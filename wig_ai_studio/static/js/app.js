const state = {
  avatarBase64: null,
  catalog: [],
  catalogById: new Map(),
  recommendations: [],
  selectedProductIds: [],
  cart: [],
  wigColorIndex: 0,
};

const CART_STORAGE_KEY = "wigverse-cart-v2";
const wigColors = [0xd63384, 0x6f42c1, 0x20c997, 0xfd7e14];

const dom = {
  metricProducts: document.getElementById("metricProducts"),
  metricRating: document.getElementById("metricRating"),
  metricCosplay: document.getElementById("metricCosplay"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  sceneFilter: document.getElementById("sceneFilter"),
  sortSelect: document.getElementById("sortSelect"),
  resetFilterBtn: document.getElementById("resetFilterBtn"),
  resultMeta: document.getElementById("resultMeta"),
  recommendations: document.getElementById("recommendations"),
  profileForm: document.getElementById("profileForm"),
  avatarInput: document.getElementById("avatarInput"),
  avatarAnalyzeBtn: document.getElementById("avatarAnalyzeBtn"),
  avatarPreview: document.getElementById("avatarPreview"),
  insightBox: document.getElementById("insightBox"),
  tryonPlans: document.getElementById("tryonPlans"),
  generateTryonImageBtn: document.getElementById("generateTryonImageBtn"),
  tryonUseRealAi: document.getElementById("tryonUseRealAi"),
  renderStyleInput: document.getElementById("renderStyleInput"),
  tryonImageSize: document.getElementById("tryonImageSize"),
  imageCountInput: document.getElementById("imageCountInput"),
  generatedImages: document.getElementById("generatedImages"),
  imageGenerationNotice: document.getElementById("imageGenerationNotice"),
  cartBadge: document.getElementById("cartBadge"),
  cartItems: document.getElementById("cartItems"),
  discountCodeInput: document.getElementById("discountCodeInput"),
  shippingMethodSelect: document.getElementById("shippingMethodSelect"),
  checkoutPreviewBtn: document.getElementById("checkoutPreviewBtn"),
  checkoutSummary: document.getElementById("checkoutSummary"),
  checkoutNotice: document.getElementById("checkoutNotice"),
  reviewList: document.getElementById("reviewList"),
  newsletterForm: document.getElementById("newsletterForm"),
  newsletterEmail: document.getElementById("newsletterEmail"),
  newsletterPreference: document.getElementById("newsletterPreference"),
  newsletterMessage: document.getElementById("newsletterMessage"),
  cartToggleBtn: document.getElementById("cartToggleBtn"),
  cartPanel: document.getElementById("cartPanel"),
  bookBtn: document.getElementById("bookBtn"),
  switchWigColorBtn: document.getElementById("switchWigColorBtn"),
  toast: document.getElementById("toast"),
};

function splitInput(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function formatCny(value) {
  return `¥${Number(value || 0).toFixed(0)}`;
}

function showToast(message, variant = "success") {
  if (!dom.toast) return;
  dom.toast.classList.remove("text-bg-success", "text-bg-danger", "text-bg-warning");
  if (variant === "error") dom.toast.classList.add("text-bg-danger");
  else if (variant === "warning") dom.toast.classList.add("text-bg-warning");
  else dom.toast.classList.add("text-bg-success");
  dom.toast.querySelector(".toast-body").textContent = message;
  const toast = bootstrap.Toast.getOrCreateInstance(dom.toast, { delay: 2300 });
  toast.show();
}

function setButtonLoading(button, loading, loadingText = "处理中...") {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.textContent || "";
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent || "";
    button.disabled = false;
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
  } catch (error) {
    console.error(error);
  }
}

function restoreCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.cart = parsed.filter((item) => item && item.productId && Number(item.quantity) > 0);
    }
  } catch (error) {
    console.error(error);
  }
}

