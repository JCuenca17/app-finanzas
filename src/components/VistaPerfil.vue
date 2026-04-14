<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-6">
        <div class="max-w-xl mx-auto mt-6">
            <div
                class="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <div class="relative mb-5">
                    <img v-if="userAvatar" :src="userAvatar"
                        class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                    <div v-else
                        class="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-900 flex items-center justify-center text-white text-4xl font-extrabold border-4 border-white shadow-lg">
                        {{ userName.charAt(0).toUpperCase() }}</div>
                    <div class="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-md"
                        title="Cuenta activa"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7">
                            </path>
                        </svg></div>
                </div>
                <h3 class="font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight mb-1">{{ userName }}</h3>
                <p
                    class="text-sm text-slate-500 font-medium mb-8 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                    {{ userEmail }}</p>
                <div
                    class="w-full max-w-sm mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3 text-left">
                    <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-xs text-blue-800 leading-relaxed font-medium">Este espacio está preparado para añadir
                        tus metas de ahorro, presupuesto personalizado y configuraciones avanzadas de notificaciones en
                        el futuro.</p>
                </div>
                <button @click="$emit('cerrar-sesion')"
                    class="w-full max-w-sm bg-rose-50 text-rose-600 py-3.5 rounded-xl text-sm font-extrabold transition active:scale-95 hover:bg-rose-100 border border-rose-100 flex items-center justify-center gap-2"><svg
                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                        </path>
                    </svg> Cerrar Sesión Segura</button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    userName: String,
    userAvatar: String,
    userEmail: String
})
defineEmits(['cerrar-sesion'])
</script>