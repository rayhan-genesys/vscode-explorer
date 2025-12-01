<script setup>
defineProps({
  breadcrumbString: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="mb-4">
    <h1 class="text-3xl text-black font-normal">
      <span v-if="!breadcrumbString">Select a node...</span>
      <span v-else>{{ breadcrumbString }}</span>
    </h1>
  </div>
</template>
