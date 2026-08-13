/** 按月龄的喂养要点、辅食建议与早教陪玩内容（内置静态数据，仅供参考） */

export interface MonthRange {
  from: number // 含
  to: number // 不含
  label: string
}

export interface FeedingTips {
  range: MonthRange
  points: string[]
}

export const FEEDING_TIPS: FeedingTips[] = [
  {
    range: { from: 0, to: 1, label: '0-1月龄' },
    points: [
      '按需喂养，通常每 2-3 小时一次，每天 8-12 次',
      '配方奶单次约 60-90ml，观察饥饿信号而非死守钟点',
      '每天补充维生素 D 400IU',
      '拍嗝后再放下，减少吐奶',
    ],
  },
  {
    range: { from: 1, to: 3, label: '1-3月龄' },
    points: [
      '奶量逐步增加，单次约 90-150ml，每天 6-8 次',
      '每天总奶量约 600-900ml',
      '继续每天补充维生素 D 400IU',
      '白天吃奶间隔逐渐拉长，可开始培养昼夜规律',
    ],
  },
  {
    range: { from: 3, to: 6, label: '3-6月龄' },
    points: [
      '单次约 150-200ml，每天 5-6 次，总奶量约 800-1000ml',
      '以奶为唯一食物，满 6 月龄前不需要添加辅食和水',
      '可能出现厌奶期，属常见现象，不强迫进食',
      '临近 6 月龄可观察辅食信号：能扶坐、对食物感兴趣、挺舌反射消失',
    ],
  },
  {
    range: { from: 6, to: 7, label: '6-7月龄（辅食适应期）' },
    points: [
      '首选高铁米粉，从 1 勺开始逐步增加稠度和量',
      '每次只加一种新食物，观察 2-3 天有无过敏',
      '蛋黄从 1/4 开始逐步增加',
      '注意补铁：红肉泥、肝泥、高铁米粉',
      '继续以奶为主（约 800-1000ml），辅食每天 1 次',
    ],
  },
  {
    range: { from: 7, to: 9, label: '7-9月龄' },
    points: [
      '辅食每天 2 次，逐步引入肉泥、肝泥、蔬菜泥、水果泥',
      '质地从泥糊过渡到碎末状，鼓励咀嚼',
      '可以开始手指食物（香蕉条、蒸软的胡萝卜条）',
      '奶量保持约 700-900ml',
    ],
  },
  {
    range: { from: 9, to: 12, label: '9-12月龄' },
    points: [
      '辅食每天 2-3 次，逐步接近三餐节奏',
      '质地过渡到软烂的碎块状，练习自己抓食、用杯子喝水',
      '食材种类尽量丰富：谷物、肉蛋、豆制品、蔬果',
      '奶量保持约 600-800ml，1 岁前不喝鲜奶、不加盐和糖',
    ],
  },
  {
    range: { from: 12, to: 36, label: '12月龄以上' },
    points: [
      '一日三餐 + 2 次加餐，与家人同桌进食',
      '奶量约 400-500ml，可逐步引入鲜牛奶',
      '清淡饮食，少盐少糖，避免整粒坚果等呛噎风险食物',
      '尊重食欲，不追喂、不强迫',
    ],
  },
]

export interface PlayPlan {
  range: MonthRange
  items: { category: string; icon: string; activities: string[] }[]
}

