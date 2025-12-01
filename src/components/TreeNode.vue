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
  "isLast", // New prop to determine line height
]);
// EMITS
const emit = defineEmits([
  "select",
  "delete",
  "node-drag-start",
  "node-drop",
  "rename",
  "insert-request",
]);

// STATE
const isOpen = ref(true); // Default to open to match image vibe, or false. Image shows expanded.
const isDraggingOver = ref(false);
const isRenaming = ref(false);
const renameName = ref("");
const renameInput = ref(null);
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

// RENAME
function startRename() {
  renameName.value = props.label;
  isRenaming.value = true;
  // Focus next tick
  setTimeout(() => {
    renameInput.value?.focus();
  }, 0);
}

function cancelRename() {
  isRenaming.value = false;
}

function confirmRename() {
  if (renameName.value && renameName.value !== props.label) {
    emit("rename", { path: props.path, newName: renameName.value });
  }
  isRenaming.value = false;
}

// INSERT
function onInsert() {
  emit("insert-request", props.path);
}
</script>

<template>
  <div class="tree-node select-none relative">
    <!-- Vertical Line -->
    <div
      v-if="depth > 0"
      class="absolute -left-4 w-px bg-gray-400 top-0"
      :class="isLast ? 'h-4' : 'h-full'"
    ></div>

    <!-- Horizontal Line -->
    <div
      v-if="depth > 0"
      class="absolute -left-4 w-4 h-px bg-gray-400 top-4"
    ></div>

    <div
      class="flex items-center py-1 cursor-pointer transition-colors group h-8"
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

      <!-- Label or Rename Input -->
      <template v-if="isRenaming">
        <input
          ref="renameInput"
          v-model="renameName"
          @click.stop
          @keydown.enter="confirmRename"
          @keydown.esc="cancelRename"
          @blur="cancelRename"
          class="mr-2 text-base border border-blue-500 rounded px-1 py-0.5 focus:outline-none"
        />
      </template>
      <span v-else class="mr-2 text-base">{{ label }}</span>

      <!-- Actions Group -->
      <div
        class="ml-auto flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <!-- Insert Button (Plus) - Only for Objects/Arrays -->
        <button
          v-if="hasChildren || (node && typeof node === 'object')"
          class="text-green-500 hover:text-green-600"
          @click.stop="onInsert"
          title="Insert Node"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
        </button>

        <!-- Rename Button (Pencil) -->
        <button
          class="text-blue-500 hover:text-blue-600"
          @click.stop="startRename"
          title="Rename Node"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            ></path>
          </svg>
        </button>

        <!-- Delete Button (Red Circle Minus) -->
        <button
          class="text-red-500 hover:text-red-600"
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
    </div>

    <!-- Children Container -->
    <div v-if="isOpen && hasChildren" class="ml-4 pl-0 flex flex-col">
      <TreeNode
        v-for="(childValue, childKey, index) in node"
        :key="childKey"
        :label="childKey"
        :node="childValue"
        :depth="depth + 1"
        :path="[...path, childKey]"
        :current-selection="currentSelection"
        :is-last="index === Object.keys(node).length - 1"
        @select="$emit('select', $event)"
        @delete="$emit('delete', $event)"
        @rename="$emit('rename', $event)"
        @insert-request="$emit('insert-request', $event)"
        @node-drag-start="$emit('node-drag-start', $event)"
        @node-drop="$emit('node-drop', $event)"
      />
    </div>
  </div>
</template>
