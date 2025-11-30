<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const formattedJson = computed(() => {
  return JSON.stringify(props.data, null, 2);
});
</script>

<template>
  <div class="flex-1 p-6 overflow-auto bg-gray-900">
    <pre class="font-mono text-xs text-green-400">{{ formattedJson }}</pre>
  </div>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
