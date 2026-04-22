export type WigCategory =
  | '角色扮演'
  | '日常通勤'
  | '医美修复'
  | '舞台演出'
  | '婚礼派对'

export type Texture = '顺直' | '空气卷' | '大波浪' | '编发' | '蛋卷'

export type FaceShape = '鹅蛋脸' | '圆脸' | '方脸' | '心形脸' | '长脸'

export type UseCase = '通勤上班' | '漫展出片' | '直播拍摄' | '婚礼宴会' | '术后修复'

export type ColorFamily = '黑茶原生' | '奶茶棕金' | '雾粉紫' | '亚麻金' | '银灰白'

export type SkinTone = '冷白皮' | '自然肤色' | '暖米肤色' | '深蜜肤色'

export interface WigProduct {
  id: string
  name: string
  category: WigCategory
  price: number
  rating: number
  texture: Texture
  length: number
  density: number
  heatResistance: number
  capRange: [number, number]
  leadTime: string
  colorFamily: ColorFamily
  colorHex: string
  accentHex: string
  stockLabel: string
  summary: string
  badges: string[]
  features: string[]
  bestFor: {
    faceShapes: FaceShape[]
    useCases: UseCase[]
    colorFamilies: ColorFamily[]
  }
}

export interface FeatureCard {
  title: string
  description: string
  metric: string
}

export interface ServicePillar {
  title: string
  description: string
}

