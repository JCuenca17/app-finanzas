<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-6">
        <div class="max-w-5xl mx-auto mt-2 mb-8 space-y-8">

            <div>
                <div class="flex justify-between items-end border-b border-slate-200 pb-2 mb-4 mt-2">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest pl-1">Mi Dinero Líquido y
                        Ahorros</h3>
                    <button @click="$emit('abrir-modal-nueva')"
                        class="text-blue-600 font-bold text-xs hover:text-blue-800 transition">+ Añadir Activo</button>
                </div>
                <div v-if="cuentasActivas.length === 0" class="col-span-full py-6 text-center text-slate-500 text-sm">No
                    tienes cuentas registradas.</div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    <div v-for="c in cuentasActivas" :key="c.id_cuenta"
                        class="card-premium h-48 md:h-52 p-5 rounded-3xl flex flex-col justify-between shadow-xl group"
                        :class="getClaseColorBanco(c.banco)" :data-banco="c.banco">
                        <div class="card-chip">
                            <div></div>
                        </div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <h4
                                    class="font-extrabold text-lg md:text-xl tracking-tight leading-tight truncate group-hover:text-amber-300 transition">
                                    {{ c.nombre }}</h4>
                                <p v-if="c.es_warda"
                                    class="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block mt-0.5 backdrop-blur-sm">
                                    Warda Ahorro</p>
                            </div><span
                                class="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-black/20 border border-white/10">{{
                                    c.tipo_cuenta }}</span>
                        </div>
                        <div class="mt-auto flex justify-between items-end relative z-10">
                            <p class="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">{{
                                formatoMoneda(c.saldo_actual, c.moneda) }}</p><button @click="$emit('abrir-modal', c)"
                                class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition text-white/70 hover:text-white"><svg
                                    class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                                    </path>
                                </svg></button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-end border-b border-slate-200 pb-2 mb-4 mt-6">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest pl-1">Cuentas Por Cobrar (Me
                        deben)</h3>
                    <button @click="$emit('abrir-modal-nueva')"
                        class="text-emerald-600 font-bold text-xs hover:text-emerald-800 transition">+ Añadir
                        Cuenta</button>
                </div>
                <div v-if="cuentasPorCobrar.length === 0" class="col-span-full py-6 text-center text-slate-500 text-sm">
                    Nadie te debe dinero actualmente.</div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    <div v-for="c in cuentasPorCobrar" :key="c.id_cuenta"
                        class="bg-card-receivable h-48 md:h-52 p-5 p-5 rounded-3xl flex flex-col justify-between shadow-xl group card-premium"
                        data-banco="Cobrar">
                        <div class="flex justify-between items-start relative z-10">
                            <h4
                                class="font-extrabold text-lg md:text-xl tracking-tight leading-tight truncate text-emerald-50">
                                {{ c.nombre }}</h4>
                            <div class="flex gap-1.5 items-center"><span
                                    class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span><span
                                    class="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/10 text-emerald-50">A
                                    mi favor</span></div>
                        </div>
                        <div class="mt-auto flex justify-between items-end relative z-10">
                            <div>
                                <p
                                    class="text-[10px] md:text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-0.5">
                                    Saldo Pendiente de Cobro</p>
                                <p class="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-100">{{
                                    formatoMoneda(c.saldo_actual, c.moneda) }}</p>
                            </div><button @click="$emit('abrir-modal', c)"
                                class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition text-emerald-100 hover:text-white"><svg
                                    class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
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
    cuentasActivas: Array,
    cuentasPorCobrar: Array,
    formatoMoneda: Function,
    getClaseColorBanco: Function
})
defineEmits(['abrir-modal-nueva', 'abrir-modal'])
</script>