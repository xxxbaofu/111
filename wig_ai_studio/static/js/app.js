const state = {
  avatarBase64: null,
  catalog: [],
  catalogById: new Map(),
  recommendations: [],
  recommendationById: new Map(),
  selectedProductIds: [],
  wigColorIndex: 0,
  cart: [],
  reviewItems: [],
};

const wigColors = [0xd266ff, 0x7e7cff, 0xff69a6, 0x9ad0ff];

const dom = {
  metricProducts: document.getElementById("metricProducts"),
  metricRating: document.getElementById("metricRating"),
  metricCosplay: document.getElementById("metricCosplay"),
  profileForm: document.getElementById("profileForm"),
  avatarInput: document.getElementById("avatarInput"),
  avatarAnalyzeBtn: document.getElementById("avatarAnalyzeBtn"),
  avatarPreview: document.getElementById("avatarPreview"),
  insightBox: document.getElementById("insightBox"),
  tryonPlans: document.getElementById("tryonPlans"),
  recommendations: document.getElementById("recommendations"),
  switchWigColorBtn: document.getElementById("switchWigColorBtn"),
  bookBtn: document.getElementById("bookBtn"),
  cartToggleBtn: document.getElementById("cartToggleBtn"),
  cartBadge: document.getElementById("cartBadge"),
  cartPanel: document.getElementById("cartPanel"),
  cartItems: document.getElementById("cartItems"),
  checkoutPreviewBtn: document.getElementById("checkoutPreviewBtn"),
  checkoutSummary: document.getElementById("checkoutSummary"),
  checkoutNotice: document.getElementById("checkoutNotice"),
  discountCodeInput: document.getElementById("discountCodeInput"),
  shippingMethodSelect: document.getElementById("shippingMethodSelect"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  sceneFilter: document.getElementById("sceneFilter"),
  sortSelect: document.getElementById("sortSelect"),
  resetFilterBtn: document.getElementById("resetFilterBtn"),
  reviewList: document.getElementById("reviewList"),
  newsletterForm: document.getElementById("newsletterForm"),
  newsletterEmail: document.getElementById("newsletterEmail"),
  newsletterPreference: document.getElementById("newsletterPreference"),
  newsletterMessage: document.getElementById("newsletterMessage"),
  toast: document.getElementById("toast"),
};

const CART_STORAGE_KEY = "wigverse-cart-v1";

function splitInput(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function formatCny(value) {
  return `¥${Number(value || 0).toFixed(0)}`;
}

function showToast(message, isError = false) {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.toggle("error", Boolean(isError));
  dom.toast.classList.add("show");
  window.setTimeout(() => dom.toast.classList.remove("show"), 2200);
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
      state.cart = parsed.filter(
        (row) => row && typeof row.productId === "string" && Number(row.quantity) > 0
      );
    }
  } catch (error) {
    console.error(error);
  }
}

