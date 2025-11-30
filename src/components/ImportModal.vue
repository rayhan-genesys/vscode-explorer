<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "confirm"]);

const importInput = ref("");

const confirmImport = () => {
  try {
    const parsed = JSON.parse(importInput.value);
    emit("confirm", parsed);
  } catch (e) {
    alert("Invalid JSON format! Please check the syntax.");
  }
};
</script>

<template>
  <div class="modal-overlay">
    <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
      <h3 class="font-bold text-xl mb-3">Import JSON Data</h3>
      <textarea
        v-model="importInput"
        class="w-full border p-3 h-48 font-mono text-xs mb-4 focus:ring-blue-500 focus:border-blue-500"
        placeholder='Enter valid JSON object here, e.g., {"root_key": {"child_key": true}}'
      ></textarea>
      <div class="flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-5 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="confirmImport"
          class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Import
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
</style>
