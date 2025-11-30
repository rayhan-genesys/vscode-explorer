<script setup>
import { ref, computed, watch, onMounted } from "vue";
import TreeNode from "./components/TreeNode.vue";
import {
  deleteNodeByPath,
  getNodeByPath,
  setNodeByPath,
  isChildOf,
} from "./utils/treeHelper.js";

// --- INITIAL DATA & STATE ---
const DEFAULT_DATA = {
  auto: {
    driver_types: {
      auto: true,
      img_url: "",
      is_active: true,
      is_open_for_signup: true,
      name: { bn: "অটো", en: "Auto" },
      verify_otp_for_signup: false,
    },
    // Add another top-level key for demonstration
    settings: {
      max_distance: 10,
      currency: "BDT",
    },
  },
};

const treeData = ref({});
const selectedPath = ref([]);
const showImportModal = ref(false);
const importInput = ref("");
const showDeleteModal = ref(false);
const pathToDelete = ref(null);
const draggedPath = ref(null); // Stores the path of the node being dragged

// --- COMPUTED PROPERTIES ---

const formattedJson = computed(() => {
  // Show formatted read-only JSON for the right panel
  return JSON.stringify(treeData.value, null, 2);
});

const breadcrumbString = computed(() => {
  // Skip the first element if it's the root key 'auto' to match the UI example
  // The first element is already shown statically as 'auto' in the template
  if (selectedPath.value.length === 0) return "";

  const pathForBreadcrumb =
    selectedPath.value.length > 1
      ? selectedPath.value.slice(1) // Start from the second element
      : selectedPath.value;

  return pathForBreadcrumb.join(" > ");
});

const nodeToDeleteName = computed(() => {
  if (!pathToDelete.value) return "";
  return pathToDelete.value[pathToDelete.value.length - 1];
});

// --- CORE ACTIONS ---

// 1. Selection
const handleSelect = (path) => {
  selectedPath.value = path;
};

// 2. Import
const confirmImport = () => {
  try {
    const parsed = JSON.parse(importInput.value);
    treeData.value = parsed;
    selectedPath.value = [];
    showImportModal.value = false;
  } catch (e) {
    alert("Invalid JSON format! Please check the syntax.");
  }
};

// 3. Delete
const requestDelete = (path) => {
  // Constraint: Don't allow deleting root nodes (Depth 0: path.length === 1, e.g., ['auto'])
  if (path.length <= 1) {
    alert("❌ The top-level root node cannot be deleted!");
    return;
  }
  pathToDelete.value = path;
  showDeleteModal.value = true;
};

const executeDelete = () => {
  if (pathToDelete.value) {
    deleteNodeByPath(treeData.value, pathToDelete.value);

    // Reset states after mutation
    showDeleteModal.value = false;
    pathToDelete.value = null;
    selectedPath.value = [];
  }
};

// 4. Drag and Drop (Reparenting)
const handleDragStart = (path) => {
  draggedPath.value = path;
};

const handleDrop = (targetPath) => {
  const sourcePath = draggedPath.value;
  if (!sourcePath || !targetPath) return;

  // --- VALIDATION & CHECKS ---
  const sourceName = sourcePath[sourcePath.length - 1];

  // A. Check for self-drop or dropping on root key
  if (JSON.stringify(sourcePath) === JSON.stringify(targetPath)) {
    draggedPath.value = null;
    return;
  }

  // B. Check for circular dependency (parent into child)
  if (isChildOf(sourcePath, targetPath)) {
    alert(
      `Circular error: Cannot move "${sourceName}" into its own descendant.`
    );
    draggedPath.value = null;
    return;
  }

  // C. Check if target is a folder/object (not a primitive value)
  const targetNode = getNodeByPath(treeData.value, targetPath);
  if (typeof targetNode !== "object" || targetNode === null) {
    alert("🚫 Can only drop into Objects/Arrays (folder nodes).");
    draggedPath.value = null;
    return;
  }

  // --- EXECUTE MOVE ---

  // 1. Get the data being moved
  const dataToMove = getNodeByPath(treeData.value, sourcePath);

  // 2. Define the final insertion path
  const insertionPath = [...targetPath, sourceName];

  // 3. Add to the new location
  setNodeByPath(treeData.value, insertionPath, dataToMove);

  // 4. Delete from the old location (This must happen last to maintain reference until deletion)
  deleteNodeByPath(treeData.value, sourcePath);

  // Reset
  draggedPath.value = null;
  selectedPath.value = insertionPath; // Select the newly moved node
};

// 5. Persistence
const STORAGE_KEY = "tree-explorer-data";

watch(
  treeData,
  (newVal) => {
    // Save data to localStorage whenever treeData changes (deep watch)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    treeData.value = JSON.parse(saved);
  } else {
    treeData.value = DEFAULT_DATA;
  }
});
</script>

<template>
  <div
    class="h-screen flex flex-col font-sans text-gray-800 antialiased bg-gray-100"
  >
    <header
      class="p-4 border-b flex justify-between items-center bg-white shadow-md"
    >
      <h1 class="font-extrabold text-2xl text-blue-600">JSON Tree Explorer</h1>
      <button
        @click="showImportModal = true"
        class="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
      >
        📥 Import JSON
      </button>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <aside
        class="w-1/3 min-w-[300px] border-r flex flex-col bg-white overflow-y-auto"
      >
        <div class="p-4">
          <h2
            class="font-bold mb-4 uppercase text-xs text-gray-500 tracking-wider"
          >
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

      <main class="flex-1 flex flex-col bg-white overflow-hidden">
        <div
          class="p-4 border-b text-sm text-gray-600 bg-gray-50 h-14 flex items-center shadow-inner"
        >
          <span class="font-mono text-gray-700">
            <span v-if="!breadcrumbString"
              >Select a node to see its path...</span
            >
            <span v-else class="font-bold text-blue-600">auto</span> >
            {{ breadcrumbString }}
          </span>
        </div>

        <div class="flex-1 p-6 overflow-auto bg-gray-900">
          <pre class="font-mono text-xs text-green-400">{{
            formattedJson
          }}</pre>
        </div>
      </main>
    </div>

    <div v-if="showImportModal" class="modal-overlay">
      <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h3 class="font-bold text-xl mb-3">Import JSON Data</h3>
        <textarea
          v-model="importInput"
          class="w-full border p-3 h-48 font-mono text-xs mb-4 focus:ring-blue-500 focus:border-blue-500"
          placeholder='Enter valid JSON object here, e.g., {"root_key": {"child_key": true}}'
        ></textarea>
        <div class="flex justify-end gap-3">
          <button
            @click="showImportModal = false"
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

    <div v-if="showDeleteModal" class="modal-overlay">
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
            @click="showDeleteModal = false"
            class="px-5 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="executeDelete"
            class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Basic utility classes for the modal overlay, since we're using Tailwind principles */
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
/* Ensure the pre tag handles the large JSON */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
