<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageBar from '@/components/PageBar.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'

const user = useUserStore()
const router = useRouter()

const PLANS = [
  { id: 'm', name: '连续包月', price: 15, origin: 30, days: 30, tag: '新用户首月', desc: '自动续费，随时取消' },
  { id: 'q', name: '连续包季', price: 45, origin: 88, days: 90, tag: '热门选择', desc: '平均每季省 43 元' },
  { id: 'y', name: '年度会员', price: 158, origin: 288, days: 365, tag: '超值推荐', desc: '一次开通省心一年' },
  { id: 'svip', name: '超级影视 SVIP', price: 268, origin: 488, days: 365, tag: '全端通用', desc: '含电视端大屏权益' }
]

const PRIVILEGES = [
  { icon: '🎬', title: '会员专享片库', desc: '5000+ 部院线大片与独播剧集' },
  { icon: '🚀', title: '蓝光 1080P', desc: '更高码率，画面细节拉满' },
  { icon: '📺', title: '投屏免延时', desc: '支持多设备同账号在线' },
  { icon: '🎧', title: '杜比音效', desc: '沉浸式音场体验' },
  { icon: '⏩', title: '一键跳过广告', desc: '尊享洁净观看体验' },
  { icon: '☁️', title: '云端追剧记录', desc: '换设备也能接着看' }
]

const PAY_METHODS = [
  { id: 'wx', name: '微信支付', icon: '💚', tip: '推荐已绑定的支付方式' },
  { id: 'ali', name: '支付宝', icon: '💙', tip: '支持花呗分期' },
  { id: 'qq', name: 'QQ 钱包', icon: '💛', tip: '余额充足' }
]

const selected = ref('y')
const payVisible = ref(false)
const payMethod = ref('wx')
const paying = ref(false)

const payDone = ref(false)

const currentPlan = computed(() => PLANS.find((p) => p.id === selected.value) || PLANS[0])

function openPay() {
  payVisible.value = true
  payDone.value = false
}

function confirmPay() {
  if (paying.value) return
  paying.value = true
  setTimeout(() => {
    user.activateVip(currentPlan.value)
    paying.value = false
    payDone.value = true
    toast(`开通成功，有效期至 ${user.vipExpireText}`, { type: 'success' })
  }, 900)
}

function finish() {
  payVisible.value = false
  payDone.value = false
}
</script>

<template>
  <div class="page">
    <div class="container">
      <PageBar title="会员中心" :subtitle="user.isVip ? `尊贵的 ${user.vipType}` : '解锁全部会员专享内容'" />

      <!-- 会员状态 -->
      <section class="vip-hero">
        <div class="vip-hero__card">
          <div class="vip-hero__left">
            <span class="vip-hero__crown"><AppIcon name="crown" :size="22" /></span>
            <div>
              <p class="vip-hero__title">
                {{ user.isVip ? `${user.vipType} · 已生效` : '开通云视听 VIP' }}
              </p>
              <p class="vip-hero__sub">
                {{
                  user.isVip
                    ? `有效期至 ${user.vipExpireText}，可继续续费叠加时长`
                    : '首月低至 ¥15，随时可取消'
                }}
              </p>
            </div>
          </div>
          <button type="button" class="vip-hero__btn" @click="openPay">
            {{ user.isVip ? '立即续费' : '立即开通' }}
          </button>
        </div>
      </section>

      <!-- 套餐 -->
      <section class="section">
        <div class="section__head"><h2 class="section__title">选择套餐</h2></div>
        <div class="vip-plans">
          <div
            v-for="p in PLANS"
            :key="p.id"
            class="vip-plan"
            :class="{ 'is-active': selected === p.id }"
            @click="selected = p.id"
          >
            <span v-if="p.tag" class="vip-plan__tag">{{ p.tag }}</span>
            <p class="vip-plan__name">{{ p.name }}</p>
            <p class="vip-plan__price">
              <em>¥</em>{{ p.price }}
              <s v-if="p.origin">¥{{ p.origin }}</s>
            </p>
            <p class="vip-plan__desc">{{ p.desc }}</p>
            <span class="vip-plan__check"><AppIcon name="check" :size="14" /></span>
          </div>
        </div>
      </section>

      <!-- 权益 -->
      <section class="section">
        <div class="section__head"><h2 class="section__title">会员权益</h2></div>
        <div class="vip-rights">
          <div v-for="p in PRIVILEGES" :key="p.title" class="vip-right">
            <span class="vip-right__icon">{{ p.icon }}</span>
            <p class="vip-right__title">{{ p.title }}</p>
            <p class="vip-right__desc">{{ p.desc }}</p>
          </div>
        </div>
      </section>

      <div class="vip-footnote weak">
        <p>本页面为技术演示，支付流程为模拟流程，不会产生任何真实扣款。</p>
        <p>开通后会员状态保存在本地浏览器，清除缓存后会失效。</p>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="payVisible" class="pay" @click.self="!paying && (payVisible = false)">
          <div class="pay__panel">
            <template v-if="!payDone">
              <h3 class="pay__title">确认订单</h3>
              <div class="pay__row">
                <span class="weak">商品</span>
                <span>云视听 {{ currentPlan.name }}</span>
              </div>
              <div class="pay__row">
                <span class="weak">时长</span>
                <span>{{ currentPlan.days }} 天</span>
              </div>
              <div class="pay__row">
                <span class="weak">支付方式</span>
                <div class="pay__methods">
                  <button
                    v-for="m in PAY_METHODS"
                    :key="m.id"
                    type="button"
                    :class="{ 'is-active': payMethod === m.id }"
                    @click="payMethod = m.id"
                  >
                    <span>{{ m.icon }}</span> {{ m.name }}
                  </button>
                </div>
              </div>
              <div class="pay__amount">
                <span>应付</span>
                <b>¥{{ currentPlan.price }}</b>
              </div>
              <button type="button" class="btn btn--primary btn--lg pay__confirm" @click="confirmPay">
                <span v-if="paying" class="pay__loading" />
                {{ paying ? '支付中…' : '确认支付' }}
              </button>
              <button type="button" class="pay__cancel" @click="payVisible = false">暂不开通</button>
            </template>

            <template v-else>
              <div class="pay__done">
                <span class="pay__done-icon">🎉</span>
                <h3>开通成功</h3>
                <p class="weak">有效期至 {{ user.vipExpireText }}</p>
                <div class="pay__done-ops">
                  <button type="button" class="btn btn--ghost" @click="finish">知道了</button>
                  <button type="button" class="btn btn--primary" @click="finish(); router.push('/')">
                    去看片
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.vip-hero {
  margin-top: 4px;
}

