// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

import { api } from "../api.js";
import { ref } from "vue";

export function useFinanceData(
  currentUserId,
  cargando,
  mostrarToast,
  showModal,
  tipoOperacion,
  tab,
  onDatosActualizados,
) {
  const cuentas = ref([]);
  const categorias = ref([]);
  const etiquetas = ref([]);
  const historial = ref([]);
  const pagosFijos = ref([]);
  const bolsaCashback = ref({
    saldo_inicial: 0,
    generado: 0,
    usado: 0,
    disponible: 0,
  });

  const fechaGlobal = ref(new Date().toISOString().slice(0, 7));

  const editandoTx = ref({ estado: false, id: null });
  const editandoPagoFijo = ref({ estado: false, id: null });
  const editandoCuenta = ref({
    estado: false,
    id: null,
    saldo_inicial_orig: 0,
    saldo_actual_orig: 0,
  });
  const editandoCat = ref({ estado: false, id: null });
  const editandoEtiq = ref({ estado: false, id: null });

  const showModalCuenta = ref(false);
  const showModalPagoFijo = ref(false);
  const showModalCat = ref(false);
  const showModalEtiq = ref(false);
  const isRescateCashback = ref(false);

  const tx = ref({
    cuenta_id: "",
    categoria_id: "",
    etiqueta_id: "",
    monto: null,
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    cashback: null,
    monto_warda: null,
    warda_cuenta_id: "",
    cuotas: 1,
    tiene_interes: false,
    cuota_banco: null,
  });

  const txTransf = ref({
    origen_id: "",
    destino_id: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
  });

  // NUEVO: Estado para gestionar Préstamos y Cobros a Terceros
  const txTercero = ref({
    tipo: "me_deben",
    contacto_id: "",
    cuenta_id: "",
    afecta_liquidez: false,
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
  });

  const nuevaCat = ref({
    nombre: "",
    tipo_flujo: "Egreso",
    nivel_necesidad: "Necesario",
    icono: "🏷️",
  });

  const nuevaEtiq = ref({ nombre: "" });
  const nuevaCuenta = ref({
    nombre: "",
    tipo_cuenta: "Debito",
    moneda: "PEN",
    saldo_inicial: "",
    limite: "",
    dia_corte: "",
    dia_pago: "",
    pago_del_mes: "",
    banco: "Otro",
    es_warda: false,
  });
  const nuevoPagoFijo = ref({
    nombre: "",
    monto: "",
    tipo_flujo: "Egreso",
    dia_cobro: "",
    moneda: "PEN",
  });

  const limpiarDatos = () => {
    cuentas.value = [];
    historial.value = [];
    pagosFijos.value = [];
    etiquetas.value = [];
    bolsaCashback.value = {
      saldo_inicial: 0,
      generado: 0,
      usado: 0,
      disponible: 0,
    };
  };

  const cargarDatos = async () => {
    try {
      const datos = await api.obtenerDatosCompletos(currentUserId.value);
      cuentas.value = datos.cuentas;
      categorias.value = datos.categorias;
      pagosFijos.value = datos.pagosFijos;
      etiquetas.value = datos.etiquetas;
      bolsaCashback.value = datos.bolsaCashback;
      historial.value = datos.historialRaw.map((h) => ({
        ...h,
        categoria_nombre: String(
          categorias.value.find((c) => c.id == h.categoria)?.nombre ||
            h.categoria_nombre ||
            "Sin Categoría",
        ),
      }));
      if (onDatosActualizados) onDatosActualizados();
    } catch (error) {
      mostrarToast("Error de conexión", "error");
    }
  };

  const editarCashbackInicial = async () => {
    const input = window.prompt(
      "Ingresa tu Cashback Histórico acumulado (S/):",
      bolsaCashback.value.saldo_inicial,
    );
    if (input !== null) {
      const monto = parseFloat(input);
      if (!isNaN(monto) && monto >= 0) {
        cargando.value = true;
        try {
          await api.actualizarBolsaCashback(currentUserId.value, {
            saldo_inicial: monto,
          });
          await cargarDatos();
          mostrarToast("Cashback actualizado", "success");
        } catch (e) {
          mostrarToast("Error", "error");
        }
        cargando.value = false;
      }
    }
  };

  const prepararRescateCashback = async () => {
    const tarjetas = cuentas.value.filter((c) => c.tipo_cuenta === "Credito");
    if (tarjetas.length === 0) {
      mostrarToast("Debes registrar una Tarjeta de Crédito", "warning");
      return;
    }
    if (bolsaCashback.value.disponible <= 0) {
      mostrarToast("No tienes saldo de Cashback", "warning");
      return;
    }

    let catRescate = categorias.value.find(
      (c) => c.nombre === "Rescate Cashback" && c.tipo_flujo === "Ingreso",
    );
    if (!catRescate) {
      cargando.value = true;
      await api.guardarCategoria({
        nombre: "Rescate Cashback",
        tipo_flujo: "Ingreso",
        nivel_necesidad: null,
        icono: "💎",
      });
      await cargarDatos();
      catRescate = categorias.value.find(
        (c) => c.nombre === "Rescate Cashback",
      );
      cargando.value = false;
    }

    editandoTx.value = { estado: false, id: null };
    tipoOperacion.value = "Ingreso";
    isRescateCashback.value = true;
    tx.value = {
      monto: "",
      cashback: "",
      descripcion: "Abono a Tarjeta con Cashback",
      fecha: new Date().toISOString().split("T")[0],
      cuenta_id: "",
      categoria_id: catRescate.id,
      etiqueta_id: "",
      monto_warda: "",
      warda_cuenta_id: "",
      cuotas: 1,
      tiene_interes: false,
      cuota_banco: null,
    };
    showModal.value = true;
  };

  const abrirModalTransaccion = (itemAEditar = null) => {
    if (itemAEditar) {
      editandoTx.value = { estado: true, id: itemAEditar.id };
      tipoOperacion.value = itemAEditar.tipo_flujo;
      isRescateCashback.value =
        itemAEditar.categoria_nombre === "Rescate Cashback";
      tx.value = {
        monto: itemAEditar.monto,
        cashback: itemAEditar.cashback || "",
        descripcion: itemAEditar.descripcion,
        fecha: itemAEditar.fecha,
        cuenta_id: itemAEditar.cuenta_id,
        categoria_id: itemAEditar.categoria,
        etiqueta_id: itemAEditar.etiqueta_id || "",
        monto_warda: "",
        warda_cuenta_id: "",
        cuotas: itemAEditar.cuotas || 1,
        tiene_interes: false,
        cuota_banco: null,
      };
    } else {
      editandoTx.value = { estado: false, id: null };
      tipoOperacion.value = "Egreso";
      isRescateCashback.value = false;
      tx.value = {
        monto: "",
        cashback: "",
        descripcion: "",
        fecha: new Date().toISOString().split("T")[0],
        cuenta_id: "",
        categoria_id: "",
        etiqueta_id: "",
        monto_warda: "",
        warda_cuenta_id: "",
        cuotas: 1,
        tiene_interes: false,
        cuota_banco: null,
      };
      txTransf.value = {
        origen_id: "",
        destino_id: "",
        monto: "",
        fecha: new Date().toISOString().split("T")[0],
        descripcion: "",
      };
      // NUEVO: Resetear el formulario de terceros
      txTercero.value = {
        tipo: "me_deben",
        contacto_id: "",
        cuenta_id: "",
        afecta_liquidez: false,
        monto: "",
        fecha: new Date().toISOString().split("T")[0],
        descripcion: "",
      };
    }
    showModal.value = true;
  };

  const ejecutarOperacion = async () => {
    cargando.value = true;

    if (tipoOperacion.value === "Transferencia") {
      if (!txTransf.value.origen_id) {
        mostrarToast("Falta seleccionar la cuenta de origen", "warning");
        cargando.value = false;
        return;
      }
      if (!txTransf.value.destino_id) {
        mostrarToast("Falta seleccionar la cuenta de destino", "warning");
        cargando.value = false;
        return;
      }
      if (!txTransf.value.monto || parseFloat(txTransf.value.monto) <= 0) {
        mostrarToast("Ingresa un monto a transferir válido", "warning");
        cargando.value = false;
        return;
      }
      if (txTransf.value.origen_id === txTransf.value.destino_id) {
        mostrarToast("No puedes transferir a la misma cuenta", "warning");
        cargando.value = false;
        return;
      }

      const cuentaOrigen = cuentas.value.find(
        (c) => c.id_cuenta === parseInt(txTransf.value.origen_id),
      );
      const montoTransf = parseFloat(txTransf.value.monto);

      if (cuentaOrigen) {
        if (
          ["Debito", "Efectivo", "Ahorro"].includes(cuentaOrigen.tipo_cuenta)
        ) {
          if (montoTransf > cuentaOrigen.saldo_actual) {
            mostrarToast(
              `Fondos insuficientes (Tienes S/ ${cuentaOrigen.saldo_actual})`,
              "warning",
            );
            cargando.value = false;
            return;
          }
        }
      }

      let catSalida = categorias.value.find(
        (c) => c.nombre === "Transferencia Saliente",
      );
      let catEntrada = categorias.value.find(
        (c) => c.nombre === "Transferencia Entrante",
      );
      if (!catSalida) {
        await api.guardarCategoria({
          nombre: "Transferencia Saliente",
          tipo_flujo: "Egreso",
          nivel_necesidad: null,
          icono: "🔄",
        });
        await cargarDatos();
        catSalida = categorias.value.find(
          (c) => c.nombre === "Transferencia Saliente",
        );
      }
      if (!catEntrada) {
        await api.guardarCategoria({
          nombre: "Transferencia Entrante",
          tipo_flujo: "Ingreso",
          nivel_necesidad: null,
          icono: "🔄",
        });
        await cargarDatos();
        catEntrada = categorias.value.find(
          (c) => c.nombre === "Transferencia Entrante",
        );
      }

      const concepto = txTransf.value.descripcion || "Transferencia";
      try {
        await Promise.all([
          api.guardarTransaccion({
            cuenta_id: parseInt(txTransf.value.origen_id),
            categoria_id: catSalida.id,
            etiqueta_id: null,
            monto: montoTransf,
            cashback: 0,
            fecha: txTransf.value.fecha,
            descripcion: concepto,
            compra_id: null,
            numero_cuota: 1,
            total_cuotas: 1,
          }),
          api.guardarTransaccion({
            cuenta_id: parseInt(txTransf.value.destino_id),
            categoria_id: catEntrada.id,
            etiqueta_id: null,
            monto: montoTransf,
            cashback: 0,
            fecha: txTransf.value.fecha,
            descripcion: concepto,
            compra_id: null,
            numero_cuota: 1,
            total_cuotas: 1,
          }),
        ]);
        mostrarToast("Transferencia registrada", "success");
      } catch (error) {
        mostrarToast("Error servidor", "error");
      }
    }
    // ==========================================
    // NUEVA LÓGICA: OPERACIONES CON TERCEROS (PRÉSTAMOS/COBROS)
    // ==========================================
    else if (tipoOperacion.value === "Terceros") {
      if (!txTercero.value.contacto_id) {
        mostrarToast("Selecciona un contacto", "warning");
        cargando.value = false;
        return;
      }
      if (!txTercero.value.monto || parseFloat(txTercero.value.monto) <= 0) {
        mostrarToast("Ingresa un monto válido", "warning");
        cargando.value = false;
        return;
      }
      if (txTercero.value.tipo === "me_pagan" && !txTercero.value.cuenta_id) {
        mostrarToast("Selecciona a qué cuenta ingresó el dinero", "warning");
        cargando.value = false;
        return;
      }
      if (
        txTercero.value.tipo === "me_deben" &&
        txTercero.value.afecta_liquidez &&
        !txTercero.value.cuenta_id
      ) {
        mostrarToast("Selecciona de qué cuenta salió el dinero", "warning");
        cargando.value = false;
        return;
      }

      try {
        const payload = {
          usuario_id: currentUserId.value,
          tipo_operacion: txTercero.value.tipo,
          etiqueta_id: parseInt(txTercero.value.contacto_id),
          cuenta_id: txTercero.value.cuenta_id
            ? parseInt(txTercero.value.cuenta_id)
            : null,
          afecta_liquidez: txTercero.value.afecta_liquidez,
          monto: parseFloat(txTercero.value.monto),
          fecha: txTercero.value.fecha,
          descripcion:
            txTercero.value.descripcion ||
            (txTercero.value.tipo === "me_deben"
              ? "Deuda a favor"
              : "Cobro de deuda"),
        };

        await api.registrarOperacionTercero(payload);

        mostrarToast("Registro de deuda actualizado", "success");
      } catch (error) {
        mostrarToast("Error. Asegúrate de actualizar tu backend.", "error");
      }
    }
    // ==========================================
    // FIN LÓGICA TERCEROS
    // ==========================================
    else {
      if (!tx.value.cuenta_id) {
        mostrarToast("Por favor selecciona una cuenta", "warning");
        cargando.value = false;
        return;
      }
      if (!tx.value.categoria_id) {
        mostrarToast("Por favor elige una categoría", "warning");
        cargando.value = false;
        return;
      }
      if (!tx.value.monto || parseFloat(tx.value.monto) <= 0) {
        mostrarToast("Ingresa un monto válido mayor a 0", "warning");
        cargando.value = false;
        return;
      }
      if (!tx.value.descripcion || tx.value.descripcion.trim() === "") {
        mostrarToast("Escribe un concepto o descripción", "warning");
        cargando.value = false;
        return;
      }

      const montoOriginal = parseFloat(tx.value.monto);
      const numCuotas = parseInt(tx.value.cuotas) || 1;
      const cuentaOrigen = cuentas.value.find(
        (c) => c.id_cuenta == tx.value.cuenta_id,
      );

      let montoPorCuota = montoOriginal / numCuotas;
      let deudaTotalAdquirida = montoOriginal;

      if (
        cuentaOrigen?.tipo_cuenta === "Credito" &&
        tx.value.tiene_interes &&
        numCuotas > 1
      ) {
        const cuotaBanco = parseFloat(tx.value.cuota_banco);
        if (!cuotaBanco || cuotaBanco <= 0) {
          mostrarToast("Debes ingresar la cuota con intereses.", "warning");
          cargando.value = false;
          return;
        }
        montoPorCuota = cuotaBanco;
        deudaTotalAdquirida = cuotaBanco * numCuotas;
      }

      if (tipoOperacion.value === "Egreso" && !editandoTx.value.estado) {
        if (cuentaOrigen) {
          if (
            ["Debito", "Efectivo", "Ahorro"].includes(cuentaOrigen.tipo_cuenta)
          ) {
            if (montoOriginal > cuentaOrigen.saldo_actual) {
              mostrarToast(`Fondos insuficientes.`, "warning");
              cargando.value = false;
              return;
            }
          } else if (cuentaOrigen.tipo_cuenta === "Credito") {
            const disponible =
              (cuentaOrigen.limite || 0) - Math.abs(cuentaOrigen.saldo_actual);
            if (deudaTotalAdquirida > disponible) {
              mostrarToast(`Línea insuficiente.`, "warning");
              cargando.value = false;
              return;
            }
          }
        }
      }

      try {
        if (editandoTx.value.estado) {
          const datosParaBD = {
            ...tx.value,
            cuenta_id: parseInt(tx.value.cuenta_id),
            categoria_id: parseInt(tx.value.categoria_id),
            etiqueta_id: tx.value.etiqueta_id
              ? parseInt(tx.value.etiqueta_id)
              : null,
            monto: montoOriginal,
            cashback: tx.value.cashback ? parseFloat(tx.value.cashback) : 0,
          };
          await api.actualizarTransaccion(editandoTx.value.id, datosParaBD);
          mostrarToast("Operación actualizada", "success");
        } else {
          if (
            cuentaOrigen?.tipo_cuenta === "Credito" &&
            numCuotas > 1 &&
            tipoOperacion.value === "Egreso"
          ) {
            const promesasCuotas = [];
            let fechaBase = new Date(tx.value.fecha + "T12:00:00");
            const idDeCompra =
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString();

            for (let i = 0; i < numCuotas; i++) {
              let fechaCuota = new Date(fechaBase);
              fechaCuota.setMonth(fechaBase.getMonth() + i);
              promesasCuotas.push(
                api.guardarTransaccion({
                  cuenta_id: parseInt(tx.value.cuenta_id),
                  categoria_id: parseInt(tx.value.categoria_id),
                  etiqueta_id: tx.value.etiqueta_id
                    ? parseInt(tx.value.etiqueta_id)
                    : null,
                  monto: montoPorCuota,
                  fecha: fechaCuota.toISOString().split("T")[0],
                  descripcion: `${tx.value.descripcion} (Cuota ${i + 1}/${numCuotas})`,
                  cashback: i === 0 ? parseFloat(tx.value.cashback) || 0 : 0,
                  compra_id: idDeCompra,
                  numero_cuota: i + 1,
                  total_cuotas: numCuotas,
                }),
              );
            }
            await Promise.all(promesasCuotas);
          } else {
            await api.guardarTransaccion({
              cuenta_id: parseInt(tx.value.cuenta_id),
              categoria_id: parseInt(tx.value.categoria_id),
              etiqueta_id: tx.value.etiqueta_id
                ? parseInt(tx.value.etiqueta_id)
                : null,
              monto: montoOriginal,
              fecha: tx.value.fecha,
              descripcion: tx.value.descripcion,
              cashback: tx.value.cashback ? parseFloat(tx.value.cashback) : 0,
              compra_id: null,
              numero_cuota: 1,
              total_cuotas: 1,
            });
          }
          mostrarToast("Operación registrada", "success");
        }
      } catch (error) {
        mostrarToast("Error servidor", "error");
      }
    }
    showModal.value = false;
    await cargarDatos();
    cargando.value = false;
  };

  const guardarCuenta = async () => {
    if (!nuevaCuenta.value.nombre) return;
    cargando.value = true;
    try {
      let saldoDeseado = parseFloat(nuevaCuenta.value.saldo_inicial || 0);
      if (
        ["Credito", "Prestamo", "Pagar"].includes(nuevaCuenta.value.tipo_cuenta)
      )
        saldoDeseado = -Math.abs(saldoDeseado);

      let saldoAEnviar = saldoDeseado;
      if (editandoCuenta.value.estado) {
        const sumaTransacciones =
          editandoCuenta.value.saldo_actual_orig -
          editandoCuenta.value.saldo_inicial_orig;
        saldoAEnviar = saldoDeseado - sumaTransacciones;
      }

      const payload = {
        usuario_id: currentUserId.value,
        nombre: nuevaCuenta.value.nombre,
        tipo_cuenta: nuevaCuenta.value.tipo_cuenta,
        moneda: nuevaCuenta.value.moneda,
        saldo_inicial: saldoAEnviar,
        saldo_actual: saldoDeseado,
        limite:
          nuevaCuenta.value.tipo_cuenta === "Credito"
            ? parseFloat(nuevaCuenta.value.limite || 0)
            : null,
        dia_corte:
          nuevaCuenta.value.tipo_cuenta === "Credito"
            ? parseInt(nuevaCuenta.value.dia_corte || 0)
            : null,
        dia_pago:
          nuevaCuenta.value.tipo_cuenta === "Credito"
            ? parseInt(nuevaCuenta.value.dia_pago || 0)
            : null,
        pago_del_mes: parseFloat(nuevaCuenta.value.pago_del_mes || 0),
        es_warda: nuevaCuenta.value.es_warda || false,
        banco: nuevaCuenta.value.banco || "Otro",
      };

      if (editandoCuenta.value.estado)
        await api.actualizarCuenta(editandoCuenta.value.id, payload);
      else await api.guardarCuenta(payload);

      showModalCuenta.value = false;
      await cargarDatos();
      mostrarToast("Cuenta guardada", "success");
    } catch (error) {
      mostrarToast("Error", "error");
    }
    cargando.value = false;
  };

  const eliminarRegistro = async (tipo, id) => {
    if (!confirm("¿Seguro de eliminar este registro?")) return;
    cargando.value = true;
    try {
      if (tipo === "transaccion") await api.eliminarTransaccion(id);
      else if (tipo === "proyeccion") await api.eliminarPagoFijo(id);
      else if (tipo === "cuenta") await api.eliminarCuenta(id);
      else if (tipo === "categoria") await api.eliminarCategoria(id);
      else if (tipo === "etiqueta") await api.eliminarEtiqueta(id);

      await cargarDatos();
      mostrarToast("Eliminado", "success");
    } catch (error) {
      mostrarToast("Error", "error");
    }
    cargando.value = false;
  };

  const abrirModalPagoFijo = (pagoAEditar) => {
    editandoPagoFijo.value = { estado: true, id: pagoAEditar.id };
    nuevoPagoFijo.value = { ...pagoAEditar };
    showModalPagoFijo.value = true;
  };
  const abrirModalNuevoPagoFijo = () => {
    editandoPagoFijo.value = { estado: false, id: null };
    nuevoPagoFijo.value = {
      nombre: "",
      monto: "",
      tipo_flujo: "Egreso",
      dia_cobro: "",
      moneda: "PEN",
    };
    showModalPagoFijo.value = true;
  };
  const cancelarEdicionPago = () => {
    editandoPagoFijo.value = { estado: false, id: null };
    nuevoPagoFijo.value = {
      nombre: "",
      monto: "",
      tipo_flujo: "Egreso",
      dia_cobro: "",
      moneda: "PEN",
    };
    showModalPagoFijo.value = false;
  };
  const guardarPagoFijo = async () => {
    if (
      !nuevoPagoFijo.value.nombre ||
      !nuevoPagoFijo.value.monto ||
      !nuevoPagoFijo.value.dia_cobro
    )
      return;
    cargando.value = true;
    try {
      const payload = {
        usuario_id: currentUserId.value,
        nombre: nuevoPagoFijo.value.nombre,
        monto: parseFloat(nuevoPagoFijo.value.monto),
        tipo_flujo: nuevoPagoFijo.value.tipo_flujo,
        dia_cobro: parseInt(nuevoPagoFijo.value.dia_cobro),
        moneda: nuevoPagoFijo.value.moneda,
      };
      if (editandoPagoFijo.value.estado)
        await api.actualizarPagoFijo(editandoPagoFijo.value.id, payload);
      else await api.guardarPagoFijo(payload);
      showModalPagoFijo.value = false;
      await cargarDatos();
      mostrarToast("Guardado", "success");
    } catch (error) {}
    cargando.value = false;
  };

  const abrirModalCuenta = (c) => {
    editandoCuenta.value = {
      estado: true,
      id: c.id_cuenta,
      saldo_inicial_orig: c.saldo_inicial,
      saldo_actual_orig: c.saldo_actual,
    };
    nuevaCuenta.value = {
      nombre: c.nombre,
      tipo_cuenta: c.tipo_cuenta,
      moneda: c.moneda,
      saldo_inicial: Math.abs(c.saldo_actual),
      limite: c.limite || "",
      dia_corte: c.dia_corte || "",
      dia_pago: c.dia_pago || "",
      pago_del_mes: c.pago_del_mes || "",
      banco: c.banco || "Otro",
      es_warda: c.es_warda || false,
    };
    showModalCuenta.value = true;
  };
  const abrirModalNuevaCuenta = () => {
    editandoCuenta.value = {
      estado: false,
      id: null,
      saldo_inicial_orig: 0,
      saldo_actual_orig: 0,
    };
    nuevaCuenta.value = {
      nombre: "",
      tipo_cuenta: "Debito",
      moneda: "PEN",
      saldo_inicial: "",
      limite: "",
      dia_corte: "",
      dia_pago: "",
      pago_del_mes: "",
      banco: "Otro",
      es_warda: false,
    };
    showModalCuenta.value = true;
  };
  const cancelarEdicionCuenta = () => {
    editandoCuenta.value = {
      estado: false,
      id: null,
      saldo_inicial_orig: 0,
      saldo_actual_orig: 0,
    };
    nuevaCuenta.value = {
      nombre: "",
      tipo_cuenta: "Debito",
      moneda: "PEN",
      saldo_inicial: "",
      limite: "",
      dia_corte: "",
      dia_pago: "",
      pago_del_mes: "",
      banco: "Otro",
      es_warda: false,
    };
    showModalCuenta.value = false;
  };

  // ==========================================
  // FUNCIONES DE CATEGORÍAS (100% CORREGIDAS)
  // ==========================================
  const abrirModalNuevaCategoria = () => {
    editandoCat.value = { estado: false, id: null };
    nuevaCat.value = {
      nombre: "",
      tipo_flujo: "Egreso",
      nivel_necesidad: "Necesario",
      icono: "🏷️",
    };
    showModalCat.value = true;
  };

  const abrirModalCategoria = (catAEditar) => {
    editandoCat.value = { estado: true, id: catAEditar.id };
    nuevaCat.value = {
      nombre: catAEditar.nombre,
      tipo_flujo: catAEditar.tipo_flujo,
      nivel_necesidad: catAEditar.nivel_necesidad || "Necesario",
      icono: catAEditar.icono || "🏷️",
    };
    showModalCat.value = true;
  };

  const cancelarEdicionCategoria = () => {
    editandoCat.value = { estado: false, id: null };
    nuevaCat.value = {
      nombre: "",
      tipo_flujo: "Egreso",
      nivel_necesidad: "Necesario",
      icono: "🏷️",
    };
    showModalCat.value = false;
  };

  const guardarCategoria = async () => {
    if (!nuevaCat.value.nombre) return;
    cargando.value = true;
    try {
      if (editandoCat.value.estado)
        await api.actualizarCategoria(editandoCat.value.id, nuevaCat.value);
      else await api.guardarCategoria(nuevaCat.value);
      showModalCat.value = false;
      await cargarDatos();
      mostrarToast("Categoría guardada", "success");
    } catch (e) {
      mostrarToast("Error guardando categoría", "error");
    }
    cargando.value = false;
  };
  // ==========================================

  const abrirModalNuevaEtiqueta = () => {
    editandoEtiq.value = { estado: false, id: null };
    nuevaEtiq.value = { nombre: "" };
    showModalEtiq.value = true;
  };
  const abrirModalEtiqueta = (etiqAEditar) => {
    editandoEtiq.value = { estado: true, id: etiqAEditar.id };
    nuevaEtiq.value = { nombre: etiqAEditar.nombre };
    showModalEtiq.value = true;
  };
  const cancelarEdicionEtiqueta = () => {
    editandoEtiq.value = { estado: false, id: null };
    nuevaEtiq.value = { nombre: "" };
    showModalEtiq.value = false;
  };
  const guardarEtiqueta = async () => {
    if (!nuevaEtiq.value.nombre) return;
    cargando.value = true;
    try {
      const payload = {
        usuario_id: currentUserId.value,
        nombre: nuevaEtiq.value.nombre,
      };
      if (editandoEtiq.value.estado)
        await api.actualizarEtiqueta(editandoEtiq.value.id, payload);
      else await api.guardarEtiqueta(payload);
      showModalEtiq.value = false;
      await cargarDatos();
      mostrarToast("Guardado", "success");
    } catch (e) {}
    cargando.value = false;
  };

  return {
    fechaGlobal,
    cuentas,
    categorias,
    etiquetas,
    historial,
    pagosFijos,
    bolsaCashback,
    isRescateCashback,
    editandoTx,
    editandoPagoFijo,
    editandoCuenta,
    editandoCat,
    editandoEtiq,
    showModalCuenta,
    showModalPagoFijo,
    showModalCat,
    showModalEtiq,
    tx,
    txTransf,
    txTercero,
    nuevaCat,
    nuevaEtiq,
    nuevaCuenta,
    nuevoPagoFijo,
    limpiarDatos,
    cargarDatos,
    ejecutarOperacion,
    eliminarRegistro,
    editarCashbackInicial,
    prepararRescateCashback,
    abrirModalTransaccion,
    abrirModalNuevaCuenta,
    abrirModalCuenta,
    cancelarEdicionCuenta,
    guardarCuenta,
    abrirModalNuevoPagoFijo,
    abrirModalPagoFijo,
    cancelarEdicionPago,
    guardarPagoFijo,
    abrirModalNuevaCategoria,
    abrirModalCategoria,
    cancelarEdicionCategoria,
    guardarCategoria,
    abrirModalNuevaEtiqueta,
    abrirModalEtiqueta,
    cancelarEdicionEtiqueta,
    guardarEtiqueta,
  };
}
