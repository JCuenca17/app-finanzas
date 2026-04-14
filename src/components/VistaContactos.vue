<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-6">
        <div class="max-w-5xl mx-auto space-y-6 mt-2 mb-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base mb-1">Análisis por Contacto</h3>
                    <p class="text-xs text-slate-500 mb-6">Compara lo que gastas con una persona frente a tu total.</p>

                    <select :value="tagSearch" @change="$emit('update:tagSearch', $event.target.value)"
                        class="w-full mb-6 px-4 py-3 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-blue-50/50 font-bold text-blue-900 cursor-pointer">
                        <option value="">-- Elige un contacto para analizar --</option>
                        <option v-for="et in etiquetas" :key="et.id" :value="et.id">@{{ et.nombre }}</option>
                    </select>

                    <div class="flex-1 w-full min-h-[300px]" :ref="(el) => $emit('bind-ref', 'contacto', el)"></div>
                </div>

                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col max-h-[600px]">
                    <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                        <div>
                            <h3 class="font-bold text-slate-800 text-sm md:text-base">Directorio</h3>
                            <p class="text-[10px] text-slate-500 mt-0.5">Personas o proyectos</p>
                        </div>
                        <button @click="$emit('abrir-modal-nueva')"
                            class="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-md">+
                            Nuevo</button>
                    </div>
                    <div class="flex-1 overflow-y-auto pr-1 space-y-2">
                        <div v-if="etiquetas.length === 0" class="text-xs text-slate-500 py-6 text-center">No hay
                            contactos registrados.</div>
                        <div v-for="et in etiquetas" :key="et.id"
                            class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition group">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                    {{ et.nombre.charAt(0).toUpperCase() }}</div>
                                <span class="text-sm font-bold text-slate-700 truncate">@{{ et.nombre }}</span>
                            </div>
                            <div
                                class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                                <button @click="$emit('abrir-modal', et)"
                                    class="p-1.5 text-slate-400 hover:text-blue-500 rounded-md hover:bg-white transition shadow-sm bg-white"><svg
                                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                                        </path>
                                    </svg></button>
                                <button @click="$emit('eliminar-registro', 'etiqueta', et.id)"
                                    class="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-white transition shadow-sm bg-white"><svg
                                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                        </path>
                                    </svg></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    tagSearch: String,
    etiquetas: Array
})
defineEmits(['update:tagSearch', 'bind-ref', 'abrir-modal-nueva', 'abrir-modal', 'eliminar-registro'])
</script>