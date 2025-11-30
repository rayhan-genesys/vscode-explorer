<script setup>
defineEmits(["open-import"]);
</script>

<template>
  <header
    class="p-4 border-b flex justify-between items-center bg-white shadow-md"
  >
    <h1 class="font-extrabold text-2xl text-blue-600">JSON Tree Explorer</h1>
    <button
      @click="$emit('open-import')"
      class="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
    >
      📥 Import JSON
    </button>
  </header>
</template>
