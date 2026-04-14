<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mt-2">
            <div
                class="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
                <p
                    class="text-[10px] md:text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1 relative z-10">
                    Liquidez Acumulada</p>
                <div class="relative z-10">
                    <h2 class="text-xl md:text-3xl font-extrabold tracking-tight truncate">S/ {{
                        saldosLiquidos.PEN.toFixed(2) }}</h2>
                    <div class="mt-1 flex items-center justify-between">
                        <p class="text-[10px] md:text-xs text-slate-400">USD</p>
                        <p class="text-sm md:text-base font-bold text-slate-300 truncate">$ {{
                            saldosLiquidos.USD.toFixed(2) }}</p>
                    </div>
                </div>
            </div>
            <div
                class="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
                <p
                    class="text-[10px] md:text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1 relative z-10">
                    Ahorros</p>
                <div class="relative z-10">
                    <h2 class="text-xl md:text-3xl font-extrabold tracking-tight truncate">S/ {{
                        saldosAhorro.PEN.toFixed(2) }}</h2>
                    <div class="mt-1 flex items-center justify-between">
                        <p class="text-[10px] md:text-xs text-blue-300">USD</p>
                        <p class="text-sm md:text-base font-bold text-blue-200 truncate">$ {{
                            saldosAhorro.USD.toFixed(2) }}</p>
                    </div>
                </div>
            </div>
            <div
                class="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white shadow-lg relative overflow-hidden group">
                <div class="flex justify-between items-start mb-1 relative z-10">
                    <p class="text-[10px] md:text-xs font-semibold text-fuchsia-200 uppercase tracking-widest">Cashback
                    </p><button @click="$emit('editar-cashback')"
                        class="text-fuchsia-200 hover:text-white transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Editar Histórico"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                            </path>
                        </svg></button>
                </div>
                <div class="relative z-10">
                    <h2 class="text-xl md:text-3xl font-extrabold tracking-tight truncate">S/ {{
                        bolsaCashback.disponible.toFixed(2) }}</h2>
                    <div class="mt-1 flex items-center justify-between">
                        <p class="text-[10px] md:text-xs text-fuchsia-300">Histórico: S/ {{
                            bolsaCashback.saldo_inicial.toFixed(2) }}</p><button @click="$emit('preparar-rescate')"
                            class="text-[10px] md:text-xs font-bold text-fuchsia-800 bg-white px-2 py-0.5 rounded-full hover:bg-fuchsia-50 transition active:scale-95 shadow-sm">Usar</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mt-3 md:mt-2">
            <div
                class="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden flex items-center justify-between">
                <div>
                    <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Crédito
                        Disponible (PEN)</p>
                    <h2 class="text-xl md:text-2xl font-extrabold text-emerald-600 truncate">S/ {{
                        creditoDisponible.PEN.toFixed(2) }}</h2>
                </div>
                <div
                    class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z">
                        </path>
                    </svg>
                </div>
            </div>
            <div class="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-900 text-white shadow-lg relative overflow-hidden flex items-center justify-between"
                :class="proyeccionProximoMes < 0 ? 'bg-rose-600' : ''">
                <div>
                    <p class="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1"
                        :class="proyeccionProximoMes < 0 ? 'text-rose-200' : 'text-slate-400'">Proyección (Flujo + Saldo
                        Actual)</p>
                    <h2 class="text-xl md:text-2xl font-extrabold truncate text-white">S/ {{
                        proyeccionProximoMes.toFixed(2) }}</h2>
                </div>
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    :class="proyeccionProximoMes < 0 ? 'bg-black/20' : 'bg-white/10'"><svg
                        v-if="proyeccionProximoMes >= 0" class="w-5 h-5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg><svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path>
                    </svg></div>
            </div>
        </div>

        <div class="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm mt-3 md:mt-5 mb-8">
            <div class="px-4 md:px-6 py-3 border-b border-slate-50 flex justify-between items-center">
                <h3 class="font-bold text-slate-800 text-sm md:text-base">Movimientos del Mes</h3>
            </div>
            <div class="divide-y divide-slate-100">
                <div v-if="historialFiltrado.length === 0" class="p-6 text-center text-slate-500 text-xs md:text-sm">No
                    hay operaciones registradas en este mes.</div>
                <div v-for="item in historialFiltrado.slice(0, 10)" :key="item.id"
                    class="px-4 md:px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition group">
                    <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-2">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0"
                            :class="item.tipo_flujo === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'">
                            {{ item.tipo_flujo === 'Ingreso' ? '+' : '-' }}</div>
                        <div class="min-w-0 flex-1">
                            <p class="font-bold text-slate-900 text-xs md:text-sm truncate">{{ item.descripcion }}</p>
                            <p class="text-[10px] md:text-xs font-medium mt-0.5 truncate"
                                :class="item.categoria_nombre && String(item.categoria_nombre).includes('Transferencia') ? 'text-blue-500' : 'text-slate-500'">
                                {{ item.fecha }} • {{ item.cuenta }} <span v-if="item.etiqueta_nombre"
                                    class="font-bold text-slate-600 bg-slate-100 px-1 rounded">@{{ item.etiqueta_nombre
                                    }}</span></p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
                        <div :class="item.tipo_flujo === 'Ingreso' ? 'text-emerald-600' : 'text-slate-900'"
                            class="font-extrabold text-sm md:text-base whitespace-nowrap text-right">{{ item.tipo_flujo
                                === 'Ingreso' ? '+' : '-' }} {{ formatoMoneda(item.monto, item.moneda) }}</div>
                        <div
                            class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition pl-1 md:pl-2">
                            <button @click="$emit('abrir-modal-tx', item)"
                                class="text-slate-300 hover:text-blue-500 transition"><svg class="w-4 h-4 md:w-5 md:h-5"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                                    </path>
                                </svg></button>
                            <button @click="$emit('eliminar-registro', 'transaccion', item.id)"
                                class="text-slate-300 hover:text-rose-500 transition"><svg class="w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
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
</template>

<script setup>
defineProps({
    saldosLiquidos: Object,
    saldosAhorro: Object,
    bolsaCashback: Object,
    creditoDisponible: Object,
    proyeccionProximoMes: Number,
    historialFiltrado: Array,
    formatoMoneda: Function
})

defineEmits([
    'editar-cashback',
    'preparar-rescate',
    'abrir-modal-tx',
    'eliminar-registro'
])
</script>