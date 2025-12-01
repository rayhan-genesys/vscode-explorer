<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

function formatJsObject(obj, indent = 0) {
  const spaces = " ".repeat(indent);
  const nextSpaces = " ".repeat(indent + 2);

  if (typeof obj !== "object" || obj === null) {
    if (typeof obj === "string") return `'${obj}'`;
    return String(obj);
  }

  if (Array.isArray(obj)) {
    const items = obj
      .map((item) => formatJsObject(item, indent + 2))
      .join(",\n" + nextSpaces);
    return `[\n${nextSpaces}${items}\n${spaces}]`;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return "{}";

  const lines = keys.map((key) => {
    const value = formatJsObject(obj[key], indent + 2);
    return `${nextSpaces}${key}: ${value},`;
  });

  return `{\n${lines.join("\n")}\n${spaces}}`;
}

const formattedJson = computed(() => {
  // Format the data and strip the outer braces to match the image style
  const fullString = formatJsObject(props.data);
  // Remove first line "{" and last line "}"
  const lines = fullString.split("\n");
  if (lines.length >= 2) {
    return lines.slice(1, -1).join("\n").trim(); // Trim to remove initial indentation if desired, or keep it.
    // Image shows "auto: {" at the start. My formatter adds indentation.
    // If I trim, it will be left aligned.
  }
  return fullString;
});
</script>

<template>
  <div class="flex-1 p-6 overflow-auto bg-white border rounded-lg shadow-sm">
    <pre class="font-mono text-sm text-black leading-relaxed">{{
      formattedJson
    }}</pre>
  </div>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
