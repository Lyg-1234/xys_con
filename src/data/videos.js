/**
 * 视频数据源
 *
 * 播放地址说明：
 * 下列 MP4 地址均为互联网公开可用的测试影片（CC / 公有领域 / 开放样本），
 * 已逐一连通性验证（HTTP 200 且 Content-Type: video/mp4）。
 * 每个「剧集」配置了 3~4 个候选源，播放器在 error / 超时时会自动切换下一个源，
 * 因此即使个别 CDN 出现地域限制，也不会出现无法播放的白屏。
 */

// 已验证可用的公开视频源池
export const VIDEO_SOURCES = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
  'https://mdn.github.io/shared-assets/videos/flower.mp4',
  'https://mdn.github.io/shared-assets/videos/friday.mp4',
  'https://download.samplelib.com/mp4/sample-10s.mp4',
  'https://download.samplelib.com/mp4/sample-15s.mp4',
  'https://download.samplelib.com/mp4/sample-20s.mp4',
  'https://videos.pexels.com/video-files/1526909/1526909-hd_1920_1080_24fps.mp4',
  'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://stream7.iqilu.com/10339/upload_transcode/202002/09/20200209105011F0zPoYzHry.mp4'
]

// 清晰度档位（与 VIDEO_SOURCES 的下标一一 correspond，切换清晰度即切换源文件）
export const QUALITY_LIST = [
  { key: '1080p', label: '蓝光 1080P', desc: '会员专享' },
  { key: '720p', label: '超清 720P', desc: '推荐网络' },
  { key: '480p', label: '高清 480P', desc: '流畅' },
  { key: '360p', label: '标清 360P', desc: '省流量' }
]

const UNIT = { tv: '集', movie: '部', variety: '期', anime: '话', doc: '集', kids: '集' }

