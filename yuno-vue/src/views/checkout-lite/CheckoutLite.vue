<script setup lang="ts">
import Button from '../../components/Button.vue'
import { startPayment } from './checkout-lite'
</script>

<template>
  <h1>Checkout Lite</h1>
  <Button text="Start Payment" @click="startPayment"></Button>
  <div id="yuno-root"></div>
</template>
