// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Cálculos Matemáticos (EFECTO CASCADA Y PROYECCIONES)

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

  // NUEVO CÁLCULO: Crédito Disponible en Tarjetas
  const creditoDisponible = computed(() => {
    let disponiblePEN = 0;
    let disponibleUSD = 0;
    deudasActivas.value
      .filter((c) => c.tipo_cuenta === "Credito")
      .forEach((c) => {
        const disp = (c.limite || 0) - Math.abs(c.saldo_actual);
        if (c.moneda === "PEN") disponiblePEN += Math.max(0, disp);
        else disponibleUSD += Math.max(0, disp);
      });
    return { PEN: disponiblePEN, USD: disponibleUSD };
  });

  // NUEVO CÁLCULO: Proyección de Dinero al próximo mes
  const proyeccionProximoMes = computed(() => {
    const liquidez = saldosLiquidos.value.PEN;
    const ahorro = saldosAhorro.value.PEN;
    const ingresosProyectados = pagosFijosIngresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + p.monto, 0);
    const gastosProyectados = pagosFijosEgresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + p.monto, 0);

    let cuotasTarjetas = 0;
    let cuotasOtros = 0;
    deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .forEach((c) => {
        const pagoMes = parseFloat(c.pago_del_mes) || 0;
        if (c.tipo_cuenta === "Credito") cuotasTarjetas += pagoMes;
        else cuotasOtros += pagoMes;
      });

    const cashbackDisponible = bolsaCashback.value.disponible || 0;
    const pagoTarjetasNeto = Math.max(0, cuotasTarjetas - cashbackDisponible);
    const obligacionesNetasMes = pagoTarjetasNeto + cuotasOtros;

    return (
      liquidez +
      ahorro +
      ingresosProyectados -
      (gastosProyectados + obligacionesNetasMes)
    );
  });

  // TERMÓMETRO DE DEUDA
  const diagnosticoDeuda = computed(() => {
    const liquidez = saldosLiquidos.value.PEN;
    const ahorro = saldosAhorro.value.PEN;
    const ingresosProyectados = pagosFijosIngresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + p.monto, 0);
    const gastosProyectados = pagosFijosEgresos.value
      .filter((p) => p.moneda === "PEN")
      .reduce((acc, p) => acc + p.monto, 0);

    const poderAdquisitivoLibre =
      liquidez + ingresosProyectados - gastosProyectados;

    let cuotasTarjetas = 0;
    let cuotasOtros = 0;
    let deudaTotalAbsoluta = 0;

    deudasActivas.value
      .filter((c) => c.moneda === "PEN")
      .forEach((c) => {
        deudaTotalAbsoluta += Math.abs(c.saldo_actual);
        const pagoMes = parseFloat(c.pago_del_mes) || 0;
        if (c.tipo_cuenta === "Credito") cuotasTarjetas += pagoMes;
        else cuotasOtros += pagoMes;
      });

    const cashbackDisponible = bolsaCashback.value.disponible || 0;
    const pagoTarjetasNeto = Math.max(0, cuotasTarjetas - cashbackDisponible);
    const obligacionesNetasMes = pagoTarjetasNeto + cuotasOtros;

    const balanceNetoMes = poderAdquisitivoLibre - obligacionesNetasMes;

    let result = {
      liquidez,
      ingresosProyectados,
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
      result.porcentajeCobertura = 100;
      result.estado = "Mes Despejado";
      result.textColor = "text-emerald-600";
      result.iconBg = "bg-emerald-500";
      result.borderColor = "border-emerald-200";
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
        result.borderColor = "border-emerald-200";
        result.alertBoxClasses =
          "bg-emerald-50 border-emerald-200 text-emerald-800";
        result.colorGrafico = "#10b981";
        result.mensaje = `Tras pagar las cuotas de este mes, te sobrarán S/ ${balanceNetoMes.toFixed(2)} libres.`;
      } else if (balanceNetoMes + ahorro >= 0) {
        result.estado = "Alerta Amarilla";
        result.textColor = "text-amber-600";
        result.iconBg = "bg-amber-500";
        result.borderColor = "border-amber-200";
        result.alertBoxClasses = "bg-amber-50 border-amber-200 text-amber-800";
        result.colorGrafico = "#f59e0b";
        result.mensaje = `Déficit de S/ ${Math.abs(balanceNetoMes).toFixed(2)} para cubrir tus cuotas. Tendrás que retirar dinero de tus Ahorros.`;
      } else {
        result.estado = "Riesgo de Mora";
        result.textColor = "text-rose-600";
        result.iconBg = "bg-rose-500";
        result.borderColor = "border-rose-200";
        result.alertBoxClasses = "bg-rose-50 border-rose-200 text-rose-800";
        result.colorGrafico = "#f43f5e";
        result.mensaje = `Tus ahorros no alcanzan. Te faltan S/ ${Math.abs(balanceNetoMes + ahorro).toFixed(2)} para cubrir las cuotas de este mes.`;
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
    creditoDisponible,
    proyeccionProximoMes, // Expuestas al frontend
  };
}