function formToPayload(form) {
  const data = new FormData(form);
  return {
    headCircumferenceCm: Number(data.get("headCircumferenceCm") || 56),
    faceShape: String(data.get("faceShape") || "oval").toLowerCase(),
    budgetMin: Number(data.get("budgetMin") || 300),
    budgetMax: Number(data.get("budgetMax") || 1200),
    targetScenes: splitInput(data.get("targetScenes")),
    preferredStyles: splitInput(data.get("preferredStyles")),
    preferredColors: splitInput(data.get("preferredColors")),
    comfortPriority: Number(data.get("comfortPriority") || 8),
    maintenanceTolerance: Number(data.get("maintenanceTolerance") || 5),
    wantsCosplay: Boolean(data.get("wantsCosplay")),
  };
}

function currentDisplayItems() {
  const source = state.recommendations.length ? state.recommendations : state.catalog;
  const keyword = String(dom.searchInput.value || "").trim().toLowerCase();
  const category = String(dom.categoryFilter.value || "").toLowerCase();
  const scene = String(dom.sceneFilter.value || "").toLowerCase();
  const sort = String(dom.sortSelect.value || "recommended");

  let items = source.filter((item) => {
    const name = String(item.name || "").toLowerCase();
    const style = String(item.style || "").toLowerCase();
    const color = String(item.colorFamily || item.baseColor || "").toLowerCase();
    const categoryMatch = !category || String(item.category || "").toLowerCase() === category;
    const sceneMatch = !scene || (item.scenes || []).map((x) => String(x).toLowerCase()).includes(scene);
    const keywordMatch = !keyword || name.includes(keyword) || style.includes(keyword) || color.includes(keyword);
    return categoryMatch && sceneMatch && keywordMatch;
  });

  if (sort === "price-asc") {
    items.sort((a, b) => Number(a.priceCny || 0) - Number(b.priceCny || 0));
  } else if (sort === "price-desc") {
    items.sort((a, b) => Number(b.priceCny || 0) - Number(a.priceCny || 0));
  } else if (sort === "rating-desc") {
    items.sort((a, b) => {
      const left = Number(state.catalogById.get(String(a.productId || "").toLowerCase())?.rating || a.rating || 0);
      const right = Number(state.catalogById.get(String(b.productId || "").toLowerCase())?.rating || b.rating || 0);
      return right - left;
    });
  } else if (state.recommendations.length) {
    items.sort((a, b) => Number(b.matchScore || 0) - Number(a.matchScore || 0));
  }

  dom.resultMeta.textContent = `当前展示 ${items.length} 款商品`;
  return items;
}

