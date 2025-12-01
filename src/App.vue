<script setup>
import { ref } from "vue";
import { useTreeData } from "./composables/useTreeData.js";
import { useTreeSelection } from "./composables/useTreeSelection.js";

// Components
import TreeHeader from "./components/TreeHeader.vue";
import TreeSidebar from "./components/TreeSidebar.vue";
import TreeBreadcrumbs from "./components/TreeBreadcrumbs.vue";
import JsonViewer from "./components/JsonViewer.vue";
import ImportModal from "./components/ImportModal.vue";
import DeleteModal from "./components/DeleteModal.vue";
import InsertModal from "./components/InsertModal.vue";

// Composables
const { treeData, setTreeData, deleteNode, moveNode, renameNode, insertNode } =
  useTreeData();
const { selectedPath, selectPath, clearSelection, breadcrumbString } =
  useTreeSelection();

// Local State
const showImportModal = ref(false);
const showDeleteModal = ref(false);
const showInsertModal = ref(false);
const pathToDelete = ref(null);
const pathToInsert = ref(null);
const draggedPath = ref(null);

// --- ACTIONS ---

// 1. Selection
const handleSelect = (path) => {
  selectPath(path);
};

// 2. Import
const handleImportConfirm = (parsedData) => {
  setTreeData(parsedData);
  clearSelection();
  showImportModal.value = false;
};

// 3. Delete
const requestDelete = (path) => {
  // Constraint: Don't allow deleting root nodes (Depth 0: path.length === 1)
  if (path.length <= 1) {
    alert("❌ The top-level root node cannot be deleted!");
    return;
  }
  pathToDelete.value = path;
  showDeleteModal.value = true;
};

const executeDelete = () => {
  if (pathToDelete.value) {
    deleteNode(pathToDelete.value);
    showDeleteModal.value = false;
    pathToDelete.value = null;
    clearSelection();
  }
};

// 4. Drag and Drop
const handleDragStart = (path) => {
  draggedPath.value = path;
};

const handleDrop = (targetPath) => {
  const sourcePath = draggedPath.value;
  if (!sourcePath || !targetPath) return;

  const result = moveNode(sourcePath, targetPath);

  if (!result.success) {
    if (result.message) alert(result.message);
  } else {
    selectPath(result.newPath);
  }

  draggedPath.value = null;
};

// 5. Rename
const handleRename = ({ path, newName }) => {
  const result = renameNode(path, newName);
  if (!result.success) {
    alert(`❌ Rename failed: ${result.message}`);
  }
};

// 6. Insert
const handleInsertRequest = (path) => {
  pathToInsert.value = path;
  showInsertModal.value = true;
};

const handleInsertConfirm = ({ key, value }) => {
  if (pathToInsert.value) {
    const result = insertNode(pathToInsert.value, key, value);
    if (!result.success) {
      alert(`❌ Insert failed: ${result.message}`);
    } else {
      showInsertModal.value = false;
      pathToInsert.value = null;
    }
  }
};
</script>

<template>
  <div
    class="h-screen flex flex-col font-sans text-gray-800 antialiased bg-white p-8"
  >
    <!-- <TreeHeader @open-import="showImportModal = true" /> -->

    <div class="flex flex-1 overflow-hidden gap-8">
      <TreeSidebar
        :tree-data="treeData"
        :selected-path="selectedPath"
        @select="handleSelect"
        @delete="requestDelete"
        @rename="handleRename"
        @insert-request="handleInsertRequest"
        @node-drag-start="handleDragStart"
        @node-drop="handleDrop"
      />

      <main class="flex-1 flex flex-col bg-white overflow-hidden">
        <TreeBreadcrumbs :breadcrumb-string="breadcrumbString" />
        <JsonViewer :data="treeData" />
      </main>
    </div>

    <ImportModal
      v-if="showImportModal"
      @close="showImportModal = false"
      @confirm="handleImportConfirm"
    />

    <DeleteModal
      v-if="showDeleteModal"
      :path-to-delete="pathToDelete"
      @close="showDeleteModal = false"
      @confirm="executeDelete"
    />

    <InsertModal
      v-if="showInsertModal"
      :parent-path="pathToInsert"
      @close="showInsertModal = false"
      @confirm="handleInsertConfirm"
    />
  </div>
</template>
