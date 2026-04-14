<template>
  <div class="space-y-4">
    <input type="text" :value="nuevaEtiq.nombre" @input="$emit('update-etiq', 'nombre', $event.target.value)"
      placeholder="Nombre (Ej: María)"
      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" />
    <button @click="$emit('guardar')"
      class="w-full py-3.5 text-sm font-extrabold text-white rounded-xl transition shadow-md bg-slate-900 hover:bg-slate-800">
      Guardar Contacto
    </button>
  </div>
</template>

<script setup>
defineProps({ nuevaEtiq: Object });
defineEmits(["update-etiq", "guardar"]);
</script>
