<template>
    <div class="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
        <div
            class="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-[400px] text-center">
            <div
                class="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-900/20">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
            </div>
            <h1 class="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">FinancePro</h1>
            <p class="text-sm text-slate-500 mb-8 font-medium">Control financiero personal y compartido.</p>
            <button @click="$emit('iniciar-sesion')"
                class="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:border-slate-300 transition active:scale-[0.98]">Ingresar
                con Google</button>
        </div>
    </div>
</template>

<script setup>
defineEmits(['iniciar-sesion'])
</script>