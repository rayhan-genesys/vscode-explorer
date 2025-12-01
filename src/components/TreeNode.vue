<script setup>
import { ref, computed } from "vue";

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
// EMITS
const emit = defineEmits(["select", "delete", "node-drag-start", "node-drop"]);

// STATE
const isOpen = ref(true); // Default to open to match image vibe, or false. Image shows expanded.
const isDraggingOver = ref(false);

// COMPUTED
const hasChildren = computed(() => {
  return (
    props.node &&
    typeof props.node === "object" &&
    Object.keys(props.node).length > 0
  );
});

const isSelected = computed(() => {
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

// DND
function onDragStart(event) {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/json", JSON.stringify(props.path));
  emit("node-drag-start", props.path);
}

function onDrop(event) {
  isDraggingOver.value = false;
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
  <div class="tree-node select-none relative">
    <div
      class="flex items-center py-1 cursor-pointer transition-colors group"
      :class="[
        isSelected ? 'text-blue-600 font-bold' : 'text-gray-800',
        isDraggingOver ? 'bg-blue-50' : '',
      ]"
      draggable="true"
      @click.stop="onSelect"
      @dragstart.stop="onDragStart"
      @drop.stop="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
    >
      <!-- Connector Line (Horizontal) for children -->
      <div v-if="depth > 0" class="w-4 h-px bg-gray-400 mr-1"></div>

      <!-- Toggler / Icon -->
      <span
        v-if="hasChildren"
        @click.stop="toggle"
        class="mr-1 transform transition-transform text-gray-500 cursor-pointer"
      >
        <!-- Chevron Down -->
        <svg
          v-if="isOpen"
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
        <!-- Chevron Right -->
        <svg
          v-else
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </span>
      <span v-else class="w-5"></span>

      <!-- Label -->
      <span class="mr-2 text-base">{{ label }}</span>

      <!-- Value (if leaf) -->
      <!-- <span v-if="!hasChildren" class="text-sm text-gray-500 mr-2">
        : {{ formatValue(node) }}
      </span> -->
      <!-- Image doesn't show values in the tree, only keys. I will hide values to match image exactly. -->

      <!-- Delete Button (Red Circle Minus) -->
      <button
        class="ml-auto mr-2 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop="onDelete"
        title="Delete Node"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-7.414 0a1 1 0 000 2l7.414 0a1 1 0 00-2z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Children Container -->
    <div
      v-if="isOpen && hasChildren"
      class="ml-[1.1rem] pl-0 border-l border-gray-400 flex flex-col"
    >
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
