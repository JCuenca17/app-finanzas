<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-6 custom-scrollbar">
        <div class="max-w-5xl mx-auto space-y-6 mt-2 mb-8">

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base mb-1">Gastos por Categoría</h3>
                    <p class="text-xs text-slate-500 mb-4">Distribución de egresos del mes</p>
                    <div class="flex-1 w-full min-h-[300px] flex items-center justify-center"
                        :ref="(el) => $emit('bind-ref', 'cat', el)"></div>
                </div>

                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base mb-1">Ingresos vs Gastos</h3>
                    <p class="text-xs text-slate-500 mb-4">Balance general del mes</p>
                    <div class="flex-1 w-full min-h-[300px] flex items-center justify-center"
                        :ref="(el) => $emit('bind-ref', 'flujo', el)"></div>
                </div>
            </div>

            <div
                class="bg-white p-5 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                <div class="flex justify-between items-center mb-1">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z">
                            </path>
                        </svg>
                        Filtros de Búsqueda
                    </h3>
                    <button v-if="hayFiltrosActivos" @click="limpiarFiltros"
                        class="text-[11px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition">
                        Limpiar Filtros
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div class="md:col-span-2">
                        <input type="text" v-model="filtros.texto" placeholder="Buscar por concepto..."
                            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition">
                    </div>
                    <div>
                        <select v-model="filtros.tipo"
                            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-300 font-medium text-slate-600 cursor-pointer">
                            <option value="">Todos los flujos</option>
                            <option value="Ingreso">Solo Ingresos</option>
                            <option value="Egreso">Solo Gastos</option>
                            <option value="Transferencia">Transferencias</option>
                        </select>
                    </div>
                    <div>
                        <select v-model="filtros.cuenta"
                            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-300 font-medium text-slate-600 cursor-pointer">
                            <option value="">Todas las cuentas</option>
                            <option v-for="c in cuentasDisponibles" :key="c.id_cuenta" :value="c.id_cuenta">
                                {{ c.nombre }} {{ c.tipo_cuenta === 'Credito' ? '(TC)' : '' }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <select v-model="filtros.etiqueta"
                            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-300 font-medium text-slate-600 cursor-pointer">
                            <option value="">Todos los contactos</option>
                            <option v-for="e in etiquetas" :key="e.id" :value="e.id">@{{ e.nombre }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div
                class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
                <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base">Movimientos Registrados</h3>
                    <span class="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{{
                        transaccionesFiltradas.length }} resultados</span>
                </div>

                <div v-if="transaccionesFiltradas.length === 0"
                    class="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                    <svg class="w-12 h-12 mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                        </path>
                    </svg>
                    <p class="text-sm font-medium">No se encontraron operaciones con estos filtros.</p>
                </div>

                <ul v-else class="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <li v-for="tx in transaccionesFiltradas" :key="tx.id"
                        class="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition group">

                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm"
                                :class="tx.tipo_flujo === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : (tx.tipo_flujo === 'Egreso' ? 'bg-white text-slate-600' : 'bg-blue-100 text-blue-600')">
                                {{ getIconoCategoria(tx.categoria) }}
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <p class="font-bold text-slate-700 text-sm leading-tight">{{ tx.descripcion }}</p>
                                    <span v-if="tx.etiqueta_nombre"
                                        class="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
                                        @{{ tx.etiqueta_nombre }}
                                    </span>
                                </div>
                                <div
                                    class="text-[10px] text-slate-400 font-medium flex items-center flex-wrap gap-1.5 mt-1">
                                    <span class="bg-white px-1.5 py-0.5 rounded border border-slate-200">{{ tx.cuenta
                                    }}</span>
                                    <span>•</span>
                                    <span>{{ formatearFechaLocal(tx.fecha) }}</span>

                                    <span v-if="tx.cashback && parseFloat(tx.cashback) > 0"
                                        class="flex items-center px-1.5 py-0.5 rounded-md border border-emerald-100/60 bg-emerald-50 text-[9px] font-bold text-emerald-600 uppercase tracking-wide ml-1">
                                        + {{ formatoMoneda(tx.cashback, tx.moneda) }} Cashback
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-4">
                            <div class="text-right">
                                <p class="font-extrabold text-sm"
                                    :class="tx.tipo_flujo === 'Ingreso' ? 'text-emerald-600' : (tx.tipo_flujo === 'Egreso' ? 'text-slate-700' : 'text-blue-600')">
                                    {{ tx.tipo_flujo === 'Egreso' ? '-' : (tx.tipo_flujo === 'Ingreso' ? '+' : '') }}
                                    {{ formatoMoneda(tx.monto, tx.moneda) }}
                                </p>
                                <p class="text-[10px] text-slate-400 font-medium mt-0.5">{{ tx.categoria_nombre }}</p>
                            </div>

                            <div
                                class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button @click="$emit('abrir-modal-tx', tx)"
                                    class="p-1.5 text-slate-400 hover:text-blue-500 bg-white rounded-md border border-slate-200 shadow-sm transition">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                                        </path>
                                    </svg>
                                </button>
                                <button @click="$emit('eliminar-registro', 'transaccion', tx.id)"
                                    class="p-1.5 text-slate-400 hover:text-rose-500 bg-white rounded-md border border-slate-200 shadow-sm transition">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    historialFiltrado: { type: Array, default: () => [] },
    formatoMoneda: Function,
    cuentas: { type: Array, default: () => [] },
    categorias: { type: Array, default: () => [] },
    etiquetas: { type: Array, default: () => [] }
})

defineEmits(['bind-ref', 'abrir-modal-tx', 'eliminar-registro'])

const filtros = ref({
    texto: '',
    tipo: '',
    cuenta: '',
    etiqueta: ''
})

const cuentasDisponibles = computed(() => {
    return props.cuentas.filter(c => c.tipo_cuenta !== 'Cobrar');
})

const transaccionesFiltradas = computed(() => {
    return props.historialFiltrado.filter(tx => {
        let pasaFiltro = true;

        if (filtros.value.texto) {
            const busqueda = filtros.value.texto.toLowerCase();
            const descripcion = (tx.descripcion || '').toLowerCase();
            if (!descripcion.includes(busqueda)) pasaFiltro = false;
        }

        if (filtros.value.tipo && tx.tipo_flujo !== filtros.value.tipo) pasaFiltro = false;
        if (filtros.value.cuenta && tx.cuenta_id !== filtros.value.cuenta) pasaFiltro = false;
        if (filtros.value.etiqueta && tx.etiqueta_id !== filtros.value.etiqueta) pasaFiltro = false;

        return pasaFiltro;
    });
})

const hayFiltrosActivos = computed(() => {
    return filtros.value.texto !== '' ||
        filtros.value.tipo !== '' ||
        filtros.value.cuenta !== '' ||
        filtros.value.etiqueta !== '';
})

const limpiarFiltros = () => {
    filtros.value = { texto: '', tipo: '', cuenta: '', etiqueta: '' };
}

const getIconoCategoria = (catId) => {
    const cat = props.categorias.find(c => c.id === catId);
    return cat && cat.icono ? cat.icono : '📄';
}

const formatearFechaLocal = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr + 'T12:00:00');
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>