.vip-hero__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 16px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #ffd88a, #ff9a44 55%, #ff5f6d);
  color: #4a2b00;
  box-shadow: 0 12px 28px rgba(255, 140, 60, 0.28);
}

.vip-hero__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.vip-hero__crown {
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-hero__title {
  font-size: 17px;
  font-weight: 800;
}

.vip-hero__sub {
  font-size: 12.5px;
  color: rgba(74, 43, 0, 0.72);
  margin-top: 2px;
}

.vip-hero__btn {
  flex: none;
  height: 38px;
  padding: 0 18px;
  border-radius: 19px;
  background: #4a2b00;
  color: #ffd88a;
  font-size: 14px;
  font-weight: 600;
}

.vip-plans {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.vip-plan {
  position: relative;
  padding: 16px 14px 14px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1.5px solid var(--line-strong);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.vip-plan.is-active {
  border-color: var(--brand);
  background: var(--brand-soft);
  box-shadow: 0 8px 20px rgba(255, 90, 43, 0.16);
}

.vip-plan__tag {
  position: absolute;
  top: -9px;
  left: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--brand-grad);
  color: #fff;
  font-size: 11px;
}

.vip-plan__name {
  font-size: 14px;
  font-weight: 600;
}

.vip-plan__price {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 800;
  color: var(--brand);
  line-height: 1.1;
}

.vip-plan__price em {
  font-size: 14px;
  font-style: normal;
  margin-right: 1px;
}

.vip-plan__price s {
  margin-left: 6px;
  font-size: 12px;
  color: var(--text-weak);
  font-weight: 400;
}

.vip-plan__desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-weak);
}

.vip-plan__check {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--brand-grad);
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
}

.vip-plan.is-active .vip-plan__check {
  display: flex;
}

.vip-rights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.vip-right {
  padding: 14px 12px;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.vip-right__icon {
  font-size: 22px;
}

.vip-right__title {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
}

.vip-right__desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-weak);
  line-height: 1.6;
}

.vip-footnote {
  margin-top: 26px;
  font-size: 12px;
  line-height: 1.9;
  text-align: center;
}

/* ---------- 支付弹窗 ---------- */
.pay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 16, 20, 0.55);
  backdrop-filter: blur(3px);
}

.pay__panel {
  width: 100%;
  max-width: 380px;
  padding: 20px;
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow);
}

.pay__title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 14px;
}

.pay__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  font-size: 13.5px;
  border-bottom: 1px solid var(--line);
}

.pay__row > span:first-child {
  width: 62px;
  flex: none;
}

.pay__methods {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.pay__methods button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--line-strong);
  font-size: 13px;
  color: var(--text-sub);
}

.pay__methods button.is-active {
  border-color: var(--brand);
  background: var(--brand-soft);
  color: var(--brand);
}

.pay__amount {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 0 8px;
  font-size: 13px;
}

.pay__amount b {
  font-size: 24px;
  color: var(--brand);
}

.pay__confirm {
  width: 100%;
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pay__loading {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: pay-spin 0.8s linear infinite;
}

@keyframes pay-spin {
  to {
    transform: rotate(360deg);
  }
}

.pay__cancel {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  font-size: 13.5px;
  color: var(--text-weak);
}

.pay__done {
  text-align: center;
  padding: 10px 0 4px;
}

.pay__done-icon {
  font-size: 44px;
}

.pay__done h3 {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
}

.pay__done-ops {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.pay__done-ops .btn {
  flex: 1;
}

@media (min-width: 768px) {
  .vip-plans,
  .vip-rights {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .vip-hero__card {
    padding: 24px 26px;
  }

  .vip-hero__title {
    font-size: 20px;
  }
}
</style>
