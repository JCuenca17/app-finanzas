<template>
    <nav
        class="md:hidden fixed bottom-0 w-full glass border-t border-slate-200 flex justify-between items-center h-16 z-40 px-1 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex-nowrap overflow-visible">

        <button @click="$emit('cambiar-tab', 'inicio')" :class="tab === 'inicio' ? 'text-slate-900' : 'text-slate-400'"
            class="flex flex-col items-center justify-center w-full h-full px-0.5 min-w-0">
            <svg class="w-5 h-5 mb-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                </path>
            </svg>
            <span class="text-[8px] font-bold truncate w-full text-center">Inicio</span>
        </button>

        <button @click="$emit('cambiar-tab', 'cuentas')"
            :class="tab === 'cuentas' ? 'text-slate-900' : 'text-slate-400'"
            class="flex flex-col items-center justify-center w-full h-full px-0.5 min-w-0">
            <svg class="w-5 h-5 mb-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <span class="text-[8px] font-bold truncate w-full text-center">Cuentas</span>
        </button>

        <button @click="$emit('cambiar-tab', 'deudas')" :class="tab === 'deudas' ? 'text-slate-900' : 'text-slate-400'"
            class="flex flex-col items-center justify-center w-full h-full px-0.5 min-w-0">
            <svg class="w-5 h-5 mb-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                </path>
            </svg>
            <span class="text-[8px] font-bold truncate w-full text-center">Deudas</span>
        </button>

        <div class="relative -top-5 flex-shrink-0 px-1.5 z-50">
            <button @click="$emit('abrir-modal')"
                class="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/40 active:scale-90 transition-transform border-[3px] border-slate-50">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>
        </div>

        <button @click="$emit('cambiar-tab', 'pagos')" :class="tab === 'pagos' ? 'text-slate-900' : 'text-slate-400'"
            class="flex flex-col items-center justify-center w-full h-full px-0.5 min-w-0">
            <svg class="w-5 h-5 mb-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-[8px] font-bold truncate w-full text-center">Pagos</span>
        </button>

        <button @click="$emit('cambiar-tab', 'historial')"
            :class="tab === 'historial' ? 'text-slate-900' : 'text-slate-400'"
            class="flex flex-col items-center justify-center w-full h-full px-0.5 min-w-0">
            <svg class="w-5 h-5 mb-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
                </path>
            </svg>
            <span class="text-[8px] font-bold truncate w-full text-center">Historial</span>
        </button>

        <button @click="$emit('cambiar-tab', 'contactos')"
            :class="tab === 'contactos' ? 'text-slate-900' : 'text-slate-400'"
            class="flex flex-col items-center justify-center w-full h-full px-0.5 min-w-0">
            <svg class="w-5 h-5 mb-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                </path>
            </svg>
            <span class="text-[8px] font-bold truncate w-full text-center">Contactos</span>
        </button>
    </nav>
</template>

<script setup>
defineProps({ tab: String })
defineEmits(['cambiar-tab', 'abrir-modal'])
</script>