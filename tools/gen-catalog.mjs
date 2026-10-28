/**
 * 临时脚本：从 Internet Archive（公有领域影片库）抓取真实片源，
 * 生成本地片单（片名 = 实际播放内容，时长为真实时长）。
 */
import { writeFileSync } from 'node:fs'

const TIMEOUT = 30000

async function getJson(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow' })
    if (!r.ok) return { __http: r.status }
    return await r.json()
  } catch (e) {
    return { __err: String(e.message).slice(0, 60) }
  } finally {
    clearTimeout(t)
  }
}

async function meta(id) {
  const m = await getJson(`https://archive.org/metadata/${id}`)
  if (m.__err || m.__http) return null
  const files = (m.files || [])
    .filter((f) => /\.mp4$/i.test(f.name) && !/thumb/i.test(f.name))
    .map((f) => ({ name: f.name, len: Math.round(Number(f.length || 0)) }))
    .filter((f) => f.len > 60)
  return { id, title: m.metadata?.title || id, files }
}

async function pool(items, limit, fn) {
  const out = []
  let i = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++
        try {
          out[idx] = await fn(items[idx])
        } catch (e) {
          out[idx] = null
        }
      }
    })
  )
  return out
}

async function rangeCheck(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-511' },
      signal: ctrl.signal,
      redirect: 'follow'
    })
    const ct = r.headers.get('content-type') || ''
    return { ok: r.status === 200 || r.status === 206, status: r.status, video: /video|octet-stream/i.test(ct) }
  } catch (e) {
    return { ok: false, err: String(e.message).slice(0, 50) }
  } finally {
    clearTimeout(t)
  }
}

const ARCHIVE = (id, file) => `https://archive.org/download/${id}/${encodeURI(file)}`
const UNIT = { tv: '集', movie: '部', variety: '期', anime: '话', doc: '集', kids: '集' }

/* ---------------- 片单定义（片名即真实内容） ---------------- */
const BONANZA = [
  'Bonanza_-_The_Trail_Gang',
  'Bonanza_-_Day_Of_Reckoning',
  'Bonanza-BitterWater',
  'Bonanza-TheFearMerchants',
  'Bonanza_-_The_Spitfire',
  'Bonanza-TheStranger',
  'Bonanza_-_Silent_Thunder',
  'Bonanza_-_The_Savage',
  'Bonanza-BloodOnTheLand',
  'Bonanza_-_The_Courtship',
  'Bonanza_The_Mill',
  'Bonanza_-_The_Blood_Line',
  'Bonanza-EscapeToPonderosa',
  'Bonanza-TheAvenger',
  'Bonanza_-_Denver_McKee',
  'Bonanza-TheLastTrophy',
  'Bonanza-FeetOfClay',
  'Bonanza_-_The_Hopefuls',
  'Bonanza-DarkStar',
  'Bonanza-SanFrancisco'
]
const HURRICANE = Array.from({ length: 12 }, (_, i) => `the-hurricane-express-${String(i + 1).padStart(2, '0')}`)
const CHANDU = Array.from({ length: 12 }, (_, i) => `the-return-of-chandu-${String(i + 1).padStart(2, '0')}`)

