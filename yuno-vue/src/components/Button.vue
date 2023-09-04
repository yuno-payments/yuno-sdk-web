<script setup>
const props = defineProps({
  text: String
})
</script>

<template>
  <button class="button">{{ props.text }}</button>
</template>

<style scoped>
.button {
  border: none;
  display: block;
  background: #6400FF;
  border-radius: 4px;
  color: #FEFEFE;
  outline: none;
  cursor: pointer;
  padding: 8px;
}

.button:hover {
  background: #410F92;
}
</style>