function renderCatalogCards(items, generic = false) {
  if (!items.length) {
    dom.recommendations.innerHTML = `<div class="col-12"><div class="alert alert-warning mb-0">暂无匹配商品，请调整筛选条件。</div></div>`;
    return;
  }

  dom.recommendations.innerHTML = items
    .map((item) => {
      const reasons = generic
        ? ["可用于 AI 试戴流程", `适用场景：${(item.scenes || []).join(" / ")}`]
        : item.aiReasons || [];
      const productId = item.productId || "";
      const badge = item.cosplay ? '<span class="badge text-bg-warning-subtle text-warning-emphasis">Cosplay</span>' : "";
      const scoreBlock = generic
        ? `<h5 class="text-primary mb-2">${formatCny(item.priceCny)}</h5>`
        : `<h5 class="text-primary mb-2">${item.matchScore}<small class="text-muted"> /100 AI匹配</small></h5>`;
      return `
      <div class="col-lg-4 col-md-6">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h5 class="card-title mb-1">${item.name}</h5>
              ${badge}
            </div>
            ${scoreBlock}
            <div class="d-flex flex-wrap gap-2 mb-3">
              <span class="badge rounded-pill text-bg-light">${item.style}</span>
              <span class="badge rounded-pill text-bg-light">${item.colorFamily || item.baseColor}</span>
              <span class="badge rounded-pill text-bg-light">${item.capRange || `${item.capMinCm}-${item.capMaxCm}cm`}</span>
            </div>
            ${
              generic
                ? ""
                : `<div class="small text-muted mb-2">头围 ${item.fitScore} · 风格 ${item.styleScore} · 场景 ${item.sceneScore}</div>`
            }
            <ul class="small ps-3 mb-0">
              ${reasons.map((line) => `<li>${line}</li>`).join("")}
            </ul>
          </div>
          <div class="card-footer bg-white border-0 d-grid gap-2 d-md-flex">
            <button class="btn btn-outline-secondary btn-sm flex-fill" data-action="quick-view" data-id="${productId}">
              查看详情
            </button>
            <button class="btn btn-primary btn-sm flex-fill" data-action="add-cart" data-id="${productId}">
              加入购物车
            </button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function renderTryonPlans(plans) {
  dom.tryonPlans.innerHTML = plans
    .map(
      (plan) => `
      <div class="border rounded p-2 mb-2">
        <strong>${plan.scene}</strong>
        <div class="small text-muted">${plan.lighting} · ${plan.pose}</div>
        <div class="small mt-1">推荐：${(plan.recommendedProductIds || []).join(", ")}</div>
      </div>
    `
    )
    .join("");
}

function renderGeneratedImages(images) {
  if (!images.length) {
    dom.generatedImages.innerHTML = '<div class="text-muted small">暂无生成结果</div>';
    return;
  }
  dom.generatedImages.innerHTML = images
    .map(
      (item) => `
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <img src="${item.imageUrl}" alt="tryon-${item.scene}" class="card-img-top object-fit-cover" style="height: 220px;" />
          <div class="card-body">
            <div class="fw-semibold">${item.scene}</div>
            <div class="small text-muted mb-2">Provider: ${item.provider}</div>
            <div class="small">${item.recommendedProductIds.join(", ")}</div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, row) => sum + row.quantity, 0);
  dom.cartBadge.textContent = String(count);
}

function renderCartItems() {
  updateCartBadge();
  saveCart();
  if (!state.cart.length) {
    dom.cartItems.innerHTML = '<div class="text-muted small">购物车为空</div>';
    return;
  }
  dom.cartItems.innerHTML = state.cart
    .map(
      (item) => `
      <div class="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
        <div>
          <div class="fw-semibold small">${item.name}</div>
          <div class="text-muted small">${formatCny(item.priceCny)} × ${item.quantity}</div>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" data-action="cart-minus" data-id="${item.productId}">-</button>
          <button class="btn btn-outline-secondary" disabled>${item.quantity}</button>
          <button class="btn btn-outline-secondary" data-action="cart-plus" data-id="${item.productId}">+</button>
        </div>
      </div>
    `
    )
    .join("");
}

function addToCart(productId) {
  const product = state.catalogById.get(String(productId || "").toLowerCase());
  if (!product) return;
  const existing = state.cart.find((item) => item.productId === product.productId);
  if (existing) existing.quantity += 1;
  else {
    state.cart.push({
      productId: product.productId,
      name: product.name,
      priceCny: product.priceCny,
      quantity: 1,
    });
  }
  renderCartItems();
  showToast("已加入购物车");
}

function changeCartQuantity(productId, delta) {
  const row = state.cart.find((item) => item.productId === productId);
  if (!row) return;
  row.quantity += delta;
  if (row.quantity <= 0) {
    state.cart = state.cart.filter((item) => item.productId !== productId);
  }
  renderCartItems();
}

async function loadCatalog() {
  const response = await fetch("/api/catalog");
  if (!response.ok) throw new Error("catalog_failed");
  const data = await response.json();
  state.catalog = data.items || [];
  state.catalogById = new Map(state.catalog.map((item) => [String(item.productId).toLowerCase(), item]));

  const summary = data.summary || {};
  dom.metricProducts.textContent = summary.total_products ?? "--";
  dom.metricRating.textContent = summary.avg_rating ?? "--";
  dom.metricCosplay.textContent = `${Math.round(Number(summary.cosplay_ratio || 0) * 100)}%`;

  renderCatalogCards(currentDisplayItems(), true);
}

