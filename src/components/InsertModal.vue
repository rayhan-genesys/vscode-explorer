<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  parentPath: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "confirm"]);

const keyName = ref("");
const valueType = ref("String"); // String, Number, Boolean, Object, Array
const stringValue = ref("");
const numberValue = ref(0);
const booleanValue = ref(true);

const isValid = computed(() => {
  if (!keyName.value.trim()) return false;
  return true;
});

function onConfirm() {
  if (!isValid.value) return;

  let finalValue;
  switch (valueType.value) {
    case "String":
      finalValue = stringValue.value;
      break;
    case "Number":
      finalValue = Number(numberValue.value);
      break;
    case "Boolean":
      finalValue = booleanValue.value;
      break;
    case "Object":
      finalValue = {};
      break;
    case "Array":
      finalValue = [];
      break;
  }

  emit("confirm", { key: keyName.value, value: finalValue });
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl w-96 p-6">
      <h3 class="text-xl font-bold mb-4">Insert New Node</h3>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Parent Path</label
        >
        <div class="text-xs text-gray-500 bg-gray-100 p-2 rounded break-all">
          {{ parentPath.join(" > ") }}
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Key Name</label
        >
        <input
          v-model="keyName"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. myNewKey"
          autofocus
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Value Type</label
        >
        <select
          v-model="valueType"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="String">String</option>
          <option value="Number">Number</option>
          <option value="Boolean">Boolean</option>
          <option value="Object">Object {}</option>
          <option value="Array">Array []</option>
        </select>
      </div>

      <div v-if="valueType === 'String'" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Value</label
        >
        <input
          v-model="stringValue"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div v-if="valueType === 'Number'" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Value</label
        >
        <input
          v-model="numberValue"
          type="number"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div v-if="valueType === 'Boolean'" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Value</label
        >
        <select
          v-model="booleanValue"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option :value="true">true</option>
          <option :value="false">false</option>
        </select>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="onConfirm"
          :disabled="!isValid"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Insert
        </button>
      </div>
    </div>
  </div>
</template>
