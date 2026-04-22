const state = {
  avatarBase64: null,
  catalog: [],
  recommendations: [],
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
    items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  } else if (state.recommendations.length) {
    items.sort((a, b) => Number(b.matchScore || 0) - Number(a.matchScore || 0));
  }
  return items;
}

async function loadCatalog() {
  const response = await fetch("/api/catalog");
  const data = await response.json();
  state.catalog = data.items || [];
  const summary = data.summary || {};
  dom.metricProducts.textContent = summary.total_products ?? "--";
  dom.metricRating.textContent = summary.avg_rating ?? "--";
  const cosplayRatio = Number(summary.cosplay_ratio || 0);
  dom.metricCosplay.textContent = `${Math.round(cosplayRatio * 100)}%`;
  renderCatalogCards(currentDisplayItems(), true);
}

async function loadReviews() {
  const response = await fetch("/api/reviews?limit=6");
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
  const id = String(productId || "").toLowerCase();
  return state.catalog.find((item) => String(item.productId || "").toLowerCase() === id);
}

function addToCart(productId) {
  const product = findCatalogById(productId);
  if (!product) return;
    const existing = state.cart.find((row) => row.productId === product.productId);
  if (existing) {
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
  if (!state.cart.length) {
    dom.cartItems.innerHTML = `<p class="empty-tip">还没有商品，先去商城加购吧。</p>`;
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
  const response = await fetch("/api/checkout/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  const pricing = data.pricing || {};
  dom.checkoutSummary.innerHTML = `
    <strong>小计：</strong>${formatCny(pricing.subtotalCny)}<br/>
    <strong>优惠：</strong>- ${formatCny(pricing.discountCny)}<br/>
    <strong>运费：</strong>${formatCny(pricing.shippingCny)}<br/>
    <strong>税费：</strong>${formatCny(pricing.taxCny)}<br/>
    <strong>应付：</strong>${formatCny(pricing.totalCny)}
  `;
}

async function analyzeAvatar() {
  const payload = formToPayload(dom.profileForm);
  payload.faceShapeHint = payload.faceShape;
  payload.skinToneHint = "neutral";
  payload.styleKeywords = payload.preferredStyles;
  payload.sceneKeywords = payload.targetScenes;
  payload.avatarImageBase64 = state.avatarBase64;
  const response = await fetch("/api/ai/avatar-insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  renderInsight(data.insight, data.avatarImagePath);
}

async function generateRecommendations(evt) {
  evt.preventDefault();
  const payload = formToPayload(dom.profileForm);
  const response = await fetch("/api/ai/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  state.recommendations = data.recommendations || [];
    state.selectedProductIds = state.recommendations.slice(0, 3).map((item) => item.productId);
  renderCatalogCards(currentDisplayItems(), false);
  await generateTryonPlans();
}

async function generateTryonPlans() {
  const payload = formToPayload(dom.profileForm);
  payload.selectedProductIds = state.selectedProductIds;
  const response = await fetch("/api/ai/tryon-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  renderTryonPlans(data.plans || []);
}

async function submitNewsletter(evt) {
  evt.preventDefault();
  const payload = {
    email: String(dom.newsletterEmail.value || "").trim(),
    preference: String(dom.newsletterPreference.value || "new-arrivals"),
  };
  const response = await fetch("/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  dom.newsletterMessage.textContent = data.message || "提交成功。";
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
  renderCartItems();
  await Promise.all([loadCatalog(), loadReviews()]);
}

boot().catch((error) => {
  console.error(error);
  dom.insightBox.textContent = "初始化失败，请刷新页面重试。";
});