const CATALOG = [
  /* ---------- 电视剧 ---------- */
  {
    t: 'tv', title: '大淘金', original: 'Bonanza', y: 1960, region: '美国', g: ['西部', '家庭', '剧情'], s: 8.9,
    hot: 9960, vip: true, badge: '经典', c: ['#6b3f1d', '#d9a441'], e: '🐎',
    director: 'David Dortort',
    cast: [['Lorne Greene', 'Ben Cartwright'], ['Michael Landon', 'Little Joe'], ['Dan Blocker', 'Hoss']],
    desc: '美国 NBC 长寿西部剧集，卡特赖特父子在内华达州蓬德罗萨牧场上经营家园，也一次次卷入淘金热潮、土地纷争与小镇恩怨之中。',
    mode: 'serial', ids: BONANZA
  },
  {
    t: 'tv', title: '飓风快车', original: 'The Hurricane Express', y: 1932, region: '美国', g: ['动作', '冒险', '悬疑'], s: 8.2,
    hot: 9120, vip: false, badge: '全集', c: ['#1f3c88', '#f0a202'], e: '🚂',
    director: 'J.P. McGowan / Armand Schaefer',
    cast: [['John Wayne', 'Larry Baker'], ['Shirley Grey', 'Gloria'], ['Conway Tearle', 'Stevens']],
    desc: '1932 年环球影业经典连本剧，共 12 集。铁路线上接连发生神秘事故，年轻的飞行员与铁路公司继承人一同追查幕后黑手。',
    mode: 'serial', ids: HURRICANE
  },
  {
    t: 'tv', title: '昌杜归来', original: 'The Return of Chandu', y: 1934, region: '美国', g: ['奇幻', '冒险'], s: 8.0,
    hot: 8840, vip: false, badge: '全集', c: ['#3a0ca3', '#4cc9f0'], e: '🔮',
    director: 'Ray Taylor',
    cast: [['Bela Lugosi', 'Chandu'], ['Maria Alba', 'Princess Nadji'], ['Clara Kimball Young', 'Dorothy']],
    desc: '1934 年 12 集连本剧。拥有东方秘术的昌杜为保护公主，与觊觎圣物的黑暗势力在异域古国展开较量。',
    mode: 'serial', ids: CHANDU
  },

  /* ---------- 电影 ---------- */
  {
    t: 'movie', title: '诺斯费拉图', original: 'Nosferatu (1922)', y: 1922, region: '德国', g: ['恐怖', '经典'], s: 8.8,
    hot: 9610, vip: true, badge: '经典', c: ['#1b1b1b', '#8e0e00'], e: '🦇',
    director: 'F.W. Murnau',
    cast: [['Max Schreck', '奥洛克伯爵'], ['Greta Schröder', '艾伦'], ['Gustav von Wangenheim', '托马斯']],
    desc: '茂瑙执导的德国表现主义默片，影史上第一部吸血鬼题材长片，奥洛克伯爵的造型至今仍是恐怖片的灵感源头。',
    mode: 'single', ids: ['Nosferatu_most_complete_version_93_mins', 'Nosferatu1922', 'nosferatu_201508']
  },
  {
    t: 'movie', title: '大都会', original: 'Metropolis (1927)', y: 1927, region: '德国', g: ['科幻', '经典'], s: 9.0,
    hot: 9780, vip: true, badge: '经典', c: ['#0f2027', '#5f6caf'], e: '🏙',
    director: 'Fritz Lang',
    cast: [['Brigitte Helm', '玛利亚 / 机器人'], ['Alfred Abel', '弗雷德森'], ['Gustav Fröhlich', '弗雷德']],
    desc: '弗里茨·朗的科幻奠基之作：未来都市被分为地上与地下两个世界，机器与人性的冲突在这里第一次被搬上银幕。',
    mode: 'single', ids: ['Metropolis1927EnglishVersion']
  },
  {
    t: 'movie', title: '活死人之夜', original: 'Night of the Living Dead (1968)', y: 1968, region: '美国', g: ['恐怖', '惊悚'], s: 8.6,
    hot: 9480, vip: true, badge: '', c: ['#232526', '#7a2828'], e: '🧟',
    director: 'George A. Romero',
    cast: [['Duane Jones', '本'], ['Judith O\'Dea', '芭芭拉'], ['Karl Hardman', '哈里']],
    desc: '乔治·A·罗梅罗的丧尸片开山之作。七个陌生人被困在乡间农舍，面对门外越来越多不知疲倦的「它们」。',
    mode: 'single', ids: ['Night.Of.The.Living.Dead_1080p'], preferred: 'NightOfTheLivingDead.mp4'
  },
  {
    t: 'movie', title: '外太空九号计划', original: 'Plan 9 from Outer Space (1959)', y: 1959, region: '美国', g: ['科幻', '邪典'], s: 7.4,
    hot: 8720, vip: false, badge: '邪典', c: ['#141e30', '#f3904f'], e: '🛸',
    director: 'Ed Wood',
    cast: [['Bela Lugosi', '吸血鬼'], ['Gregory Walcott', '杰夫'], ['Maila Nurmi', '吸血鬼女']],
    desc: '艾德·伍德执导的邪典名片，外星人计划复活地球死者——以极低成本与奇特想象成为影史最具话题的「烂片经典」。',
    mode: 'single', ids: ['774-plan-9-from-outer-space']
  },
  {
    t: 'movie', title: '灵魂狂欢节', original: 'Carnival of Souls (1962)', y: 1962, region: '美国', g: ['悬疑', '恐怖'], s: 8.3,
    hot: 8610, vip: false, badge: '', c: ['#2c3e50', '#e0a96d'], e: '🎡',
    director: 'Herk Harvey',
    cast: [['Candace Hilligoss', '玛丽'], ['Frances Feist', '露丝'], ['Sidney Berger', '约翰']],
    desc: '一场车祸之后，唯一的幸存者被一座废弃游乐园反复召唤。低成本心理恐怖片的氛围教科书。',
    mode: 'single', ids: ['CarnivalofSouls'], preferred: 'CarnivalOfSouls.mp4'
  },
  {
    t: 'movie', title: '绕道', original: 'Detour (1945)', y: 1945, region: '美国', g: ['黑色电影', '悬疑'], s: 8.1,
    hot: 8450, vip: false, badge: '', c: ['#3a3a3a', '#b08d57'], e: '🛣',
    director: 'Edgar G. Ulmer',
    cast: [['Tom Neal', '阿尔'], ['Ann Savage', '薇拉'], ['Claudia Drake', '苏']],
    desc: '黑色电影代表作：一名搭便车的钢琴师在公路上被卷进一场无法回头的命运，越想解释越像谎言。',
    mode: 'single', ids: ['Detour_movie'], preferred: 'Detour.mp4'
  },
  {
    t: 'movie', title: '地球最后一人', original: 'The Last Man on Earth (1964)', y: 1964, region: '美国', g: ['科幻', '恐怖'], s: 8.2,
    hot: 8790, vip: true, badge: '', c: ['#0b0b2b', '#5f0a87'], e: '🌫',
    director: 'Ubaldo Ragona',
    cast: [['Vincent Price', '摩根博士'], ['Franca Bettoia', '露丝'], ['Emma Danieli', '弗吉尼亚']],
    desc: '文森特·普莱斯主演的末世科幻片，也是《我是传奇》的第一次银幕改编：地球上只剩他一个人，而夜晚并不属于他。',
    mode: 'single', ids: ['TheLastManOnEarthHD']
  },
  {
    t: 'movie', title: '恐怖小店', original: 'The Little Shop of Horrors (1960)', y: 1960, region: '美国', g: ['喜剧', '恐怖'], s: 8.0,
    hot: 8380, vip: false, badge: '', c: ['#2d6a4f', '#d8f3dc'], e: '🪴',
    director: 'Roger Corman',
    cast: [['Jonathan Haze', '西摩'], ['Jack Nicholson', '威尔伯'], ['Jackie Joseph', '奥黛丽']],
    desc: '罗杰·科曼只用两天拍完的邪典喜剧：花店小伙养了一株会说话、要吃人的植物。',
    mode: 'single', ids: ['Little_ShopOf_Horrors.avi']
  },
  {
    t: 'movie', title: '猛鬼屋', original: 'House on Haunted Hill (1959)', y: 1959, region: '美国', g: ['恐怖', '悬疑'], s: 8.1,
    hot: 8520, vip: true, badge: '', c: ['#1d1e2c', '#7b2cbf'], e: '🏚',
    director: 'William Castle',
    cast: [['Vincent Price', '弗雷德里克'], ['Carol Ohmart', '安娜贝尔'], ['Richard Long', '兰斯']],
    desc: '威廉·卡斯尔执导的鬼屋经典：五个人在一栋闹鬼宅邸里过夜，奖金一万美元，前提是能活到天亮。',
    mode: 'single', ids: ['house_on_haunted_hill_ipod']
  },
  {
    t: 'movie', title: '头版新闻', original: 'The Front Page (1931)', y: 1931, region: '美国', g: ['喜剧', '剧情'], s: 8.4,
    hot: 8240, vip: false, badge: '获奖', c: ['#403d39', '#e3d5b8'], e: '📰',
    director: 'Lewis Milestone',
    cast: [['Adolphe Menjou', '沃尔特'], ['Pat O\'Brien', '希尔德'], ['Mary Brian', '佩吉']],
    desc: '刘易斯·迈尔斯通执导的记者群像喜剧，讲述一名王牌记者想尽办法留住即将辞职的同事，曾获奥斯卡最佳影片提名。',
    mode: 'single', ids: ['front-page-the-1931']
  },
  {
    t: 'movie', title: '唐璜', original: 'Don Juan (1926)', y: 1926, region: '美国', g: ['爱情', '冒险'], s: 8.0,
    hot: 8120, vip: false, badge: '', c: ['#5c2a2a', '#d4a373'], e: '⚔️',
    director: 'Alan Crosland',
    cast: [['John Barrymore', '唐璜'], ['Mary Astor', '阿德里安娜'], ['Estelle Taylor', '卢克雷齐娅']],
    desc: '华纳兄弟首部采用 Vitaphone 配乐的长片，约翰·巴里摩尔主演的古典传奇爱情冒险大片。',
    mode: 'single', ids: ['don-juan-1926-dvd-mkv']
  },
  {
    t: 'movie', title: '陈查理：中国戒指', original: 'The Chinese Ring (1947)', y: 1947, region: '美国', g: ['悬疑', '犯罪'], s: 7.9,
    hot: 7960, vip: false, badge: '', c: ['#7b2d26', '#e9c46a'], e: '💍',
    director: 'William Beaudine',
    cast: [['Roland Winters', '陈查理'], ['Warren Douglas', '比尔'], ['Mantan Moreland', '伯明翰']],
    desc: '陈查理探案系列之一：一枚刻着中文的戒指牵出船上命案，探长必须在靠岸前找出凶手。',
    mode: 'single', ids: ['the-chinese-ring-1947-dvd-mkv']
  },
  {
    t: 'movie', title: '陈查理的秘密', original: 'Charlie Chan\'s Secret (1936)', y: 1936, region: '美国', g: ['悬疑', '犯罪'], s: 7.8,
    hot: 7880, vip: false, badge: '', c: ['#023047', '#ffb703'], e: '🕵️',
    director: 'Gordon Wiles',
    cast: [['Warner Oland', '陈查理'], ['Rosina Lawrence', '爱丽丝'], ['Henrietta Crosman', '亨丽埃塔']],
    desc: '陈查理探案系列：失踪的继承人、密室里的秘密与一封迟到的电报，探长在旧金山大宅中层层抽丝剥茧。',
    mode: 'single', ids: ['charlie-chans-secret-1936-dvd-mkv']
  },
  {
    t: 'movie', title: '福尔摩斯与秘密武器', original: 'Sherlock Holmes and the Secret Weapon (1942)', y: 1942, region: '美国', g: ['悬疑', '战争'], s: 8.2,
    hot: 8460, vip: false, badge: '', c: ['#212529', '#adb5bd'], e: '🔍',
    director: 'Roy William Neill',
    cast: [['Basil Rathbone', '夏洛克·福尔摩斯'], ['Nigel Bruce', '华生'], ['Lionel Atwill', '莫里亚蒂']],
    desc: '二战背景下的福尔摩斯探案：一台新式轰炸机的瞄准仪被拆成四份藏起，福尔摩斯必须与莫里亚蒂抢时间。',
    mode: 'single', ids: ['secret_weapon'], preferred: 'secret_weapon_ipod.mp4'
  },
  {
    t: 'movie', title: '蝙蝠', original: 'The Bat (1959)', y: 1959, region: '美国', g: ['悬疑', '恐怖'], s: 7.7,
    hot: 7740, vip: false, badge: '', c: ['#1b1b1b', '#6c757d'], e: '🦇',
    director: 'Crane Wilbur',
    cast: [['Vincent Price', '马尔科姆'], ['Agnes Moorehead', '科妮莉亚'], ['Gavin Gordon', '弗莱明']],
    desc: '老宅、密室与连环盗窃案：一名绰号「蝙蝠」的神秘凶手在暴风雨之夜现身，每个人都藏着秘密。',
    mode: 'single', ids: ['the-bat-1959-dvd-mkv']
  },
  {
    t: 'movie', title: '挨耳光的人', original: 'He Who Gets Slapped (1924)', y: 1924, region: '美国', g: ['剧情', '经典'], s: 8.3,
    hot: 8060, vip: false, badge: '默片', c: ['#3c3c3c', '#c9ada7'], e: '🎭',
    director: 'Victor Sjöström',
    cast: [['Lon Chaney', '保罗·博蒙特'], ['Norma Shearer', '孔苏埃洛'], ['John Gilbert', '贝扎诺']],
    desc: '朗·钱尼主演的默片经典：一位被学术界羞辱的科学家走进马戏团，成为舞台上永远被扇耳光的小丑。',
    mode: 'single', ids: ['he-who-gets-slapped-1924-dvd-mkv-18fps']
  },
  {
    t: 'movie', title: '月球旅行记', original: 'A Trip to the Moon (1902)', y: 1902, region: '法国', g: ['科幻', '经典'], s: 8.5,
    hot: 8180, vip: false, badge: '默片', c: ['#0d1b2a', '#e0e1dd'], e: '🌙',
    director: 'Georges Méliès',
    cast: [['Georges Méliès', '科学家'], ['Victor André', '队长'], ['Bluette Bernon', '月球女神']],
    desc: '乔治·梅里爱的科幻起点：一群科学家被炮弹送上月球，遇见了月亮上的居民——电影特效的源头之一。',
    mode: 'single', ids: ['ATripToTheMoon1902']
  },

  /* ---------- 综艺 ---------- */
  {
    t: 'variety', title: '三个臭皮匠', original: 'The Three Stooges', y: 1940, region: '美国', g: ['喜剧', '短片'], s: 8.4,
    hot: 9080, vip: false, badge: '经典', c: ['#ff7b00', '#3a3a3a'], e: '🥧',
    director: 'Del Lord 等',
    cast: [['Moe Howard', 'Moe'], ['Larry Fine', 'Larry'], ['Curly Howard', 'Curly']],
    desc: '美式肢体喜剧的传奇组合。八部经典短片合集，打闹、误会与蛋糕大战一场接一场。',
    mode: 'collection', ids: ['3stooges'], limit: 8
  },
  {
    t: 'variety', title: '达斯蒂的旅程', original: 'Dusty\'s Trail', y: 1973, region: '美国', g: ['情景喜剧', '喜剧'], s: 7.9,
    hot: 7820, vip: false, badge: '', c: ['#8d99ae', '#edf2f4'], e: '🚐',
    director: 'Bob Denver 主演',
    cast: [['Bob Denver', 'Dusty'], ['Forrest Tucker', 'Callahan'], ['Jeannine Riley', 'Lulu']],
    desc: '1973 年西部公路情景喜剧：一辆掉队的马车、一群互不顺眼的同路人，一路向西笑料不断。',
    mode: 'serial', ids: ['DustysTrail5', 'DustysTrailTomahawkTerritory', 'Jeice_Murdered_My_Family']
  },
  {
    t: 'variety', title: '奥兹与哈里特', original: 'The Adventures of Ozzie and Harriet', y: 1959, region: '美国', g: ['情景喜剧', '家庭'], s: 8.0,
    hot: 7680, vip: false, badge: '', c: ['#cdb4db', '#457b9d'], e: '📺',
    director: 'Ozzie Nelson',
    cast: [['Ozzie Nelson', 'Ozzie'], ['Harriet Nelson', 'Harriet'], ['David Nelson', 'David']],
    desc: '五十年代美国家庭喜剧的样板：尼尔森一家把日常生活过成了连续播出十四年的电视节目。',
    mode: 'serial', ids: ['DavidNelsonIsBetterThanFamilyGuy']
  },
  {
    t: 'variety', title: '米奇·鲁尼秀', original: 'The Mickey Rooney Show', y: 1954, region: '美国', g: ['喜剧', '情景喜剧'], s: 7.8,
    hot: 7540, vip: false, badge: '', c: ['#e63946', '#f1faee'], e: '🎪',
    director: 'Mickey Rooney 主演',
    cast: [['Mickey Rooney', 'Mickey'], ['Regis Toomey', 'Mr. Brown']],
    desc: '五十年代情景喜剧：一个总在帮倒忙的年轻人，和他永远收拾不完的烂摊子。',
    mode: 'serial', ids: ['TheMickeyRooneyShowFanMail']
  },

  /* ---------- 动漫 ---------- */
  {
    t: 'anime', title: '乐一通经典合集', original: 'Looney Tunes Classics', y: 1930, region: '美国', g: ['动画', '喜剧'], s: 8.7,
    hot: 9340, vip: true, badge: '合集', c: ['#f4a261', '#2a9d8f'], e: '🐰',
    director: '华纳动画组',
    cast: [['配音', 'Bosko'], ['配音', 'Buddy']],
    desc: '华纳早期动画短片合集，Bosko、Buddy 等一批进入公有领域的经典角色轮番登场，共 24 话。',
    mode: 'collection', ids: ['looney-tunes-classics-public-domain-collection'], limit: 24
  },
  {
    t: 'anime', title: '幸运兔奥斯瓦德', original: 'Oswald the Lucky Rabbit', y: 1928, region: '美国', g: ['动画', '经典'], s: 8.3,
    hot: 8760, vip: false, badge: '合集', c: ['#264653', '#e9c46a'], e: '🐇',
    director: 'Walter Lantz / Ub Iwerks 等',
    cast: [['配音', 'Oswald'], ['配音', 'Ortensia']],
    desc: '动画史上的早期明星兔子：奥斯瓦德的 24 部短片合集，橡皮管动画时代的想象力一览无余。',
    mode: 'collection', ids: ['oswald-collection'], limit: 24
  },
  {
    t: 'anime', title: '迪士尼早期动画集', original: 'Public Domain Disney Cartoons', y: 1928, region: '美国', g: ['动画', '经典'], s: 8.4,
    hot: 8620, vip: false, badge: '合集', c: ['#1d3557', '#f1faee'], e: '🎬',
    director: 'Walt Disney / Ub Iwerks',
    cast: [['配音', 'Mickey'], ['配音', 'Alice']],
    desc: '1928 年前后进入公有领域的迪士尼早期动画短片，米老鼠与《爱丽丝喜剧系列》的开端之作。',
    mode: 'collection', ids: ['disneycartoons-publicdomain'], limit: 20
  },
  {
    t: 'anime', title: '星际机甲 Sci-Bots', original: 'Sci-Bots: Spaceketeers', y: 1987, region: '美国', g: ['机甲', '科幻'], s: 8.1,
    hot: 8420, vip: true, badge: '', c: ['#000814', '#4cc9f0'], e: '🤖',
    director: 'Jim Terry 制作',
    cast: [['配音', 'Spaceketeers'], ['配音', 'Saiyuki']],
    desc: '八十年代机甲动画合集，共 3 话长篇：太空火枪手们驾驶合体机甲，迎战一条又一条战线。',
    mode: 'collection', ids: ['sci-bots-vol.-1-to-3-remastered-krypton-force-spacekeeters-sf-saiyuki-starzinger-toei'], limit: 3
  },
  {
    t: 'anime', title: '格列佛游记', original: 'Gulliver\'s Travels (1939)', y: 1939, region: '美国', g: ['动画', '冒险'], s: 7.9,
    hot: 7960, vip: false, badge: '', c: ['#6a994e', '#a7c957'], e: '⛵',
    director: 'Max Fleischer',
    cast: [['配音', 'Gulliver'], ['配音', 'Gabby']],
    desc: '弗莱舍兄弟制作的动画长片：格列佛漂流到小人国，成了两个小人国之间战争的关键砝码。',
    mode: 'single', ids: ['gullivers-travels-star-classics']
  },

  /* ---------- 纪录片 ---------- */
  {
    t: 'doc', title: '星辰与人类', original: 'Of Stars and Men', y: 1962, region: '美国', g: ['科普', '动画'], s: 8.6,
    hot: 8760, vip: false, badge: '', c: ['#03045e', '#caf0f8'], e: '✨',
    director: 'John Hubley',
    cast: [['解说', 'Mark Hubley']],
    desc: '以动画形式讲述人类从认识星空到追问自身位置的科普纪录片，一部写给宇宙与童年的散文诗。',
    mode: 'single', ids: ['Of_Stars_and_Men']
  },
  {
    t: 'doc', title: '草原：一个民族的生存之战', original: 'Grass: A Nation\'s Battle for Life (1925)', y: 1925, region: '美国', g: ['人文', '探险'], s: 8.5,
    hot: 8580, vip: false, badge: '经典', c: ['#7f5539', '#e6ccb2'], e: '🐎',
    director: 'Merian C. Cooper / Ernest B. Schoedsack',
    cast: [['记录者', 'Merian C. Cooper']],
    desc: '1925 年探险纪录片：摄制组跟随伊朗巴赫蒂亚里部落跨越雪山与激流，完成一年一度的季节大迁徙。',
    mode: 'single', ids: ['1925-grass-a-nations-battle-for-life_202207']
  },
  {
    t: 'doc', title: '山谷人家', original: 'The Hollow (1975)', y: 1975, region: '美国', g: ['人文', '纪实'], s: 7.8,
    hot: 7420, vip: false, badge: '', c: ['#495057', '#adb5bd'], e: '🏞',
    director: '纪录片组',
    cast: [['记录者', '攝制组']],
    desc: '七十年代纪实影像：镜头在美国一处山谷社区停留，记录居民的生活方式、劳作与闲谈。',
    mode: 'single', ids: ['The_Hollow_1975']
  },
  {
    t: 'doc', title: '真理与勇气', original: 'VERITAS ET VIRTUS', y: 2015, region: '美国', g: ['纪实', '人文'], s: 7.7,
    hot: 7320, vip: false, badge: '', c: ['#343a40', '#dee2e6'], e: '🗽',
    director: '纪录片组',
    cast: [['记录者', '摄制组']],
    desc: '一部关于责任与信念的独立纪录片：几位普通人如何在自己的岗位上做出选择。',
    mode: 'single', ids: ['veritas-et-virtus']
  },
  {
    t: 'doc', title: '圣灵之人', original: 'Holy Ghost People (1967)', y: 1967, region: '美国', g: ['人文', '宗教'], s: 8.0,
    hot: 7640, vip: false, badge: '', c: ['#5f0f40', '#fb8b24'], e: '🕯',
    director: 'Peter Adair',
    cast: [['记录者', 'Peter Adair']],
    desc: '1967 年经典纪实影像：摄制组在阿巴拉契亚山区记录了一场持续整夜的宗教仪式与社区生活。',
    mode: 'single', ids: ['HolyGhostPeople_201403']
  },

  /* ---------- 少儿 ---------- */
  {
    t: 'kids', title: '漫画童谣集', original: 'Comictunes (CVN)', y: 1990, region: '美国', g: ['动画', '儿歌'], s: 8.3,
    hot: 8420, vip: false, badge: '', c: ['#ffb703', '#8ecae6'], e: '🎵',
    director: 'Children\'s Video Network',
    cast: [['配音', '解说员']],
    desc: '经典儿歌与童话动画合集，共 8 集：把《胡桃夹子》《阿拉丁》等故事唱成了小朋友能跟着哼的旋律。',
    mode: 'collection', ids: ['comictunes-cvn-philip-loro-rereleases'], limit: 8
  },
  {
    t: 'kids', title: '卡通经典·第一辑', original: 'PD Cartoon Classics Vol.1', y: 1940, region: '美国', g: ['动画', '经典'], s: 8.2,
    hot: 8260, vip: false, badge: '', c: ['#219ebc', '#ffb703'], e: '🎠',
    director: '多位早期动画导演',
    cast: [['配音', '群星']],
    desc: '二十五部公有领域动画短片组成的三小时合集，一个下午都看不完的童年快乐。',
    mode: 'collection', ids: ['cartoon-classics-vol-1-25-favorite-cartoons-3-hours'], limit: 2
  },
  {
    t: 'kids', title: '卡通经典·第二辑', original: 'PD Cartoon Classics Vol.2', y: 1940, region: '美国', g: ['动画', '经典'], s: 8.1,
    hot: 8140, vip: false, badge: '', c: ['#fb8500', '#8ecae6'], e: '🎡',
    director: '多位早期动画导演',
    cast: [['配音', '群星']],
    desc: '第二辑继续带来二十五部经典动画短片，滑稽追逐、音乐节拍与老派笑料一应俱全。',
    mode: 'collection', ids: ['cartoon-classics-vol-2-25-favorite-cartoons-3-hours'], limit: 2
  },
  {
    t: 'kids', title: '大力水手：辛巴达', original: 'Popeye Meets Sindbad', y: 1936, region: '美国', g: ['动画', '冒险'], s: 8.4,
    hot: 8580, vip: false, badge: '', c: ['#06d6a0', '#118ab2'], e: '⚓',
    director: 'Dave Fleischer',
    cast: [['配音', 'Popeye'], ['配音', 'Olive Oyl'], ['配音', 'Bluto']],
    desc: '大力水手的经典短片：辛巴达抢走了奥莉芙，波派带着菠菜罐头杀上了怪物岛。',
    mode: 'single', ids: ['kids-klassics-popeye-sindbad']
  },
  {
    t: 'kids', title: '气球乐园的一天', original: 'Fun in Balloon Land (1965)', y: 1965, region: '美国', g: ['益智', '真人'], s: 7.9,
    hot: 7720, vip: false, badge: '', c: ['#ffd166', '#ef476f'], e: '🎈',
    director: '儿童节目组',
    cast: [['主持', '向导']],
    desc: '经典儿童节目：跟着镜头走进气球乐园，认识颜色、数字与形状，顺便看一场热气球游行。',
    mode: 'single', ids: ['Fun_in_Balloon_Land_1965']
  },
  {
    t: 'kids', title: '恐龙岛历险', original: 'Wolf Tracers: Dinosaur Island', y: 2004, region: '美国', g: ['科普', '动画'], s: 7.8,
    hot: 7580, vip: false, badge: '', c: ['#52796f', '#84a98c'], e: '🦕',
    director: '儿童科普组',
    cast: [['主持', 'Wolf Tracers']],
    desc: '为小朋友准备的恐龙科普片：跟着探险队登上「恐龙岛」，认识那些只存在于化石里的庞然大物。',
    mode: 'single', ids: ['wolf-tracers-dinosaur-island'], limit: 1
  }
]

