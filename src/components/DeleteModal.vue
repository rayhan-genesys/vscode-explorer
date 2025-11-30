<script setup>
import { computed } from "vue";

const props = defineProps({
  pathToDelete: {
    type: Array,
    default: null,
  },
});

const emit = defineEmits(["close", "confirm"]);

const nodeToDeleteName = computed(() => {
  if (!props.pathToDelete) return "";
  return props.pathToDelete[props.pathToDelete.length - 1];
});
</script>

<template>
  <div class="modal-overlay">
    <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
      <h3 class="font-bold text-xl text-red-600 mb-3">Confirm Deletion</h3>
      <p class="text-sm mb-6">
        Are you sure you want to delete the node:
        <span class="font-mono font-bold bg-red-100 p-1 rounded">{{
          nodeToDeleteName
        }}</span
        >?
      </p>
      <div class="flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-5 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete Permanently
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
