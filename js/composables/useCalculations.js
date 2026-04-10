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

  const formatoMoneda = (monto, moneda) => {
    const simbolo = moneda === "USD" ? "$" : "S/";
    return `${simbolo} ${Number(Math.abs(monto || 0)).toFixed(2)}`;
  };

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
    if (cuenta.tipo_cuenta === "Prestamo") return "bg-bank-bbva";
    return "bg-card-debt";
  };

  const getClasePuntoEstado = (cuenta) => "bg-emerald-400";

  const categoriasFiltradas = computed(() =>
    categorias.value.filter(
      (c) =>
        c.tipo_flujo === tipoOperacion.value &&
        !String(c.nombre || "").includes("Transferencia"),
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
    const operaciones = historial.value.filter(
      (h) => h.etiqueta_id === etiquetaIdSeleccionada,
    );

    let ingresos = 0;
    let egresos = 0;
    operaciones.forEach((op) => {
      if (op.tipo_flujo === "Ingreso") ingresos += op.monto || 0;
      if (op.tipo_flujo === "Egreso") egresos += op.monto || 0;
    });
    return {
      ingresos,
      egresos,
      balance: ingresos - egresos,
      nombre: etiquetaObj ? etiquetaObj.nombre : "",
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
    pagosFijosIngresos.value.reduce((a, b) => a + (b.monto || 0), 0),
  );
  const totalGastosFijos = computed(() =>
    pagosFijosEgresos.value.reduce((a, b) => a + (b.monto || 0), 0),
  );
  const flujoNetoMensual = computed(
    () => totalIngresosFijos.value - totalGastosFijos.value,
  );

  const saldosLiquidos = computed(() => {
    const saldos = { PEN: 0, USD: 0 };
    cuentasActivas.value
      .filter((c) => c.tipo_cuenta !== "Ahorro")
      .forEach((c) => {
        if (c.moneda) saldos[c.moneda] += c.saldo_actual || 0;
      });
    return saldos;
  });

  const saldosAhorro = computed(() => {
    const saldos = { PEN: 0, USD: 0 };
    cuentasActivas.value
      .filter((c) => c.tipo_cuenta === "Ahorro")
      .forEach((c) => {
        if (c.moneda) saldos[c.moneda] += c.saldo_actual || 0;
      });
    return saldos;
  });

  const creditoDisponible = computed(() => {
    let disponible = 0;
    deudasActivas.value
      .filter((c) => c.tipo_cuenta === "Credito" && c.moneda === "PEN")
      .forEach((c) => {
        disponible += (c.limite || 0) - Math.abs(c.saldo_actual || 0);
      });
    return { PEN: disponible };
  });

  const proyeccionProximoMes = computed(() => {
    const liquidez = saldosLiquidos.value.PEN || 0;
    const ahorro = saldosAhorro.value.PEN || 0;
    const ingresosProyectados = pagosFijosIngresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + (p.monto || 0), 0);
    const gastosProyectados = pagosFijosEgresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + (p.monto || 0), 0);

    let cuotasTarjetas = 0;
    let cuotasOtros = 0;
    deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .forEach((c) => {
        const pagoMes = parseFloat(c.pago_del_mes) || 0;
        if (c.tipo_cuenta === "Credito") cuotasTarjetas += pagoMes;
        else cuotasOtros += pagoMes;
      });

    const cashbackDisponible = bolsaCashback.value?.disponible || 0;
    const pagoTarjetasNeto = Math.max(0, cuotasTarjetas - cashbackDisponible);
    const obligacionesNetasMes = pagoTarjetasNeto + cuotasOtros;
    return (
      liquidez +
      ahorro +
      ingresosProyectados -
      (gastosProyectados + obligacionesNetasMes)
    );
  });

  const diagnosticoDeuda = computed(() => {
    const liquidez = saldosLiquidos.value.PEN || 0;
    const ahorro = saldosAhorro.value.PEN || 0;
    const ingresosProyectados = pagosFijosIngresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + (p.monto || 0), 0);
    const gastosProyectados = pagosFijosEgresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + (p.monto || 0), 0);
    const poderAdquisitivoLibre =
      liquidez + ingresosProyectados - gastosProyectados;

    let cuotasTarjetas = 0;
    let cuotasOtros = 0;
    let deudaTotalAbsoluta = 0;
    deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .forEach((c) => {
        deudaTotalAbsoluta += Math.abs(c.saldo_actual || 0);
        const pagoMes = parseFloat(c.pago_del_mes) || 0;
        if (c.tipo_cuenta === "Credito") cuotasTarjetas += pagoMes;
        else cuotasOtros += pagoMes;
      });

    const cashbackDisponible = bolsaCashback.value?.disponible || 0;
    const pagoTarjetasNeto = Math.max(0, cuotasTarjetas - cashbackDisponible);
    const obligacionesNetasMes = pagoTarjetasNeto + cuotasOtros;
    const balanceNetoMes = poderAdquisitivoLibre - obligacionesNetasMes;

    let result = {
      poderAdquisitivoLibre,
      obligacionesNetasMes,
      cuotasOriginales: cuotasTarjetas + cuotasOtros,
      deudaTotalAbsoluta,
      cashbackAplicado: Math.min(cuotasTarjetas, cashbackDisponible),
      estado: "",
      mensaje: "",
      textColor: "",
      iconBg: "",
      borderColor: "",
      alertBoxClasses: "",
      porcentajeCobertura: 0,
      colorGrafico: "",
    };

    if (obligacionesNetasMes === 0) {
      result.estado = "Mes Despejado";
      result.textColor = "text-emerald-600";
      result.iconBg = "bg-emerald-500";
      result.alertBoxClasses =
        "bg-emerald-50 border-emerald-200 text-emerald-800";
      result.colorGrafico = "#10b981";
      result.mensaje =
        "Excelente. No tienes cuotas programadas para pagar este mes.";
    } else {
      let cob = (poderAdquisitivoLibre / obligacionesNetasMes) * 100;
      result.porcentajeCobertura = Math.round(Math.max(0, Math.min(cob, 100)));

      if (balanceNetoMes >= 0) {
        result.estado = "Cobertura Segura";
        result.textColor = "text-emerald-600";
        result.iconBg = "bg-emerald-500";
        result.alertBoxClasses =
          "bg-emerald-50 border-emerald-200 text-emerald-800";
        result.colorGrafico = "#10b981";
        result.mensaje = `Tras pagar las cuotas de este mes, te sobrarán S/ ${balanceNetoMes.toFixed(2)} libres.`;
      } else if (balanceNetoMes + ahorro >= 0) {
        result.estado = "Alerta Amarilla";
        result.textColor = "text-amber-600";
        result.iconBg = "bg-amber-500";
        result.alertBoxClasses = "bg-amber-50 border-amber-200 text-amber-800";
        result.colorGrafico = "#f59e0b";
        result.mensaje = `Déficit de S/ ${Math.abs(balanceNetoMes).toFixed(2)} para cubrir tus cuotas. Tendrás que retirar dinero de tus Ahorros.`;
      } else {
        result.estado = "Riesgo de Mora";
        result.textColor = "text-rose-600";
        result.iconBg = "bg-rose-500";
        result.alertBoxClasses = "bg-rose-50 border-rose-200 text-rose-800";
        result.colorGrafico = "#f43f5e";
        result.mensaje = `Tus ahorros no alcanzan. Te faltan S/ ${Math.abs(balanceNetoMes + ahorro).toFixed(2)} para cubrir las cuotas.`;
      }
    }
    return result;
  });

  const datosPatrimonio = computed(() => {
    const liquidez = saldosLiquidos.value.PEN || 0;
    const ahorro = saldosAhorro.value.PEN || 0;
    const deudas = deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .reduce((a, b) => a + Math.abs(b.saldo_actual), 0);
    let currentNW = liquidez + ahorro - deudas;

    const labels = [];
    const series = [];
    const hoy = new Date();
    let nwTracker = currentNW;

    for (let i = 0; i < 30; i++) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      labels.unshift(`${d.getDate()}/${d.getMonth() + 1}`);
      series.unshift(Number(nwTracker.toFixed(2)));

      const txsOfDay = historial.value.filter((h) => h.fecha === dateStr);
      txsOfDay.forEach((tx) => {
        if (tx.tipo_flujo === "Egreso") nwTracker += tx.monto;
        if (tx.tipo_flujo === "Ingreso") nwTracker -= tx.monto;
      });
    }
    return { labels, series };
  });

  const datosDiversificacion = computed(() => {
    const labels = [];
    const series = [];
    cuentasActivas.value.forEach((c) => {
      if (c.saldo_actual > 0 && c.moneda === "PEN") {
        labels.push(c.nombre);
        series.push(Number(c.saldo_actual.toFixed(2)));
      }
    });
    return { labels, series };
  });

  const datosCalendario = computed(() => {
    const dias = Array.from({ length: 31 }, (_, i) => i + 1);
    const montos = new Array(31).fill(0);
    deudasActivas.value.forEach((d) => {
      if (
        d.dia_pago &&
        d.dia_pago >= 1 &&
        d.dia_pago <= 31 &&
        d.moneda === "PEN"
      )
        montos[d.dia_pago - 1] += parseFloat(d.pago_del_mes) || 0;
    });
    pagosFijosEgresos.value.forEach((p) => {
      if (
        p.dia_cobro &&
        p.dia_cobro >= 1 &&
        p.dia_cobro <= 31 &&
        p.moneda === "PEN"
      )
        montos[p.dia_cobro - 1] += parseFloat(p.monto) || 0;
    });
    return {
      categorias: dias.map((d) => `${d}`),
      series: montos.map((m) => Number(m.toFixed(2))),
    };
  });

  // LOGICA RECUPERADA PARA LA PESTAÑA "ANALÍTICA"
  const datosGraficoFlujo = computed(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    let ingresosMes = 0;
    let egresosMes = 0;
    historial.value.forEach((tx) => {
      const fechaTx = new Date(tx.fecha + "T00:00:00");
      if (
        fechaTx.getMonth() === mesActual &&
        fechaTx.getFullYear() === añoActual
      ) {
        if (tx.tipo_flujo === "Ingreso") ingresosMes += tx.monto;
        else if (tx.tipo_flujo === "Egreso") egresosMes += tx.monto;
      }
    });
    return { ingresos: ingresosMes, egresos: egresosMes };
  });

  const datosGraficoCat = computed(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    const gastosPorCat = {};
    historial.value.forEach((tx) => {
      const fechaTx = new Date(tx.fecha + "T00:00:00");
      if (
        tx.tipo_flujo === "Egreso" &&
        fechaTx.getMonth() === mesActual &&
        fechaTx.getFullYear() === añoActual
      ) {
        const catNombre = tx.categoria_nombre || "Otros";
        if (!gastosPorCat[catNombre]) gastosPorCat[catNombre] = 0;
        gastosPorCat[catNombre] += tx.monto;
      }
    });
    const labels = Object.keys(gastosPorCat);
    const series = Object.values(gastosPorCat).map((v) => Number(v.toFixed(2)));
    return { labels, series };
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
    getClaseColorBanco,
    getClaseColorPasivo,
    getClasePuntoEstado,
    datosPatrimonio,
    datosDiversificacion,
    datosCalendario,
    datosGraficoFlujo,
    datosGraficoCat,
  };
}
