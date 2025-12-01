<script setup>
import TreeNode from "./TreeNode.vue";

defineProps({
  treeData: {
    type: Object,
    required: true,
  },
  selectedPath: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "select",
  "delete",
  "node-drag-start",
  "node-drop",
  "rename",
  "insert-request",
]);

const handleSelect = (path) => emit("select", path);
const requestDelete = (path) => emit("delete", path);
const handleDragStart = (path) => emit("node-drag-start", path);
const handleDrop = (path) => emit("node-drop", path);
</script>

<template>
  <aside class="w-1/3 min-w-[300px] flex flex-col bg-white overflow-y-auto">
    <h2 class="text-2xl font-normal mb-4 text-black">Tree</h2>

    <div class="border rounded-lg p-4 h-full overflow-auto">
      <TreeNode
        v-for="(value, key) in treeData"
        :key="key"
        :label="key"
        :node="value"
        :depth="0"
        :path="[key]"
        :current-selection="selectedPath"
        @select="handleSelect"
        @delete="requestDelete"
        @rename="$emit('rename', $event)"
        @insert-request="$emit('insert-request', $event)"
        @node-drag-start="handleDragStart"
        @node-drop="handleDrop"
      />
    </div>
  </aside>
</template>
