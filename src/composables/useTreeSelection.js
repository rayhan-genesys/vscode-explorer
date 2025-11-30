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

    const pathForBreadcrumb =
      selectedPath.value.length > 1
        ? selectedPath.value.slice(1)
        : selectedPath.value;

    return pathForBreadcrumb.join(" > ");
  });

  return {
    selectedPath,
    selectPath,
    clearSelection,
    breadcrumbString,
  };
}
