// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Gestión de Datos (Con Ajuste Matemático de Saldos)

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
  const wardaConfig = ref({
    activa: false,
    cuenta_destino_id: "",
    tipo_redondeo: 1,
  });

  const editandoTx = ref({ estado: false, id: null });
  const editandoPagoFijo = ref({ estado: false, id: null });

  // Modificado: Agregamos memoria de los saldos originales para hacer la matemática inversa
  const editandoCuenta = ref({
    estado: false,
    id: null,
    saldo_inicial_orig: 0,
    saldo_actual_orig: 0,
  });

  const editandoCat = ref({ estado: false, id: null });
  const editandoEtiq = ref({ estado: false, id: null });

  const isRescateCashback = ref(false);

  const tx = ref({
    monto: "",
    cashback: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    cuenta_id: "",
    categoria_id: "",
    etiqueta_id: "",
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
    wardaConfig.value = {
      activa: false,
      cuenta_destino_id: "",
      tipo_redondeo: 1,
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
      wardaConfig.value = datos.wardaConfig;
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
      "Ingresa tu Cashback Histórico acumulado de otros meses (S/):",
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
          mostrarToast("Cashback histórico actualizado", "success");
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
      mostrarToast("No tienes saldo de Cashback disponible", "warning");
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
    };
    showModal.value = true;
  };

  const guardarConfiguracionWarda = async () => {
    if (wardaConfig.value.activa && !wardaConfig.value.cuenta_destino_id) {
      mostrarToast("Selecciona tu cuenta destino Warda", "warning");
      return;
    }
    cargando.value = true;
    try {
      await api.actualizarConfiguracionWarda(currentUserId.value, {
        cuenta_destino_id: wardaConfig.value.cuenta_destino_id
          ? parseInt(wardaConfig.value.cuenta_destino_id)
          : null,
        tipo_redondeo: parseInt(wardaConfig.value.tipo_redondeo),
        activa: wardaConfig.value.activa,
      });
      mostrarToast("Regla Warda actualizada", "success");
    } catch (e) {
      mostrarToast("Error al guardar Warda", "error");
    }
    cargando.value = false;
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
        mostrarToast("Falta completar datos", "warning");
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
        txTransf.value.monto = "";
        txTransf.value.descripcion = "";
        mostrarToast("Transferencia completada", "success");
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
      if (isRescateCashback.value) {
        if (
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

          if (
            tipoOperacion.value === "Egreso" &&
            wardaConfig.value.activa &&
            wardaConfig.value.cuenta_destino_id
          ) {
            const cuentaOrigen = cuentas.value.find(
              (c) => c.id_cuenta === parseInt(tx.value.cuenta_id),
            );
            if (cuentaOrigen && cuentaOrigen.tipo_cuenta === "Debito") {
              const r = parseInt(wardaConfig.value.tipo_redondeo);
              const montoRedondeado = Math.ceil(montoOriginal / r) * r;
              const vuelto = parseFloat(
                (montoRedondeado - montoOriginal).toFixed(2),
              );

              if (vuelto > 0) {
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
                    monto: vuelto,
                    cashback: 0,
                    fecha: tx.value.fecha,
                    descripcion: `Warda Vuelto (${tx.value.descripcion})`,
                  }),
                  api.guardarTransaccion({
                    cuenta_id: parseInt(wardaConfig.value.cuenta_destino_id),
                    categoria_id: catEntrada.id,
                    etiqueta_id: null,
                    monto: vuelto,
                    cashback: 0,
                    fecha: tx.value.fecha,
                    descripcion: `Warda Vuelto (${tx.value.descripcion})`,
                  }),
                ]);
              }
            }
          }
        }
        tx.value.monto = "";
        tx.value.descripcion = "";
        tx.value.cashback = "";
        tx.value.etiqueta_id = "";
      } catch (error) {
        mostrarToast("Error servidor", "error");
      }
    }
    showModal.value = false;
    await cargarDatos();
    cargando.value = false;
  };

  const abrirModalPagoFijo = (pagoAEditar) => {
    editandoPagoFijo.value = { estado: true, id: pagoAEditar.id };
    nuevoPagoFijo.value = { ...pagoAEditar };
    tab.value = "ajustes";
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
      cancelarEdicionPago();
      await cargarDatos();
    } catch (error) {}
    cargando.value = false;
  };

  // --- LÓGICA DE CUENTAS MODIFICADA PARA AJUSTAR EL SALDO DESEADO ---
  const abrirModalCuenta = (cuentaAEditar) => {
    editandoCuenta.value = {
      estado: true,
      id: cuentaAEditar.id_cuenta,
      saldo_inicial_orig: cuentaAEditar.saldo_inicial,
      saldo_actual_orig: cuentaAEditar.saldo_actual,
    };
    nuevaCuenta.value = {
      nombre: cuentaAEditar.nombre,
      tipo_cuenta: cuentaAEditar.tipo_cuenta,
      moneda: cuentaAEditar.moneda,
      saldo_inicial: Math.abs(cuentaAEditar.saldo_actual), // Se muestra el saldo ACTUAL al editar
      limite: cuentaAEditar.limite || "",
      dia_corte: cuentaAEditar.dia_corte || "",
      dia_pago: cuentaAEditar.dia_pago || "",
      pago_del_mes: cuentaAEditar.pago_del_mes || "",
    };
    tab.value = "ajustes";
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
    };
  };

  const guardarCuenta = async () => {
    if (!nuevaCuenta.value.nombre) return;
    cargando.value = true;
    try {
      let saldoDeseado = parseFloat(nuevaCuenta.value.saldo_inicial || 0);
      if (
        ["Credito", "Prestamo", "Pagar"].includes(nuevaCuenta.value.tipo_cuenta)
      ) {
        saldoDeseado = -Math.abs(saldoDeseado);
      }

      let saldoAEnviar = saldoDeseado;

      // Matemática Inversa: Si el usuario edita su cuenta y le pone que tiene "12.82",
      // la aplicación resta el historial completo para enviar el "Saldo Inicial" perfecto
      // de modo que cuando el backend sume la historia, el resultado sea exactamente "12.82".
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
        saldo_inicial: saldoAEnviar, // Se envía el inicial ajustado
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
      };

      if (editandoCuenta.value.estado) {
        await api.actualizarCuenta(editandoCuenta.value.id, payload);
        mostrarToast("Cuenta actualizada con éxito", "success");
      } else {
        await api.guardarCuenta(payload);
        mostrarToast("Cuenta registrada con éxito", "success");
      }
      cancelarEdicionCuenta();
      await cargarDatos();
    } catch (error) {
      mostrarToast("Error al guardar cuenta", "error");
    }
    cargando.value = false;
  };

  const abrirModalCategoria = (catAEditar) => {
    editandoCat.value = { estado: true, id: catAEditar.id };
    nuevaCat.value = {
      nombre: catAEditar.nombre,
      tipo_flujo: catAEditar.tipo_flujo,
    };
  };
  const cancelarEdicionCategoria = () => {
    editandoCat.value = { estado: false, id: null };
    nuevaCat.value = { nombre: "", tipo_flujo: "Egreso" };
  };
  const guardarCategoria = async () => {
    if (!nuevaCat.value.nombre) return;
    cargando.value = true;
    try {
      if (editandoCat.value.estado)
        await api.actualizarCategoria(editandoCat.value.id, nuevaCat.value);
      else await api.guardarCategoria(nuevaCat.value);
      cancelarEdicionCategoria();
      await cargarDatos();
    } catch (e) {}
    cargando.value = false;
  };

  const abrirModalEtiqueta = (etiqAEditar) => {
    editandoEtiq.value = { estado: true, id: etiqAEditar.id };
    nuevaEtiq.value = { nombre: etiqAEditar.nombre };
  };
  const cancelarEdicionEtiqueta = () => {
    editandoEtiq.value = { estado: false, id: null };
    nuevaEtiq.value = { nombre: "" };
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
      cancelarEdicionEtiqueta();
      await cargarDatos();
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
    wardaConfig,
    isRescateCashback,
    editandoTx,
    editandoPagoFijo,
    editandoCuenta,
    editandoCat,
    editandoEtiq,
    tx,
    txTransf,
    nuevaCat,
    nuevaEtiq,
    nuevaCuenta,
    nuevoPagoFijo,
    limpiarDatos,
    cargarDatos,
    abrirModalTransaccion,
    ejecutarOperacion,
    abrirModalPagoFijo,
    cancelarEdicionPago,
    guardarPagoFijo,
    abrirModalCuenta,
    cancelarEdicionCuenta,
    guardarCuenta,
    abrirModalCategoria,
    cancelarEdicionCategoria,
    guardarCategoria,
    abrirModalEtiqueta,
    cancelarEdicionEtiqueta,
    guardarEtiqueta,
    eliminarRegistro,
    editarCashbackInicial,
    prepararRescateCashback,
    guardarConfiguracionWarda,
  };
}
