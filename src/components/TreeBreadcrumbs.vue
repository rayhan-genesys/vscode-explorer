<script setup>
defineProps({
  breadcrumbString: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div
    class="p-4 border-b text-sm text-gray-600 bg-gray-50 h-14 flex items-center shadow-inner"
  >
    <span class="font-mono text-gray-700">
      <span v-if="!breadcrumbString">Select a node to see its path...</span>
      <span v-else>
        <span class="font-bold text-blue-600">auto</span> >
        {{ breadcrumbString }}
      </span>
    </span>
  </div>
</template>
