// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Cálculos Matemáticos y Financieros

const { computed } = window.Vue;

export function useCalculations(data, ui) {
  const { cuentas, historial, pagosFijos, etiquetas, categorias } = data;
  const { tagSearch, tipoOperacion } = ui;

  const formatoMoneda = (monto, moneda) => {
    const simbolo = moneda === "USD" ? "$" : "S/";
    return `${simbolo} ${Math.abs(monto).toFixed(2)}`;
  };

  const categoriasFiltradas = computed(() =>
    categorias.value.filter(
      (c) =>
        c.tipo_flujo === tipoOperacion.value &&
        !c.nombre.includes("Transferencia"),
    ),
  );

  const analisisTag = computed(() => {
    if (!tagSearch.value)
      return {
        ingresos: 0,
        egresos: 0,
        balance: 0,
        nombre: "",
        operaciones: [],
      };

    const etiquetaIdSeleccionada = parseInt(tagSearch.value);
    const etiquetaObj = etiquetas.value.find(
      (e) => e.id === etiquetaIdSeleccionada,
    );
    const nombreEtiqueta = etiquetaObj ? etiquetaObj.nombre : "";

    const operaciones = historial.value.filter(
      (h) => h.etiqueta_id === etiquetaIdSeleccionada,
    );

    let ingresos = 0;
    let egresos = 0;

    operaciones.forEach((op) => {
      if (op.tipo_flujo === "Ingreso") ingresos += op.monto;
      if (op.tipo_flujo === "Egreso") egresos += op.monto;
    });

    return {
      ingresos,
      egresos,
      balance: ingresos - egresos,
      nombre: nombreEtiqueta,
      operaciones,
    };
  });

  const cuentasActivas = computed(() =>
    cuentas.value.filter((c) =>
      ["Debito", "Efectivo", "Ahorro"].includes(c.tipo_cuenta),
    ),
  );
  const cuentasPorCobrar = computed(() =>
    cuentas.value.filter((c) => c.tipo_cuenta === "Cobrar"),
  );
  const deudasActivas = computed(() =>
    cuentas.value.filter((c) =>
      ["Credito", "Prestamo", "Pagar"].includes(c.tipo_cuenta),
    ),
  );

  const pagosFijosIngresos = computed(() =>
    pagosFijos.value.filter((p) => p.tipo_flujo === "Ingreso"),
  );
  const pagosFijosEgresos = computed(() =>
    pagosFijos.value.filter((p) => p.tipo_flujo === "Egreso"),
  );

  const totalIngresosFijos = computed(() =>
    pagosFijosIngresos.value.reduce((a, b) => a + b.monto, 0),
  );
  const totalGastosFijos = computed(() =>
    pagosFijosEgresos.value.reduce((a, b) => a + b.monto, 0),
  );
  const flujoNetoMensual = computed(
    () => totalIngresosFijos.value - totalGastosFijos.value,
  );

  const saldosLiquidos = computed(() => {
    const saldos = { PEN: 0, USD: 0 };
    cuentasActivas.value
      .filter((c) => c.tipo_cuenta !== "Ahorro")
      .forEach((c) => {
        saldos[c.moneda || "PEN"] += c.saldo_actual;
      });
    return saldos;
  });

  const saldosAhorro = computed(() => {
    const saldos = { PEN: 0, USD: 0 };
    cuentasActivas.value
      .filter((c) => c.tipo_cuenta === "Ahorro")
      .forEach((c) => {
        saldos[c.moneda || "PEN"] += c.saldo_actual;
      });
    return saldos;
  });

  const diagnosticoDeuda = computed(() => {
    const liquidez = saldosLiquidos.value.PEN;
    const ahorro = saldosAhorro.value.PEN;
    const deuda = deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .reduce((acc, c) => acc + Math.abs(c.saldo_actual), 0);
    const ingresosProyectados = pagosFijosIngresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + p.monto, 0);
    const gastosProyectados = pagosFijosEgresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + p.monto, 0);

    const poderAdquisitivoLibre =
      liquidez + (ingresosProyectados - gastosProyectados);
    const balance = poderAdquisitivoLibre - deuda;

    let result = {
      liquidez,
      deuda,
      ingresosProyectados,
      poderAdquisitivoLibre,
      estado: "",
      mensaje: "",
      textColor: "",
      iconBg: "",
      borderColor: "",
      alertBoxClasses: "",
      porcentajeCobertura: 0,
      colorGrafico: "",
    };

    if (deuda === 0) {
      result.porcentajeCobertura = 100;
      result.estado = "Sin obligaciones activas";
      result.textColor = "text-emerald-600";
      result.iconBg = "bg-emerald-500";
      result.borderColor = "border-emerald-200";
      result.alertBoxClasses =
        "bg-emerald-50 border-emerald-200 text-emerald-800";
      result.colorGrafico = "#10b981";
      result.mensaje =
        "Excelente estado de solvencia. No existen pasivos registrados en Soles pendientes de pago.";
    } else {
      let cob = (poderAdquisitivoLibre / deuda) * 100;
      result.porcentajeCobertura = Math.round(Math.max(0, Math.min(cob, 100)));

      if (balance >= 0) {
        result.estado = "Superávit Proyectado";
        result.textColor = "text-emerald-600";
        result.iconBg = "bg-emerald-500";
        result.borderColor = "border-emerald-200";
        result.alertBoxClasses =
          "bg-emerald-50 border-emerald-200 text-emerald-800";
        result.colorGrafico = "#10b981";
        result.mensaje = `Tras cubrir las obligaciones de crédito y gastos fijos, existirá un excedente líquido de S/ ${balance.toFixed(2)}.`;
      } else if (balance + ahorro >= 0) {
        result.estado = "Alerta Amarilla";
        result.textColor = "text-amber-600";
        result.iconBg = "bg-amber-500";
        result.borderColor = "border-amber-200";
        result.alertBoxClasses = "bg-amber-50 border-amber-200 text-amber-800";
        result.colorGrafico = "#f59e0b";
        result.mensaje = `Déficit líquido proyectado de S/ ${Math.abs(balance).toFixed(2)}. Será necesario comprometer capital de la reserva de ahorros para evitar mora.`;
      } else {
        result.estado = "Insolvencia Crítica";
        result.textColor = "text-rose-600";
        result.iconBg = "bg-rose-500";
        result.borderColor = "border-rose-200";
        result.alertBoxClasses = "bg-rose-50 border-rose-200 text-rose-800";
        result.colorGrafico = "#f43f5e";
        result.mensaje = `El déficit supera la reserva total de ahorros en S/ ${Math.abs(balance + ahorro).toFixed(2)}. Se requiere reestructuración de deuda inmediata.`;
      }
    }
    return result;
  });

  return {
    formatoMoneda,
    categoriasFiltradas,
    analisisTag,
    cuentasActivas,
    cuentasPorCobrar,
    deudasActivas,
    pagosFijosIngresos,
    pagosFijosEgresos,
    totalIngresosFijos,
    totalGastosFijos,
    flujoNetoMensual,
    saldosLiquidos,
    saldosAhorro,
    diagnosticoDeuda,
  };
}
