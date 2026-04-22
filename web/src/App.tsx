import { lazy, Suspense, useMemo, useState, type CSSProperties } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronRight,
  CircleHelp,
  Clock3,
  HeartHandshake,
  Palette,
  PlayCircle,
  Ruler,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Wand2,
} from 'lucide-react'

import './App.css'
import {
  careSteps,
  colorFamilies,
  faqs,
  faceShapes,
  featureCards,
  servicePillars,
  skinTones,
  testimonials,
  useCaseCategoryMap,
  useCases,
  wigCategories,
  wigs,
  type ColorFamily,
  type FaceShape,
  type WigCategory,
  type WigProduct,
} from './data'

const WigCanvas = lazy(() => import('./components/WigCanvas'))

type CatalogSort = '推荐度' | '价格从低到高' | '价格从高到低' | '评分'
type CategoryFilter = '全部' | WigCategory

const categoryFilters: CategoryFilter[] = ['全部', ...wigCategories]
const money = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0,
})

const faceShapePreviewScale: Record<FaceShape, { width: number; height: number }> = {
  鹅蛋脸: { width: 0.98, height: 1.06 },
  圆脸: { width: 1.04, height: 0.98 },
  方脸: { width: 1.08, height: 0.96 },
  心形脸: { width: 0.96, height: 1.08 },
  长脸: { width: 0.92, height: 1.14 },
}

