<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../components/Button.vue'
import { startPayment, setCanaryMode } from './checkout-lite'

const canaryMode = ref(false)

const handleCanaryToggle = (event: Event) => {
  const checkbox = event.target as HTMLInputElement
  canaryMode.value = checkbox.checked
  setCanaryMode(checkbox.checked)
}
</script>

<template>
  <div class="canary-toggle-container">
    <label class="canary-toggle-label">
      <input
        type="checkbox"
        id="canary-toggle"
        :checked="canaryMode"
        @change="handleCanaryToggle"
      />
      <span>Canary Mode</span>
    </label>
  </div>

  <h1>Checkout Lite</h1>
  <Button text="Start Payment" @click="startPayment"></Button>
  <div id="yuno-root"></div>
</template>

<style scoped>
.canary-toggle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px auto;
  max-width: 450px;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.canary-toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'Inter', 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  user-select: none;
}

.canary-toggle-label input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 40px;
  height: 22px;
  background: #cbd5e1;
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.canary-toggle-label input[type="checkbox"]::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: left 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.canary-toggle-label input[type="checkbox"]:checked {
  background: #632DBB;
}

.canary-toggle-label input[type="checkbox"]:checked::after {
  left: 20px;
}
</style>