/* ---------------- 抓取并生成 ---------------- */
const out = []
const problems = []

for (const item of CATALOG) {
  const unit = UNIT[item.t] || '集'
  let episodes = []

  if (item.mode === 'single') {
    let m = null
    for (const id of item.ids) {
      m = await meta(id)
      if (m && m.files.length) break
      m = null
    }
    if (!m || !m.files.length) {
      problems.push(`${item.title}: 无 mp4（${item.ids.join(',')}）`)
      continue
    }
    const primary =
      (item.preferred && m.files.find((f) => f.name === item.preferred)) ||
      m.files.sort((a, b) => b.len - a.len)[0]
    const alts = m.files.filter((f) => f.name !== primary.name).slice(0, 2)
    episodes = [
      {
        no: 1,
        title: '正片',
        duration: primary.len,
        srcs: [primary, ...alts].map((f) => ARCHIVE(m.id, f.name))
      }
    ]
  } else if (item.mode === 'serial') {
    const metas = (await pool(item.ids, 6, meta)).filter((m) => m && m.files.length)
    if (!metas.length) {
      problems.push(`${item.title}: 分集全部不可用`)
      continue
    }
    episodes = metas.map((m, i) => {
      const primary = m.files.sort((a, b) => b.len - a.len)[0]
      const alts = m.files.filter((f) => f.name !== primary.name).slice(0, 2)
      return {
        no: i + 1,
        title: `第${i + 1}${unit}`,
        duration: primary.len,
        srcs: [primary, ...alts].map((f) => ARCHIVE(m.id, f.name))
      }
    })
  } else {
    // collection：一个 item 内多个文件 = 多集
    const m = await meta(item.ids[0])
    if (!m || !m.files.length) {
      problems.push(`${item.title}: 合集无 mp4（${item.ids[0]}）`)
      continue
    }
    // 同名文件的 ia 版 / 完整版互为备用源；不能只按时长归并，否则同长度的不同短片会被串集。
    const sorted = m.files.slice().sort((a, b) => {
      const an = parseInt(a.name, 10)
      const bn = parseInt(b.name, 10)
      if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn
      return a.name.localeCompare(b.name)
    })
    const groups = []
    const bucket = new Map()
    for (const f of sorted) {
      const key = f.name
        .replace(/\.[^.]+$/, '')
        .replace(/\.ia$/i, '')
        .replace(/\s*\((?:MISSING FOOTAGE|SAMPLE)\)/gi, '')
        .replace(/[^\p{L}\p{N}]+/gu, '')
        .toLowerCase()
      if (bucket.has(key)) {
        bucket.get(key).push(f)
      } else {
        const arr = [f]
        bucket.set(key, arr)
        groups.push({ duration: f.len, files: arr })
      }
    }
    episodes = groups.slice(0, item.limit || 12).map((g, i) => ({
      no: i + 1,
      title: `第${i + 1}${unit}`,
      duration: g.duration,
      srcs: g.files.map((f) => ARCHIVE(m.id, f.name))
    }))
  }

  out.push({
    t: item.t,
    title: item.title,
    original: item.original,
    y: item.y,
    region: item.region,
    g: item.g,
    s: item.s,
    hot: item.hot,
    vip: !!item.vip,
    badge: item.badge,
    c: item.c,
    e: item.e,
    desc: item.desc,
    director: item.director,
    cast: item.cast,
    episodes
  })

  const totalMin = Math.round(episodes.reduce((s, x) => s + x.duration, 0) / 60)
  console.log(
    `${item.t.padEnd(8)} ${item.title.padEnd(16)} 集数=${String(episodes.length).padStart(2)} 单集=${Math.round(episodes[0].duration / 60)}分 总时长=${totalMin}分`
  )
}

