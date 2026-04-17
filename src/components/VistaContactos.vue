<template>
    <div class="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-8 pb-40 md:pb-6">
        <div class="max-w-5xl mx-auto space-y-6 mt-2 mb-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base mb-1">Análisis por Contacto</h3>
                    <p class="text-xs text-slate-500 mb-6">Compara lo que gastas con una persona frente a tu total.</p>

                    <select :value="tagSearch" @change="$emit('update:tagSearch', $event.target.value)"
                        class="w-full mb-6 px-4 py-3 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-blue-50/50 font-bold text-blue-900 cursor-pointer">
                        <option value="">-- Elige un contacto para analizar --</option>
                        <option v-for="et in etiquetas" :key="et.id" :value="et.id">@{{ et.nombre }}</option>
                    </select>

                    <div class="flex-1 w-full min-h-[300px]" :ref="(el) => $emit('bind-ref', 'contacto', el)"></div>
                </div>

                <div
                    class="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col max-h-[700px]">
                    <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                        <div>
                            <h3 class="font-bold text-slate-800 text-sm md:text-base">Contactos y Deudas</h3>
                            <p class="text-[10px] text-slate-500 mt-0.5">Saldos de amigos y proyectos</p>
                        </div>
                        <button @click="$emit('abrir-modal-nueva')"
                            class="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-md active:scale-95">
                            + Nuevo Contacto
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                        <div v-if="contactosConSaldo.length === 0"
                            class="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl border border-slate-100">
                            No hay contactos registrados.
                        </div>

                        <div v-for="contacto in contactosConSaldo" :key="contacto.id"
                            class="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">

                            <div @click="toggleExpand(contacto.id)"
                                class="flex justify-between items-center p-3 md:p-4 hover:bg-slate-50 cursor-pointer transition">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition"
                                        :class="contacto.saldo > 0 ? 'bg-emerald-100 text-emerald-700' : (contacto.saldo < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600')">
                                        {{ contacto.nombre.charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-sm font-bold text-slate-700 truncate">@{{ contacto.nombre
                                    }}</span>
                                </div>
                                <div class="text-right">
                                    <div v-if="contacto.saldo > 0"
                                        class="text-sm md:text-base font-extrabold text-emerald-600">S/ {{
                                            contacto.saldo.toFixed(2) }}</div>
                                    <div v-else-if="contacto.saldo < 0"
                                        class="text-sm md:text-base font-extrabold text-rose-600">-S/ {{
                                            Math.abs(contacto.saldo).toFixed(2) }}</div>
                                    <div v-else class="text-sm md:text-base font-bold text-slate-400">S/ 0.00</div>
                                    <div class="text-[9px] font-bold uppercase text-slate-400 mt-0.5">
                                        {{ contacto.saldo > 0 ? 'A tu favor' : (contacto.saldo < 0 ? 'En contra'
                                            : 'Al día') }} </div>
                                    </div>
                                </div>

                                <div v-if="contactoExpandido === contacto.id"
                                    class="bg-slate-50 border-t border-slate-100 p-4 slide-down">
                                    <div class="flex justify-end gap-3 mb-4 pb-2 border-b border-slate-200/60">
                                        <button @click.stop="$emit('abrir-modal', contacto)"
                                            class="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">Editar
                                            Nombre</button>
                                        <button @click.stop="$emit('eliminar-registro', 'etiqueta', contacto.id)"
                                            class="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wide">Eliminar
                                            Contacto</button>
                                    </div>

                                    <div v-if="contacto.operaciones.length === 0"
                                        class="text-center text-[11px] text-slate-400 py-3 font-medium">
                                        Historial limpio. No hay movimientos.
                                    </div>
                                    <ul v-else class="space-y-3">
                                        <li v-for="op in contacto.operaciones" :key="op.id"
                                            class="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                                            <div>
                                                <p class="font-bold text-slate-700">{{ op.descripcion }}</p>
                                                <p class="text-[9px] text-slate-400 font-medium mt-0.5">{{
                                                    formatearFecha(op.fecha) }}</p>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-extrabold"
                                                    :class="op.tipo_operacion === 'me_deben' ? 'text-emerald-600' : 'text-slate-500'">
                                                    {{ op.tipo_operacion === 'me_deben' ? '+' : '-' }} S/ {{
                                                        parseFloat(op.monto).toFixed(2) }}
                                                </div>
                                                <div class="text-[8.5px] font-bold text-slate-400 uppercase mt-0.5">{{
                                                    op.tipo_operacion === 'me_deben' ? 'Préstamo' : 'Cobro' }}</div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    tagSearch: String,
    etiquetas: { type: Array, default: () => [] },
    operacionesTerceros: { type: Array, default: () => [] } // NUEVA PROP: Recibe el historial desde useFinanceData
})

defineEmits(['update:tagSearch', 'bind-ref', 'abrir-modal-nueva', 'abrir-modal', 'eliminar-registro'])

const contactoExpandido = ref(null)

const toggleExpand = (id) => {
    contactoExpandido.value = contactoExpandido.value === id ? null : id
}

// LÓGICA CORE: Calcula el saldo sumando "me_deben" y restando "me_pagan"
const contactosConSaldo = computed(() => {
    return props.etiquetas.map(et => {
        // Filtramos solo las operaciones de este contacto
        const ops = props.operacionesTerceros.filter(op => op.etiqueta_id === et.id);

        let saldo = 0;
        ops.forEach(op => {
            if (op.tipo_operacion === 'me_deben') saldo += parseFloat(op.monto);
            if (op.tipo_operacion === 'me_pagan') saldo -= parseFloat(op.monto);
        });

        return {
            ...et,
            saldo,
            // Ordenamos el historial del más reciente al más antiguo
            operaciones: ops.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        }
    });
})

const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    const fecha = new Date(fechaString + 'T12:00:00'); // Evita desfase horario
    return fecha.toLocaleDateString('es-ES', opciones).toUpperCase();
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.slide-down {
    animation: slideDown 0.2s ease-out forwards;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>