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
    },
    verify_otp_for_signup: false,
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
    renameNode: (path, newName) => {
      const parentPath = path.slice(0, -1);
      const oldName = path[path.length - 1];
      const parentNode =
        path.length === 1
          ? treeData.value
          : getNodeByPath(treeData.value, parentPath);

      if (Array.isArray(parentNode)) {
        // Arrays don't have keys to rename, but if we treated indices as keys...
        // Actually, for arrays, "renaming" might not make sense unless it's an object inside.
        // But our path logic uses indices for arrays.
        // If the user wants to rename a key inside an object in an array, the path would point to that key.
        // If path points to an array index, we can't "rename" the index.
        return {
          success: false,
          message: "Cannot rename array items directly.",
        };
      }

      if (parentNode[newName] !== undefined) {
        return { success: false, message: "Key already exists." };
      }

      // Preserve order if possible (ES2015+ preserves string key insertion order)
      const keys = Object.keys(parentNode);
      const newObject = {};
      keys.forEach((key) => {
        if (key === oldName) {
          newObject[newName] = parentNode[oldName];
        } else {
          newObject[key] = parentNode[key];
        }
      });

      // We need to replace the parent node's content with this new ordered object
      // But we can't easily replace "this" node if it's the root.
      if (path.length === 1) {
        // Root rename? Usually root is just the object.
        // If we are renaming a top-level key:
        delete treeData.value[oldName];
        treeData.value[newName] = parentNode[oldName];
        // Note: This loses order at root level if we just delete/add.
        // To preserve root order, we'd need to reconstruct treeData.value.
        // Let's try to reconstruct.
        const newRoot = {};
        Object.keys(treeData.value).forEach((k) => {
          if (k === oldName) newRoot[newName] = treeData.value[oldName];
          else newRoot[k] = treeData.value[k];
        });
        treeData.value = newRoot;
      } else {
        // For nested objects, we need to set the parent's value to the new object
        // But `getNodeByPath` returns a reference to the *value* of the parent, which is `parentNode`.
        // We can modify `parentNode` in place.
        // However, to preserve key order, we have to delete all keys and re-add them?
        // Or just accept that order might change?
        // Let's try to preserve order by re-assigning properties.

        // 1. Clear parent
        keys.forEach((k) => delete parentNode[k]);
        // 2. Re-add
        Object.assign(parentNode, newObject);
      }

      return { success: true };
    },
    insertNode: (path, key, value) => {
      const targetNode = getNodeByPath(treeData.value, path);
      if (typeof targetNode !== "object" || targetNode === null) {
        return { success: false, message: "Cannot insert into non-object." };
      }

      if (Array.isArray(targetNode)) {
        targetNode.push(value);
      } else {
        if (targetNode[key] !== undefined) {
          return { success: false, message: "Key already exists." };
        }
        targetNode[key] = value;
      }
      return { success: true };
    },
  };
}
