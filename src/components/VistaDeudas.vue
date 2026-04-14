<template>
    <div class="h-full overflow-y-auto p-4 md:p-6 pb-24">

        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-xl md:text-2xl font-extrabold text-slate-800">Deudas</h2>
                <p class="text-xs text-slate-500 font-medium mt-1">Control de tus cuotas mensuales</p>
            </div>
            <button @click="$emit('abrir-modal-nueva')"
                class="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95">
                + Añadir Deuda
            </button>
        </div>

        <div v-if="deudasActivas.length === 0"
            class="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <span class="text-5xl mb-4 block">💳</span>
            <p class="text-sm font-bold text-slate-600">No tienes deudas registradas.</p>
            <p class="text-xs text-slate-400 mt-1">Tu salud financiera está impecable.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="d in deudasActivas" :key="d.id_cuenta" @click="$emit('abrir-modal', d)"
                class="p-5 rounded-3xl cursor-pointer text-white shadow-lg transition-transform hover:scale-[1.02] relative overflow-hidden"
                :class="getClaseColorPasivo(d)">

                <div class="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-bl-full pointer-events-none">
                </div>

                <div class="flex justify-between items-center mb-4 relative z-10">
                    <span class="font-black text-lg tracking-tight">{{ d.nombre }}</span>
                    <span class="text-[10px] font-bold px-2 py-1 bg-black/20 rounded-md uppercase tracking-wider">{{
                        d.tipo_cuenta }}</span>
                </div>

                <div class="mb-4 relative z-10">
                    <p class="text-xs font-semibold opacity-80 mb-1">CUOTA DEL MES</p>
                    <p class="text-3xl font-black">{{ formatoMoneda(d.pago_del_mes, d.moneda) }}</p>
                </div>

                <div class="flex justify-between items-end border-t border-white/20 pt-3 mt-2 relative z-10">
                    <div>
                        <p class="text-[10px] font-semibold opacity-80 uppercase tracking-wide">Deuda Total</p>
                        <p class="text-sm font-bold">{{ formatoMoneda(d.saldo_actual, d.moneda) }}</p>
                    </div>

                    <div v-if="d.tipo_cuenta === 'Credito'" class="text-right">
                        <p class="text-[9px] font-semibold opacity-80 uppercase">Disp: {{ formatoMoneda((d.limite || 0)
                            - Math.abs(d.saldo_actual), d.moneda) }}</p>
                        <p class="text-[9px] font-medium opacity-70 mt-0.5">Corte: {{ d.dia_corte || '--' }} | Pago: {{
                            d.dia_pago || '--' }}</p>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>

<script setup>
defineProps({
    diagnosticoDeuda: Object,
    deudasActivas: Array,
    getClaseColorPasivo: Function,
    formatoMoneda: Function
})
defineEmits(['abrir-modal-nueva', 'abrir-modal', 'bind-ref'])
</script>