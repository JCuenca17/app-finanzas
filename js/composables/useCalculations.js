// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

const { computed } = window.Vue;

export function useCalculations(data, ui) {
  const {
    cuentas,
    historial,
    pagosFijos,
    etiquetas,
    categorias,
    bolsaCashback,
    fechaGlobal,
  } = data;
  const { tagSearch, tipoOperacion } = ui;

  const formatoMoneda = (monto, moneda) => {
    const simbolo = moneda === "USD" ? "$" : "S/";
    return `${simbolo} ${Number(Math.abs(monto || 0)).toFixed(2)}`;
  };

  // NUEVA FUNCIÓN PARA ACORTAR LA FECHA (Ej: "ABR 2026")
  const formatoMes = (yyyyMM) => {
    if (!yyyyMM) return "";
    const [y, m] = yyyyMM.split("-");
    const meses = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ];
    return `${meses[parseInt(m) - 1]} ${y}`;
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

  const anioGlobal = computed(() => parseInt(fechaGlobal.value.split("-")[0]));
  const mesGlobal = computed(
    () => parseInt(fechaGlobal.value.split("-")[1]) - 1,
  );

  const historialFiltrado = computed(() => {
    return historial.value.filter((tx) => {
      const f = new Date(tx.fecha + "T00:00:00");
      return (
        f.getFullYear() === anioGlobal.value && f.getMonth() === mesGlobal.value
      );
    });
  });

  const cuentasConSaldoHistorico = computed(() => {
    const hoy = new Date();
    const esMesActual =
      anioGlobal.value === hoy.getFullYear() &&
      mesGlobal.value === hoy.getMonth();

    return cuentas.value.map((c) => {
      if (esMesActual) return { ...c };

      let saldoRevertido = c.saldo_actual;
      historial.value.forEach((tx) => {
        const f = new Date(tx.fecha + "T00:00:00");
        if (
          f.getFullYear() > anioGlobal.value ||
          (f.getFullYear() === anioGlobal.value &&
            f.getMonth() > mesGlobal.value)
        ) {
          if (tx.cuenta_id === c.id_cuenta) {
            if (tx.tipo_flujo === "Ingreso") saldoRevertido -= tx.monto || 0;
            if (tx.tipo_flujo === "Egreso") saldoRevertido += tx.monto || 0;
          }
        }
      });
      return { ...c, saldo_actual: saldoRevertido };
    });
  });

  const categoriasFiltradas = computed(() =>
    categorias.value.filter(
      (c) =>
        c.tipo_flujo === tipoOperacion.value &&
        !String(c.nombre || "").includes("Transferencia"),
    ),
  );

  const cuentasActivas = computed(() =>
    cuentasConSaldoHistorico.value.filter((c) =>
      ["Debito", "Efectivo", "Ahorro"].includes(c.tipo_cuenta),
    ),
  );
  const cuentasPorCobrar = computed(() =>
    cuentasConSaldoHistorico.value.filter((c) => c.tipo_cuenta === "Cobrar"),
  );
  const deudasActivas = computed(() =>
    cuentasConSaldoHistorico.value.filter((c) =>
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

  const datosGraficoCat = computed(() => {
    const gastosPorCat = {};
    historialFiltrado.value.forEach((tx) => {
      const esTransferencia = String(tx.categoria_nombre || "")
        .toLowerCase()
        .includes("transferencia");
      if (tx.tipo_flujo === "Egreso" && !esTransferencia) {
        const catNombre = tx.categoria_nombre || "Otros";
        if (!gastosPorCat[catNombre]) gastosPorCat[catNombre] = 0;
        gastosPorCat[catNombre] += tx.monto || 0;
      }
    });
    return {
      labels: Object.keys(gastosPorCat),
      series: Object.values(gastosPorCat).map((v) => Number(v.toFixed(2))),
    };
  });

  const datosGraficoContacto = computed(() => {
    let totalEgresos = 0;
    let egresosContacto = 0;
    const idContacto = tagSearch.value ? parseInt(tagSearch.value) : null;
    const etiquetaObj = etiquetas.value.find((e) => e.id === idContacto);
    const nombreContacto = etiquetaObj ? etiquetaObj.nombre : "Seleccione";

    historialFiltrado.value.forEach((tx) => {
      const esTransferencia = String(tx.categoria_nombre || "")
        .toLowerCase()
        .includes("transferencia");
      if (tx.tipo_flujo === "Egreso" && !esTransferencia) {
        totalEgresos += tx.monto || 0;
        if (idContacto && tx.etiqueta_id === idContacto)
          egresosContacto += tx.monto || 0;
      }
    });

    const otrosGastos = Math.max(0, totalEgresos - egresosContacto);
    return {
      hasData: totalEgresos > 0,
      labels: idContacto ? [`Con @${nombreContacto}`, "Otros Gastos"] : [],
      series: idContacto
        ? [Number(egresosContacto.toFixed(2)), Number(otrosGastos.toFixed(2))]
        : [],
    };
  });

  return {
    formatoMoneda,
    formatoMes,
    categoriasFiltradas,
    historialFiltrado,
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
    datosGraficoCat,
    datosGraficoContacto,
  };
}