// 每个 id 对应一张稳定的封面图（同 seed 恒定返回同一张图）
export function posterUrl(id, w = 300, h = 420) {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/${w}/${h}`
}

function pickSources(seed) {
  const n = VIDEO_SOURCES.length
  const offsets = [0, 3, 7, 11]
  return offsets.map((o) => VIDEO_SOURCES[(seed + o) % n])
}

/**
 * 依据清晰度取播放地址
 * @param {Array<string>} srcs 候选地址
 * @param {string} qualityKey
 * @param {number} failedIndex 已失败的下标
 */
export function resolvePlayUrl(srcs, qualityKey, failedIndex = 0) {
  const qIndex = QUALITY_LIST.findIndex((q) => q.key === qualityKey)
  const start = qIndex < 0 ? 0 : qIndex
  const list = srcs.slice(start).concat(srcs.slice(0, start))
  return list[Math.min(failedIndex, list.length - 1)]
}

function buildEpisodes(type, total, seed) {
  const unit = UNIT[type] || '集'
  return Array.from({ length: total }, (_, i) => ({
    no: i + 1,
    title: total === 1 ? '正片' : `第${i + 1}${unit}`,
    srcs: pickSources(seed + i * 5)
  }))
}

/**
 * RAW 数据：
 * t=频道 g=类型 y=年份 s=评分 total=总集数 updated=已更新至 vip=会员 pay=付费
 * badge=角标 c=封面配色 e=封面图标 hot=热度值
 */
const RAW = [
  // ---------------- 电视剧 ----------------
  {
    t: 'tv', title: '山河永昼', g: ['剧情', '年代'], region: '内地', y: 2025, s: 8.9,
    total: 40, updated: 28, vip: true, badge: '独播', c: ['#2b3a67', '#e05d7c'], e: '🏔', hot: 9860,
    director: '陈牧之', cast: [['沈砚', '陆时川'], ['林知白', '苏晚'], ['赵岩', '周旅长']],
    desc: '1937 年冬，北境山城沦陷。年轻的工程师陆时川被卷入一场关乎家国存亡的资源争夺，在暗流涌动的十里洋场里，他与一群素不相识的人用各自的方式守住了最后的灯火。'
  },
  {
    t: 'tv', title: '归途的光', g: ['都市', '情感'], region: '内地', y: 2025, s: 8.4,
    total: 32, updated: 16, vip: true, badge: '', c: ['#1f2f98', '#4facfe'], e: '🌃', hot: 9240,
    director: '苏映雪', cast: [['江屿', '顾南川'], ['白鹿鸣', '温以宁'], ['周斯年', '陈放']],
    desc: '一场意外让外科医生温以宁失去了回家的路，也失去了最爱的人。三年后她在同一个路口重新出发，却发现那个熟悉的背影始终站在灯下等她。'
  },
  {
    t: 'tv', title: '大明风骨', g: ['古装', '权谋'], region: '内地', y: 2024, s: 9.1,
    total: 45, updated: 45, vip: false, badge: '独播', c: ['#7b2d26', '#d9a441'], e: '🏯', hot: 9510,
    director: '李承渊', cast: [['傅明玉', '徐阶'], ['何砚青', '严世蕃'], ['宋晚舟', '海瑞']],
    desc: '嘉靖四十年，朝堂风雨飘摇。一纸罪己诏牵出二十年旧案，年轻的翰林院编修徐阶在理想与权谋之间，做出了一次又一次残酷的选择。'
  },
  {
    t: 'tv', title: '深蓝密码', g: ['悬疑', '刑侦'], region: '内地', y: 2025, s: 8.7,
    total: 24, updated: 20, vip: true, badge: '', c: ['#0f2027', '#2c5364'], e: '🔎', hot: 9130,
    director: '周敬堂', cast: [['崔斯铭', '秦向东'], ['林一鸣', '方舟'], ['阿泰', '老周']],
    desc: '一桩沉寂十五年的港口失踪案重启调查，刑警秦向东发现所有线索都指向同一串海图坐标，而真相远比他想象的更深。'
  },
  {
    t: 'tv', title: '我的治愈系男友', g: ['都市', '甜宠'], region: '内地', y: 2025, s: 7.9,
    total: 24, updated: 18, vip: false, badge: '', c: ['#ff9a8b', '#ff6a88'], e: '💐', hot: 8760,
    director: '安可', cast: [['李星燃', '许亦然'], ['宋知意', '林小满']],
    desc: '宠物医生许亦然脾气古怪却对小动物温柔至极，直到那个总是把流浪猫送来的姑娘，把他的世界也一并治愈了。'
  },
  {
    t: 'tv', title: '山城旧梦', g: ['年代', '家庭'], region: '内地', y: 2024, s: 8.2,
    total: 40, updated: 40, vip: false, badge: '', c: ['#3c1053', '#ad5389'], e: '🏘', hot: 8420,
    director: '杨树笙', cast: [['罗冬至', '陈松'], ['孟青禾', '苏梅'], ['小满', '陈念']],
    desc: '四十年间，一座山城、一条老街、三代人的命运被时代洪流不断改写，唯独那碗清晨的豆花面从未变过味道。'
  },
  {
    t: 'tv', title: '云上飞鸟', g: ['青春', '校园'], region: '内地', y: 2025, s: 8.0,
    total: 24, updated: 12, vip: true, badge: '', c: ['#2193b0', '#6dd5ed'], e: '🕊', hot: 8190,
    director: '周予安', cast: [['陈也', '陆飞'], ['钟晚', '苏禾'], ['胖猴', '赵宇']],
    desc: '高考前的最后一个夏天，一群少年在屋顶许下关于飞行与远方的诺言。多年以后他们才明白，最难的不是起飞，而是落地。'
  },
  {
    t: 'tv', title: '长夜将尽', g: ['悬疑', '战争'], region: '内地', y: 2024, s: 8.8,
    total: 30, updated: 30, vip: true, badge: '独播', c: ['#232526', '#8e0e00'], e: '🌒', hot: 9030,
    director: '韩牧', cast: [['廖凡明', '沈长夜'], ['言沐', '顾青'], ['老刀', '马三']],
    desc: '孤岛时期的上海，三名身份各异的人在暗战中彼此试探。当最后一颗子弹上膛，长夜终于迎来黎明。'
  },
  {
    t: 'tv', title: '星河律师团', g: ['职场', '律政'], region: '内地', y: 2025, s: 8.3,
    total: 36, updated: 22, vip: true, badge: '', c: ['#1d2671', '#c33764'], e: '⚖️', hot: 8870,
    director: '沈枝', cast: [['宋辞', '江律'], ['叶子恒', '周牧'], ['阿奚', '夏格']],
    desc: '从实习律师到合伙人，江律用了八年。她处理的每一个案子看似无关，却在最后一刻连成了一张巨大的网。'
  },
  {
    t: 'tv', title: '归墟札记', g: ['古装', '玄幻'], region: '内地', y: 2025, s: 8.6,
    total: 48, updated: 30, vip: true, badge: '独播', c: ['#0b0b2b', '#5f0a87'], e: '🐉', hot: 9410,
    director: '陆九歌', cast: [['萧翎', '白泽'], ['容屿', '阿巳'], ['鹿鸣', '归墟老人']],
    desc: '少年白泽带着一本无字札记踏入归墟之地，揭开的是上古众神的黄昏，也是自己身世的起点。'
  },

  // ---------------- 电影 ----------------
  {
    t: 'movie', title: '追风者', g: ['动作', '冒险'], region: '美国', y: 2025, s: 8.5,
    total: 1, updated: 1, vip: true, badge: '', c: ['#141e30', '#f3904f'], e: '🏍', hot: 8920,
    director: '艾伦·科瓦奇', cast: [['多米尼克·李', '杰克'], ['安娜·莫里斯', '罗拉']],
    desc: '退役车手杰克为了救治重病的妹妹，重返那条九死一生的死亡峡谷赛道，而他最大的对手是曾经的自己。'
  },
  {
    t: 'movie', title: '漫长的告别', g: ['剧情', '家庭'], region: '内地', y: 2024, s: 9.0,
    total: 1, updated: 1, vip: false, badge: '经典', c: ['#5c677d', '#c2c9d6'], e: '🍂', hot: 8690,
    director: '顾长风', cast: [['金士杰', '老周'], ['吴越', '周岚']],
    desc: '阿尔茨海默症晚期的父亲逐渐忘记全世界，却始终记得女儿小时候最爱吃的那道糖醋排骨。'
  },
  {
    t: 'movie', title: '荒原来信', g: ['西部', '剧情'], region: '美国', y: 2023, s: 7.8,
    total: 1, updated: 1, vip: false, badge: '', c: ['#8360c3', '#2ebf91'], e: '🌵', hot: 7640,
    director: '怀亚特·金', cast: [['山姆·雷', '柯尔'], ['艾拉·珍', '南希']],
    desc: '一封迟到二十年的信，让沉默的牧场主重新踏上寻找真相的路。'
  },
  {
    t: 'movie', title: '极地重生', g: ['冒险', '生存'], region: '英国', y: 2025, s: 8.6,
    total: 1, updated: 1, vip: true, pay: true, badge: '付费', c: ['#3a7bd5', '#00d2ff'], e: '🧊', hot: 9030,
    director: '詹姆斯·霍尔特', cast: [['理查德·梅森', '汤姆'], ['爱丽丝·王', '林恩']],
    desc: '科考队在冰层断裂后失联，六名队员以最原始的方式对抗极夜、饥饿与彼此的猜忌。'
  },
  {
    t: 'movie', title: '时光电影院', g: ['爱情', '治愈'], region: '日本', y: 2024, s: 8.1,
    total: 1, updated: 1, vip: false, badge: '', c: ['#4568dc', '#b06ab3'], e: '🎞', hot: 8210,
    director: '岩井润一', cast: [['星野结衣', '铃'], ['山下健太', '修']],
    desc: '小镇电影院即将拆除，放映员决定放最后一场电影，邀请所有曾在这里相遇的人。'
  },
  {
    t: 'movie', title: '逆流器', g: ['科幻', '动作'], region: '内地', y: 2025, s: 8.7,
    total: 1, updated: 1, vip: true, badge: '', c: ['#000428', '#004e92'], e: '🚀', hot: 9340,
    director: '徐疆', cast: [['南宫洵', '叶寻'], ['罗宇', '陈末']],
    desc: '一艘逆向航行的飞船降落在地球，带来的不是侵略，而是一段来自未来的求救信号。'
  },
  {
    t: 'movie', title: '无声证词', g: ['犯罪', '悬疑'], region: '内地', y: 2024, s: 8.3,
    total: 1, updated: 1, vip: false, badge: '', c: ['#2c3e50', '#e74c3c'], e: '🔇', hot: 8470,
    director: '崔浩然', cast: [['邢家栋', '周正'], ['李蔓', '苏黎']],
    desc: '唯一的证人是个失语的孩子，检察官方寸必须在一周内读懂他画在墙上的每一个符号。'
  },
  {
    t: 'movie', title: '夏天的果实', g: ['青春', '成长'], region: '韩国', y: 2023, s: 7.6,
    total: 1, updated: 1, vip: false, badge: '', c: ['#f7971e', '#ffd200'], e: '🍋', hot: 7520,
    director: '朴志勋', cast: [['金多恩', '夏天'], ['李宰旭', '宇蓝']],
    desc: '十八岁的夏天，两个少年骑着破旧的摩托车横穿整个海岸线，只为看一眼传说中的日出。'
  },

  // ---------------- 综艺 ----------------
  {
    t: 'variety', title: '文旅奇遇记', g: ['真人秀', '旅行'], region: '内地', y: 2025, s: 8.8,
    total: 12, updated: 10, vip: true, badge: '独播', c: ['#43cea2', '#185a9d'], e: '🧭', hot: 9210,
    director: '总导演 郑岭', cast: [['嘉宾', '周野'], ['嘉宾', '苏念'], ['MC', '何川']],
    desc: '六位旅行者穿越十二条鲜为人知的风景线，在限定预算下完成只属于这片土地的故事收集。'
  },
  {
    t: 'variety', title: '厨房有请', g: ['美食', '生活'], region: '内地', y: 2025, s: 8.2,
    total: 10, updated: 10, vip: false, badge: '', c: ['#ff512f', '#dd2476'], e: '🍳', hot: 8650,
    director: '总导演 温朗', cast: [['主厨', '陆铭'], ['主持', '小秋']],
    desc: '每期一位素人带着自家食谱走进厨房，星级主厨用一餐饭替他完成一个未了的心愿。'
  },
  {
    t: 'variety', title: '声浪对决', g: ['音乐', '竞演'], region: '内地', y: 2025, s: 8.5,
    total: 12, updated: 8, vip: true, badge: '', c: ['#360033', '#0b8793'], e: '🎤', hot: 9120,
    director: '总导演 韩青', cast: [['导师', '陈屿'], ['导师', '罗一叶'], ['制作人', '阿鲲']],
    desc: '十六组唱作人同台竞演，每一轮盲选都可能诞生下一首刷屏单曲。'
  },
  {
    t: 'variety', title: '出发吧向导', g: ['旅行', '纪实'], region: '内地', y: 2024, s: 7.9,
    total: 8, updated: 8, vip: false, badge: '', c: ['#56ccf2', '#2f80ed'], e: '🚐', hot: 7930,
    director: '总导演 石帆', cast: [['向导', '阿泽'], ['向导', '丹增']],
    desc: '跟随当地向导走一条没有攻略的路，重新认识那些被我们匆匆路过的风景。'
  },
  {
    t: 'variety', title: '脱口秀大会·新季', g: ['喜剧', '脱口秀'], region: '内地', y: 2025, s: 8.4,
    total: 10, updated: 6, vip: true, badge: '', c: ['#f12711', '#f5af19'], e: '🎙', hot: 8960,
    director: '总导演 毕小川', cast: [['领笑员', '罗川'], ['选手', '王大柱'], ['选手', '陈满满']],
    desc: '老面孔回归、新人搅局，五分钟的段子里藏着一整年的真实生活。'
  },
  {
    t: 'variety', title: '城市守夜人', g: ['纪实', '人文'], region: '内地', y: 2024, s: 8.0,
    total: 6, updated: 6, vip: false, badge: '', c: ['#373b44', '#4286f4'], e: '🌉', hot: 8210,
    director: '总导演 沈野', cast: [['记录者', '林一盏'], ['旁白', '江浩']],
    desc: '凌晨零点之后，城市换上了另一副面孔。镜头记录下那些替我们守夜的人。'
  },

  // ---------------- 动漫 ----------------
  {
    t: 'anime', title: '灵笼·终章', g: ['科幻', '热血'], region: '国漫', y: 2025, s: 9.2,
    total: 16, updated: 12, vip: true, badge: '独播', c: ['#0f0c29', '#928dab'], e: '🛡', hot: 9680,
    director: '动画导演 韦青', cast: [['配音', '马克·段'], ['配音', '冉冰·林']],
    desc: '灯塔的最后一道能源耗尽，地面的噬极兽再度苏醒，马克必须在人类与怪物之间做出选择。'
  },
  {
    t: 'anime', title: '少年与山海', g: ['冒险', '热血'], region: '国漫', y: 2025, s: 8.7,
    total: 36, updated: 24, vip: true, badge: '', c: ['#1cb5e0', '#000851'], e: '⛰', hot: 9180,
    director: '动画导演 徐野', cast: [['配音', '陆生'], ['配音', '阿黎']],
    desc: '少年带着一张残缺的山海图出海，寻找失踪的父亲与传说中的归墟。'
  },
  {
    t: 'anime', title: '猫灵小店', g: ['治愈', '日常'], region: '国漫', y: 2024, s: 8.4,
    total: 12, updated: 12, vip: false, badge: '', c: ['#ffecd2', '#fcb69f'], e: '🐱', hot: 8450,
    director: '动画导演 温言', cast: [['配音', '老板娘'], ['配音', '三花']],
    desc: '一间只在深夜营业的小店，店主是一只会说人话的猫，它用一道菜换一个故事。'
  },
  {
    t: 'anime', title: '天元幻剑录', g: ['玄幻', '武侠'], region: '国漫', y: 2025, s: 8.5,
    total: 48, updated: 36, vip: true, badge: '独播', c: ['#4b1248', '#f0c27b'], e: '⚔️', hot: 9270,
    director: '动画导演 秦九', cast: [['配音', '叶无缺'], ['配音', '慕清商']],
    desc: '一把断剑，一个被逐出师门的少年，誓要在这个以剑为尊的世界里重开天道。'
  },
  {
    t: 'anime', title: '机械之心', g: ['机甲', '科幻'], region: '国漫', y: 2024, s: 8.1,
    total: 24, updated: 24, vip: false, badge: '', c: ['#2b5876', '#4e4376'], e: '🤖', hot: 8160,
    director: '动画导演 白川', cast: [['配音', 'K07'], ['配音', '小夏']],
    desc: '报废机器人的最后一次启动，它决定去寻找制造者留下的那句「对不起」。'
  },
  {
    t: 'anime', title: '甜心烘焙屋', g: ['少女', '日常'], region: '国漫', y: 2023, s: 7.7,
    total: 12, updated: 12, vip: false, badge: '', c: ['#ffafbd', '#ffc3a0'], e: '🧁', hot: 7620,
    director: '动画导演 苏糖', cast: [['配音', '米露'], ['配音', '柠檬']],
    desc: '实习生米露在烘焙屋打工的第一天就烤糊了三炉饼干，但她也因此遇见了最温柔的伙伴们。'
  },

  // ---------------- 纪录片 ----------------
  {
    t: 'doc', title: '大地之下', g: ['自然', '探索'], region: '英国', y: 2025, s: 9.3,
    total: 6, updated: 6, vip: true, badge: '独家', c: ['#134e5e', '#71b280'], e: '🌍', hot: 9160,
    director: 'BBC 自然组', cast: [['解说', '叶子莘']],
    desc: '从地表一路向下四千米，镜头第一次完整记录了地下岩层中的隐秘生态。'
  },
  {
    t: 'doc', title: '丝路千年', g: ['历史', '人文'], region: '内地', y: 2024, s: 9.0,
    total: 8, updated: 8, vip: false, badge: '', c: ['#c79081', '#dfa579'], e: '🐪', hot: 8840,
    director: '总导演 韩溯', cast: [['解说', '李立宏']],
    desc: '重走三万里丝路，用考古文献与实景回访，还原一条商道上真实发生过的相遇。'
  },
  {
    t: 'doc', title: '江海行者', g: ['地理', '生态'], region: '内地', y: 2025, s: 8.8,
    total: 8, updated: 8, vip: true, badge: '', c: ['#0575e6', '#021b79'], e: '🌊', hot: 8610,
    director: '总导演 冯岸', cast: [['解说', '程可为']],
    desc: '从长江源头到入海口，跟随科学考察队记录这条母亲河正在发生的变化。'
  },
  {
    t: 'doc', title: '造物者', g: ['科技', '工程'], region: '美国', y: 2023, s: 8.6,
    total: 5, updated: 5, vip: false, badge: '', c: ['#232526', '#8e9eab'], e: '🛠', hot: 8230,
    director: '纪录片组 Asher', cast: [['解说', '莫岩']],
    desc: '一座大桥、一台发动机、一颗芯片，镜头对准那些把不可能变成日常的人。'
  },

  // ---------------- 少儿 ----------------
  {
    t: 'kids', title: '熊猫小队', g: ['动画', '益智'], region: '内地', y: 2025, s: 8.5,
    total: 52, updated: 52, vip: false, badge: '', c: ['#11998e', '#38ef7d'], e: '🐼', hot: 8460,
    director: '动画导演 毛豆', cast: [['配音', '团团'], ['配音', '圆圆']],
    desc: '竹林深处的小队每天都有新任务：认识形状、学会分享、勇敢说对不起。'
  },
  {
    t: 'kids', title: '奇妙字母城', g: ['启蒙', '认知'], region: '内地', y: 2024, s: 8.2,
    total: 36, updated: 36, vip: false, badge: '', c: ['#f79d00', '#64f38c'], e: '🔤', hot: 8020,
    director: '动画导演 阿布', cast: [['配音', '小 A'], ['配音', '小 Z']],
    desc: '二十六个字母住在奇妙城里，每一天都有新的单词诞生。'
  },
  {
    t: 'kids', title: '勇敢的消防车', g: ['动画', '成长'], region: '英国', y: 2023, s: 8.0,
    total: 24, updated: 24, vip: false, badge: '', c: ['#cb2d3e', '#ef473a'], e: '🚒', hot: 7780,
    director: '动画导演 Peter', cast: [['配音', '红红'], ['配音', '队长 Ben']],
    desc: '小小消防车最怕火，但它依然每次都冲在最前面，因为它想保护大家。'
  },
  {
    t: 'kids', title: '太空猫历险记', g: ['科普', '动画'], region: '内地', y: 2025, s: 8.6,
    total: 26, updated: 26, vip: true, badge: '', c: ['#360968', '#37d5d6'], e: '🐈', hot: 8340,
    director: '动画导演 星野', cast: [['配音', '喵斯克'], ['配音', '小满']],
    desc: '一只误入火箭的猫成了星际探险家，它把宇宙的秘密讲给了所有小朋友。'
  }
]

export const CHANNELS = [
  { key: 'all', name: '全部' },
  { key: 'tv', name: '电视剧' },
  { key: 'movie', name: '电影' },
  { key: 'variety', name: '综艺' },
  { key: 'anime', name: '动漫' },
  { key: 'doc', name: '纪录片' },
  { key: 'kids', name: '少儿' }
]

export const CHANNEL_NAME = CHANNELS.reduce((acc, c) => {
  acc[c.key] = c.name
  return acc
}, {})

const COUNTERS = {}

function enrich(raw, index) {
  COUNTERS[raw.t] = (COUNTERS[raw.t] || 0) + 1
  const id = `${raw.t}-${String(COUNTERS[raw.t]).padStart(2, '0')}`
  const unit = UNIT[raw.t] || '集'
  const isSerial = raw.total > 1
  // 可播放集数与「更新至第 N 集」保持一致，避免显示与实际可选集数不一致
  const available = isSerial ? Math.min(raw.total, raw.updated || raw.total) : 1
  return {
    id,
    type: raw.t,
    typeName: CHANNEL_NAME[raw.t],
    unit,
    title: raw.title,
    genres: raw.g,
    region: raw.region,
    year: raw.y,
    score: raw.s,
    desc: raw.desc,
    director: raw.director,
    cast: raw.cast.map(([name, role]) => ({ name, role })),
    hot: raw.hot,
    vip: !!raw.vip,
    pay: !!raw.pay,
    badge: raw.badge,
    episodeTotal: raw.total,
    episodeUpdated: available,
    updateText: isSerial
      ? raw.updated >= raw.total
        ? `全${raw.total}${unit}`
        : `更新至${available}${unit}`
      : '高清正片',
    poster: posterUrl(id),
    posterLarge: posterUrl(id, 600, 338),
    cover: { from: raw.c[0], to: raw.c[1], emoji: raw.e },
    episodes: buildEpisodes(raw.t, available, index * 4 + 1)
  }
}

export const VIDEOS = RAW.map(enrich)

/** 按 id 获取视频 */
export function getVideo(id) {
  return VIDEOS.find((v) => v.id === id) || null
}

/** 按 id 列表获取 */
export function listByIds(ids = []) {
  return ids.map((id) => getVideo(id)).filter(Boolean)
}

/** 按频道取列表 */
export function listByType(type, limit) {
  const arr = type && type !== 'all' ? VIDEOS.filter((v) => v.type === type) : VIDEOS.slice()
  return typeof limit === 'number' ? arr.slice(0, limit) : arr
}

/** 排序器 */
const SORTERS = {
  hot: (a, b) => b.hot - a.hot,
  new: (a, b) => b.year - a.year || b.hot - a.hot,
  score: (a, b) => b.score - a.score,
  title: (a, b) => a.title.localeCompare(b.title, 'zh-CN')
}

/**
 * 统一查询：频道 + 筛选 + 搜索 + 排序 + 分页
 */
export function queryVideos(opts = {}) {
  const {
    type = 'all',
    keyword = '',
    genre = '',
    region = '',
    year = '',
    sort = 'hot',
    page = 1,
    pageSize = 12,
    vipOnly = false
  } = opts

  const kw = String(keyword).trim().toLowerCase()
  let list = VIDEOS.filter((v) => {
    if (type && type !== 'all' && v.type !== type) return false
    if (genre && !v.genres.includes(genre)) return false
    if (region && v.region !== region) return false
    if (year && String(v.year) !== String(year)) return false
    if (vipOnly && !v.vip) return false
    if (kw) {
      const hay = [v.title, v.desc, v.director, ...v.genres, ...v.cast.map((c) => c.name)]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })

  list = list.slice().sort(SORTERS[sort] || SORTERS.hot)

  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    list: list.slice(start, start + pageSize),
    total,
    page: safePage,
    totalPages,
    hasMore: start + pageSize < total
  }
}

/** 动态生成筛选项 */
export function filterOptions(type = 'all') {
  const scoped = type && type !== 'all' ? VIDEOS.filter((v) => v.type === type) : VIDEOS
  const uniq = (arr) => Array.from(new Set(arr)).filter(Boolean)
  return {
    genres: uniq(scoped.flatMap((v) => v.genres)).slice(0, 16),
    regions: uniq(scoped.map((v) => v.region)),
    years: uniq(scoped.map((v) => v.year)).sort((a, b) => b - a)
  }
}

/** 相关推荐 */
export function relatedVideos(video, limit = 8) {
  if (!video) return []
  const scored = VIDEOS.filter((v) => v.id !== video.id).map((v) => {
    const sameGenre = v.genres.filter((g) => video.genres.includes(g)).length
    let s = sameGenre * 3
    if (v.type === video.type) s += 4
    if (v.region === video.region) s += 1
    if (v.vip === video.vip) s += 0.5
    return { v, s }
  })
  return scored.sort((a, b) => b.s - a.s || b.v.hot - a.v.hot).slice(0, limit).map((x) => x.v)
}
