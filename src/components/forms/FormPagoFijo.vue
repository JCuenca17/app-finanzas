<template>
    <div class="space-y-4">
        <input type="text" :value="nuevoPagoFijo.nombre" @input="$emit('update-pago', 'nombre', $event.target.value)"
            placeholder="Nombre (Ej: Netflix, Sueldo)"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" />
        <div class="grid grid-cols-2 gap-3">
            <select :value="nuevoPagoFijo.tipo_flujo" @change="$emit('update-pago', 'tipo_flujo', $event.target.value)"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
                <option value="Ingreso">Ingreso Seguro</option>
                <option value="Egreso">Gasto Fijo</option>
            </select>
            <select :value="nuevoPagoFijo.moneda" @change="$emit('update-pago', 'moneda', $event.target.value)"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares ($)</option>
            </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <input type="number" :value="nuevoPagoFijo.monto"
                @input="$emit('update-pago', 'monto', $event.target.value)" placeholder="Monto"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-extrabold focus:outline-none" />
            <input type="number" :value="nuevoPagoFijo.dia_cobro"
                @input="$emit('update-pago', 'dia_cobro', $event.target.value)" placeholder="Día del mes (1-31)"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" />
        </div>
        <button @click="$emit('guardar')"
            class="w-full py-3.5 text-sm font-extrabold text-white rounded-xl transition shadow-md bg-slate-900 hover:bg-slate-800">Guardar
            Proyección</button>
    </div>
</template>

<script setup>
defineProps({ nuevoPagoFijo: Object })
defineEmits(['update-pago', 'guardar'])
</script>