<template>
    <div class="flex flex-col z-30 flex-shrink-0">
        <header class="bg-white border-b border-slate-200 flex items-center justify-between p-3 md:p-4">

            <div class="flex flex-col overflow-hidden pr-2">
                <h1 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none truncate">{{
                    tituloCabecera }}</h1>
                <p class="text-[10px] md:text-xs font-semibold text-slate-500 mt-1">Control en tiempo real</p>
            </div>

            <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">

                <div
                    class="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 md:px-3 md:py-2 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden">
                    <svg class="w-4 h-4 text-slate-400 mr-1.5 md:mr-2" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                        </path>
                    </svg>

                    <span class="text-xs md:text-sm font-bold text-slate-700 select-none uppercase tracking-wide">
                        {{ obtenerMesFormateado(fechaGlobal) }}
                    </span>

                    <input type="month" :value="fechaGlobal" @change="$emit('update:fechaGlobal', $event.target.value)"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                <button @click="$emit('cambiar-tab', 'asesor')"
                    class="md:hidden p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                    title="Análisis de Liquidez">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                        </path>
                    </svg>
                </button>

                <button @click="$emit('cambiar-tab', 'ajustes')"
                    class="md:hidden p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                    title="Ajustes">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                        </path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </button>

                <button @click="$emit('abrir-modal-tx')"
                    class="hidden md:flex bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors active:scale-95 items-center gap-2">
                    <span>+ Registrar Operación</span>
                </button>

                <div @click="$emit('cambiar-tab', 'perfil')"
                    class="cursor-pointer w-9 h-9 md:w-10 md:h-10 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 relative bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                    <span>{{ userName.charAt(0).toUpperCase() }}</span>
                    <img v-if="userAvatar" :src="userAvatar" referrerpolicy="no-referrer"
                        @error="$event.target.style.display = 'none'"
                        class="absolute inset-0 w-full h-full object-cover" />
                </div>

            </div>
        </header>
    </div>
</template>

<script setup>
const props = defineProps({ tituloCabecera: String, fechaGlobal: String, formatoMes: Function, userAvatar: String, userName: String });
defineEmits(['update:fechaGlobal', 'abrir-modal-tx', 'cambiar-tab']);

const obtenerMesFormateado = (fechaString) => {
    if (!fechaString) return "--";
    try {
        const [year, month] = fechaString.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        const mesCorto = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
        return `${mesCorto} ${year}`;
    } catch (e) {
        return fechaString;
    }
};
</script>