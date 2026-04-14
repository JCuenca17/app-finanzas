<template>
    <div class="h-full overflow-y-auto p-4 md:p-6 pb-24">
        <div class="max-w-4xl mx-auto space-y-6">

            <div>
                <h2 class="text-xl md:text-2xl font-extrabold text-slate-800">Análisis de Liquidez</h2>
                <p class="text-xs text-slate-500 font-medium mt-1">Evaluación del flujo de caja y obligaciones vigentes
                </p>
            </div>

            <div class="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">

                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-inner"
                        :class="diagnosticoDeuda.iconBg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                            </path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-extrabold text-slate-800 text-sm md:text-base">Estado de Cobertura Mensual</h3>
                        <p class="text-[10px] font-bold uppercase tracking-wider" :class="diagnosticoDeuda.textColor">{{
                            diagnosticoDeuda.estado }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="text-[10px] text-slate-500 font-extrabold uppercase mb-1 tracking-wider">Liquidez
                            Operativa</p>
                        <p class="text-xl font-black text-slate-800">S/ {{ (diagnosticoDeuda.poderAdquisitivoLibre ||
                            0).toFixed(2) }}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="text-[10px] text-slate-500 font-extrabold uppercase mb-1 tracking-wider">Obligaciones
                            (Cuotas)</p>
                        <p class="text-xl font-black text-rose-600">- S/ {{ (diagnosticoDeuda.obligacionesNetasMes ||
                            0).toFixed(2) }}</p>
                        <p v-if="diagnosticoDeuda.cashbackAplicado > 0"
                            class="text-[9px] text-emerald-600 font-bold mt-1">DEDUCCIÓN S/ {{
                                diagnosticoDeuda.cashbackAplicado.toFixed(2) }} (CASHBACK)</p>
                    </div>
                </div>

                <div class="mb-6 pt-2">
                    <div class="flex justify-between items-end mb-2">
                        <p class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Índice de Estrés
                            Financiero</p>
                        <p class="text-xs font-black" :class="diagnosticoDeuda.textColor">{{
                            porcentajeConsumo.toFixed(1) }}% Consumido</p>
                    </div>

                    <div class="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div class="h-full bg-emerald-500" style="width: 50%;"></div>
                        <div class="h-full bg-amber-400" style="width: 35%;"></div>
                        <div class="h-full bg-rose-500" style="width: 15%;"></div>
                    </div>

                    <div class="relative w-full h-4 mt-1">
                        <div class="absolute top-0 -ml-1.5 transition-all duration-700 ease-out flex flex-col items-center"
                            :style="{ left: Math.min(porcentajeConsumo, 100) + '%' }">
                            <svg class="w-3 h-3 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 22h20L12 2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 border-t border-slate-100 pt-5">
                    <div class="flex items-start gap-2 opacity-80">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-700">Zona Óptima (0% - 50%)</p>
                            <p class="text-[9px] text-slate-500 leading-tight mt-0.5">Liquidez suficiente. Capacidad de
                                ahorro e inversión intacta.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2 opacity-80">
                        <div class="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0"></div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-700">Precaución (51% - 85%)</p>
                            <p class="text-[9px] text-slate-500 leading-tight mt-0.5">Margen estrecho. Vulnerabilidad
                                ante gastos imprevistos.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2 opacity-80">
                        <div class="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0"></div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-700">Peligro Crítico (> 85%)</p>
                            <p class="text-[9px] text-slate-500 leading-tight mt-0.5">Insolvencia inminente. Requiere
                                liquidación de activos o reestructuración.</p>
                        </div>
                    </div>
                </div>

                <div class="p-3 md:p-4 rounded-xl border flex items-start gap-3 bg-slate-50 border-slate-200">
                    <div class="mt-0.5 text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-wider mb-1 opacity-60 text-slate-800">
                            Dictamen del Sistema</p>
                        <p class="text-xs font-medium leading-relaxed text-slate-700">{{ diagnosticoDeuda.mensaje }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-slate-900 text-white p-5 md:p-6 rounded-3xl shadow-lg relative overflow-hidden">
                <div class="mb-4 relative z-10">
                    <h3 class="font-extrabold text-base md:text-lg">Proyección de Flujo de Caja</h3>
                    <p class="text-[11px] md:text-xs text-slate-400 font-medium mt-1">Módulo reservado para futuros
                        análisis y proyecciones de capital.</p>
                </div>

                <div
                    class="h-24 flex items-center justify-center border border-slate-700 border-dashed rounded-xl bg-slate-800/50">
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">Módulo en construcción</p>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    diagnosticoDeuda: Object,
    saldosLiquidos: Object,
    saldosAhorro: Object
});

const porcentajeConsumo = computed(() => {
    const liquidez = props.diagnosticoDeuda.poderAdquisitivoLibre || 0;
    const deudas = props.diagnosticoDeuda.obligacionesNetasMes || 0;
    if (liquidez <= 0) return deudas > 0 ? 100 : 0;
    return (deudas / liquidez) * 100;
});
</script>