<template>
    <div class="h-full overflow-y-auto p-4 md:p-6 pb-24">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-xl md:text-2xl font-extrabold text-slate-800">Categorías</h2>
                <p class="text-xs text-slate-500 font-medium mt-1">Organiza tu mapa de gastos</p>
            </div>
            <button @click="$emit('abrir-modal-nueva')"
                class="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 shadow-md transition-all active:scale-95">
                + Nueva
            </button>
        </div>

        <div class="space-y-8">

            <div v-if="ingresos.length > 0">
                <h3
                    class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>📈</span> Mis Ingresos
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="c in ingresos" :key="c.id" @click="$emit('abrir-modal', c)"
                        class="cursor-pointer bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group active:scale-[0.98]">
                        <div class="flex items-center gap-3 flex-1 pl-1">
                            <div
                                class="text-xl bg-slate-50 p-2 rounded-xl border border-slate-100 group-hover:scale-110 transition-transform">
                                {{ c.icono || '🏷️' }}
                            </div>
                            <span class="text-sm font-bold text-slate-700">{{ c.nombre }}</span>
                        </div>
                        <button @click.stop="$emit('eliminar-registro', 'categoria', c.id)"
                            class="text-slate-300 hover:text-rose-500 p-2.5 transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="obligatorios.length > 0">
                <h3
                    class="text-[11px] font-extrabold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>📅</span> Fijos Obligatorios
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="c in obligatorios" :key="c.id" @click="$emit('abrir-modal', c)"
                        class="cursor-pointer bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group active:scale-[0.98]">
                        <div class="flex items-center gap-3 flex-1 pl-1">
                            <div
                                class="text-xl bg-rose-50 p-2 rounded-xl border border-rose-100 group-hover:scale-110 transition-transform">
                                {{ c.icono || '🏷️' }}
                            </div>
                            <span class="text-sm font-bold text-slate-700">{{ c.nombre }}</span>
                        </div>
                        <button @click.stop="$emit('eliminar-registro', 'categoria', c.id)"
                            class="text-slate-300 hover:text-rose-500 p-2.5 transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="necesarios.length > 0">
                <h3
                    class="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>🍽️</span> Variables Necesarios
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="c in necesarios" :key="c.id" @click="$emit('abrir-modal', c)"
                        class="cursor-pointer bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group active:scale-[0.98]">
                        <div class="flex items-center gap-3 flex-1 pl-1">
                            <div
                                class="text-xl bg-blue-50 p-2 rounded-xl border border-blue-100 group-hover:scale-110 transition-transform">
                                {{ c.icono || '🏷️' }}
                            </div>
                            <span class="text-sm font-bold text-slate-700">{{ c.nombre }}</span>
                        </div>
                        <button @click.stop="$emit('eliminar-registro', 'categoria', c.id)"
                            class="text-slate-300 hover:text-rose-500 p-2.5 transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="superfluos.length > 0">
                <h3
                    class="text-[11px] font-extrabold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>☕</span> Discrecionales / Superfluos
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="c in superfluos" :key="c.id" @click="$emit('abrir-modal', c)"
                        class="cursor-pointer bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group active:scale-[0.98]">
                        <div class="flex items-center gap-3 flex-1 pl-1">
                            <div
                                class="text-xl bg-emerald-50 p-2 rounded-xl border border-emerald-100 group-hover:scale-110 transition-transform">
                                {{ c.icono || '🏷️' }}
                            </div>
                            <span class="text-sm font-bold text-slate-700">{{ c.nombre }}</span>
                        </div>
                        <button @click.stop="$emit('eliminar-registro', 'categoria', c.id)"
                            class="text-slate-300 hover:text-rose-500 p-2.5 transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="otrosGastos.length > 0">
                <h3
                    class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>❓</span> Otros Gastos
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="c in otrosGastos" :key="c.id" @click="$emit('abrir-modal', c)"
                        class="cursor-pointer bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group active:scale-[0.98]">
                        <div class="flex items-center gap-3 flex-1 pl-1">
                            <div
                                class="text-xl bg-slate-50 p-2 rounded-xl border border-slate-100 group-hover:scale-110 transition-transform">
                                {{ c.icono || '🏷️' }}
                            </div>
                            <span class="text-sm font-bold text-slate-700">{{ c.nombre }}</span>
                        </div>
                        <button @click.stop="$emit('eliminar-registro', 'categoria', c.id)"
                            class="text-slate-300 hover:text-rose-500 p-2.5 transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ categorias: Array });
defineEmits(['abrir-modal-nueva', 'abrir-modal', 'eliminar-registro']);

const ingresos = computed(() => props.categorias.filter(c => c.tipo_flujo === 'Ingreso'));
const obligatorios = computed(() => props.categorias.filter(c => c.tipo_flujo === 'Egreso' && c.nivel_necesidad === 'Obligatorio'));
const necesarios = computed(() => props.categorias.filter(c => c.tipo_flujo === 'Egreso' && c.nivel_necesidad === 'Necesario'));
const superfluos = computed(() => props.categorias.filter(c => c.tipo_flujo === 'Egreso' && c.nivel_necesidad === 'Superfluo'));
const otrosGastos = computed(() => props.categorias.filter(c => c.tipo_flujo === 'Egreso' && !c.nivel_necesidad));
</script>