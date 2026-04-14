<template>
    <aside class="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-full flex-shrink-0 z-20">
        <div class="p-6 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
            </div>
            <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">FinancePro</h2>
        </div>

        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <button @click="$emit('cambiar-tab', 'inicio')"
                :class="tab === 'inicio' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Dashboard</button>
            <button @click="$emit('cambiar-tab', 'asesor')"
                :class="tab === 'asesor' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Análisis
                de Liquidez</button>
            <button @click="$emit('cambiar-tab', 'cuentas')"
                :class="tab === 'cuentas' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Cuentas</button>
            <button @click="$emit('cambiar-tab', 'deudas')"
                :class="tab === 'deudas' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Deudas</button>
            <button @click="$emit('cambiar-tab', 'pagos')"
                :class="tab === 'pagos' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Pagos
                Fijos</button>
            <button @click="$emit('cambiar-tab', 'historial')"
                :class="tab === 'historial' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Historial</button>
            <button @click="$emit('cambiar-tab', 'contactos')"
                :class="tab === 'contactos' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Contactos</button>
            <button @click="$emit('cambiar-tab', 'ajustes')"
                :class="tab === 'ajustes' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
                class="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition flex items-center gap-3">Ajustes</button>
        </nav>

        <div class="p-4 border-t border-slate-100 flex flex-col gap-2">
            <button @click="$emit('cambiar-tab', 'perfil')"
                class="flex items-center gap-3 truncate px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition text-left cursor-pointer w-full">
                <img v-if="userAvatar" :src="userAvatar" referrerpolicy="no-referrer"
                    class="w-8 h-8 rounded-full border border-slate-200 flex-shrink-0" />
                <div v-else
                    class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {{ userName.charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-slate-900 truncate">{{ userName }}</p>
                    <p class="text-[9px] text-slate-500 font-medium">Mi Perfil</p>
                </div>
            </button>

            <button @click="$emit('cerrar-sesion')"
                class="w-full text-left px-4 py-3 text-sm text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition flex items-center justify-between">
                Cerrar Sesión
                <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
                </svg>
            </button>
        </div>
    </aside>
</template>

<script setup>
defineProps({
    tab: String,
    userName: String,
    userAvatar: String
})
defineEmits(['cambiar-tab', 'cerrar-sesion'])
</script>