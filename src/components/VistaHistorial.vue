<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-6">
        <div class="max-w-5xl mx-auto space-y-6 mt-2 mb-8">

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 class="font-extrabold text-lg md:text-xl text-slate-800 mb-1">Distribución de Gastos</h3>
                    <p class="text-xs text-slate-500 mb-4">¿En qué se fue el dinero este mes?</p>
                    <div class="w-full flex-1 min-h-[300px]" :ref="(el) => $emit('bind-ref', 'cat', el)"></div>
                </div>
                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 class="font-extrabold text-lg md:text-xl text-slate-800 mb-1">Ingresos vs Egresos</h3>
                    <p class="text-xs text-slate-500 mb-4">Balance general del mes seleccionado.</p>
                    <div class="w-full flex-1 min-h-[300px]" :ref="(el) => $emit('bind-ref', 'flujo', el)"></div>
                </div>
            </div>

            <div class="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col w-full">
                <div class="divide-y divide-slate-100">
                    <div v-if="historialFiltrado.length === 0" class="p-10 text-center text-slate-500 text-sm">No hay
                        operaciones en este mes.</div>
                    <div v-for="item in historialFiltrado" :key="item.id"
                        class="p-4 flex items-center justify-between hover:bg-slate-50 transition group">
                        <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-2">
                            <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-base md:text-xl flex-shrink-0"
                                :class="item.tipo_flujo === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'">
                                {{ item.tipo_flujo === 'Ingreso' ? '+' : '-' }}</div>
                            <div class="min-w-0 flex-1">
                                <p class="font-bold text-slate-900 text-sm md:text-base truncate">{{ item.descripcion }}
                                </p>
                                <p class="text-[10px] md:text-xs font-medium mt-0.5 truncate"
                                    :class="item.categoria_nombre && String(item.categoria_nombre).includes('Transferencia') ? 'text-blue-500' : 'text-slate-500'">
                                    {{ item.fecha }} • {{ item.cuenta }} <span v-if="item.etiqueta_nombre"
                                        class="font-bold text-slate-600 bg-slate-100 px-1 rounded">@{{
                                            item.etiqueta_nombre }}</span></p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
                            <div :class="item.tipo_flujo === 'Ingreso' ? 'text-emerald-600' : 'text-slate-900'"
                                class="font-extrabold text-base md:text-lg whitespace-nowrap text-right">
                                {{ item.tipo_flujo === 'Ingreso' ? '+' : '-' }} {{ formatoMoneda(item.monto,
                                    item.moneda) }}
                                <div v-if="item.cashback && item.cashback > 0"
                                    class="text-[10px] text-emerald-500 mt-1 block">+ {{ formatoMoneda(item.cashback,
                                        item.moneda) }} CB</div>
                            </div>
                            <div
                                class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition pl-1 md:pl-2">
                                <button @click="$emit('abrir-modal-tx', item)"
                                    class="text-slate-300 hover:text-blue-500 transition"><svg class="w-5 h-5"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                                        </path>
                                    </svg></button>
                                <button @click="$emit('eliminar-registro', 'transaccion', item.id)"
                                    class="text-slate-300 hover:text-rose-500 transition"><svg class="w-4 h-4"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    historialFiltrado: Array,
    formatoMoneda: Function
})
defineEmits(['bind-ref', 'abrir-modal-tx', 'eliminar-registro'])
</script>