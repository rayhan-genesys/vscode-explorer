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
      <span v-else>
        <span>auto</span>
        <span class="mx-2">&gt;</span>
        <span>{{ breadcrumbString.split(" > ").join(" > ") }}</span>
      </span>
    </h1>
  </div>
</template>