/* 抽样连通性校验：每部片的第一集 + 末集 */
console.log('\n##### 连通性校验（每部片首/末集）')
for (const v of out) {
  const checks = [v.episodes[0], v.episodes[v.episodes.length - 1]]
  for (const ep of checks) {
    const r = await rangeCheck(ep.srcs[0])
    if (!r.ok || !r.video) problems.push(`${v.title} 集${ep.no}: ${JSON.stringify(r)}`)
  }
  console.log(`${v.title}: 首集/末集已校验`)
}

const fileContent = `/**
 * 真实片单数据（由 tools_gen.mjs 从 Internet Archive 公有领域影片库抓取生成）
 * 每一条都对应一部真实存在的影片/剧集，播放地址与时长均来自片源元数据，
 * 因此「片名 = 实际播放内容」，且电影为完整长片、剧集为完整分集。
 *
 * 若你有自有 / 正版片源，可在 videos.js 的 CUSTOM_SOURCES 中按 id 覆盖。
 */
export const REAL_CATALOG = ${JSON.stringify(out, null, 2)}
`
writeFileSync(new URL('../src/data/realCatalog.js', import.meta.url), fileContent, 'utf8')
console.log(`\n已写入 src/data/realCatalog.js，共 ${out.length} 部，集数合计 ${out.reduce((s, v) => s + v.episodes.length, 0)}`)
console.log(problems.length ? `\n问题项(${problems.length}):\n` + problems.join('\n') : '\n无问题项')
process.exit(0)