export interface CareStep {
  title: string
  detail: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface Testimonial {
  name: string
  role: string
  quote: string
}

export const wigCategories: WigCategory[] = [
  '角色扮演',
  '日常通勤',
  '医美修复',
  '舞台演出',
  '婚礼派对',
]

export const faceShapes: FaceShape[] = ['鹅蛋脸', '圆脸', '方脸', '心形脸', '长脸']

export const useCases: UseCase[] = [
  '通勤上班',
  '漫展出片',
  '直播拍摄',
  '婚礼宴会',
  '术后修复',
]

export const colorFamilies: ColorFamily[] = [
  '黑茶原生',
  '奶茶棕金',
  '雾粉紫',
  '亚麻金',
  '银灰白',
]

export const skinTones: { label: SkinTone; hex: string }[] = [
  { label: '冷白皮', hex: '#f4d4c6' },
  { label: '自然肤色', hex: '#ddae8f' },
  { label: '暖米肤色', hex: '#c68a61' },
  { label: '深蜜肤色', hex: '#8e583d' },
]

export const useCaseCategoryMap: Record<UseCase, WigCategory> = {
  通勤上班: '日常通勤',
  漫展出片: '角色扮演',
  直播拍摄: '舞台演出',
  婚礼宴会: '婚礼派对',
  术后修复: '医美修复',
}

export const featureCards: FeatureCard[] = [
  {
    title: '3D 旋转展示',
    description: '实时预览长度、颜色、刘海和蓬松度，不用靠想象选假发。',
    metric: '120+ 造型组合',
  },
  {
    title: '头围智能匹配',
    description: '根据头围、额前发际线、鬓角到鬓角、后颈深度给出网帽建议。',
    metric: '4 项关键尺寸',
  },
  {
    title: '场景化选款',
    description: '把通勤、漫展、直播、婚礼、修复等需求转成直观推荐清单。',
    metric: '5 大场景路径',
  },
]

export const servicePillars: ServicePillar[] = [
  {
    title: '隐形发际线与轻薄网帽',
    description: '针对日常近距离佩戴优化发际线过渡，支持全蕾丝与半蕾丝方案。',
  },
  {
    title: 'Cosplay 角色色卡库',
    description: '覆盖高饱和角色色、渐变挑染与可加发片组合，适合出片和舞台。',
  },
  {
    title: '舒适度优先的定制建议',
    description: '结合头围与佩戴时长，推荐调节带、透气内衬与防滑夹组合。',
  },
  {
    title: '护理与复购体系',
    description: '洗护、造型、收纳、二次修剪一步到位，降低假发后期维护门槛。',
  },
]

export const careSteps: CareStep[] = [
  {
    title: '佩戴前预整形',
    detail: '将假发静置 10 分钟后梳理，热纤维款先用低温定型，再佩戴更自然。',
  },
  {
    title: '佩戴后轻梳分区',
    detail: '从发尾向上轻梳，卷发与蛋卷款建议使用宽齿梳与护理喷雾。',
  },
  {
    title: '收纳时保持弧度',
    detail: '长款假发建议上假发架，短款可放防尘袋，避免压扁顶部蓬松度。',
  },
]

export const faqs: FaqItem[] = [
  {
    question: '没有真人上传照片，这个网站也能帮助选款吗？',
    answer:
      '可以。当前版本先用 3D 假头模和前视试戴卡片做形态预览，再结合头围与使用场景给出推荐，适合初筛与下单前确认。',
  },
  {
    question: '头围不在常规范围怎么办？',
    answer:
      '当头围小于 54cm 或大于 60cm 时，系统会自动建议小码或定制 XL 网帽，并提示需要额外确认的尺寸项。',
  },
  {
    question: 'Cosplay 假发和日常假发推荐逻辑有什么不同？',
    answer:
      'Cosplay 会更看重颜色精度、出片层次和造型空间；日常款会更强调发际线、舒适度和长期佩戴稳定性。',
  },
  {
    question: '医美修复类假发会特别考虑什么？',
    answer:
      '重点是透气、轻量、亲肤与遮盖稳定性，推荐结果会优先考虑柔软内衬、轻密度和更稳的网帽结构。',
  },
]

export const testimonials: Testimonial[] = [
  {
    name: 'Mika',
    role: 'Cosplayer',
    quote: '以前买角色假发最怕颜色失真，这个站的 3D 预览和色卡匹配真的能提前避坑。',
  },
  {
    name: '林语',
    role: '婚礼造型师',
    quote: '我会先让客户填头围与场景偏好，再看推荐列表，沟通效率提升特别明显。',
  },
  {
    name: 'Sienna',
    role: '直播博主',
    quote: '试戴卡片能快速判断镜头里显不显脸小，比只看商品图更直观。',
  },
]

export const wigs: WigProduct[] = [
  {
    id: 'nebula-princess',
    name: 'Nebula Princess 渐变双马尾',
    category: '角色扮演',
    price: 899,
    rating: 4.9,
    texture: '大波浪',
    length: 65,
    density: 160,
    heatResistance: 180,
    capRange: [54, 58],
    leadTime: '现货 48h 发出',
    colorFamily: '雾粉紫',
    colorHex: '#b36fd9',
    accentHex: '#ffd6f7',
    stockLabel: '角色活动热卖',
    summary: '高饱和渐变色与双马尾轮廓适合漫展、棚拍和角色视频。',
    badges: ['全蕾丝发际线', '高显色', '可二次造型'],
    features: ['预留发缝', '双层加密', '轻量发尾', '拍摄不易炸毛'],
    bestFor: {
      faceShapes: ['鹅蛋脸', '心形脸', '长脸'],
      useCases: ['漫展出片', '直播拍摄'],
      colorFamilies: ['雾粉紫', '银灰白'],
    },
  },
  {
    id: 'soft-commute',
    name: 'Soft Commute 云感锁骨发',
    category: '日常通勤',
    price: 699,
    rating: 4.8,
    texture: '空气卷',
    length: 38,
    density: 125,
    heatResistance: 160,
    capRange: [53, 58],
    leadTime: '现货 24h 发出',
    colorFamily: '奶茶棕金',
    colorHex: '#7c5a4e',
    accentHex: '#dcc0a2',
    stockLabel: '通勤口碑款',
    summary: '轻盈锁骨长度搭配自然碎刘海，适合通勤与日常约会。',
    badges: ['轻薄网帽', '小脸修饰', '易打理'],
    features: ['空气刘海', '耳侧贴合', '低反光纤维', '全天舒适'],
    bestFor: {
      faceShapes: ['圆脸', '鹅蛋脸', '方脸'],
      useCases: ['通勤上班', '婚礼宴会'],
      colorFamilies: ['黑茶原生', '奶茶棕金'],
    },
  },
  {
    id: 'silk-revive',
    name: 'Silk Revive 轻羽修复款',
    category: '医美修复',
    price: 1280,
    rating: 4.9,
    texture: '顺直',
    length: 30,
    density: 110,
    heatResistance: 140,
    capRange: [52, 59],
    leadTime: '支持 1 对 1 定制',
    colorFamily: '黑茶原生',
    colorHex: '#2d2428',
    accentHex: '#958188',
    stockLabel: '舒适度优先',
    summary: '低密度轻量纤维配亲肤内衬，重点兼顾遮盖和长时间舒适度。',
    badges: ['医用级透气内衬', '亲肤低压', '可调节围度'],
    features: ['柔软内衬', '低压边缘', '稳定遮盖', '适合长时佩戴'],
    bestFor: {
      faceShapes: ['鹅蛋脸', '圆脸', '长脸', '方脸', '心形脸'],
      useCases: ['术后修复', '通勤上班'],
      colorFamilies: ['黑茶原生'],
    },
  },
  {
    id: 'stage-flare',
    name: 'Stage Flare 高颅顶长卷',
    category: '舞台演出',
    price: 1099,
    rating: 4.7,
    texture: '大波浪',
    length: 72,
    density: 170,
    heatResistance: 200,
    capRange: [55, 60],
    leadTime: '3 天内出货',
    colorFamily: '亚麻金',
    colorHex: '#b28a52',
    accentHex: '#f2de98',
    stockLabel: '镜头氛围感',
    summary: '高颅顶大波浪在直播和舞台灯下更有层次，适合存在感造型。',
    badges: ['舞台灯光友好', '高蓬松', '可热造型'],
    features: ['大卷层次', '高颅顶垫发', '镜头提亮', '耐热更强'],
    bestFor: {
      faceShapes: ['长脸', '心形脸', '鹅蛋脸'],
      useCases: ['直播拍摄', '婚礼宴会'],
      colorFamilies: ['亚麻金', '奶茶棕金'],
    },
  },
  {
    id: 'bride-veil',
    name: 'Bride Veil 水光盘发套组',
    category: '婚礼派对',
    price: 1499,
    rating: 5,
    texture: '编发',
    length: 45,
    density: 145,
    heatResistance: 170,
    capRange: [53, 57],
    leadTime: '预约款 5 天内',
    colorFamily: '黑茶原生',
    colorHex: '#473339',
    accentHex: '#f6d8cb',
    stockLabel: '婚礼主推',
    summary: '盘发底座与编发片组合，适合婚礼主纱、敬酒服与写真造型。',
    badges: ['套组更完整', '适配头纱', '可拆分佩戴'],
    features: ['盘发底座', '编发发片', '高光碎发', '礼服友好'],
    bestFor: {
      faceShapes: ['鹅蛋脸', '圆脸', '心形脸'],
      useCases: ['婚礼宴会', '直播拍摄'],
      colorFamilies: ['黑茶原生', '奶茶棕金'],
    },
  },
  {
    id: 'silver-bloom',
    name: 'Silver Bloom 未来感银灰短发',
    category: '角色扮演',
    price: 759,
    rating: 4.7,
    texture: '蛋卷',
    length: 28,
    density: 135,
    heatResistance: 170,
    capRange: [54, 59],
    leadTime: '现货 48h 发出',
    colorFamily: '银灰白',
    colorHex: '#c7c7d3',
    accentHex: '#f5f2ff',
    stockLabel: '高辨识角色色',
    summary: '银灰色短发带未来感光泽，适合机能风与中性角色演绎。',
    badges: ['短发控友好', '轻重量', '边缘服帖'],
    features: ['短层次', '冷调发丝', '轻松出片', '适合头盔造型'],
    bestFor: {
      faceShapes: ['方脸', '鹅蛋脸', '长脸'],
      useCases: ['漫展出片', '直播拍摄'],
      colorFamilies: ['银灰白', '雾粉紫'],
    },
  },
  {
    id: 'latte-volume',
    name: 'Latte Volume 慵懒羊毛卷',
    category: '日常通勤',
    price: 829,
    rating: 4.8,
    texture: '蛋卷',
    length: 42,
    density: 140,
    heatResistance: 160,
    capRange: [54, 58],
    leadTime: '现货 24h 发出',
    colorFamily: '奶茶棕金',
    colorHex: '#8c6546',
    accentHex: '#f1d6b5',
    stockLabel: '显脸小精选',
    summary: '羊毛卷自带氛围感和颅顶支撑，对圆脸和方脸更友好。',
    badges: ['修饰脸型', '蓬松显发量', '秋冬热门'],
    features: ['自然蓬松', '小脸比例', '拍照显立体', '日常百搭'],
    bestFor: {
      faceShapes: ['圆脸', '方脸', '心形脸'],
      useCases: ['通勤上班', '婚礼宴会'],
      colorFamilies: ['奶茶棕金', '亚麻金'],
    },
  },
  {
    id: 'moon-aisle',
    name: 'Moon Aisle 月光轻纱长直发',
    category: '婚礼派对',
    price: 1399,
    rating: 4.9,
    texture: '顺直',
    length: 60,
    density: 130,
    heatResistance: 170,
    capRange: [53, 58],
    leadTime: '预约款 72h 内确认',
    colorFamily: '黑茶原生',
    colorHex: '#34282d',
    accentHex: '#dcb8aa',
    stockLabel: '写真与主纱通用',
    summary: '自然长直发搭配柔和水光感，适合婚礼、写真和礼服造型。',
    badges: ['顺滑发尾', '低反光自然', '头纱兼容'],
    features: ['柔顺尾部', '发根轻立体', '适合礼服', '可二次卷发'],
    bestFor: {
      faceShapes: ['长脸', '鹅蛋脸', '心形脸'],
      useCases: ['婚礼宴会', '通勤上班'],
      colorFamilies: ['黑茶原生', '奶茶棕金'],
    },
  },
]