function formToPayload(form) {
  const data = new FormData(form);
  const payload = {
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
  return payload;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function currentDisplayItems() {
  const source = state.recommendations.length ? state.recommendations : state.catalog;
  const keyword = String(dom.searchInput.value || "")
    .trim()
    .toLowerCase();
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
  return items;
}

async function loadCatalog() {
  const response = await fetch("/api/catalog");
  if (!response.ok) {
    throw new Error("catalog_request_failed");
  }
  const data = await response.json();
  state.catalog = data.items || [];
  state.catalogById = new Map(
    state.catalog.map((item) => [String(item.productId || "").toLowerCase(), item])
  );
  const summary = data.summary || {};
  dom.metricProducts.textContent = summary.total_products ?? "--";
  dom.metricRating.textContent = summary.avg_rating ?? "--";
  const cosplayRatio = Number(summary.cosplay_ratio || 0);
  dom.metricCosplay.textContent = `${Math.round(cosplayRatio * 100)}%`;
  renderCatalogCards(currentDisplayItems(), true);
}

async function loadReviews() {
  const response = await fetch("/api/reviews?limit=6");
  if (!response.ok) {
    throw new Error("reviews_request_failed");
  }
  const data = await response.json();
  state.reviewItems = data.items || [];
  renderReviews();
}

function renderCatalogCards(items, generic = false) {
  if (!items.length) {
    dom.recommendations.innerHTML = `<p class="empty-tip">暂无匹配商品，请调整筛选条件。</p>`;
    return;
  }
  const cards = items.map((item) => {
    const reasons = generic
      ? ["可用于 AI 试戴流程。", `适用场景：${(item.scenes || []).join(" / ")}`]
      : item.aiReasons || [];
    const scoreBlock = generic
      ? `<div class="score">${formatCny(item.priceCny)}</div>`
      : `<div class="score">${item.matchScore}<small>/100 AI匹配</small></div>`;
    const scoreRows = generic
      ? ""
      : `
      <div class="score-row">
        <div class="score-box"><small>头围</small><strong>${item.fitScore}</strong></div>
        <div class="score-box"><small>风格</small><strong>${item.styleScore}</strong></div>
        <div class="score-box"><small>场景</small><strong>${item.sceneScore}</strong></div>
        <div class="score-box"><small>价格</small><strong>${formatCny(item.priceCny)}</strong></div>
      </div>`;
    const tagCos = item.cosplay ? `<span class="pill">cosplay</span>` : "";

    const productId = item.productId || "";
    return `
      <article class="card">
        <h3>${item.name}</h3>
        ${scoreBlock}
        <div class="meta">
          <span>${item.style}</span>
          <span>${item.colorFamily || item.baseColor}</span>
          <span>${item.capRange || `${item.capMinCm}-${item.capMaxCm}cm`}</span>
          ${tagCos}
        </div>
        ${scoreRows}
        <ul class="reasons">
          ${reasons.map((text) => `<li>${text}</li>`).join("")}
        </ul>
        <div class="card-actions">
          <button class="btn btn-secondary" data-action="quick-view" data-id="${productId}">
            查看详情
          </button>
          <button class="btn btn-primary" data-action="add-cart" data-id="${productId}">
            加入购物车
          </button>
        </div>
      </article>
    `;
  });
  dom.recommendations.innerHTML = cards.join("");
}

function renderInsight(insight, imagePath) {
  if (imagePath) {
    dom.avatarPreview.src = imagePath;
    dom.avatarPreview.classList.remove("hidden");
  }
  const html = `
    <strong>检测脸型：</strong>${insight.detectedFaceShape}<br/>
    <strong>肤色倾向：</strong>${insight.detectedSkinTone}<br/>
    <strong>置信度：</strong>${Math.round((insight.confidence || 0) * 100)}%<br/>
    <strong>推荐色系：</strong>${(insight.suggestedColorFamilies || []).join(", ")}<br/>
    <strong>建议场景：</strong>${(insight.suggestedScenes || []).join(", ")}<br/>
    <strong>AI说明：</strong>${insight.notes}
  `;
  dom.insightBox.innerHTML = html;
}

function renderTryonPlans(plans) {
  dom.tryonPlans.innerHTML = plans
    .map(
      (plan) => `
      <article class="plan-item">
        <h5>${plan.scene} · ${plan.lighting}</h5>
        <p><strong>推荐款：</strong>${(plan.recommendedProductIds || []).join(", ")}</p>
        <p>${plan.generationPrompt}</p>
      </article>
    `
    )
    .join("");
}

function renderReviews() {
  if (!state.reviewItems.length) {
    dom.reviewList.innerHTML = `<p class="empty-tip">暂无评价数据。</p>`;
    return;
  }
  dom.reviewList.innerHTML = state.reviewItems
    .map(
      (item) => `
      <article class="review-card">
        <div class="review-head">
          <strong>${item.userName}</strong>
          <span>${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}</span>
        </div>
        <h4>${item.title}</h4>
        <p>${item.content}</p>
        <div class="review-meta">
          <span>${item.scene}</span>
          <span>${item.productId}</span>
          <span>${item.createdAt}</span>
        </div>
      </article>
    `
    )
    .join("");
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, row) => sum + row.quantity, 0);
  dom.cartBadge.textContent = String(count);
}

