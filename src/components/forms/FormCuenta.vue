<template>
    <div class="space-y-4">
        <input type="text" :value="nuevaCuenta.nombre" @input="$emit('update-cuenta', 'nombre', $event.target.value)"
            placeholder="Nombre (Ej: Visa BCP)"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" />

        <div class="grid grid-cols-2 gap-3">
            <select :value="nuevaCuenta.tipo_cuenta"
                @change="$emit('update-cuenta', 'tipo_cuenta', $event.target.value)"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
                <optgroup label="Mis Activos">
                    <option value="Debito">Débito</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Ahorro">Ahorro</option>
                    <option value="Cobrar">Por Cobrar</option>
                </optgroup>
                <optgroup label="Mis Pasivos">
                    <option value="Credito">Tarjeta Crédito</option>
                    <option value="Prestamo">Préstamo Bancario</option>
                    <option value="Pagar">Por Pagar a Terceros</option>
                </optgroup>
            </select>
            <select :value="nuevaCuenta.moneda" @change="$emit('update-cuenta', 'moneda', $event.target.value)"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares ($)</option>
            </select>
        </div>

        <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Entidad Financiera (Color de
                Tarjeta)</label>
            <select :value="nuevaCuenta.banco" @change="$emit('update-cuenta', 'banco', $event.target.value)"
                class="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
                <option value="Otro">Ninguno / Otro</option>
                <option value="BCP">BCP</option>
                <option value="BBVA">BBVA</option>
                <option value="Interbank">Interbank</option>
                <option value="Scotiabank">Scotiabank</option>
            </select>
        </div>

        <template v-if="['Debito', 'Efectivo', 'Ahorro', 'Cobrar'].includes(nuevaCuenta.tipo_cuenta)">
            <div><label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Saldo a favor / Por
                    cobrar</label><input type="number" :value="nuevaCuenta.saldo_inicial"
                    @input="$emit('update-cuenta', 'saldo_inicial', $event.target.value)" placeholder="0.00"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-extrabold focus:outline-none" />
            </div>
            <div v-if="nuevaCuenta.tipo_cuenta === 'Ahorro'"
                class="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 relative z-10">
                <input type="checkbox" id="es_warda_check" :checked="nuevaCuenta.es_warda"
                    @change="$emit('update-cuenta', 'es_warda', $event.target.checked)"
                    class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer border-slate-300"><label
                    for="es_warda_check"
                    class="text-[11px] font-bold text-emerald-800 cursor-pointer leading-tight">Configurar como cuenta
                    'Warda' (Recibe redondeos automáticos)</label>
            </div>
        </template>

        <template v-else-if="nuevaCuenta.tipo_cuenta === 'Credito'">
            <input type="number" :value="nuevaCuenta.limite"
                @input="$emit('update-cuenta', 'limite', $event.target.value)" placeholder="Límite Total de Crédito"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" />
            <div class="grid grid-cols-2 gap-3"><input type="number" :value="nuevaCuenta.saldo_inicial"
                    @input="$emit('update-cuenta', 'saldo_inicial', $event.target.value)"
                    placeholder="Deuda Total Actual"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" /><input
                    type="number" :value="nuevaCuenta.pago_del_mes"
                    @input="$emit('update-cuenta', 'pago_del_mes', $event.target.value)" placeholder="Cuota del Mes"
                    class="w-full px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-extrabold focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3"><input type="number" :value="nuevaCuenta.dia_corte"
                    @input="$emit('update-cuenta', 'dia_corte', $event.target.value)" placeholder="Día Corte (Ej: 25)"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" /><input
                    type="number" :value="nuevaCuenta.dia_pago"
                    @input="$emit('update-cuenta', 'dia_pago', $event.target.value)" placeholder="Día Pago (Ej: 12)"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" />
            </div>
        </template>

        <template v-else>
            <div class="grid grid-cols-2 gap-3"><input type="number" :value="nuevaCuenta.saldo_inicial"
                    @input="$emit('update-cuenta', 'saldo_inicial', $event.target.value)" placeholder="Deuda Pendiente"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" /><input
                    type="number" :value="nuevaCuenta.pago_del_mes"
                    @input="$emit('update-cuenta', 'pago_del_mes', $event.target.value)" placeholder="Cuota del Mes"
                    class="w-full px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-extrabold focus:outline-none" />
            </div>
        </template>

        <button @click="$emit('guardar')"
            class="w-full py-3.5 text-sm font-extrabold text-white rounded-xl transition shadow-md bg-slate-900 hover:bg-slate-800">Guardar
            Cuenta</button>
    </div>
</template>

<script setup>
defineProps({ nuevaCuenta: Object })
defineEmits(['update-cuenta', 'guardar'])
</script>