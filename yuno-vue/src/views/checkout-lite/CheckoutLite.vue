<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../components/Button.vue'
import { startPayment, yunoInstance } from './checkout-lite'

const canaryMode = ref(false)

const handleCanaryToggle = (event: Event) => {
  const target = event.target as HTMLInputElement
  canaryMode.value = target.checked
  if (yunoInstance.value) {
    yunoInstance.value.setCanaryMode(canaryMode.value)
  }
}
</script>

<template>
  <h1>Checkout Lite</h1>
  <div class="canary-toggle-container">
    <label class="toggle-label">
      <input
        type="checkbox"
        id="canary-toggle"
        :checked="canaryMode"
        @change="handleCanaryToggle"
      />
      <span>Canary Mode</span>
    </label>
  </div>
  <Button text="Start Payment" @click="startPayment"></Button>
  <div id="yuno-root"></div>
</template>

<style scoped>
.canary-toggle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  margin: 16px auto;
  max-width: 450px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'Inter', 'Arial';
  font-size: 14px;
  font-weight: 500;
  color: #333;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #632DBB;
}
</style>
