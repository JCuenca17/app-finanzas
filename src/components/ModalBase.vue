<template>
    <Teleport to="body">
        <transition name="modal">
            <div v-if="show"
                class="fixed inset-0 z-[100] flex items-end md:items-center justify-center glass p-0 md:p-4 transition-all">
                <div class="bg-white rounded-t-3xl md:rounded-3xl p-5 md:p-6 w-full shadow-2xl border border-slate-100 max-h-[85vh] md:max-h-[90vh] overflow-y-auto slide-up relative"
                    :class="maxWidth">

                    <div v-if="lineaMobile" class="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 md:hidden"></div>

                    <div class="flex justify-between items-center mb-5">
                        <h2 class="text-xl font-extrabold text-slate-900">{{ titulo }}</h2>
                        <button @click="$emit('cerrar')"
                            class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">&times;</button>
                    </div>

                    <slot></slot>

                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
defineProps({
    show: Boolean,
    titulo: String,
    maxWidth: { type: String, default: 'max-w-md' },
    lineaMobile: { type: Boolean, default: false }
})
defineEmits(['cerrar'])
</script>