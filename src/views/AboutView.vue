<template>
  <div class="about">
    <div class="container about__wrap">
      <header>
        <p class="section-head__eyebrow">ABOUT THIS ARCADE</p>
        <h1>一间随时营业的<br /><span>网页游戏厅</span></h1>
        <p>所有游戏均使用浏览器原生技术实现，没有广告弹窗，也不需要安装客户端。</p>
      </header>

      <div class="about__grid">
        <article class="about-card panel">
          <span>⚡</span>
          <h2>打开即玩</h2>
          <p>每款游戏都经过轻量化处理，进入页面后马上开局。</p>
        </article>
        <article class="about-card panel">
          <span>📱</span>
          <h2>双端适配</h2>
          <p>桌面支持键盘操作，手机提供专门优化的触控按钮与手势。</p>
        </article>
        <article class="about-card panel">
          <span>🔒</span>
          <h2>成绩留在本机</h2>
          <p>不需要注册，成绩仅写入浏览器 localStorage，不会上传。</p>
        </article>
      </div>

      <section class="about__story panel">
        <div>
          <p class="section-head__eyebrow">OUR LITTLE RULE</p>
          <h2>简单、公平、随时来一局</h2>
        </div>
        <p>
          这里没有复杂任务、体力限制和强制登录。每款游戏都可以单独游玩，也可以随时刷新重开。
          我们更在意一局几分钟的轻松体验，以及差一点破纪录时再来一次的动力。
        </p>
      </section>

      <RouterLink to="/games" class="btn btn--primary about__cta">挑选游戏 →</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 50px 0 80px;
}

.about__wrap {
  max-width: 980px;
}

.about header h1 {
  font-size: clamp(40px, 7vw, 68px);
  line-height: 1.02;
  letter-spacing: -0.055em;
}

.about header h1 span {
  color: var(--coral);
  text-shadow: 3px 3px 0 var(--ink);
}

.about header > p:last-child {
  max-width: 640px;
  margin-top: 16px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.8;
}

.about__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 38px;
}

.about-card {
  padding: 22px;
}

.about-card > span {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1.5px solid var(--ink);
  border-radius: 15px;
  background: var(--sun);
  font-size: 26px;
}

.about-card h2 {
  margin-top: 14px;
  font-size: 20px;
}

.about-card p {
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}

.about__story {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 30px;
  margin-top: 18px;
  padding: 26px;
  background: #dff9f3;
}

.about__story h2 {
  margin-top: 4px;
  font-size: 25px;
}

.about__story > p {
  color: var(--muted);
  line-height: 1.8;
}

.about__cta {
  margin-top: 24px;
}

@media (max-width: 700px) {
  .about {
    padding-top: 32px;
  }

  .about__grid {
    grid-template-columns: 1fr;
  }

  .about__story {
    grid-template-columns: 1fr;
    gap: 13px;
  }
}
</style>