export const PLAY_PLANS: PlayPlan[] = [
  {
    range: { from: 0, to: 1, label: '0-1月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['清醒时每天俯卧练习（趴一趴）几分钟', '轻柔的抚触操'] },
      { category: '精细动作', icon: '👌', activities: ['把手指放进宝宝掌心让 TA 抓握'] },
      { category: '语言', icon: '💬', activities: ['多和宝宝说话、哼歌', '模仿宝宝发出的声音'] },
      { category: '认知', icon: '🧠', activities: ['黑白卡距离眼睛 20-30cm 缓慢移动', '摇铃在两侧轻响，观察转头'] },
      { category: '社交情感', icon: '😊', activities: ['多进行眼神对视', '及时回应哭声，建立安全感'] },
    ],
  },
  {
    range: { from: 1, to: 2, label: '1-2月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['每天累计 15-30 分钟俯卧抬头练习', '仰卧时做蹬腿小操'] },
      { category: '精细动作', icon: '👌', activities: ['让宝宝握住不同质地的小物品'] },
      { category: '语言', icon: '💬', activities: ['面对面慢速说话，留出「回应」时间', '常叫宝宝的名字'] },
      { category: '认知', icon: '🧠', activities: ['追视练习：玩具左右缓慢移动', '听不同的音乐和声音'] },
      { category: '社交情感', icon: '😊', activities: ['对宝宝微笑，逗引社会性微笑'] },
    ],
  },
  {
    range: { from: 2, to: 3, label: '2-3月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['俯卧抬头 45-90 度练习', '竖抱练习颈部力量（注意护头）'] },
      { category: '精细动作', icon: '👌', activities: ['悬挂玩具让宝宝挥手碰触', '把摇铃放进手里摇一摇'] },
      { category: '语言', icon: '💬', activities: ['回应宝宝的「咿呀」声，进行「对话」'] },
      { category: '认知', icon: '🧠', activities: ['照镜子认识自己', '不同方向发出声音让宝宝寻找'] },
      { category: '社交情感', icon: '😊', activities: ['多做鬼脸、夸张表情逗笑'] },
    ],
  },
  {
    range: { from: 3, to: 4, label: '3-4月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['引导从仰卧向侧卧翻身', '俯卧时用玩具引导抬头挺胸'] },
      { category: '精细动作', icon: '👌', activities: ['主动伸手够悬挂玩具', '双手到中线互握玩手'] },
      { category: '语言', icon: '💬', activities: ['读简单的儿歌童谣，有节奏地念'] },
      { category: '认知', icon: '🧠', activities: ['玩不同声音的玩具', '看高对比度彩色图卡'] },
      { category: '社交情感', icon: '😊', activities: ['躲猫猫初级版：用手帕遮脸再露出'] },
    ],
  },
  {
    range: { from: 4, to: 5, label: '4-5月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['练习从仰卧翻到俯卧', '靠坐练习（用枕头支撑）', '俯卧伸手够玩具'] },
      { category: '精细动作', icon: '👌', activities: ['主动抓握不同大小的玩具', '撕纸游戏（锻炼手指）'] },
      { category: '语言', icon: '💬', activities: ['模仿不同的声音', '常描述正在做的事「我们换尿布啦」'] },
      { category: '认知', icon: '🧠', activities: ['玩具掉落游戏，观察宝宝找寻', '认识常见物品并命名'] },
      { category: '社交情感', icon: '😊', activities: ['照镜子互动', '举高高等亲子游戏（轻柔）'] },
    ],
  },
  {
    range: { from: 5, to: 6, label: '5-6月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['熟练双向翻身', '拉坐练习', '扶腋下蹦跳'] },
      { category: '精细动作', icon: '👌', activities: ['双手倒换玩具', '敲打积木发声'] },
      { category: '语言', icon: '💬', activities: ['辅音练习：ba、ma、da', '看布书讲简单内容'] },
      { category: '认知', icon: '🧠', activities: ['寻找部分遮住的玩具', '认识家庭成员称呼'] },
      { category: '社交情感', icon: '😊', activities: ['分辨生人熟人属正常，多陪伴安抚'] },
    ],
  },
  {
    range: { from: 6, to: 8, label: '6-8月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['独坐练习', '腹爬引导：玩具放在够不到的前方'] },
      { category: '精细动作', icon: '👌', activities: ['拇食指捏小物练习（注意防误吞）', '双手对敲玩具'] },
      { category: '语言', icon: '💬', activities: ['重复叠词：爸爸、妈妈、拿拿', '指认图片上的动物'] },
      { category: '认知', icon: '🧠', activities: ['藏找游戏：完全盖住玩具再找', '因果玩具：按了会响会亮'] },
      { category: '社交情感', icon: '😊', activities: ['挥手再见、拍手欢迎等社交动作'] },
    ],
  },
  {
    range: { from: 8, to: 10, label: '8-10月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['手膝爬行练习', '扶站练习', '坐位转身取物'] },
      { category: '精细动作', icon: '👌', activities: ['把小物放进容器再倒出', '翻厚纸板书'] },
      { category: '语言', icon: '💬', activities: ['听懂简单指令「给我」「拍手」', '有意识叫爸爸妈妈的引导'] },
      { category: '认知', icon: '🧠', activities: ['模仿动作：拍桌子、摇头', '认五官游戏'] },
      { category: '社交情感', icon: '😊', activities: ['轮流游戏：你给我、我给你'] },
    ],
  },
  {
    range: { from: 10, to: 12, label: '10-12月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['扶走练习、推小车走', '蹲下捡东西再站起'] },
      { category: '精细动作', icon: '👌', activities: ['搭 2 块积木', '涂鸦：握粗蜡笔随意画'] },
      { category: '语言', icon: '💬', activities: ['每天亲子共读 10 分钟以上', '用简单词语表达需求的引导'] },
      { category: '认知', icon: '🧠', activities: ['形状盒配对玩具', '指认身体部位'] },
      { category: '社交情感', icon: '😊', activities: ['和同龄宝宝接触', '简单的假装游戏：喂娃娃'] },
    ],
  },
  {
    range: { from: 12, to: 18, label: '12-18月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['独走练习、扶栏上台阶', '踢球、扔球'] },
      { category: '精细动作', icon: '👌', activities: ['搭 3-4 块积木', '用勺子自己吃饭', '串大珠子'] },
      { category: '语言', icon: '💬', activities: ['指认图书中的物品并命名', '鼓励用词语代替手势'] },
      { category: '认知', icon: '🧠', activities: ['简单拼图（2 块）', '大小、里外等概念游戏'] },
      { category: '社交情感', icon: '😊', activities: ['做家务模仿游戏', '表达情绪时帮 TA 命名情绪'] },
    ],
  },
  {
    range: { from: 18, to: 24, label: '18-24月龄' },
    items: [
      { category: '大运动', icon: '🏃', activities: ['跑步、双脚跳', '独自上下台阶练习'] },
      { category: '精细动作', icon: '👌', activities: ['搭 6 块以上积木', '模仿画直线', '翻书、拧瓶盖'] },
      { category: '语言', icon: '💬', activities: ['两词句表达「妈妈抱」「要喝水」', '简单问答互动'] },
      { category: '认知', icon: '🧠', activities: ['颜色配对游戏', '按用途指认物品「哪个用来喝水」'] },
      { category: '社交情感', icon: '😊', activities: ['和小朋友平行游戏', '建立简单规则意识：轮流、等待'] },
    ],
  },
]

export function findFeedingTips(monthAge: number): FeedingTips {
  return (
    FEEDING_TIPS.find((t) => monthAge >= t.range.from && monthAge < t.range.to) ??
    FEEDING_TIPS[FEEDING_TIPS.length - 1]
  )
}

export function findPlayPlanIndex(monthAge: number): number {
  const idx = PLAY_PLANS.findIndex((p) => monthAge >= p.range.from && monthAge < p.range.to)
  return idx === -1 ? PLAY_PLANS.length - 1 : idx
}

/** 辅食开始建议月龄（满 6 月龄） */
export const SOLID_FOOD_START_MONTH = 6
