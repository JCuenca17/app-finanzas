// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Lógica de Negocio y Cálculos Financieros

const { computed } = window.Vue;

export function useCalculations(data, ui) {
  const {
    cuentas,
    historial,
    pagosFijos,
    etiquetas,
    categorias,
    bolsaCashback,
  } = data;
  const { tagSearch, tipoOperacion } = ui;

  // Utilidades
  const formatoMoneda = (monto, moneda) => {
    const simbolo = moneda === "USD" ? "$" : "S/";
    // Usamos Math.abs para mostrar deudas en positivo visualmente si es necesario,
    // pero aquí lo mantenemos tal cual viene de BD (deudas en negativo)
    return `${simbolo} ${monto.toFixed(2)}`;
  };

  // LOGICA VISUAL PARA PREMIUM CARDS (NUEVO)
  const getClaseColorBanco = (banco) => {
    const clases = {
      BCP: "bg-bank-bcp",
      BBVA: "bg-bank-bbva",
      Interbank: "bg-bank-interbank",
      Scotiabank: "bg-bank-scotiabank",
      Otro: "bg-card-neutral",
    };
    return clases[banco] || clases["Otro"];
  };

  const getClaseColorPasivo = (cuenta) => {
    if (cuenta.tipo_cuenta === "Credito")
      return getClaseColorBanco(cuenta.banco);
    if (cuenta.tipo_cuenta === "Prestamo") return "bg-bank-bbva"; // Por defecto BBVA para prestamos por color
    return "bg-card-debt"; // Rojo profundo para pagar a terceros
  };

  const getClasePuntoEstado = (cuenta) => {
    // Si la cuota del mes es alta respecto a ingresos, podría ser ámbar, etc.
    // Por ahora, verde=activo, rojo=vencido (futuro)
    return "bg-emerald-400";
  };

  // Filtrado de categorías para el modal según operación actual
  const categoriasFiltradas = computed(() => {
    return categorias.value.filter(
      (c) =>
        c.tipo_flujo === tipoOperacion.value &&
        !c.nombre.includes("Transferencia"),
    );
  });

  // Análisis relacional por Etiqueta (Contacto)
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
      nombre: etiquetaObj ? etiquetaObj.nombre : "",
      operaciones,
    };
  });

  // Segregación de Cuentas (NUEVA LÓGICA DE UNIFICACIÓN VISUAL)
  // Activos líquidos y ahorros
  const cuentasActivas = computed(() =>
    cuentas.value.filter((c) =>
      ["Debito", "Efectivo", "Ahorro"].includes(c.tipo_cuenta),
    ),
  );
  // Cuentas por cobrar (Me deben)
  const cuentasPorCobrar = computed(() =>
    cuentas.value.filter((c) => c.tipo_cuenta === "Cobrar"),
  );
  // Deudas (Pasivos)
  const deudasActivas = computed(() =>
    cuentas.value.filter((c) =>
      ["Credito", "Prestamo", "Pagar"].includes(c.tipo_cuenta),
    ),
  );

  // Proyecciones (Pagos Fijos)
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

  // Saldos Consolidados por Moneda (Solo Soles para simplificar dashboards principales)
  const saldosLiquidos = computed(() => {
    const saldos = { PEN: 0, USD: 0 };
    // No incluimos ahorros ni cuentas por cobrar en liquidez inmediata
    cuentasActivas.value
      .filter((c) => c.tipo_cuenta !== "Ahorro")
      .forEach((c) => {
        saldos[c.moneda] += c.saldo_actual;
      });
    return saldos;
  });

  const saldosAhorro = computed(() => {
    const saldos = { PEN: 0, USD: 0 };
    cuentasActivas.value
      .filter((c) => c.tipo_cuenta === "Ahorro")
      .forEach((c) => {
        saldos[c.moneda] += c.saldo_actual;
      });
    return saldos;
  });

  // Crédito Disponible (PEN)
  const creditoDisponible = computed(() => {
    let disponible = 0;
    deudasActivas.value
      .filter((c) => c.tipo_cuenta === "Credito" && c.moneda === "PEN")
      .forEach((c) => {
        disponible += c.limite - Math.abs(c.saldo_actual);
      });
    return { PEN: disponible };
  });

  // Proyección para el próximo mes (Soles)
  const proyeccionProximoMes = computed(() => {
    const liquidez = saldosLiquidos.value.PEN;
    const ahorro = saldosAhorro.value.PEN;
    const ingresosProyectados = totalIngresosFijos.value; // Asumimos Soles para simplificar
    const gastosProyectados = totalGastosFijos.value;

    // Suma de cuotas de deudas (ya vienen en positivo pago_del_mes)
    const cuotasDeudas = deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .reduce((a, b) => a + b.pago_del_mes, 0);

    return (
      liquidez +
      ahorro +
      ingresosProyectados -
      (gastosProyectados + cuotasDeudas)
    );
  });

  // Diagnóstico de Salud de Deuda
  const diagnosticoDeuda = computed(() => {
    const ingresosProyectados = totalIngresosFijos.value;
    const gastosProyectados = totalGastosFijos.value;
    const poderAdquisitivoLibre = ingresosProyectados - gastosProyectados;

    // Cuotas del mes (Asumimos PEN para termómetro)
    const obligacionesMes = deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .reduce((a, b) => a + b.pago_del_mes, 0);
    const deudaTotalPEN = deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .reduce((a, b) => a + Math.abs(b.saldo_actual), 0);

    let result = {
      poderAdquisitivoLibre,
      obligacionesMes,
      deudaTotalPEN,
      estado: "Saludable",
      mensaje: "",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-500",
      borderColor: "border-emerald-200",
      alertBoxClasses: "bg-emerald-50 border-emerald-200 text-emerald-800",
      colorGrafico: "#10b981",
    };

    if (obligacionesMes === 0) {
      result.mensaje =
        "No tienes cuotas programadas para este mes. ¡Excelente!";
      return result;
    }

    const ratio = poderAdquisitivoLibre / obligacionesMes;

    if (ratio >= 1.5) {
      result.mensaje = `Tus ingresos libres cubren holgadamente las cuotas del mes (Ratio: ${ratio.toFixed(1)}x).`;
    } else if (ratio >= 1) {
      result.estado = "Ajustado";
      result.mensaje =
        "Cubres las cuotas, pero te queda poco margen para imprevistos.";
      result.textColor = "text-amber-600";
      result.iconBg = "bg-amber-500";
      result.colorGrafico = "#f59e0b";
      result.alertBoxClasses = "bg-amber-50 border-amber-200 text-amber-800";
    } else {
      result.estado = "Riesgo";
      result.mensaje =
        "Tus gastos fijos y cuotas superan tus ingresos proyectados. Necesitas usar ahorros o refinanciar.";
      result.textColor = "text-rose-600";
      result.iconBg = "bg-rose-500";
      result.colorGrafico = "#f43f5e";
      result.alertBoxClasses = "bg-rose-50 border-rose-200 text-rose-800";
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
    creditoDisponible,
    proyeccionProximoMes,
    diagnosticoDeuda,
    // Nuevas utilidades visuales
    getClaseColorBanco,
    getClaseColorPasivo,
    getClasePuntoEstado,
  };
}
