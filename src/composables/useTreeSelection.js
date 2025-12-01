import { ref, computed } from "vue";

export function useTreeSelection() {
  const selectedPath = ref([]);

  const selectPath = (path) => {
    selectedPath.value = path;
  };

  const clearSelection = () => {
    selectedPath.value = [];
  };

  const breadcrumbString = computed(() => {
    if (selectedPath.value.length === 0) return "";

    return selectedPath.value.join(" > ");
  });

  return {
    selectedPath,
    selectPath,
    clearSelection,
    breadcrumbString,
  };
}
