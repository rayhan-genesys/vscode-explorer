// utils.js

/**
 * Traverses the data object to find and return the value at a given path.
 * Input: data (Object), path (Array of strings e.g. ['auto', 'name', 'en'])
 * Output: The value at the path, or undefined.
 */
export function getNodeByPath(data, path) {
  // Use Array.reduce to walk down the object keys
  return path.reduce(
    (current, key) =>
      current && current[key] !== undefined ? current[key] : undefined,
    data
  );
}

/**
 * Traverses the data object and sets a new value at the specified path.
 * Input: data (Object), path (Array), value (Any)
 * Output: Mutates the 'data' object.
 */
export function setNodeByPath(data, path, value) {
  let current = data;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (i === path.length - 1) {
      // Last key: set the value
      current[key] = value;
    } else {
      // Not last key: dig deeper
      if (!current[key] || typeof current[key] !== "object") {
        // If the path doesn't exist, initialize it (important for 'Add' feature, though not implemented here)
        current[key] = {};
      }
      current = current[key];
    }
  }
}

/**
 * Traverses the data object and deletes the key at the specified path.
 * Input: data (Object), path (Array)
 * Output: Mutates the 'data' object.
 */
export function deleteNodeByPath(data, path) {
  if (path.length === 0) return; // Cannot delete root

  let current = data;

  // Find the PARENT of the node to be deleted (stop at path.length - 1)
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current[key]) {
      current = current[key];
    } else {
      return; // Path doesn't exist (safety check)
    }
  }

  // The last item in the path is the key we want to delete
  const keyToDelete = path[path.length - 1];

  // Delete it from the parent
  if (Array.isArray(current)) {
    // If parent is array, splice it (index-based deletion)
    const index = parseInt(keyToDelete);
    if (!isNaN(index)) current.splice(index, 1);
  } else if (typeof current === "object" && current !== null) {
    // If parent is object, delete key
    delete current[keyToDelete];
  }
}

/**
 * Checks if 'targetPath' is a descendant (child, grandchild, etc.) of 'sourcePath'.
 * Used to prevent dropping a parent node into one of its own children.
 * Input: sourcePath (Array), targetPath (Array)
 * Output: Boolean
 */
export function isChildOf(sourcePath, targetPath) {
  if (targetPath.length <= sourcePath.length) return false;

  // Check if target path starts with all elements of source path
  return sourcePath.every((key, index) => targetPath[index] === key);
}
