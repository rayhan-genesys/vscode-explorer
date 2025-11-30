<script setup>
import { ref, computed } from "vue";

// Use 'defineOptions' or direct component setup for recursion
// If using Vue CLI/Vite setup, ensure the component name matches the file name for recursion.
defineOptions({
  name: "TreeNode",
});

// PROPS
const props = defineProps([
  "label",
  "node",
  "depth",
  "path",
  "currentSelection",
]);
// EMITS: select, delete, and DND events
const emit = defineEmits(["select", "delete", "node-drag-start", "node-drop"]);

// STATE
const isOpen = ref(false); // Manages expand/collapse
const isDraggingOver = ref(false); // Manages visual drop indicator

// COMPUTED LOGIC
const hasChildren = computed(() => {
  return (
    props.node &&
    typeof props.node === "object" &&
    Object.keys(props.node).length > 0
  );
});

const isSelected = computed(() => {
  // Deep comparison of arrays to determine selection
  return JSON.stringify(props.path) === JSON.stringify(props.currentSelection);
});

// ACTIONS
function toggle() {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value;
  }
}

function onSelect() {
  emit("select", props.path);
}

function onDelete() {
  emit("delete", props.path);
}

function formatValue(val) {
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "boolean") return val ? "true" : "false";
  return val;
}

// --- DND Handlers ---
function onDragStart(event) {
  // Store the source path on the component state and bubble up to App.vue
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/json", JSON.stringify(props.path));
  emit("node-drag-start", props.path);
}

function onDrop(event) {
  isDraggingOver.value = false;
  // Bubble up the target path (which is the current node's path)
  emit("node-drop", props.path);
}

function onDragOver() {
  isDraggingOver.value = true;
}

function onDragLeave() {
  isDraggingOver.value = false;
}
</script>

<template>
  <div class="tree-node select-none">
    <div
      class="flex items-center py-1 cursor-pointer transition-colors"
      :class="[
        isSelected
          ? 'bg-blue-200 text-blue-800 font-semibold'
          : 'hover:bg-gray-100',
        isDraggingOver
          ? 'border-2 border-dashed border-blue-500'
          : 'border-2 border-transparent',
      ]"
      :style="{ paddingLeft: `${depth * 20}px` }"
      draggable="true"
      @click.stop="onSelect"
      @dragstart.stop="onDragStart"
      @drop.stop="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
    >
      <span
        v-if="hasChildren"
        @click.stop="toggle"
        class="mr-2 transform transition-transform text-gray-500 text-xs"
        :class="{ 'rotate-90': isOpen }"
      >
        ▶
      </span>
      <span v-else class="w-5"></span>
      <span class="mr-2 text-sm">{{ label }}</span>

      <span v-if="!hasChildren" class="text-xs text-gray-400 mr-2">
        : {{ formatValue(node) }}
      </span>

      <button
        class="ml-auto mr-2 text-red-500 hover:text-red-700 font-bold text-lg"
        @click.stop="onDelete"
        title="Delete Node"
      >
        &#x2716;
      </button>
    </div>

    <div v-if="isOpen && hasChildren" class="relative">
      <TreeNode
        v-for="(childValue, childKey) in node"
        :key="childKey"
        :label="childKey"
        :node="childValue"
        :depth="depth + 1"
        :path="[...path, childKey]"
        :current-selection="currentSelection"
        @select="$emit('select', $event)"
        @delete="$emit('delete', $event)"
        @node-drag-start="$emit('node-drag-start', $event)"
        @node-drop="$emit('node-drop', $event)"
      />
    </div>
  </div>
</template>
