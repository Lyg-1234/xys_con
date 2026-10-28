# 闪玩游戏盒

一个使用 Vue 3 + Vite 构建的在线小游戏合集。无需注册和下载，打开网页即可游玩，支持桌面键盘、手机触控和本机成绩保存。

## 游戏列表

| 游戏 | 类型 | 操作 |
| --- | --- | --- |
| 霓虹方块 | 俄罗斯方块 | 方向键移动/旋转，空格直落 |
| 火眼金睛 | 找不同 | 点击两幅场景中的差异 |
| 翻翻记忆 | 记忆配对 | 点击卡片寻找相同图案 |
| 贪吃蛇 | 街机 | 方向键/WASD 转向，手机可滑动 |
| 2048 | 数字合并 | 方向键/WASD 或手机滑动 |
| 扫雷行动 | 逻辑益智 | 左键翻开，右键插旗，手机可切换模式 |

## 本地运行

```bash
npm install
npm run dev
```

本地访问：

```text
http://localhost:5173/xys_con/
```

生产构建与预览：

```bash
npm run build
npm run preview
```

## 项目结构

```text
src/
├── components/
│   ├── GameShell.vue       # 游戏页通用框架、分数与操作说明
│   ├── GameCard.vue        # 游戏大厅卡片
│   └── SpotScene.vue       # 找不同双场景
├── composables/
│   └── useGameScores.js    # localStorage 成绩与排行榜
├── data/
│   └── games.js            # 游戏清单和分类
├── views/
│   ├── GamesHomeView.vue
│   ├── AllGamesView.vue
│   ├── GameRouteView.vue
│   ├── LeaderboardView.vue
│   └── games/              # 六款游戏实现
├── router/index.js
├── styles/global.css
└── App.vue
```

## 设计特点

- 卡通描边、错位阴影和高饱和配色，整体接近轻量网页游戏厅。
- 首页包含搜索、分类、随机开玩、挑战入口和个人高分。
- 每个游戏提供即时反馈、重新开始、暂停或状态提示。
- 所有成绩保存在浏览器 `localStorage`，不会上传到服务器。
- 桌面、平板和手机使用不同布局，移动端提供底部导航和触控操作。
- GitHub Pages 部署包含 SPA 深层路由回退。

## 检查

```bash
npm run check:games
```

浏览器端验收脚本 `final_check.mjs` 会检查首页、全部游戏、排行榜、六款游戏的核心交互以及手机端横向溢出。
