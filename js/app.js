// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Lógica visual y estado de la aplicación (Vue 3)

import { api } from "./api.js";

const { createApp, ref, computed, onMounted, nextTick } = Vue;

createApp({
  setup() {
    // --- CREDENCIALES SUPABASE ---
    const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
    const SUPABASE_KEY = "TU_SUPABASE_PUBLISHABLE_KEY";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    // -----------------------------

    const cargando = ref(true);
    const isLoggedIn = ref(false);
    const currentUserId = ref("");
    const tab = ref("inicio");
    const showModal = ref(false);
    const tipoOperacion = ref("Egreso");

    const cuentas = ref([]);
    const categorias = ref([]);
    const historial = ref([]);
    const pagosFijos = ref([]);

    // Referencias para Gráficos
    const chartCatRef = ref(null);
    const chartFlujoRef = ref(null);
    const chartDeudaRef = ref(null); // Referencia para el velocímetro
    let chartCatInstance = null;
    let chartFlujoInstance = null;
    let chartDeudaInstance = null; // Instancia del velocímetro

    const tx = ref({
      monto: "",
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
      cuenta_id: "",
      categoria_id: "",
    });
    const txTransf = ref({
      origen_id: "",
      destino_id: "",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
      descripcion: "",
    });

    const nuevaCat = ref({ nombre: "", tipo_flujo: "Egreso" });
    const nuevaCuenta = ref({
      nombre: "",
      tipo_cuenta: "Debito",
      moneda: "PEN",
      saldo_inicial: "",
      limite: "",
      dia_corte: "",
      dia_pago: "",
    });
    const nuevoPagoFijo = ref({
      nombre: "",
      monto: "",
      tipo_flujo: "Egreso",
      dia_cobro: "",
      moneda: "PEN",
    });

    const tituloCabecera = computed(() => {
      const titulos = {
        inicio: "Dashboard",
        analitica: "Análisis Financiero",
        cuentas: "Cuentas y Deudas",
        historial: "Historial Completo",
        pagos: "Proyección Mensual",
        mas: "Menú",
        ajustes: "Ajustes de Sistema",
      };
      return titulos[tab.value] || "FinancePro";
    });

    const saldosLiquidos = computed(() => {
      const saldos = { PEN: 0, USD: 0 };
      cuentas.value
        .filter(
          (c) => c.tipo_cuenta === "Debito" || c.tipo_cuenta === "Efectivo",
        )
        .forEach((c) => {
          saldos[c.moneda || "PEN"] += c.saldo_actual;
        });
      return saldos;
    });

    const saldosAhorro = computed(() => {
      const saldos = { PEN: 0, USD: 0 };
      cuentas.value
        .filter((c) => c.tipo_cuenta === "Ahorro")
        .forEach((c) => {
          saldos[c.moneda || "PEN"] += c.saldo_actual;
        });
      return saldos;
    });

    // Algoritmo de Diagnóstico de Deuda
    const diagnosticoDeuda = computed(() => {
      const liquidez = saldosLiquidos.value.PEN;
      const ahorro = saldosAhorro.value.PEN;

      const deuda = cuentas.value
        .filter((c) => c.tipo_cuenta === "Credito" && c.moneda === "PEN")
        .reduce((acc, c) => acc + Math.abs(c.saldo_actual), 0);
      const ingresosProyectados = pagosFijos.value
        .filter((p) => p.tipo_flujo === "Ingreso" && p.moneda === "PEN")
        .reduce((acc, p) => acc + p.monto, 0);

      const poderAdquisitivo = liquidez + ingresosProyectados;
      const balance = poderAdquisitivo - deuda;

      let result = {
        liquidez,
        deuda,
        ingresosProyectados,
        estado: "",
        mensaje: "",
        textColor: "",
        iconBg: "",
        borderColor: "",
        alertBoxClasses: "",
        porcentajeCobertura: 0,
        colorGrafico: "",
      };

      // Calcular porcentaje para el gráfico (Máximo 100%)
      if (deuda === 0) {
        result.porcentajeCobertura = 100;
      } else {
        let cob = (poderAdquisitivo / deuda) * 100;
        if (cob > 100) cob = 100;
        result.porcentajeCobertura = Math.round(cob);
      }

      if (deuda === 0) {
        result.estado = "Sin deudas";
        result.textColor = "text-emerald-600";
        result.iconBg = "bg-emerald-500";
        result.borderColor = "border-emerald-200";
        result.alertBoxClasses =
          "bg-emerald-50 text-emerald-800 border-emerald-200";
        result.colorGrafico = "#10b981";
        result.mensaje =
          "No tienes deudas de tarjeta de crédito activas en Soles.";
      } else if (balance >= 0) {
        result.estado = "Controlado";
        result.textColor = "text-emerald-600";
        result.iconBg = "bg-emerald-500";
        result.borderColor = "border-emerald-200";
        result.alertBoxClasses =
          "bg-emerald-50 text-emerald-800 border-emerald-200";
        result.colorGrafico = "#10b981";
        result.mensaje = `Tienes liquidez e ingresos futuros suficientes. Te sobrarán S/ ${balance.toFixed(2)}.`;
      } else if (balance + ahorro >= 0) {
        result.estado = "Alerta Amarilla";
        result.textColor = "text-amber-600";
        result.iconBg = "bg-amber-500";
        result.borderColor = "border-amber-200";
        result.alertBoxClasses = "bg-amber-50 text-amber-800 border-amber-200";
        result.colorGrafico = "#f59e0b";
        result.mensaje = `Tu liquidez no alcanza. Te faltan S/ ${Math.abs(balance).toFixed(2)}. Tendrás que usar tus ahorros.`;
      } else {
        result.estado = "Peligro Constante";
        result.textColor = "text-rose-600";
        result.iconBg = "bg-rose-500";
        result.borderColor = "border-rose-200";
        result.alertBoxClasses = "bg-rose-50 text-rose-800 border-rose-200";
        result.colorGrafico = "#f43f5e";
        result.mensaje = `Aún rompiendo tus ahorros, te faltarán S/ ${Math.abs(balance + ahorro).toFixed(2)} para cubrir la tarjeta.`;
      }
      return result;
    });

    const categoriasFiltradas = computed(() => {
      return categorias.value.filter(
        (c) =>
          c.tipo_flujo === tipoOperacion.value &&
          !c.nombre.includes("Transferencia"),
      );
    });

    const formatoMoneda = (monto, moneda) => {
      const simbolo = moneda === "USD" ? "$" : "S/";
      return `${simbolo} ${Math.abs(monto).toFixed(2)}`;
    };

    const renderizarGraficosAnalitica = () => {
      if (chartCatInstance) {
        chartCatInstance.destroy();
        chartCatInstance = null;
      }
      if (chartFlujoInstance) {
        chartFlujoInstance.destroy();
        chartFlujoInstance = null;
      }

      // 1. Gráfico Anillo (Categorías)
      if (chartCatRef.value) {
        const egresos = historial.value.filter(
          (h) =>
            h.tipo_flujo === "Egreso" &&
            !h.categoria_nombre.includes("Transferencia"),
        );
        const datosAgrupados = {};
        egresos.forEach((e) => {
          if (!datosAgrupados[e.categoria_nombre])
            datosAgrupados[e.categoria_nombre] = 0;
          datosAgrupados[e.categoria_nombre] += e.monto;
        });

        if (Object.keys(datosAgrupados).length > 0) {
          const optionsCat = {
            series: Object.values(datosAgrupados),
            labels: Object.keys(datosAgrupados),
            chart: {
              type: "donut",
              height: "100%",
              width: "100%",
              fontFamily: "inherit",
              background: "transparent",
            },
            plotOptions: {
              pie: {
                donut: {
                  size: "70%",
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 600,
                    },
                    value: {
                      show: true,
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#0f172a",
                      formatter: function (val) {
                        return "S/ " + parseFloat(val).toFixed(2);
                      },
                    },
                    total: {
                      show: true,
                      label: "Total Egresos",
                      color: "#64748b",
                      fontWeight: 600,
                      formatter: function (w) {
                        return (
                          "S/ " +
                          w.globals.seriesTotals
                            .reduce((a, b) => a + b, 0)
                            .toFixed(2)
                        );
                      },
                    },
                  },
                },
              },
            },
            dataLabels: { enabled: false },
            stroke: { width: 0 },
            theme: { palette: "palette1" },
            legend: { position: "bottom", fontSize: "13px", fontWeight: 600 },
            tooltip: {
              y: {
                formatter: function (val) {
                  return "S/ " + val.toFixed(2);
                },
              },
            },
          };
          chartCatInstance = new ApexCharts(chartCatRef.value, optionsCat);
          chartCatInstance.render();
        }
      }

      // 2. Gráfico Barras (Flujo)
      if (chartFlujoRef.value) {
        const ingresosPEN = historial.value
          .filter(
            (h) =>
              h.tipo_flujo === "Ingreso" &&
              h.moneda === "PEN" &&
              !h.categoria_nombre.includes("Transferencia"),
          )
          .reduce((a, b) => a + b.monto, 0);
        const egresosPEN = historial.value
          .filter(
            (h) =>
              h.tipo_flujo === "Egreso" &&
              h.moneda === "PEN" &&
              !h.categoria_nombre.includes("Transferencia"),
          )
          .reduce((a, b) => a + b.monto, 0);

        const optionsFlujo = {
          series: [{ name: "Monto en Soles", data: [ingresosPEN, egresosPEN] }],
          chart: {
            type: "bar",
            height: "100%",
            width: "100%",
            fontFamily: "inherit",
            toolbar: { show: false },
          },
          plotOptions: {
            bar: {
              borderRadius: 6,
              distributed: true,
              horizontal: false,
              columnWidth: "50%",
            },
          },
          colors: ["#10b981", "#f43f5e"],
          dataLabels: { enabled: false },
          xaxis: {
            categories: ["Ingresos", "Egresos"],
            labels: {
              style: {
                fontSize: "13px",
                fontWeight: 600,
                colors: ["#64748b", "#64748b"],
              },
            },
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return "S/ " + val.toFixed(0);
              },
            },
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return "S/ " + val.toFixed(2);
              },
            },
          },
        };
        chartFlujoInstance = new ApexCharts(chartFlujoRef.value, optionsFlujo);
        chartFlujoInstance.render();
      }
    };

    // Función para renderizar el Velocímetro de Deuda
    const renderizarGraficoDeuda = () => {
      if (!chartDeudaRef.value) return;
      if (chartDeudaInstance) {
        chartDeudaInstance.destroy();
        chartDeudaInstance = null;
      }

      const optionsDeuda = {
        series: [diagnosticoDeuda.value.porcentajeCobertura],
        chart: { type: "radialBar", height: 250, fontFamily: "inherit" },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: { size: "65%" },
            track: { background: "#f1f5f9", strokeWidth: "100%" },
            dataLabels: {
              name: {
                show: true,
                fontSize: "12px",
                color: "#64748b",
                offsetY: 20,
              },
              value: {
                offsetY: -10,
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                formatter: function (val) {
                  return val + "%";
                },
              },
            },
          },
        },
        fill: { colors: [diagnosticoDeuda.value.colorGrafico] },
        stroke: { lineCap: "round" },
        labels: ["Cobertura de Deuda"],
      };

      chartDeudaInstance = new ApexCharts(chartDeudaRef.value, optionsDeuda);
      chartDeudaInstance.render();
    };

    const iniciarSesionGoogle = async () => {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    };

    const cerrarSesion = async () => {
      cargando.value = true;
      await supabase.auth.signOut();
      isLoggedIn.value = false;
      currentUserId.value = "";
      cuentas.value = [];
      historial.value = [];
      pagosFijos.value = [];
      if (chartCatInstance) {
        chartCatInstance.destroy();
        chartCatInstance = null;
      }
      if (chartFlujoInstance) {
        chartFlujoInstance.destroy();
        chartFlujoInstance = null;
      }
      if (chartDeudaInstance) {
        chartDeudaInstance.destroy();
        chartDeudaInstance = null;
      }
      cargando.value = false;
    };

    const cargarDatos = async () => {
      try {
        const datos = await api.obtenerDatosCompletos(currentUserId.value);
        cuentas.value = datos.cuentas;
        categorias.value = datos.categorias;
        pagosFijos.value = datos.pagosFijos;

        historial.value = datos.historialRaw.map((h) => ({
          ...h,
          categoria_nombre:
            categorias.value.find((c) => c.id == h.categoria)?.nombre ||
            h.categoria,
        }));

        if (tab.value === "analitica")
          nextTick(() => renderizarGraficosAnalitica());
        if (tab.value === "cuentas") nextTick(() => renderizarGraficoDeuda());
      } catch (error) {
        console.error("Error conectando con la API:", error);
      }
    };

    const ejecutarOperacion = async () => {
      cargando.value = true;

      if (tipoOperacion.value === "Transferencia") {
        if (
          !txTransf.value.origen_id ||
          !txTransf.value.destino_id ||
          !txTransf.value.monto
        ) {
          alert("Completa todos los datos");
          cargando.value = false;
          return;
        }
        if (txTransf.value.origen_id === txTransf.value.destino_id) {
          alert("Cuentas iguales");
          cargando.value = false;
          return;
        }

        const catSalida = categorias.value.find(
          (c) => c.nombre === "Transferencia Saliente",
        );
        const catEntrada = categorias.value.find(
          (c) => c.nombre === "Transferencia Entrante",
        );
        const concepto = txTransf.value.descripcion || "Transferencia";

        await Promise.all([
          api.guardarTransaccion({
            cuenta_id: parseInt(txTransf.value.origen_id),
            categoria_id: catSalida.id,
            monto: parseFloat(txTransf.value.monto),
            fecha: txTransf.value.fecha,
            descripcion: concepto,
          }),
          api.guardarTransaccion({
            cuenta_id: parseInt(txTransf.value.destino_id),
            categoria_id: catEntrada.id,
            monto: parseFloat(txTransf.value.monto),
            fecha: txTransf.value.fecha,
            descripcion: concepto,
          }),
        ]);
        txTransf.value.monto = "";
        txTransf.value.descripcion = "";
      } else {
        if (
          !tx.value.cuenta_id ||
          !tx.value.categoria_id ||
          !tx.value.monto ||
          !tx.value.descripcion
        ) {
          alert("Datos incompletos");
          cargando.value = false;
          return;
        }
        await api.guardarTransaccion({
          ...tx.value,
          cuenta_id: parseInt(tx.value.cuenta_id),
          categoria_id: parseInt(tx.value.categoria_id),
          monto: parseFloat(tx.value.monto),
        });
        tx.value.monto = "";
        tx.value.descripcion = "";
      }

      showModal.value = false;
      await cargarDatos();
      cargando.value = false;
    };

    const guardarCategoria = async () => {
      if (!nuevaCat.value.nombre) return;
      await api.guardarCategoria(nuevaCat.value);
      nuevaCat.value.nombre = "";
      await cargarDatos();
    };

    const guardarCuenta = async () => {
      if (!nuevaCuenta.value.nombre) return;
      const payload = {
        usuario_id: currentUserId.value,
        nombre: nuevaCuenta.value.nombre,
        tipo_cuenta: nuevaCuenta.value.tipo_cuenta,
        moneda: nuevaCuenta.value.moneda,
        saldo_inicial: parseFloat(nuevaCuenta.value.saldo_inicial || 0),
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
      };
      await api.guardarCuenta(payload);
      nuevaCuenta.value = {
        nombre: "",
        tipo_cuenta: "Debito",
        moneda: "PEN",
        saldo_inicial: "",
        limite: "",
        dia_corte: "",
        dia_pago: "",
      };
      await cargarDatos();
    };

    const guardarPagoFijo = async () => {
      if (
        !nuevoPagoFijo.value.nombre ||
        !nuevoPagoFijo.value.monto ||
        !nuevoPagoFijo.value.dia_cobro
      )
        return;
      const payload = {
        usuario_id: currentUserId.value,
        nombre: nuevoPagoFijo.value.nombre,
        monto: parseFloat(nuevoPagoFijo.value.monto),
        tipo_flujo: nuevoPagoFijo.value.tipo_flujo,
        dia_cobro: parseInt(nuevoPagoFijo.value.dia_cobro),
        moneda: nuevoPagoFijo.value.moneda,
      };
      await api.guardarPagoFijo(payload);
      nuevoPagoFijo.value = {
        nombre: "",
        monto: "",
        tipo_flujo: "Egreso",
        dia_cobro: "",
        moneda: "PEN",
      };
      await cargarDatos();
    };

    onMounted(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          isLoggedIn.value = true;
          currentUserId.value = session.user.id;
          cargarDatos().then(() => {
            cargando.value = false;
          });
        } else if (window.location.hash.includes("access_token")) {
          cargando.value = true;
        } else {
          cargando.value = false;
        }
      });

      supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          isLoggedIn.value = true;
          currentUserId.value = session.user.id;
          cargarDatos().then(() => {
            cargando.value = false;
          });
        } else {
          isLoggedIn.value = false;
          currentUserId.value = "";
          cargando.value = false;
        }
      });
    });

    // Observadores para redibujar gráficos al cambiar de pestaña
    Vue.watch(tab, (newTab) => {
      if (newTab === "analitica") nextTick(() => renderizarGraficosAnalitica());
      if (newTab === "cuentas") nextTick(() => renderizarGraficoDeuda());
    });

    return {
      cargando,
      isLoggedIn,
      currentUserId,
      tab,
      tituloCabecera,
      showModal,
      tipoOperacion,
      cuentas,
      categorias,
      categoriasFiltradas,
      historial,
      saldosLiquidos,
      saldosAhorro,
      pagosFijos,
      tx,
      txTransf,
      nuevaCat,
      nuevaCuenta,
      nuevoPagoFijo,
      chartCatRef,
      chartFlujoRef,
      chartDeudaRef,
      diagnosticoDeuda,
      iniciarSesionGoogle,
      cerrarSesion,
      ejecutarOperacion,
      guardarCategoria,
      guardarCuenta,
      guardarPagoFijo,
      formatoMoneda,
    };
  },
}).mount("#app");