async function loadReviews() {
  const response = await fetch("/api/reviews?limit=6");
  if (!response.ok) throw new Error("reviews_failed");
  const data = await response.json();
  const reviews = data.items || [];
  dom.reviewList.innerHTML = reviews
    .map(
      (item) => `
    <div class="col-lg-4 col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <strong>${item.userName}</strong>
            <span class="small text-warning">${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}</span>
          </div>
          <h6 class="mt-2 mb-1">${item.title}</h6>
          <p class="small text-muted mb-2">${item.content}</p>
          <span class="badge text-bg-light">${item.scene}</span>
        </div>
      </div>
    </div>`
    )
    .join("");
}

async function analyzeAvatar() {
  const payload = formToPayload(dom.profileForm);
  payload.faceShapeHint = payload.faceShape;
  payload.skinToneHint = "neutral";
  payload.styleKeywords = payload.preferredStyles;
  payload.sceneKeywords = payload.targetScenes;
  payload.avatarImageBase64 = state.avatarBase64;
  setButtonLoading(dom.avatarAnalyzeBtn, true, "分析中...");
  try {
    const response = await fetch("/api/ai/avatar-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("avatar_insight_failed");
    const data = await response.json();
    if (data.avatarImagePath) {
      dom.avatarPreview.src = data.avatarImagePath;
      dom.avatarPreview.classList.remove("d-none");
    }
    const insight = data.insight || {};
    dom.insightBox.innerHTML = `
      <div><strong>检测脸型：</strong>${insight.detectedFaceShape || "-"}</div>
      <div><strong>肤色倾向：</strong>${insight.detectedSkinTone || "-"}</div>
      <div><strong>置信度：</strong>${Math.round(Number(insight.confidence || 0) * 100)}%</div>
      <div><strong>推荐色系：</strong>${(insight.suggestedColorFamilies || []).join(", ")}</div>
      <div><strong>建议场景：</strong>${(insight.suggestedScenes || []).join(", ")}</div>
      <div class="small text-muted mt-2">${insight.notes || ""}</div>
    `;
    showToast("头像分析完成");
  } catch (error) {
    showToast("头像分析失败", "error");
    console.error(error);
  } finally {
    setButtonLoading(dom.avatarAnalyzeBtn, false);
  }
}

async function generateRecommendations(event) {
  event.preventDefault();
  const payload = formToPayload(dom.profileForm);
  const submitBtn = dom.profileForm.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true, "生成中...");
  try {
    const response = await fetch("/api/ai/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("recommend_failed");
    const data = await response.json();
    state.recommendations = data.recommendations || [];
    state.selectedProductIds = state.recommendations.slice(0, 3).map((item) => item.productId);
    renderCatalogCards(currentDisplayItems(), false);

    const planResponse = await fetch("/api/ai/tryon-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, selectedProductIds: state.selectedProductIds }),
    });
    if (planResponse.ok) {
      const planData = await planResponse.json();
      renderTryonPlans(planData.plans || []);
    }
    showToast("推荐已更新");
  } catch (error) {
    showToast("推荐生成失败", "error");
    console.error(error);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

async function generateTryonImages() {
  const payload = {
    ...formToPayload(dom.profileForm),
    selectedProductIds: state.selectedProductIds,
    useRealAi: dom.tryonUseRealAi.checked,
    renderStyle: String(dom.renderStyleInput.value || ""),
    imageSize: String(dom.tryonImageSize.value || "1024x1024"),
    imageCount: Number(dom.imageCountInput.value || 3),
  };
  setButtonLoading(dom.generateTryonImageBtn, true, "生成中...");
  try {
    const response = await fetch("/api/ai/tryon-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("tryon_generate_failed");
    const data = await response.json();
    renderGeneratedImages(data.images || []);

    const messages = [];
    messages.push(`当前模式：${data.providerMode === "openai" ? "真实AI出图" : "Mock占位图"}`);
    if (Array.isArray(data.warnings) && data.warnings.length) messages.push(data.warnings.join(" "));
    if (Array.isArray(data.integrationTips) && data.integrationTips.length) messages.push(data.integrationTips[0]);
    dom.imageGenerationNotice.textContent = messages.join(" | ");
    showToast("试戴图片已生成");
  } catch (error) {
    dom.imageGenerationNotice.textContent = "出图失败，请稍后重试。";
    showToast("试戴出图失败", "error");
    console.error(error);
  } finally {
    setButtonLoading(dom.generateTryonImageBtn, false);
  }
}

async function previewCheckout() {
  if (!state.cart.length) {
    dom.checkoutSummary.textContent = "购物车为空";
    return;
  }
  setButtonLoading(dom.checkoutPreviewBtn, true, "计算中...");
  try {
    const response = await fetch("/api/checkout/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        discountCode: String(dom.discountCodeInput.value || ""),
        shippingMethod: String(dom.shippingMethodSelect.value || "standard"),
      }),
    });
    if (!response.ok) throw new Error("checkout_preview_failed");
    const data = await response.json();
    const pricing = data.pricing || {};
    dom.checkoutSummary.innerHTML = `
      <div><strong>小计：</strong>${formatCny(pricing.subtotalCny)}</div>
      <div><strong>优惠：</strong>- ${formatCny(pricing.discountCny)}</div>
      <div><strong>运费：</strong>${formatCny(pricing.shippingCny)}</div>
      <div><strong>税费：</strong>${formatCny(pricing.taxCny)}</div>
      <div class="fw-semibold"><strong>应付：</strong>${formatCny(pricing.totalCny)}</div>
    `;
    const notes = [];
    if (data.couponApplied) notes.push(`已使用优惠码 ${data.couponApplied}`);
    if ((data.stockAlerts || []).length) notes.push("部分商品数量已按库存自动调整");
    if ((data.skippedItems || []).length) notes.push("部分商品不可用，已从结算中排除");
    dom.checkoutNotice.textContent = notes.join("；");
  } catch (error) {
    dom.checkoutNotice.textContent = "结算预估失败";
    showToast("结算预估失败", "error");
  } finally {
    setButtonLoading(dom.checkoutPreviewBtn, false);
  }
}

