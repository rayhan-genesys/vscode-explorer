import { ref, watch, onMounted } from "vue";
import {
  deleteNodeByPath,
  getNodeByPath,
  setNodeByPath,
  isChildOf,
} from "../utils/treeHelper.js";

const STORAGE_KEY = "tree-explorer-data";

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
    settings: {
      max_distance: 10,
      currency: "BDT",
    },
  },
};

export function useTreeData() {
  const treeData = ref({});

  // Persistence
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        treeData.value = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved tree data", e);
        treeData.value = DEFAULT_DATA;
      }
    } else {
      treeData.value = DEFAULT_DATA;
    }
  });

  watch(
    treeData,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
    },
    { deep: true }
  );

  // Actions
  const setTreeData = (newData) => {
    treeData.value = newData;
  };

  const deleteNode = (path) => {
    deleteNodeByPath(treeData.value, path);
  };

  const moveNode = (sourcePath, targetPath) => {
    if (!sourcePath || !targetPath)
      return { success: false, message: "Invalid paths" };

    const sourceName = sourcePath[sourcePath.length - 1];

    // Check for self-drop
    if (JSON.stringify(sourcePath) === JSON.stringify(targetPath)) {
      return { success: false, message: "Cannot move node to itself" };
    }

    // Check for circular dependency
    if (isChildOf(sourcePath, targetPath)) {
      return {
        success: false,
        message: `Circular error: Cannot move "${sourceName}" into its own descendant.`,
      };
    }

    // Check if target is a folder/object
    const targetNode = getNodeByPath(treeData.value, targetPath);
    if (typeof targetNode !== "object" || targetNode === null) {
      return {
        success: false,
        message: "🚫 Can only drop into Objects/Arrays (folder nodes).",
      };
    }

    // Execute Move
    const dataToMove = getNodeByPath(treeData.value, sourcePath);
    const insertionPath = [...targetPath, sourceName];

    // We need to clone the data to avoid reference issues if we were to delete first,
    // but here we set then delete. `getNodeByPath` returns reference for objects, so it's fine.
    // However, `setNodeByPath` might overwrite if we are not careful, but here we are moving to a new key in target.

    setNodeByPath(treeData.value, insertionPath, dataToMove);
    deleteNodeByPath(treeData.value, sourcePath);

    return { success: true, newPath: insertionPath };
  };

  return {
    treeData,
    setTreeData,
    deleteNode,
    moveNode,
    getNodeByPath: (path) => getNodeByPath(treeData.value, path),
  };
}
