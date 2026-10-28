export const CATEGORIES = [
  { key: 'all', name: '全部游戏' },
  { key: 'puzzle', name: '益智烧脑' },
  { key: 'arcade', name: '街机挑战' },
  { key: 'classic', name: '经典复刻' }
]

export const GAMES = [
  {
    id: 'tetris',
    name: '霓虹方块',
    subtitle: '俄罗斯方块',
    icon: '🧱',
    category: 'classic',
    categoryName: '经典复刻',
    difficulty: '进阶',
    color: '#5b5bd6',
    accent: '#8b8bff',
    gradient: 'linear-gradient(145deg, #362c9a, #7165f5)',
    description: '旋转、堆叠、消行。保持节奏，在方块堆到顶端前拿下更高分。',
    controls: ['← → 移动', '↑ 旋转', '↓ 加速', '空格 直落'],
    scoreUnit: '分',
    featured: true
  },
  {
    id: 'spot-difference',
    name: '火眼金睛',
    subtitle: '找不同',
    icon: '🔍',
    category: 'puzzle',
    categoryName: '益智烧脑',
    difficulty: '轻松',
    color: '#ff6b57',
    accent: '#ffad66',
    gradient: 'linear-gradient(145deg, #ff6b57, #ffb45f)',
    description: '左右两幅画藏着 5 处不同。别放过颜色、数量和位置的小变化。',
    controls: ['点击画面中的不同之处', '点错会扣分并记录失误'],
    scoreUnit: '分',
    featured: true
  },
  {
    id: 'memory',
    name: '翻翻记忆',
    subtitle: '记忆配对',
    icon: '🃏',
    category: 'puzzle',
    categoryName: '益智烧脑',
    difficulty: '轻松',
    color: '#16b8a6',
    accent: '#71e1c9',
    gradient: 'linear-gradient(145deg, #0c8f82, #38cfb8)',
    description: '翻开卡片，记住图案，用尽量少的步数找出全部配对。',
    controls: ['点击卡片翻开', '连续翻开两张相同图案即可配对'],
    scoreUnit: '分',
    featured: true
  },
  {
    id: 'snake',
    name: '贪吃蛇',
    subtitle: '街机经典',
    icon: '🐍',
    category: 'arcade',
    categoryName: '街机挑战',
    difficulty: '进阶',
    color: '#80b918',
    accent: '#d4ed4b',
    gradient: 'linear-gradient(145deg, #47770e, #9aca24)',
    description: '吃掉果实不断变长，避开墙壁和自己的尾巴。速度会越来越快。',
    controls: ['方向键或 WASD 转向', '手机可滑动棋盘操作'],
    scoreUnit: '分',
    featured: true
  },
  {
    id: '2048',
    name: '2048',
    subtitle: '数字合并',
    icon: '🔢',
    category: 'puzzle',
    categoryName: '益智烧脑',
    difficulty: '进阶',
    color: '#ed9b40',
    accent: '#ffd36b',
    gradient: 'linear-gradient(145deg, #d77720, #f8b949)',
    description: '滑动数字方块，让相同数字合并。看看能不能抵达 2048。',
    controls: ['方向键或 WASD 滑动', '手机直接在棋盘上滑动'],
    scoreUnit: '分',
    featured: true
  },
  {
    id: 'minesweeper',
    name: '扫雷行动',
    subtitle: '逻辑排雷',
    icon: '💣',
    category: 'classic',
    categoryName: '经典复刻',
    difficulty: '烧脑',
    color: '#3584e4',
    accent: '#73baf7',
    gradient: 'linear-gradient(145deg, #215cac, #4c9eea)',
    description: '根据数字推断地雷位置，标记危险区域，安全揭开整片棋盘。',
    controls: ['左键翻开', '右键插旗', '手机可切换插旗模式'],
    scoreUnit: '分',
    featured: false
  }
]

export function getGame(id) {
  return GAMES.find((game) => game.id === id) || null
}

export function getGamesByCategory(category = 'all', keyword = '') {
  const query = String(keyword || '').trim().toLowerCase()
  return GAMES.filter((game) => {
    if (category !== 'all' && game.category !== category) return false
    if (!query) return true
    return [game.name, game.subtitle, game.description, game.categoryName]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
}

export function formatCompactNumber(value) {
  const number = Number(value) || 0
  if (number >= 10000) return `${(number / 10000).toFixed(number >= 100000 ? 0 : 1)}w`
  return number.toLocaleString('zh-CN')
}