async function submitNewsletter(event) {
  event.preventDefault();
  const submitBtn = dom.newsletterForm.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true, "提交中...");
  try {
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(dom.newsletterEmail.value || "").trim(),
        preference: String(dom.newsletterPreference.value || "new-arrivals"),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "newsletter_failed");
    dom.newsletterMessage.textContent = data.message || "订阅成功";
    dom.newsletterEmail.value = "";
    showToast("订阅成功");
  } catch (error) {
    dom.newsletterMessage.textContent = error instanceof Error ? error.message : "订阅失败";
    showToast("订阅失败", "error");
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

function bindEvents() {
  dom.profileForm.addEventListener("submit", generateRecommendations);
  dom.avatarAnalyzeBtn.addEventListener("click", analyzeAvatar);
  dom.generateTryonImageBtn.addEventListener("click", generateTryonImages);
  dom.checkoutPreviewBtn.addEventListener("click", previewCheckout);
  dom.newsletterForm.addEventListener("submit", submitNewsletter);

  dom.avatarInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.avatarBase64 = reader.result;
      dom.avatarPreview.src = state.avatarBase64;
      dom.avatarPreview.classList.remove("d-none");
    };
    reader.readAsDataURL(file);
  });

  dom.recommendations.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "add-cart") {
      addToCart(id);
    } else if (action === "quick-view") {
      const item = state.catalogById.get(String(id || "").toLowerCase());
      if (!item) return;
      dom.insightBox.innerHTML = `
        <div class="fw-semibold">${item.name}</div>
        <div class="small text-muted">${item.description}</div>
        <div class="small mt-2">帽围：${item.capMinCm}-${item.capMaxCm}cm · 库存：${item.stock}</div>
      `;
      window.location.hash = "#ai-stylist";
    }
  });

  dom.cartItems.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "cart-minus") changeCartQuantity(btn.dataset.id, -1);
    if (btn.dataset.action === "cart-plus") changeCartQuantity(btn.dataset.id, 1);
  });

  document.querySelectorAll(".coupon-chip").forEach((button) => {
    button.addEventListener("click", () => {
      dom.discountCodeInput.value = button.dataset.coupon || "";
      showToast("优惠码已填入");
    });
  });

  dom.searchInput.addEventListener("input", () => {
    renderCatalogCards(currentDisplayItems(), !state.recommendations.length);
  });
  dom.categoryFilter.addEventListener("change", () => {
    renderCatalogCards(currentDisplayItems(), !state.recommendations.length);
  });
  dom.sceneFilter.addEventListener("change", () => {
    renderCatalogCards(currentDisplayItems(), !state.recommendations.length);
  });
  dom.sortSelect.addEventListener("change", () => {
    renderCatalogCards(currentDisplayItems(), !state.recommendations.length);
  });
  dom.resetFilterBtn.addEventListener("click", () => {
    dom.searchInput.value = "";
    dom.categoryFilter.value = "";
    dom.sceneFilter.value = "";
    dom.sortSelect.value = "recommended";
    renderCatalogCards(currentDisplayItems(), !state.recommendations.length);
  });

  dom.cartToggleBtn.addEventListener("click", () => {
    dom.cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  dom.bookBtn.addEventListener("click", () => {
    document.getElementById("ai-stylist").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function init3dScene() {
  const canvas = document.getElementById("wig3dCanvas");
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.4, 4.5);
  const light1 = new THREE.DirectionalLight(0xffffff, 1.2);
  light1.position.set(2.3, 2.2, 2);
  const light2 = new THREE.AmbientLight(0x7e57c2, 0.5);
  scene.add(light1, light2);

  const group = new THREE.Group();
  scene.add(group);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 40, 40),
    new THREE.MeshStandardMaterial({ color: 0xf2d3c2, roughness: 0.8 })
  );
  head.position.y = -0.08;
  const wig = new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.72),
    new THREE.MeshStandardMaterial({ color: wigColors[state.wigColorIndex], roughness: 0.35, metalness: 0.1 })
  );
  wig.position.y = 0.33;
  const bangs = new THREE.Mesh(
    new THREE.TorusGeometry(0.63, 0.21, 20, 68, Math.PI),
    new THREE.MeshStandardMaterial({ color: wigColors[state.wigColorIndex], roughness: 0.42 })
  );
  bangs.rotation.x = Math.PI / 2;
  bangs.rotation.z = Math.PI;
  bangs.position.set(0, 0.14, 0.66);
  group.add(head, wig, bangs);

  function resize() {
    const ratio = Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = ratio;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  function animate() {
    group.rotation.y += 0.004;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  dom.switchWigColorBtn.addEventListener("click", () => {
    state.wigColorIndex = (state.wigColorIndex + 1) % wigColors.length;
    wig.material.color.setHex(wigColors[state.wigColorIndex]);
    bangs.material.color.setHex(wigColors[state.wigColorIndex]);
  });
}

async function boot() {
  bindEvents();
  init3dScene();
  restoreCart();
  renderCartItems();
  await Promise.all([loadCatalog(), loadReviews()]);
  state.cart = state.cart.filter((item) => state.catalogById.has(String(item.productId || "").toLowerCase()));
  renderCartItems();
}

boot().catch((error) => {
  console.error(error);
  showToast("页面初始化失败", "error");
});

