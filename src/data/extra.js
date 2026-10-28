import { VIDEOS, getVideo, queryVideos } from './videos.js'

/** 首页轮播 */
export const BANNERS = ['tv-01', 'movie-02', 'movie-03', 'tv-02', 'anime-01', 'doc-02']
  .map((id) => getVideo(id))
  .filter(Boolean)
  .map((v) => ({
    id: v.id,
    title: v.title,
    subtitle: `${v.desc.slice(0, 26)}…`,
    typeName: v.typeName,
    score: v.score,
    poster: v.posterLarge,
    video: v
  }))

/** 大家都在搜 */
export const HOT_SEARCH = [
  '蒸蒸日上',
  '现在就出发4',
  '大淘金',
  '诺斯费拉图',
  '大都会',
  '活死人之夜',
  '三个臭皮匠',
  '乐一通',
  '大力水手',
  '福尔摩斯',
  '星际机甲',
  '陈查理'
]

/** 搜索发现 - 分类热词 */
export const SEARCH_DISCOVER = [
  { title: '正版热播', keywords: ['蒸蒸日上', '现在就出发4'] },
  { title: '影史经典', keywords: ['诺斯费拉图', '大都会', '月球旅行记'] },
  { title: '惊悚悬疑', keywords: ['活死人之夜', '灵魂狂欢节', '陈查理'] },
  { title: '下饭喜剧', keywords: ['三个臭皮匠', '达斯蒂的旅程', '恐怖小店'] },
  { title: '亲子时光', keywords: ['大力水手', '漫画童谣集', '气球乐园的一天'] }
]

/** 联想词 */
export function suggest(keyword, limit = 8) {
  const kw = String(keyword || '').trim().toLowerCase()
  if (!kw) return HOT_SEARCH.slice(0, limit)
  const titleHits = VIDEOS.filter(
    (v) => v.title.toLowerCase().includes(kw) || v.genres.some((g) => g.includes(kw))
  ).map((v) => v.title)
  const artistHits = Array.from(
    new Set(
      VIDEOS.flatMap((v) => v.cast.map((c) => c.name)).filter((n) =>
        n.toLowerCase().includes(kw)
      )
    )
  )
  return Array.from(new Set([...titleHits, ...artistHits])).slice(0, limit)
}

/** 榜单分组 */
export const RANK_TABS = [
  { key: 'hot', name: '热播榜' },
  { key: 'score', name: '高分榜' },
  { key: 'new', name: '新上线' }
]

export const RANK_GROUPS = [
  { key: 'tv', name: '电视剧' },
  { key: 'movie', name: '电影' },
  { key: 'variety', name: '综艺' },
  { key: 'anime', name: '动漫' }
]

export function rankList(type, sort = 'hot', limit = 10) {
  return queryVideos({ type, sort, pageSize: limit }).list
}

/** 弹幕池 */
export const DANMAKU_POOL = [
  '前方高能',
  '这段太好哭了',
  '编剧这波在线',
  '背景音乐好评',
  '我直接锁死',
  '这里转场封神',
  '演技一直在线',
  '为了它充了会员',
  '这个画质太顶了',
  '镜头语言牛啊',
  '我没看懂，谁来解释一下',
  '二刷打卡',
  '第三遍还是会被打动',
  '这不科学吧',
  '前面憋住别哭',
  '细节控狂喜',
  '弹幕护体',
  '出现即巅峰',
  '回忆杀来了',
  '导演是懂留白的',
  '服化道一百分',
  '这个布景太用心了',
  '给我看饿了',
  '求背景音乐名字',
  '为什么我一到这里就鼻酸',
  '疯狂打 call',
  '这台词我可以背下来',
  '终于更新了',
  '会员没白充',
  '这段我看了十遍',
  '神仙打架',
  '这波操作是对的',
  '我直接路转粉',
  '此处省略一万字',
  '爷青回',
  '画质一下子就上来了',
  '主角也太帅了吧',
  '后期是我失散多年的兄弟',
  '看完想去旅行了',
  '这剧情我要倒回去看'
]

function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** ---------- 评论 ---------- */
const COMMENT_USERS = [
  { name: '夏天的第一颗糖', emoji: '🍬', vip: true, level: 6 },
  { name: '人间清醒小分队', emoji: '🧊', vip: false, level: 4 },
  { name: '陈皮不加糖', emoji: '🍊', vip: true, level: 8 },
  { name: '一只干饭武昌鱼', emoji: '🐟', vip: false, level: 3 },
  { name: '此间少年游', emoji: '🌿', vip: true, level: 7 },
  { name: '不打伞的猫', emoji: '🐈', vip: false, level: 5 },
  { name: '雾都里的灯塔', emoji: '🌫', vip: false, level: 2 },
  { name: '夜班司机老周', emoji: '🚕', vip: true, level: 9 },
  { name: '早八人自救指南', emoji: '☕', vip: false, level: 4 },
  { name: '追剧不睡觉', emoji: '🌙', vip: true, level: 6 },
  { name: '爱喝冰美式', emoji: '🥤', vip: false, level: 3 },
  { name: '南墙下的葡萄藤', emoji: '🍇', vip: false, level: 5 }
]

const COMMENT_TEXTS = [
  '看到第 18 分钟我才明白前面那个伏笔，太妙了。',
  '叙事节奏很舒服，不急不躁，这个导演有东西。',
  '点进来只是随便看看，结果一口气刷完，值得。',
  '这部剧的配乐我要单独夸一夸，每一次响起都恰到好处。',
  '看完最大的感受是：普通人的一生也值得被认真记录。',
  '这是我今年看过最好的国产剧，没有之一。',
  '镜头语言很克制，很多情绪都藏在留白里。',
  '角色塑造很立体，反派也有自己的逻辑，不是工具人。',
  '本来打算看一集就睡，凌晨三点了我还在看。',
  '细节控狂喜，道具和场景都经得起推敲。',
  '前半段铺垫有点慢，但后面全部收回来的时候真的很爽。',
  '演技在线，眼神戏尤其好，不需要台词就已经说清楚了。',
  '作为土生土长的本地人，这个方言还原度可以给满分。',
  '被朋友按头安利来的，果然没让我失望。',
  '这个结局的处理我很喜欢，没有强行圆满。',
  '剪辑很有想法，几处蒙太奇用得相当精准。',
  '很少会在评论区写这么多字，但这次是真的被打动了。'
]

/** 按视频 id 稳定生成评论 */
export function getComments(id) {
  const rnd = mulberry32(hashSeed(id || 'default'))
  const count = 6 + Math.floor(rnd() * 6)
  const used = new Set()
  const list = []
  for (let i = 0; i < count; i += 1) {
    const ui = Math.floor(rnd() * COMMENT_USERS.length)
    let ti = Math.floor(rnd() * COMMENT_TEXTS.length)
    while (used.has(ti)) ti = (ti + 1) % COMMENT_TEXTS.length
    used.add(ti)
    const u = COMMENT_USERS[ui]
    list.push({
      id: `${id}-c${i}`,
      user: u.name,
      emoji: u.emoji,
      vip: u.vip,
      level: u.level,
      text: COMMENT_TEXTS[ti],
      likes: Math.floor(rnd() * 30000),
      replies: Math.floor(rnd() * 120),
      time: ['刚刚', '10 分钟前', '1 小时前', '昨天', '2 天前', '4 天前'][Math.floor(rnd() * 6)],
      liked: false,
      mine: false,
      weight: rnd()
    })
  }
  return list.sort((a, b) => b.weight - a.weight)
}
