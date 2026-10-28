<script setup>
import { useToast } from '@/composables/useToast'

const { list } = useToast()
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-wrap">
      <div v-for="item in list" :key="item.id" class="toast" :class="`toast--${item.type}`">
        {{ item.text }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-wrap {
  position: fixed;
  left: 50%;
  bottom: calc(84px + var(--safe-bottom));
  transform: translateX(-50%);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast {
  max-width: 78vw;
  padding: 9px 16px;
  border-radius: 20px;
  background: rgba(20, 22, 28, 0.9);
  color: #fff;
  font-size: 13px;
  line-height: 1.4;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
}

.toast--success {
  background: rgba(22, 145, 84, 0.94);
}

.toast--error {
  background: rgba(196, 42, 42, 0.94);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}

@media (min-width: 768px) {
  .toast-wrap {
    bottom: 40px;
  }
}
</style>
