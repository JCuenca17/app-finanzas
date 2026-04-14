<template>
    <div>
        <div v-if="!editandoTx.estado && !isRescateCashback" class="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button @click="$emit('update:tipoOperacion', 'Egreso')"
                :class="tipoOperacion === 'Egreso' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 font-medium'"
                class="flex-1 py-2 text-xs md:text-sm rounded-lg transition">Gasto</button>
            <button @click="$emit('update:tipoOperacion', 'Ingreso')"
                :class="tipoOperacion === 'Ingreso' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 font-medium'"
                class="flex-1 py-2 text-xs md:text-sm rounded-lg transition">Ingreso</button>
            <button @click="$emit('update:tipoOperacion', 'Transferencia')"
                :class="tipoOperacion === 'Transferencia' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 font-medium'"
                class="flex-1 py-2 text-xs md:text-sm rounded-lg transition">Mover</button>
        </div>

        <div v-if="isRescateCashback"
            class="mb-5 bg-fuchsia-50 text-fuchsia-800 p-3 rounded-xl text-xs font-semibold text-center border border-fuchsia-100">
            Estás usando tu Cashback. Asegúrate de elegir la Tarjeta de Crédito correcta. (Disponible: S/ {{
                bolsaCashback.disponible.toFixed(2) }})
        </div>

        <div v-if="tipoOperacion !== 'Transferencia'" class="space-y-3 md:space-y-4">
            <select :value="tx.cuenta_id" @change="$emit('update-tx', 'cuenta_id', $event.target.value)"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-bold focus:outline-none">
                <option value="" disabled><template v-if="isRescateCashback">Elige tu Tarjeta de
                        Crédito...</template><template v-else>Cuenta origen/destino...</template></option><template
                    v-for="c in cuentas" :key="c.id_cuenta">
                    <option :value="c.id_cuenta" v-if="!isRescateCashback || c.tipo_cuenta === 'Credito'">{{ c.nombre }}
                        ({{ c.moneda }})</option>
                </template>
            </select>

            <div v-if="tipoOperacion === 'Egreso' && cuentas.find(c => c.id_cuenta == tx.cuenta_id)?.tipo_cuenta === 'Credito'"
                class="p-4 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">¿En cuántas cuotas?</label>
                <div class="flex items-center gap-4 mt-2 mb-3">
                    <input type="range" :value="tx.cuotas || 1"
                        @input="$emit('update-tx', 'cuotas', parseInt($event.target.value))" min="1" max="36"
                        class="w-full accent-slate-900" />
                    <div
                        class="w-12 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-extrabold text-slate-900 shadow-sm">
                        {{ tx.cuotas || 1 }}</div>
                </div>

                <div v-if="(tx.cuotas || 1) > 1" class="space-y-3 pt-3 border-t border-slate-200/60">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" :checked="tx.tiene_interes"
                            @change="$emit('update-tx', 'tiene_interes', $event.target.checked)" id="check_interes"
                            class="w-4 h-4 text-slate-900 rounded focus:ring-slate-900 cursor-pointer border-slate-300">
                        <label for="check_interes" class="text-xs font-bold text-slate-700 cursor-pointer">¿El banco
                            cobra intereses
                            por estas cuotas?</label>
                    </div>

                    <p v-if="!tx.tiene_interes && tx.monto > 0"
                        class="text-[10px] font-bold text-emerald-600 text-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        Se sumarán S/ {{ (tx.monto / tx.cuotas).toFixed(2) }} a tu cuota del mes (Sin intereses).
                    </p>

                    <div v-if="tx.tiene_interes" class="p-3 bg-amber-50 border border-amber-200 rounded-xl slide-up">
                        <label class="text-[10px] font-bold text-amber-800 uppercase ml-1">Valor exacto de la cuota
                            mensual
                            (S/)</label>
                        <input type="number" :value="tx.cuota_banco"
                            @input="$emit('update-tx', 'cuota_banco', $event.target.value)" placeholder="Ej: 450.00"
                            class="w-full mt-1 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm font-extrabold text-amber-900 focus:outline-none focus:border-amber-400" />
                        <p v-if="tx.cuota_banco > 0 && tx.monto > 0"
                            class="text-[9.5px] font-bold text-amber-700 mt-2 leading-tight">
                            Deuda Total que adquirirás: S/ {{ (tx.cuota_banco * tx.cuotas).toFixed(2) }}<br>
                            <span class="text-amber-600 font-medium">(El banco te está cobrando S/ {{ ((tx.cuota_banco *
                                tx.cuotas)
                                - tx.monto).toFixed(2) }} de interés total)</span>
                        </p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 md:gap-4"><select :value="tx.categoria_id"
                    @change="$emit('update-tx', 'categoria_id', $event.target.value)" :disabled="isRescateCashback"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-bold focus:outline-none"
                    :class="isRescateCashback ? 'opacity-50 cursor-not-allowed' : ''">
                    <option value="" disabled>Categoría...</option>
                    <option v-for="cat in categoriasFiltradas" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                </select><select :value="tx.etiqueta_id"
                    @change="$emit('update-tx', 'etiqueta_id', $event.target.value)" :disabled="isRescateCashback"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-bold focus:outline-none text-blue-600"
                    :class="isRescateCashback ? 'opacity-50 cursor-not-allowed' : ''">
                    <option value="">Sin Etiqueta</option>
                    <option v-for="et in etiquetas" :key="et.id" :value="et.id">@{{ et.nombre }}</option>
                </select></div>
            <div class="grid grid-cols-2 gap-3 md:gap-4">
                <div><label v-if="!isRescateCashback" class="text-[10px] font-bold text-slate-400 uppercase ml-1">Monto
                        {{
                            tipoOperacion === 'Egreso' ? 'Gastado' : 'Ingresado' }}</label><label v-else
                        class="text-[10px] font-bold text-fuchsia-500 uppercase ml-1">Cashback a Usar</label><input
                        type="number" :value="tx.monto" @input="$emit('update-tx', 'monto', $event.target.value)"
                        placeholder="0.00"
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-lg font-extrabold focus:outline-none" />
                </div>
                <div v-if="tipoOperacion === 'Egreso'"><label
                        class="text-[10px] font-bold text-emerald-500 uppercase ml-1">Cashback
                        Generado (+)</label><input type="number" :value="tx.cashback"
                        @input="$emit('update-tx', 'cashback', $event.target.value)" placeholder="Opcional"
                        class="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-base md:text-lg font-extrabold text-emerald-600 focus:outline-none" />
                </div>
                <div v-else><label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Fecha</label><input
                        type="date" :value="tx.fecha" @input="$emit('update-tx', 'fecha', $event.target.value)"
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-bold focus:outline-none" />
                </div>
            </div>

            <div v-if="tipoOperacion === 'Egreso' && !editandoTx.estado && cuentas.some(c => c.es_warda)"
                class="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <label class="text-[10px] font-bold text-emerald-600 uppercase ml-1">Warda Ahorro (Opcional)</label>
                <div v-if="cuentas.find(c => c.id_cuenta == tx.cuenta_id)?.tipo_cuenta === 'Debito'">
                    <div class="flex gap-2 mt-1"><select :value="tx.warda_cuenta_id"
                            @change="$emit('update-tx', 'warda_cuenta_id', $event.target.value)"
                            class="w-1/2 px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold focus:outline-none">
                            <option value="" disabled>Elegir Alcancía...</option>
                            <option v-for="w in cuentas.filter(c => c.es_warda)" :key="w.id_cuenta"
                                :value="w.id_cuenta">{{ w.nombre
                                }}</option>
                        </select><input type="number" :value="tx.monto_warda"
                            @input="$emit('update-tx', 'monto_warda', $event.target.value)" placeholder="S/ Redondeo"
                            class="w-1/2 px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold focus:outline-none text-emerald-700" />
                    </div>
                </div>
                <div v-else>
                    <p class="text-xs text-emerald-600 mt-1 font-medium bg-emerald-100/50 p-2 rounded text-center">
                        Selecciona una
                        cuenta de <b>Débito</b> arriba.</p>
                </div>
            </div>

            <div v-if="tipoOperacion === 'Egreso'" class="mt-1"><label
                    class="text-[10px] font-bold text-slate-400 uppercase ml-1">Fecha de la transacción</label><input
                    type="date" :value="tx.fecha" @input="$emit('update-tx', 'fecha', $event.target.value)"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-bold focus:outline-none" />
            </div>
            <input type="text" :value="tx.descripcion" @input="$emit('update-tx', 'descripcion', $event.target.value)"
                :placeholder="isRescateCashback ? 'Ej. Abono a Tarjeta' : 'Concepto'"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none" />
        </div>

        <div v-if="tipoOperacion === 'Transferencia'" class="space-y-4">
            <div v-if="editandoTx.estado"
                class="text-xs text-rose-500 font-semibold mb-2 bg-rose-50 p-2 rounded-lg border border-rose-100">Las
                transferencias deben ser eliminadas y creadas de nuevo.</div>

            <select :value="txTransf.origen_id" @change="$emit('update-txTransf', 'origen_id', $event.target.value)"
                :disabled="editandoTx.estado"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
                <option value="" disabled>Sale de (Origen)...</option>
                <template v-for="c in cuentas" :key="'ori-'+c.id_cuenta">
                    <option v-if="c.tipo_cuenta !== 'Credito'" :value="c.id_cuenta">{{ c.nombre }} ({{ c.moneda }})
                    </option>
                </template>
            </select>

            <select :value="txTransf.destino_id" @change="$emit('update-txTransf', 'destino_id', $event.target.value)"
                :disabled="editandoTx.estado"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none">
                <option value="" disabled>Entra a (Destino)...</option>
                <template v-for="c in cuentas" :key="'des-'+c.id_cuenta">
                    <option v-if="c.tipo_cuenta !== 'Credito'" :value="c.id_cuenta">{{ c.nombre }} ({{ c.moneda }})
                    </option>
                </template>
            </select>

            <p
                class="text-[10px] text-slate-500 font-medium text-center bg-slate-100 p-2 rounded border border-slate-200">
                Por seguridad, las Tarjetas de Crédito no permiten transferencias directas. Para abonar a tu tarjeta,
                usa la
                pestaña "Ingreso".
            </p>

            <div class="grid grid-cols-2 gap-3">
                <input type="number" :value="txTransf.monto"
                    @input="$emit('update-txTransf', 'monto', $event.target.value)" :disabled="editandoTx.estado"
                    placeholder="Monto"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-extrabold focus:outline-none" />
                <input type="date" :value="txTransf.fecha"
                    @input="$emit('update-txTransf', 'fecha', $event.target.value)" :disabled="editandoTx.estado"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none" />
            </div>
        </div>

        <div class="mt-8 flex gap-3 pb-6 md:pb-0">
            <button @click="$emit('ejecutar')"
                class="w-full py-3.5 text-sm font-extrabold text-white rounded-xl transition active:scale-95 shadow-md"
                :class="editandoTx.estado ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'"><span
                    v-if="editandoTx.estado">Guardar Cambios</span><span v-else>Confirmar Operación</span></button>
            <button v-if="editandoTx.estado" @click="$emit('cancelar')"
                class="w-full py-3.5 text-sm font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-95">Cancelar</button>
        </div>
    </div>
</template>

<script setup>
defineProps({ editandoTx: Object, isRescateCashback: Boolean, tipoOperacion: String, bolsaCashback: Object, tx: Object, txTransf: Object, cuentas: Array, categoriasFiltradas: Array, etiquetas: Array })
defineEmits(['update:tipoOperacion', 'update-tx', 'update-txTransf', 'ejecutar', 'cancelar'])
</script>