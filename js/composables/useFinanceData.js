// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Gestión de Datos (Con Sistema de Modales Independientes)

import { api } from "../api.js";
const { ref } = window.Vue;

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

  // ESTADOS DE EDICIÓN
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

  // ESTADOS DE MODALES
  const showModalCuenta = ref(false);
  const showModalPagoFijo = ref(false);
  const showModalCat = ref(false);
  const showModalEtiq = ref(false);
  const isRescateCashback = ref(false);

  // FORMULARIOS
  const tx = ref({
    monto: "",
    cashback: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    cuenta_id: "",
    categoria_id: "",
    etiqueta_id: "",
    monto_warda: "",
    warda_cuenta_id: "",
  });
  const txTransf = ref({
    origen_id: "",
    destino_id: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
  });
  const nuevaCat = ref({ nombre: "", tipo_flujo: "Egreso" });
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
      mostrarToast("Error de conexión con el servidor", "error");
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
          mostrarToast("Error al guardar", "error");
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
      };
      txTransf.value = {
        origen_id: "",
        destino_id: "",
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
      if (
        !txTransf.value.origen_id ||
        !txTransf.value.destino_id ||
        !txTransf.value.monto
      ) {
        mostrarToast("Faltan datos", "warning");
        cargando.value = false;
        return;
      }
      if (txTransf.value.origen_id === txTransf.value.destino_id) {
        mostrarToast("Cuentas iguales", "warning");
        cargando.value = false;
        return;
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
            monto: parseFloat(txTransf.value.monto),
            cashback: 0,
            fecha: txTransf.value.fecha,
            descripcion: concepto,
          }),
          api.guardarTransaccion({
            cuenta_id: parseInt(txTransf.value.destino_id),
            categoria_id: catEntrada.id,
            etiqueta_id: null,
            monto: parseFloat(txTransf.value.monto),
            cashback: 0,
            fecha: txTransf.value.fecha,
            descripcion: concepto,
          }),
        ]);
        mostrarToast("Transferencia registrada", "success");
      } catch (error) {
        mostrarToast("Error servidor", "error");
      }
    } else {
      if (
        !tx.value.cuenta_id ||
        !tx.value.categoria_id ||
        !tx.value.monto ||
        !tx.value.descripcion
      ) {
        mostrarToast("Llenar campos obligatorios", "warning");
        cargando.value = false;
        return;
      }

      const montoOriginal = parseFloat(tx.value.monto);
      if (
        isRescateCashback.value &&
        !editandoTx.value.estado &&
        montoOriginal > bolsaCashback.value.disponible
      ) {
        mostrarToast(
          `Solo S/ ${bolsaCashback.value.disponible.toFixed(2)} disponibles`,
          "warning",
        );
        cargando.value = false;
        return;
      }

      try {
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

        if (editandoTx.value.estado) {
          await api.actualizarTransaccion(editandoTx.value.id, datosParaBD);
          mostrarToast("Operación actualizada", "success");
        } else {
          await api.guardarTransaccion(datosParaBD);
          mostrarToast("Operación registrada", "success");

          const montoWarda = parseFloat(tx.value.monto_warda);
          if (
            tipoOperacion.value === "Egreso" &&
            montoWarda > 0 &&
            tx.value.warda_cuenta_id
          ) {
            const cuentaOrigen = cuentas.value.find(
              (c) => c.id_cuenta === parseInt(tx.value.cuenta_id),
            );
            if (cuentaOrigen && cuentaOrigen.tipo_cuenta === "Debito") {
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
                });
                await cargarDatos();
                catEntrada = categorias.value.find(
                  (c) => c.nombre === "Transferencia Entrante",
                );
              }

              await Promise.all([
                api.guardarTransaccion({
                  cuenta_id: cuentaOrigen.id_cuenta,
                  categoria_id: catSalida.id,
                  etiqueta_id: null,
                  monto: montoWarda,
                  cashback: 0,
                  fecha: tx.value.fecha,
                  descripcion: `Warda Vuelto (${tx.value.descripcion})`,
                }),
                api.guardarTransaccion({
                  cuenta_id: parseInt(tx.value.warda_cuenta_id),
                  categoria_id: catEntrada.id,
                  etiqueta_id: null,
                  monto: montoWarda,
                  cashback: 0,
                  fecha: tx.value.fecha,
                  descripcion: `Warda Vuelto (${tx.value.descripcion})`,
                }),
              ]);
            }
          }
        }
      } catch (error) {
        mostrarToast("Error servidor", "error");
      }
    }
    showModal.value = false;
    await cargarDatos();
    cargando.value = false;
  };

  // LÓGICA MODALES DE PAGOS FIJOS
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
  const abrirModalPagoFijo = (pagoAEditar) => {
    editandoPagoFijo.value = { estado: true, id: pagoAEditar.id };
    nuevoPagoFijo.value = { ...pagoAEditar };
    showModalPagoFijo.value = true;
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
      mostrarToast("Proyección guardada", "success");
    } catch (error) {}
    cargando.value = false;
  };

  // LÓGICA MODALES DE CUENTAS
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
      mostrarToast("Error al guardar", "error");
    }
    cargando.value = false;
  };

  // LÓGICA MODALES CATEGORÍAS
  const abrirModalNuevaCategoria = () => {
    editandoCat.value = { estado: false, id: null };
    nuevaCat.value = { nombre: "", tipo_flujo: "Egreso" };
    showModalCat.value = true;
  };
  const abrirModalCategoria = (catAEditar) => {
    editandoCat.value = { estado: true, id: catAEditar.id };
    nuevaCat.value = {
      nombre: catAEditar.nombre,
      tipo_flujo: catAEditar.tipo_flujo,
    };
    showModalCat.value = true;
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
      mostrarToast("Guardado", "success");
    } catch (e) {}
    cargando.value = false;
  };

  // LÓGICA MODALES ETIQUETAS
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

  const eliminarRegistro = async (tipo, id) => {
    if (!confirm("¿Seguro de eliminar?")) return;
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
      mostrarToast("Error al eliminar", "error");
    }
    cargando.value = false;
  };

  return {
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
    guardarCuenta,
    abrirModalNuevoPagoFijo,
    abrirModalPagoFijo,
    guardarPagoFijo,
    abrirModalNuevaCategoria,
    abrirModalCategoria,
    guardarCategoria,
    abrirModalNuevaEtiqueta,
    abrirModalEtiqueta,
    guardarEtiqueta,
  };
}