const atelierSteps = [
  {
    title: '1. 场景先行',
    detail: '先确定通勤、漫展、婚礼或修复需求，减少盲选。',
  },
  {
    title: '2. 录入头围',
    detail: '用头围、日均佩戴时长和预算，筛掉不合身的款。',
  },
  {
    title: '3. 3D 试戴对比',
    detail: '旋转查看长度、颜色、刘海和蓬松度，感受正侧面比例。',
  },
  {
    title: '4. 生成下单建议',
    detail: '输出推荐款、网帽尺码和护理建议，方便直接转化。',
  },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function getCapSizeLabel(headCircumference: number) {
  if (headCircumference < 54) {
    return 'S / 小码'
  }

  if (headCircumference < 57.5) {
    return 'M / 标准码'
  }

  if (headCircumference < 60) {
    return 'L / 大码'
  }

  return 'XL / 定制码'
}

function getFitSummary(product: WigProduct, headCircumference: number) {
  const [min, max] = product.capRange
  const middle = (min + max) / 2
  const gap = Math.abs(headCircumference - middle)

  if (headCircumference >= min && headCircumference <= max) {
    if (gap <= 0.8) {
      return {
        tone: 'good',
        label: '贴合度高',
        description: '当前头围位于推荐区间核心位置，日常佩戴更稳定。',
      }
    }

    return {
      tone: 'neutral',
      label: '可调节适配',
      description: '头围处于可穿戴范围边缘，建议配合调节带或防滑夹。',
    }
  }

  if (headCircumference < min) {
    return {
      tone: 'warning',
      label: '建议更小网帽',
      description: `当前头围比推荐下限小 ${(min - headCircumference).toFixed(1)} cm，建议确认耳侧收紧量。`,
    }
  }

  return {
    tone: 'warning',
    label: '建议加大或定制',
    description: `当前头围比推荐上限大 ${(headCircumference - max).toFixed(1)} cm，优先选择 XL 或定制网帽。`,
  }
}

function getRecommendationScore(
  product: WigProduct,
  {
    useCase,
    faceShape,
    preferredColor,
    headCircumference,
    budget,
    dailyHours,
  }: {
    useCase: (typeof useCases)[number]
    faceShape: FaceShape
    preferredColor: ColorFamily
    headCircumference: number
    budget: number
    dailyHours: number
  },
) {
  let score = 50

  if (useCaseCategoryMap[useCase] === product.category) {
    score += 18
  }

  if (product.bestFor.useCases.includes(useCase)) {
    score += 20
  }

  if (product.bestFor.faceShapes.includes(faceShape)) {
    score += 12
  }

  if (product.bestFor.colorFamilies.includes(preferredColor)) {
    score += 10
  }

  const [minCap, maxCap] = product.capRange
  const distanceToRange =
    headCircumference < minCap
      ? minCap - headCircumference
      : headCircumference > maxCap
        ? headCircumference - maxCap
        : 0

  if (distanceToRange === 0) {
    score += 16
  } else {
    score -= Math.min(14, Math.round(distanceToRange * 6))
  }

  if (product.price <= budget) {
    score += 8
  } else {
    score -= Math.min(10, Math.round((product.price - budget) / 160))
  }

  if (dailyHours >= 8 && (product.category === '日常通勤' || product.category === '医美修复')) {
    score += 6
  }

  if (dailyHours >= 6 && product.density <= 135) {
    score += 4
  }

  if (useCase === '漫展出片' && product.density >= 150) {
    score += 4
  }

  if (useCase === '婚礼宴会' && product.length >= 45) {
    score += 4
  }

  if (useCase === '术后修复' && product.category === '医美修复') {
    score += 8
  }

  return clamp(Math.round(score), 48, 99)
}

function buildReasons(
  product: WigProduct,
  {
    useCase,
    faceShape,
    preferredColor,
    headCircumference,
    budget,
  }: {
    useCase: (typeof useCases)[number]
    faceShape: FaceShape
    preferredColor: ColorFamily
    headCircumference: number
    budget: number
  },
) {
  const reasons: string[] = []

  if (useCaseCategoryMap[useCase] === product.category) {
    reasons.push(`与你当前的“${useCase}”场景高度匹配`)
  }

  if (product.bestFor.faceShapes.includes(faceShape)) {
    reasons.push(`对${faceShape}更友好，修饰比例更自然`)
  }

  if (product.bestFor.colorFamilies.includes(preferredColor)) {
    reasons.push(`色系接近你偏好的“${preferredColor}”方向`)
  }

  if (headCircumference >= product.capRange[0] && headCircumference <= product.capRange[1]) {
    reasons.push(`头围 ${headCircumference.toFixed(1)} cm 落在推荐网帽区间内`)
  }

  if (product.price <= budget) {
    reasons.push(`价格位于当前预算 ${money.format(budget)} 内，更适合直接下单`)
  }

  reasons.push(product.summary)

  return reasons.slice(0, 3)
}

function ScoreBar({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div className="score-bar">
      <div className="score-bar__header">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="score-bar__track" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
      <p>{description}</p>
    </div>
  )
}

function App() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('全部')
  const [sortBy, setSortBy] = useState<CatalogSort>('推荐度')
  const [query, setQuery] = useState('')
  const [selectedProductId, setSelectedProductId] = useState(wigs[1].id)
  const [headCircumference, setHeadCircumference] = useState(56)
  const [faceShape, setFaceShape] = useState<FaceShape>('鹅蛋脸')
  const [useCase, setUseCase] = useState<(typeof useCases)[number]>('通勤上班')
  const [preferredColor, setPreferredColor] = useState<ColorFamily>('奶茶棕金')
  const [skinTone, setSkinTone] = useState<(typeof skinTones)[number]['label']>('自然肤色')
  const [dailyHours, setDailyHours] = useState(6)
  const [budget, setBudget] = useState(1200)
  const [volumeLevel, setVolumeLevel] = useState(135)
  const [lengthFactor, setLengthFactor] = useState(1)
  const [showBangs, setShowBangs] = useState(true)

  const recommendationScores = useMemo(
    () =>
      new Map(
        wigs.map((product) => [
          product.id,
          getRecommendationScore(product, {
            useCase,
            faceShape,
            preferredColor,
            headCircumference,
            budget,
            dailyHours,
          }),
        ]),
      ),
    [budget, dailyHours, faceShape, headCircumference, preferredColor, useCase],
  )

  const recommendations = useMemo(
    () =>
      [...wigs]
        .map((product) => ({
          product,
          score: recommendationScores.get(product.id) ?? 0,
          reasons: buildReasons(product, {
            useCase,
            faceShape,
            preferredColor,
            headCircumference,
            budget,
          }),
        }))
        .sort((left, right) => right.score - left.score),
    [budget, faceShape, headCircumference, preferredColor, recommendationScores, useCase],
  )

  const visibleProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const matches = wigs.filter((product) => {
      const matchesCategory = categoryFilter === '全部' || product.category === categoryFilter
      const matchesKeyword =
        keyword.length === 0 ||
        `${product.name} ${product.summary} ${product.badges.join(' ')} ${product.category}`
          .toLowerCase()
          .includes(keyword)

      return matchesCategory && matchesKeyword
    })

    return [...matches].sort((left, right) => {
      switch (sortBy) {
        case '价格从低到高':
          return left.price - right.price
        case '价格从高到低':
          return right.price - left.price
        case '评分':
          return right.rating - left.rating
        case '推荐度':
        default:
          return (recommendationScores.get(right.id) ?? 0) - (recommendationScores.get(left.id) ?? 0)
      }
    })
  }, [categoryFilter, query, recommendationScores, sortBy])

  const selectedProduct = useMemo(() => {
    if (visibleProducts.length === 0) {
      return wigs.find((product) => product.id === selectedProductId) ?? wigs[0]
    }

    return visibleProducts.find((product) => product.id === selectedProductId) ?? visibleProducts[0]
  }, [selectedProductId, visibleProducts])

  const topMatch = recommendations[0]
  const fitSummary = getFitSummary(selectedProduct, headCircumference)
  const selectedScore = recommendationScores.get(selectedProduct.id) ?? 0
  const selectedSkinTone = skinTones.find((tone) => tone.label === skinTone) ?? skinTones[1]
  const measurementGuide = useMemo(
    () => [
      { label: '前额发际线到后颈', value: `${(headCircumference * 0.62).toFixed(1)} cm` },
      { label: '鬓角到鬓角', value: `${(headCircumference * 0.34).toFixed(1)} cm` },
      { label: '耳前到耳后', value: `${(headCircumference * 0.31).toFixed(1)} cm` },
      { label: '建议网帽', value: getCapSizeLabel(headCircumference) },
    ],
    [headCircumference],
  )

  const fitScore = clamp(
    Math.round(
      100 -
        (headCircumference < selectedProduct.capRange[0]
          ? (selectedProduct.capRange[0] - headCircumference) * 15
          : headCircumference > selectedProduct.capRange[1]
            ? (headCircumference - selectedProduct.capRange[1]) * 15
            : Math.abs(
                headCircumference -
                  (selectedProduct.capRange[0] + selectedProduct.capRange[1]) / 2,
              ) *
              7),
    ),
    55,
    98,
  )

  const comfortScore = clamp(
    Math.round(
      88 -
        Math.max(0, selectedProduct.density - 135) * 0.22 -
        Math.max(0, dailyHours - 6) * 2.5 +
        (selectedProduct.category === '医美修复' ? 8 : 0),
    ),
    58,
    97,
  )

  const stylingScore = clamp(
    Math.round(
      72 +
        Math.max(0, selectedProduct.heatResistance - 150) * 0.12 +
        Math.max(0, selectedProduct.length - 40) * 0.16 +
        (selectedProduct.category === '角色扮演' || selectedProduct.category === '舞台演出' ? 8 : 0),
    ),
    60,
    98,
  )

  const previewScale = faceShapePreviewScale[faceShape]
  const wearPreviewStyle = {
    '--wig-color': selectedProduct.colorHex,
    '--wig-accent': selectedProduct.accentHex,
    '--skin-tone': selectedSkinTone.hex,
    '--volume-scale': `${0.9 + volumeLevel / 190}`,
    '--drop-scale': `${0.85 + (selectedProduct.length / 70) * lengthFactor}`,
    '--face-width': `${previewScale.width}`,
    '--face-height': `${previewScale.height}`,
  } as CSSProperties

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand-mark">
          <span className="brand-mark__icon">MW</span>
          <div>
            <strong>MuseWig Atelier</strong>
            <span>3D 假发试戴与定制选购平台</span>
          </div>
        </div>
        <nav className="site-nav" aria-label="主导航">
          <a href="#catalog">产品库</a>
          <a href="#atelier">3D 试戴</a>
          <a href="#match">智能匹配</a>
          <a href="#care">护理指南</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="button button--secondary" href="#atelier">
          开始试戴
        </a>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} />
              为 Cosplay、日常、婚礼和修复场景而设计
            </span>
            <h1>让用户先“戴上去”，再决定买哪一款假发。</h1>
            <p className="hero-copy__lead">
              MuseWig Atelier
              把假发商品库、3D 旋转预览、头围尺码匹配、色系偏好和护理建议整合成一个完整选购网站，
              帮用户更快选到适合自己脸型、用途和佩戴时长的假发。
            </p>
            <div className="hero-actions">
              <a className="button button--primary" href="#atelier">
                进入 3D 试戴工作室
                <ArrowRight size={16} />
              </a>
              <a className="button button--ghost" href="#catalog">
                浏览全部系列
              </a>
            </div>
            <div className="hero-stats">
              <article>
                <strong>8 款精选</strong>
                <span>涵盖 cosplay、通勤、婚礼与修复</span>
              </article>
              <article>
                <strong>4 项尺寸</strong>
                <span>头围、鬓角、发际线、后颈推荐</span>
              </article>
              <article>
                <strong>3D 演示</strong>
                <span>长度、蓬松度、刘海状态实时预览</span>
              </article>
            </div>
          </div>

          <div className="hero-showcase">
            <div className="hero-showcase__card hero-showcase__card--lead">
              <div className="hero-showcase__topline">
                <span>本次最匹配</span>
                <strong>{topMatch.score}%</strong>
              </div>
              <h2>{topMatch.product.name}</h2>
              <p>{topMatch.product.summary}</p>
              <div className="hero-showcase__meta">
                <span>{topMatch.product.category}</span>
                <span>{money.format(topMatch.product.price)}</span>
                <span>{topMatch.product.leadTime}</span>
              </div>
              <ul className="reason-list">
                {topMatch.reasons.map((reason) => (
                  <li key={reason}>
                    <BadgeCheck size={16} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero-swatches">
              <article>
                <Palette size={18} />
                <div>
                  <strong>色系库</strong>
                  <p>从自然黑茶到未来感银灰，支持角色色与日常色。</p>
                </div>
              </article>
              <div className="swatch-row">
                {colorFamilies.map((family) => {
                  const tone = wigs.find((product) => product.colorFamily === family)?.colorHex ?? '#c9b5b5'

                  return (
                    <span key={family} className="swatch-pill">
                      <i style={{ backgroundColor: tone }} />
                      {family}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="hero-showcase__grid">
              <article className="mini-panel">
                <Ruler size={18} />
                <div>
                  <span>当前头围建议</span>
                  <strong>{getCapSizeLabel(headCircumference)}</strong>
                </div>
              </article>
              <article className="mini-panel">
                <Camera size={18} />
                <div>
                  <span>场景主线</span>
                  <strong>{useCase}</strong>
                </div>
              </article>
              <article className="mini-panel">
                <Sparkles size={18} />
                <div>
                  <span>站点定位</span>
                  <strong>高颜值 + 强决策辅助</strong>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section-block section-block--soft">
          <div className="section-heading">
            <span className="eyebrow">
              <SlidersHorizontal size={16} />
              产品定位与核心能力
            </span>
            <h2>这是一个“会帮用户做选择”的假发网站，不只是商品橱窗。</h2>
            <p>
              我把首页结构设计成适合美妆、发饰和造型类品牌的视觉语言：深酒红紫 + 玫瑰裸粉 + 香槟金，
              同时在功能层面补齐了商品浏览、试戴、匹配、护理和信任建立。
            </p>
          </div>
          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className="feature-card">
                <strong>{feature.metric}</strong>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block" id="catalog">
          <div className="section-heading section-heading--with-action">
            <div>
              <span className="eyebrow">
                <ShoppingBag size={16} />
                产品库 / Catalog
              </span>
              <h2>把各种假发都放进一个可筛选、可比较的商品库。</h2>
              <p>
                支持分类浏览、关键词搜索和智能排序。用户可以先在商品库缩小范围，再进入 3D
                试戴工作室深度比较。
              </p>
            </div>
            <a className="button button--ghost" href="#match">
              查看推荐逻辑
              <ChevronRight size={16} />
            </a>
          </div>

          <div className="catalog-controls">
            <label className="search-field">
              <Search size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索角色款、锁骨发、修复款、编发套组..."
              />
            </label>

            <label className="sort-field">
              <span>排序</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as CatalogSort)}>
                <option value="推荐度">推荐度</option>
                <option value="价格从低到高">价格从低到高</option>
                <option value="价格从高到低">价格从高到低</option>
                <option value="评分">评分</option>
              </select>
            </label>
          </div>

          <div className="chip-row" role="tablist" aria-label="假发分类">
            {categoryFilters.map((category) => (
              <button
                key={category}
                className={categoryFilter === category ? 'chip-button chip-button--active' : 'chip-button'}
                type="button"
                aria-pressed={categoryFilter === category}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {visibleProducts.length > 0 ? (
            <div className="catalog-grid">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  className={
                    product.id === selectedProduct.id
                      ? 'product-card product-card--active'
                      : 'product-card'
                  }
                  type="button"
                  onClick={() => {
                    setSelectedProductId(product.id)
                    setVolumeLevel(product.density)
                    setLengthFactor(1)
                    setShowBangs(product.category !== '舞台演出')
                  }}
                >
                  <div
                    className="product-card__cover"
                    style={{
                      background: `linear-gradient(140deg, ${product.accentHex}, ${product.colorHex})`,
                    }}
                  >
                    <span>{product.stockLabel}</span>
                    <strong>{product.colorFamily}</strong>
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__title-row">
                      <div>
                        <small>{product.category}</small>
                        <h3>{product.name}</h3>
                      </div>
                      <div className="rating-pill">
                        <Star size={14} />
                        {product.rating}
                      </div>
                    </div>
                    <p>{product.summary}</p>
                    <div className="product-card__facts">
                      <span>长度 {product.length} cm</span>
                      <span>密度 {product.density}%</span>
                      <span>网帽 {product.capRange[0]}-{product.capRange[1]} cm</span>
                    </div>
                    <div className="product-card__badges">
                      {product.badges.map((badge) => (
                        <span key={badge}>{badge}</span>
                      ))}
                    </div>
                    <div className="product-card__footer">
                      <strong>{money.format(product.price)}</strong>
                      <span>推荐度 {recommendationScores.get(product.id)}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>没有找到符合当前筛选的假发</strong>
              <p>试试切回“全部”，或者搜索“卷发、修复、婚礼”等关键词。</p>
            </div>
          )}
        </section>

        <section className="section-block section-block--contrast" id="atelier">
          <div className="section-heading">
            <span className="eyebrow">
              <PlayCircle size={16} />
              3D 试戴工作室 / Wig Atelier
            </span>
            <h2>核心卖点：把“头围 + 场景 + 脸型 + 色系”变成可视化试戴体验。</h2>
            <p>
              用户无需上传真人照片，也能通过假头模预览造型走向；后续如果要继续迭代，可在这个基础上接入
              AR、照片映射或下单系统。
            </p>
          </div>

          <div className="atelier-layout">
            <aside className="atelier-panel">
              <div className="panel-title">
                <Wand2 size={18} />
                <div>
                  <strong>试戴参数</strong>
                  <span>一边调整，一边看 3D 结果</span>
                </div>
              </div>

              <label className="range-field">
                <div>
                  <span>头围</span>
                  <strong>{headCircumference.toFixed(1)} cm</strong>
                </div>
                <input
                  type="range"
                  min="52"
                  max="62"
                  step="0.5"
                  value={headCircumference}
                  onChange={(event) => setHeadCircumference(Number.parseFloat(event.target.value))}
                />
              </label>

              <label className="range-field">
                <div>
                  <span>预算</span>
                  <strong>{money.format(budget)}</strong>
                </div>
                <input
                  type="range"
                  min="600"
                  max="1800"
                  step="50"
                  value={budget}
                  onChange={(event) => setBudget(Number.parseInt(event.target.value, 10))}
                />
              </label>

              <label className="range-field">
                <div>
                  <span>日均佩戴时长</span>
                  <strong>{dailyHours} 小时</strong>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={dailyHours}
                  onChange={(event) => setDailyHours(Number.parseInt(event.target.value, 10))}
                />
              </label>

              <label className="range-field">
                <div>
                  <span>蓬松度</span>
                  <strong>{volumeLevel}%</strong>
                </div>
                <input
                  type="range"
                  min="105"
                  max="180"
                  step="5"
                  value={volumeLevel}
                  onChange={(event) => setVolumeLevel(Number.parseInt(event.target.value, 10))}
                />
              </label>

              <label className="range-field">
                <div>
                  <span>长度强化</span>
                  <strong>{lengthFactor.toFixed(2)}x</strong>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.35"
                  step="0.05"
                  value={lengthFactor}
                  onChange={(event) => setLengthFactor(Number.parseFloat(event.target.value))}
                />
              </label>

              <div className="selector-group">
                <span>使用场景</span>
                <div className="chip-row chip-row--dense">
                  {useCases.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={useCase === item ? 'chip-button chip-button--active' : 'chip-button'}
                      onClick={() => {
                        setUseCase(item)
                        setCategoryFilter(useCaseCategoryMap[item])
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="selector-group">
                <span>脸型</span>
                <div className="chip-row chip-row--dense">
                  {faceShapes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={faceShape === item ? 'chip-button chip-button--active' : 'chip-button'}
                      onClick={() => setFaceShape(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="selector-group">
                <span>偏好色系</span>
                <div className="chip-row chip-row--dense">
                  {colorFamilies.map((family) => (
                    <button
                      key={family}
                      type="button"
                      className={
                        preferredColor === family ? 'chip-button chip-button--active' : 'chip-button'
                      }
                      onClick={() => setPreferredColor(family)}
                    >
                      {family}
                    </button>
                  ))}
                </div>
              </div>

              <div className="selector-group">
                <span>肤色参考</span>
                <div className="tone-row">
                  {skinTones.map((tone) => (
                    <button
                      key={tone.label}
                      type="button"
                      className={skinTone === tone.label ? 'tone-button tone-button--active' : 'tone-button'}
                      onClick={() => setSkinTone(tone.label)}
                    >
                      <i style={{ backgroundColor: tone.hex }} />
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="toggle-row">
                <span>开启刘海预览</span>
                <button
                  type="button"
                  className={showBangs ? 'switch switch--active' : 'switch'}
                  aria-pressed={showBangs}
                  onClick={() => setShowBangs((current) => !current)}
                >
                  <span />
                </button>
              </label>
            </aside>

            <div className="atelier-canvas-panel">
              <div className="atelier-canvas-panel__header">
                <div>
                  <span>当前选款</span>
                  <strong>{selectedProduct.name}</strong>
                </div>
                <div className="rating-pill">
                  <Sparkles size={14} />
                  匹配度 {selectedScore}%
                </div>
              </div>
              <Suspense fallback={<div className="wig-canvas wig-canvas--loading">3D 试戴模型加载中...</div>}>
                <WigCanvas
                  product={selectedProduct}
                  faceShape={faceShape}
                  skinToneHex={selectedSkinTone.hex}
                  volumeLevel={volumeLevel}
                  lengthFactor={lengthFactor}
                  showBangs={showBangs}
                />
              </Suspense>
              <div className="atelier-caption">
                <span>{selectedProduct.texture}</span>
                <span>耐热 {selectedProduct.heatResistance}°C</span>
                <span>{selectedProduct.leadTime}</span>
              </div>
            </div>

            <aside className="atelier-panel atelier-panel--insight">
              <div className="panel-title">
                <HeartHandshake size={18} />
                <div>
                  <strong>佩戴效果与下单建议</strong>
                  <span>前视试戴卡片 + 决策说明</span>
                </div>
              </div>

              <div className="wear-preview-card" style={wearPreviewStyle}>
                <div className="wear-preview-stage">
                  <div className="wear-hair wear-hair--halo" />
                  <div className="wear-hair wear-hair--left" />
                  <div className="wear-hair wear-hair--right" />
                  {showBangs && <div className="wear-hair wear-hair--bangs" />}
                  <div className="wear-face" />
                  <div className="wear-neck" />
                </div>
                <div className="wear-preview-copy">
                  <strong>{selectedProduct.category}</strong>
                  <p>
                    这张前视试戴卡片用于模拟用户在商品详情页里快速判断“显不显脸小、颜色适不适合、
                    长度会不会压脸”的第一眼效果。
                  </p>
                </div>
              </div>

              <div className={`fit-banner fit-banner--${fitSummary.tone}`}>
                <strong>{fitSummary.label}</strong>
                <p>{fitSummary.description}</p>
              </div>

              <div className="score-stack">
                <ScoreBar label="网帽贴合度" value={fitScore} description="基于当前头围与该款推荐区间计算" />
                <ScoreBar label="长时间舒适度" value={comfortScore} description="综合密度、类别和佩戴时长预估" />
                <ScoreBar label="造型扩展空间" value={stylingScore} description="结合耐热能力、长度与场景表现力" />
              </div>

              <div className="selected-product-meta">
                <div>
                  <small>推荐网帽</small>
                  <strong>{getCapSizeLabel(headCircumference)}</strong>
                </div>
                <div>
                  <small>价格</small>
                  <strong>{money.format(selectedProduct.price)}</strong>
                </div>
                <div>
                  <small>推荐场景</small>
                  <strong>{selectedProduct.bestFor.useCases[0]}</strong>
                </div>
              </div>

              <ul className="reason-list">
                {buildReasons(selectedProduct, {
                  useCase,
                  faceShape,
                  preferredColor,
                  headCircumference,
                  budget,
                }).map((reason) => (
                  <li key={reason}>
                    <BadgeCheck size={16} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="section-block" id="match">
          <div className="section-heading section-heading--with-action">
            <div>
              <span className="eyebrow">
                <Ruler size={16} />
                智能匹配 / Smart Match
              </span>
              <h2>把用户输入的信息，转换成可解释的推荐结果。</h2>
              <p>
                这部分既是产品功能，也是在转化页里建立信任的关键。用户不只看到“推荐”，还能知道为什么。
              </p>
            </div>
            <div className="pill-note">当前场景偏向：{useCaseCategoryMap[useCase]}</div>
          </div>

          <div className="match-layout">
            <div className="measurement-card">
              <div className="panel-title">
                <Ruler size={18} />
                <div>
                  <strong>头围测量提示</strong>
                  <span>引导用户填写真实尺寸，降低售后风险</span>
                </div>
              </div>
              <div className="measurement-grid">
                {measurementGuide.map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
              <p className="measurement-card__footer">
                如果用户头围小于 54 cm 或大于 60 cm，页面会主动提示选择小码 / 定制码，并建议联系客服确认。
              </p>
            </div>

            <div className="recommendation-list">
              {recommendations.slice(0, 3).map(({ product, score, reasons }, index) => (
                <article key={product.id} className="recommendation-item">
                  <div className="recommendation-item__rank">TOP {index + 1}</div>
                  <div className="recommendation-item__main">
                    <div className="recommendation-item__head">
                      <div>
                        <small>{product.category}</small>
                        <h3>{product.name}</h3>
                      </div>
                      <strong>{score}%</strong>
                    </div>
                    <p>{product.summary}</p>
                    <ul className="reason-list">
                      {reasons.map((reason) => (
                        <li key={reason}>
                          <BadgeCheck size={16} />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    设为当前试戴
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block section-block--soft">
          <div className="section-heading">
            <span className="eyebrow">
              <ShieldCheck size={16} />
              网站需要补齐的辅助模块
            </span>
            <h2>除了商品和试戴，还要把服务、护理和购买信心一起做进去。</h2>
            <p>这会让整个网站更像品牌官网 + 转化站，而不是一个单纯的活动落地页。</p>
          </div>

          <div className="pillar-grid">
            {servicePillars.map((pillar) => (
              <article key={pillar.title} className="pillar-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>

          <div className="steps-grid">
            {atelierSteps.map((step) => (
              <article key={step.title} className="step-card">
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block" id="care">
          <div className="section-heading section-heading--with-action">
            <div>
              <span className="eyebrow">
                <Scissors size={16} />
                护理与售后内容 / Care
              </span>
              <h2>把护理知识放进站点，有助于提升复购和降低售后摩擦。</h2>
              <p>用户在选择假发时很在意“买回来会不会难打理”，因此护理内容必须前置。</p>
            </div>
            <div className="pill-note">
              <Clock3 size={14} />
              适合放在商品详情页和下单页中复用
            </div>
          </div>

          <div className="care-grid">
            {careSteps.map((step) => (
              <article key={step.title} className="care-card">
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.name} className="testimonial-card">
                <p>“{item.quote}”</p>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block section-block--contrast" id="faq">
          <div className="section-heading">
            <span className="eyebrow">
              <CircleHelp size={16} />
              FAQ / 常见问题
            </span>
            <h2>提前回答用户最关心的问题，减少犹豫。</h2>
            <p>这里适合继续扩展尺寸、退换、护理、真假发材质差异等内容。</p>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__cta">
          <span className="eyebrow">
            <Sparkles size={16} />
            产品经理视角的最终落地
          </span>
          <h2>你要的网站已经具备：首页、产品库、3D 试戴、头围推荐、护理内容和 FAQ。</h2>
          <p>
            如果你下一步想继续做成真实商业站点，可以在这个基础上继续接支付、购物车、用户账号、真人上传照片、
            AR 试戴、预约咨询和订单系统。
          </p>
        </div>

        <div className="site-footer__links">
          <a href="#catalog">浏览产品库</a>
          <a href="#atelier">进入试戴工作室</a>
          <a href="#match">查看智能匹配</a>
        </div>
      </footer>
    </div>
  )
}

export default App
