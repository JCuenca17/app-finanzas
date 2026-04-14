<template>
    <div class="space-y-4">

        <div class="flex gap-3">
            <div class="relative w-16 h-[46px] flex-shrink-0">
                <input type="text" :value="nuevaCat.icono" @input="limitarEmoji($event)"
                    class="w-full h-full text-center text-2xl bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all cursor-pointer"
                    title="Abre el teclado de emojis" />
                <div v-if="!nuevaCat.icono"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-bold">
                    😀</div>
            </div>

            <input type="text" :value="nuevaCat.nombre" @input="$emit('update-cat', 'nombre', $event.target.value)"
                placeholder="Nombre (Ej: Alimentación)"
                class="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" />
        </div>

        <select :value="nuevaCat.tipo_flujo" @change="$emit('update-cat', 'tipo_flujo', $event.target.value)"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
            <option value="Egreso">Gasto (Egreso)</option>
            <option value="Ingreso">Ingreso</option>
        </select>

        <div v-if="nuevaCat.tipo_flujo === 'Egreso'" class="space-y-2 pt-2 border-t border-slate-200/60">
            <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">Clasificación de Ahorro</label>
            <div class="grid grid-cols-1 gap-2.5">
                <div @click="$emit('update-cat', 'nivel_necesidad', 'Obligatorio')"
                    class="cursor-pointer p-3 rounded-xl border flex gap-3 items-center transition-all select-none"
                    :class="nuevaCat.nivel_necesidad === 'Obligatorio' ? 'border-rose-400 bg-rose-50/50 shadow-sm ring-1 ring-rose-400' : 'border-slate-200 bg-white hover:border-slate-300'">
                    <div class="text-2xl bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">📅</div>
                    <div>
                        <p class="text-xs font-extrabold"
                            :class="nuevaCat.nivel_necesidad === 'Obligatorio' ? 'text-rose-700' : 'text-slate-700'">
                            Fijo Obligatorio</p>
                        <p class="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Prioritarios. Deben
                            abonarse primero (Ej: Alquiler, Deudas).</p>
                    </div>
                </div>
                <div @click="$emit('update-cat', 'nivel_necesidad', 'Necesario')"
                    class="cursor-pointer p-3 rounded-xl border flex gap-3 items-center transition-all select-none"
                    :class="nuevaCat.nivel_necesidad === 'Necesario' ? 'border-blue-400 bg-blue-50/50 shadow-sm ring-1 ring-blue-400' : 'border-slate-200 bg-white hover:border-slate-300'">
                    <div class="text-2xl bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">🍽️</div>
                    <div>
                        <p class="text-xs font-extrabold"
                            :class="nuevaCat.nivel_necesidad === 'Necesario' ? 'text-blue-700' : 'text-slate-700'">
                            Variable Necesario</p>
                        <p class="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Vida cotidiana. Pueden
                            reducirse un poco (Ej: Mercado).</p>
                    </div>
                </div>
                <div @click="$emit('update-cat', 'nivel_necesidad', 'Superfluo')"
                    class="cursor-pointer p-3 rounded-xl border flex gap-3 items-center transition-all select-none"
                    :class="nuevaCat.nivel_necesidad === 'Superfluo' ? 'border-emerald-400 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-400' : 'border-slate-200 bg-white hover:border-slate-300'">
                    <div class="text-2xl bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">☕</div>
                    <div>
                        <p class="text-xs font-extrabold"
                            :class="nuevaCat.nivel_necesidad === 'Superfluo' ? 'text-emerald-700' : 'text-slate-700'">
                            Superfluo / Discrecional</p>
                        <p class="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Deseos. Los primeros en
                            eliminarse para ahorrar (Ej: Salidas).</p>
                    </div>
                </div>
            </div>
        </div>

        <button @click="validarYGuardar"
            class="w-full mt-2 py-3.5 text-sm font-extrabold text-white rounded-xl transition shadow-md bg-slate-900 hover:bg-slate-800">
            Guardar Categoría
        </button>
    </div>
</template>

<script setup>
const props = defineProps({ nuevaCat: Object })
const emit = defineEmits(['update-cat', 'guardar'])

const limitarEmoji = (event) => {
    let val = event.target.value;
    if (val.length > 2) val = val.substring(val.length - 2);
    emit('update-cat', 'icono', val);
};

const validarYGuardar = () => {
    if (props.nuevaCat.tipo_flujo === 'Egreso' && !props.nuevaCat.nivel_necesidad) {
        alert("Por favor, selecciona un Nivel de Necesidad para este gasto.");
        return;
    }
    emit('guardar');
}
</script>