function findCatalogById(productId) {
  return state.catalogById.get(String(productId || "").toLowerCase());
}

function addToCart(productId) {
  const product = findCatalogById(productId);
  if (!product) return;
  const maxStock = Number(product.stock || 0);
  if (maxStock <= 0) {
    showToast("该商品当前缺货", true);
    return;
  }
  const existing = state.cart.find((row) => row.productId === product.productId);
  if (existing) {
    if (existing.quantity >= maxStock) {
      showToast("已达到该商品可购买上限", true);
      return;
    }
    existing.quantity += 1;
  } else {
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

function renderCartItems() {
  updateCartBadge();
  saveCart();
  if (!state.cart.length) {
    dom.cartItems.innerHTML = `<p class="empty-tip">还没有商品，先去商城加购吧。</p>`;
    dom.checkoutNotice.textContent = "";
    return;
  }
  dom.cartItems.innerHTML = state.cart
    .map(
      (row) => `
      <div class="cart-item">
        <div>
          <strong>${row.name}</strong>
          <p>${formatCny(row.priceCny)} × ${row.quantity}</p>
        </div>
        <div class="qty">
          <button data-action="cart-minus" data-id="${row.productId}">-</button>
          <span>${row.quantity}</span>
          <button data-action="cart-plus" data-id="${row.productId}">+</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function previewCheckout() {
  if (!state.cart.length) {
    dom.checkoutSummary.textContent = "购物车为空。";
    return;
  }
  const payload = {
    items: state.cart.map((row) => ({ productId: row.productId, quantity: row.quantity })),
    discountCode: String(dom.discountCodeInput.value || "").trim(),
    shippingMethod: String(dom.shippingMethodSelect.value || "standard"),
  };
  setButtonLoading(dom.checkoutPreviewBtn, true, "计算中...");
  try {
    const response = await fetch("/api/checkout/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("checkout_preview_failed");
    }
    const data = await response.json();
    const pricing = data.pricing || {};
    dom.checkoutSummary.innerHTML = `
      <strong>小计：</strong>${formatCny(pricing.subtotalCny)}<br/>
      <strong>优惠：</strong>- ${formatCny(pricing.discountCny)}<br/>
      <strong>运费：</strong>${formatCny(pricing.shippingCny)}<br/>
      <strong>税费：</strong>${formatCny(pricing.taxCny)}<br/>
      <strong>应付：</strong>${formatCny(pricing.totalCny)}
    `;
    const notices = [];
    if (data.couponApplied) {
      notices.push(`已应用优惠码：${data.couponApplied}`);
    }
    if (Array.isArray(data.stockAlerts) && data.stockAlerts.length) {
      notices.push("部分商品数量超出库存，已自动调整。");
      data.stockAlerts.forEach((alert) => {
        const row = state.cart.find((item) => item.productId === alert.productId);
        if (row) row.quantity = alert.availableStock;
      });
      renderCartItems();
    }
    if (Array.isArray(data.skippedItems) && data.skippedItems.length) {
      notices.push("部分商品已失效或缺货，未计入结算。");
      const skippedSet = new Set(data.skippedItems.map((item) => String(item.productId || "")));
      state.cart = state.cart.filter((row) => !skippedSet.has(row.productId));
      renderCartItems();
    }
    dom.checkoutNotice.textContent = notices.join(" ");
    showToast("结算预估已更新");
  } catch (error) {
    dom.checkoutNotice.textContent = "结算预估失败，请稍后重试。";
    showToast("结算预估失败", true);
    console.error(error);
  } finally {
    setButtonLoading(dom.checkoutPreviewBtn, false);
  }
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
    if (!response.ok) {
      throw new Error("avatar_insight_failed");
    }
    const data = await response.json();
    renderInsight(data.insight, data.avatarImagePath);
    showToast("AI头像分析已完成");
  } finally {
    setButtonLoading(dom.avatarAnalyzeBtn, false);
  }
}

async function generateRecommendations(evt) {
  evt.preventDefault();
  const payload = formToPayload(dom.profileForm);
  const submitBtn = dom.profileForm.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true, "生成中...");
  try {
    const response = await fetch("/api/ai/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("recommendation_failed");
    }
    const data = await response.json();
    state.recommendations = data.recommendations || [];
    state.recommendationById = new Map(
      state.recommendations.map((item) => [String(item.productId || "").toLowerCase(), item])
    );
    state.selectedProductIds = state.recommendations.slice(0, 3).map((item) => item.productId);
    renderCatalogCards(currentDisplayItems(), false);
    await generateTryonPlans();
    showToast("推荐结果已更新");
  } catch (error) {
    dom.insightBox.textContent = "推荐生成失败，请稍后重试。";
    showToast("推荐生成失败", true);
    console.error(error);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

async function generateTryonPlans() {
  const payload = formToPayload(dom.profileForm);
  payload.selectedProductIds = state.selectedProductIds;
  const response = await fetch("/api/ai/tryon-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("tryon_plan_failed");
  }
  const data = await response.json();
  renderTryonPlans(data.plans || []);
}

async function submitNewsletter(evt) {
  evt.preventDefault();
  const payload = {
    email: String(dom.newsletterEmail.value || "").trim(),
    preference: String(dom.newsletterPreference.value || "new-arrivals"),
  };
  const submitBtn = dom.newsletterForm.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true, "提交中...");
  try {
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "newsletter_failed");
    }
    dom.newsletterMessage.textContent = data.message || "提交成功。";
    dom.newsletterEmail.value = "";
    showToast("订阅成功");
  } catch (error) {
    const message = error instanceof Error ? error.message : "订阅失败，请稍后再试。";
    dom.newsletterMessage.textContent = message;
    showToast("订阅失败", true);
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

function handleCardAction(event) {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "add-cart") {
    addToCart(id);
  } else if (action === "quick-view") {
    const item = findCatalogById(id);
    if (!item) return;
    dom.insightBox.innerHTML = `<strong>${item.name}</strong><br/>${item.description}<br/>帽围 ${item.capMinCm}-${item.capMaxCm}cm，库存 ${item.stock}。`;
    window.location.hash = "#ai-stylist";
  }
}

function handleCartAction(event) {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === "cart-minus") {
    changeCartQuantity(id, -1);
  } else if (action === "cart-plus") {
    changeCartQuantity(id, 1);
  }
}

function refreshDisplayedCatalog() {
  const generic = !state.recommendations.length;
  renderCatalogCards(currentDisplayItems(), generic);
}

function bindEvents() {
  dom.profileForm.addEventListener("submit", generateRecommendations);
  dom.avatarAnalyzeBtn.addEventListener("click", async () => {
    try {
      await analyzeAvatar();
    } catch (error) {
      dom.insightBox.textContent = "头像分析失败，请稍后重试。";
      console.error(error);
    }
  });

  dom.avatarInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      state.avatarBase64 = null;
      return;
    }
    try {
      state.avatarBase64 = await readFileAsBase64(file);
      dom.avatarPreview.src = state.avatarBase64;
      dom.avatarPreview.classList.remove("hidden");
    } catch (error) {
      console.error(error);
      state.avatarBase64 = null;
    }
  });

  dom.bookBtn.addEventListener("click", () => {
    dom.insightBox.textContent = "已为你创建 AI 顾问会话：建议先完成头像分析，再生成推荐。";
    window.location.hash = "#ai-stylist";
  });

  dom.cartToggleBtn.addEventListener("click", () => {
    dom.cartPanel.classList.toggle("open");
    window.location.hash = "#ai-stylist";
  });

  dom.checkoutPreviewBtn.addEventListener("click", async () => {
    await previewCheckout();
  });

  document.querySelectorAll(".coupon-chip").forEach((button) => {
    button.addEventListener("click", () => {
      dom.discountCodeInput.value = button.dataset.coupon || "";
      showToast("优惠码已填入");
    });
  });

  dom.recommendations.addEventListener("click", handleCardAction);
  dom.cartItems.addEventListener("click", handleCartAction);

  dom.searchInput.addEventListener("input", refreshDisplayedCatalog);
  dom.categoryFilter.addEventListener("change", refreshDisplayedCatalog);
  dom.sceneFilter.addEventListener("change", refreshDisplayedCatalog);
  dom.sortSelect.addEventListener("change", refreshDisplayedCatalog);
  dom.resetFilterBtn.addEventListener("click", () => {
    dom.searchInput.value = "";
    dom.categoryFilter.value = "";
    dom.sceneFilter.value = "";
    dom.sortSelect.value = "recommended";
    refreshDisplayedCatalog();
  });

  dom.newsletterForm.addEventListener("submit", submitNewsletter);
}

function init3dScene() {
  const canvas = document.getElementById("wig3dCanvas");
  if (!canvas || !window.THREE) {
    return;
  }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.4, 4.5);

  const light1 = new THREE.DirectionalLight(0xffffff, 1.25);
  light1.position.set(2.2, 2.4, 2);
  const light2 = new THREE.AmbientLight(0x9f7cff, 0.45);
  scene.add(light1, light2);

  const group = new THREE.Group();
  scene.add(group);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 42, 42),
    new THREE.MeshStandardMaterial({ color: 0xf2d3c2, roughness: 0.8, metalness: 0.02 })
  );
  head.position.y = -0.08;

  const wig = new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.72),
    new THREE.MeshStandardMaterial({ color: wigColors[state.wigColorIndex], roughness: 0.35, metalness: 0.1 })
  );
  wig.position.y = 0.33;

  const bangs = new THREE.Mesh(
    new THREE.TorusGeometry(0.63, 0.21, 22, 70, Math.PI),
    new THREE.MeshStandardMaterial({ color: wigColors[state.wigColorIndex], roughness: 0.42, metalness: 0.06 })
  );
  bangs.rotation.x = Math.PI / 2;
  bangs.rotation.z = Math.PI;
  bangs.position.set(0, 0.14, 0.66);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.39, 0.75, 26),
    new THREE.MeshStandardMaterial({ color: 0xe8bfa7, roughness: 0.86 })
  );
  neck.position.y = -1.2;

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.32, 0.18, 44),
    new THREE.MeshStandardMaterial({ color: 0x342c5c, roughness: 0.6, metalness: 0.12 })
  );
  stand.position.y = -1.72;

  group.add(head, wig, bangs, neck, stand);

  function resizeRenderer() {
    const { clientWidth, clientHeight } = canvas;
    const ratio = Math.max(clientWidth, 1) / Math.max(clientHeight, 1);
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = ratio;
    camera.updateProjectionMatrix();
  }

  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);

  function render() {
    group.rotation.y += 0.0045;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  dom.switchWigColorBtn.addEventListener("click", () => {
    state.wigColorIndex = (state.wigColorIndex + 1) % wigColors.length;
    const color = wigColors[state.wigColorIndex];
    wig.material.color.setHex(color);
    bangs.material.color.setHex(color);
  });
}

async function boot() {
  bindEvents();
  init3dScene();
  restoreCart();
  renderCartItems();
  const [catalogRes, reviewsRes] = await Promise.allSettled([loadCatalog(), loadReviews()]);
  if (catalogRes.status === "rejected") {
    showToast("商品数据加载失败，请刷新页面。", true);
  }
  if (reviewsRes.status === "rejected") {
    showToast("评价数据暂不可用。", true);
  }
  state.cart = state.cart.filter((row) => findCatalogById(row.productId));
  renderCartItems();
}

boot().catch((error) => {
  console.error(error);
  dom.insightBox.textContent = "初始化失败，请刷新页面重试。";
});
