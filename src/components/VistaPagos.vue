<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-6">
        <div class="max-w-5xl mx-auto mt-2 mb-8">

            <div
                class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white mb-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Flujo Neto Mensual
                        Fijo (Soles)</p>
                    <h2 class="text-3xl md:text-4xl font-extrabold">S/ {{ (flujoNetoMensual).toFixed(2) }}</h2>
                    <p class="text-[10px] md:text-xs text-slate-300 mt-1">Dinero proyectado libre tras cubrir pagos
                        fijos.</p>
                </div>
                <button @click="$emit('abrir-modal-nuevo')"
                    class="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold transition border border-white/20 whitespace-nowrap">+
                    Añadir Proyección</button>
            </div>

            <div
                class="bg-blue-50 border border-blue-100 p-4 md:p-5 rounded-2xl mb-6 text-xs md:text-sm text-blue-800 shadow-sm flex items-start gap-3">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"></path>
                </svg>
                <div>
                    <p class="font-bold mb-1">Nota sobre Pagos Compartidos:</p>
                    <p>Si pagas algo en grupo (ej. Plan Spotify), registra aquí <b>solo tu parte del gasto</b>.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                <div class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                    <div class="flex justify-between items-end border-b border-slate-50 pb-3 mb-4">
                        <h3 class="font-bold text-slate-800 text-sm md:text-base">Ingresos Fijos</h3><span
                            class="text-emerald-600 font-extrabold text-lg">S/ {{ totalIngresosFijos.toFixed(2)
                            }}</span>
                    </div>
                    <div class="divide-y divide-slate-50">
                        <div v-if="pagosFijosIngresos.length === 0"
                            class="py-6 text-center text-slate-500 text-xs md:text-sm">No hay ingresos registrados.
                        </div>
                        <div v-for="pago in pagosFijosIngresos" :key="pago.id"
                            class="py-3 flex justify-between items-start px-1 group">
                            <div class="flex-1 min-w-0 pr-2">
                                <p class="font-bold text-slate-900 text-sm break-words">{{ pago.nombre }}</p>
                                <p class="text-[10px] font-medium text-slate-500 mt-0.5">Día tope estimado: {{
                                    pago.dia_cobro }}</p>
                            </div>
                            <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <div class="font-extrabold text-emerald-600 whitespace-nowrap">+ {{
                                    formatoMoneda(pago.monto, pago.moneda) }}</div>
                                <div
                                    class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                                    <button @click="$emit('abrir-modal', pago)"
                                        class="text-slate-300 hover:text-blue-500 transition"><svg class="w-4 h-4"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                                            </path>
                                        </svg></button>
                                    <button @click="$emit('eliminar-registro', 'proyeccion', pago.id)"
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

                <div class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                    <div class="flex justify-between items-end border-b border-slate-50 pb-3 mb-4">
                        <h3 class="font-bold text-slate-800 text-sm md:text-base">Gastos Fijos</h3><span
                            class="text-rose-600 font-extrabold text-lg">- S/ {{ totalGastosFijos.toFixed(2) }}</span>
                    </div>
                    <div class="divide-y divide-slate-50">
                        <div v-if="pagosFijosEgresos.length === 0"
                            class="py-6 text-center text-slate-500 text-xs md:text-sm">No hay gastos fijos registrados.
                        </div>
                        <div v-for="pago in pagosFijosEgresos" :key="pago.id"
                            class="py-3 flex justify-between items-start px-1 group">
                            <div class="flex-1 min-w-0 pr-2">
                                <p class="font-bold text-slate-900 text-sm break-words">{{ pago.nombre }}</p>
                                <p class="text-[10px] font-medium text-slate-500 mt-0.5">Día pago: {{ pago.dia_cobro }}
                                </p>
                            </div>
                            <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <div class="font-extrabold text-slate-900 whitespace-nowrap">- {{
                                    formatoMoneda(pago.monto, pago.moneda) }}</div>
                                <div
                                    class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                                    <button @click="$emit('abrir-modal', pago)"
                                        class="text-slate-300 hover:text-blue-500 transition"><svg class="w-4 h-4"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                                            </path>
                                        </svg></button>
                                    <button @click="$emit('eliminar-registro', 'proyeccion', pago.id)"
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
    </div>
</template>

<script setup>
defineProps({
    flujoNetoMensual: Number,
    totalIngresosFijos: Number,
    totalGastosFijos: Number,
    pagosFijosIngresos: Array,
    pagosFijosEgresos: Array,
    formatoMoneda: Function
})
defineEmits(['abrir-modal-nuevo', 'abrir-modal', 'eliminar-registro'])
</script>