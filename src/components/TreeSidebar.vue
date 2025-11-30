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

const emit = defineEmits(["select", "delete", "node-drag-start", "node-drop"]);

const handleSelect = (path) => emit("select", path);
const requestDelete = (path) => emit("delete", path);
const handleDragStart = (path) => emit("node-drag-start", path);
const handleDrop = (path) => emit("node-drop", path);
</script>

<template>
  <aside
    class="w-1/3 min-w-[300px] border-r flex flex-col bg-white overflow-y-auto"
  >
    <div class="p-4">
      <h2 class="font-bold mb-4 uppercase text-xs text-gray-500 tracking-wider">
        Tree
      </h2>

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
        @node-drag-start="handleDragStart"
        @node-drop="handleDrop"
      />
    </div>
  </aside>
</template>
