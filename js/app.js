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

    // Sistema Global de Notificaciones
    const toast = ref({ show: false, message: "", type: "success" });
    let toastTimeout = null;

    const mostrarToast = (mensaje, tipo = "success") => {
      toast.value = { show: true, message: mensaje, type: tipo };
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.value.show = false;
      }, 3500);
    };

    const cuentas = ref([]);
    const categorias = ref([]);
    const historial = ref([]);
    const pagosFijos = ref([]);

    const chartCatRef = ref(null);
    const chartFlujoRef = ref(null);
    const chartDeudaRef = ref(null);
    let chartCatInstance = null;
    let chartFlujoInstance = null;
    let chartDeudaInstance = null;

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
        cuentas: "Mis Activos",
        deudas: "Mis Pasivos (Deudas)",
        historial: "Historial Completo",
        pagos: "Flujo de Caja Libre",
        mas: "Menú Principal",
        ajustes: "Ajustes de Sistema",
      };
      return titulos[tab.value] || "FinancePro";
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
      } else {
        let cob = (poderAdquisitivoLibre / deuda) * 100;
        if (cob < 0) cob = 0;
        if (cob > 100) cob = 100;
        result.porcentajeCobertura = Math.round(cob);
      }

      // Textos amigables
      if (deuda === 0) {
        result.estado = "Todo en orden";
        result.textColor = "text-emerald-600";
        result.iconBg = "bg-emerald-500";
        result.borderColor = "border-emerald-200";
        result.alertBoxClasses =
          "bg-emerald-50 border-emerald-200 text-emerald-800";
        result.colorGrafico = "#10b981";
        result.mensaje =
          "No tienes deudas de tarjetas en este momento. ¡Sigue así!";
      } else if (balance >= 0) {
        result.estado = "Bajo Control";
        result.textColor = "text-emerald-600";
        result.iconBg = "bg-emerald-500";
        result.borderColor = "border-emerald-200";
        result.alertBoxClasses =
          "bg-emerald-50 border-emerald-200 text-emerald-800";
        result.colorGrafico = "#10b981";
        result.mensaje = `Con tu dinero actual y tu sueldo podrás pagar tus tarjetas tranqui. Te sobrarán S/ ${balance.toFixed(2)}.`;
      } else if (balance + ahorro >= 0) {
        result.estado = "Cuidado, faltan fondos";
        result.textColor = "text-amber-600";
        result.iconBg = "bg-amber-500";
        result.borderColor = "border-amber-200";
        result.alertBoxClasses = "bg-amber-50 border-amber-200 text-amber-800";
        result.colorGrafico = "#f59e0b";
        result.mensaje = `Tu sueldo no alcanza para la tarjeta. Te faltan S/ ${Math.abs(balance).toFixed(2)}. Tendrás que sacar de tus ahorros.`;
      } else {
        result.estado = "Peligro de Deuda";
        result.textColor = "text-rose-600";
        result.iconBg = "bg-rose-500";
        result.borderColor = "border-rose-200";
        result.alertBoxClasses = "bg-rose-50 border-rose-200 text-rose-800";
        result.colorGrafico = "#f43f5e";
        result.mensaje = `Incluso usando todos tus ahorros te van a faltar S/ ${Math.abs(balance + ahorro).toFixed(2)}. Evita gastar más.`;
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

    const renderizarGraficoDeuda = () => {
      if (!chartDeudaRef.value) return;
      if (chartDeudaInstance) {
        chartDeudaInstance.destroy();
        chartDeudaInstance = null;
      }

      const optionsDeuda = {
        series: [diagnosticoDeuda.value.porcentajeCobertura],
        chart: {
          type: "radialBar",
          height: "100%",
          width: "100%",
          fontFamily: "inherit",
          sparkline: { enabled: false },
        },
        plotOptions: {
          radialBar: {
            startAngle: -100,
            endAngle: 100,
            hollow: { size: "65%" },
            track: { background: "#f1f5f9", strokeWidth: "100%", margin: 5 },
            dataLabels: {
              name: {
                show: true,
                fontSize: "11px",
                color: "#64748b",
                offsetY: 30,
                fontWeight: 700,
              },
              value: {
                offsetY: -5,
                fontSize: "32px",
                fontWeight: 900,
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
        labels: ["Cobertura Segura"],
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
        if (tab.value === "deudas") nextTick(() => renderizarGraficoDeuda());
      } catch (error) {
        console.error("Error conectando con la API:", error);
        mostrarToast("Error de conexión con el servidor", "error");
      }
    };

    const ejecutarOperacion = async () => {
      if (tipoOperacion.value === "Transferencia") {
        if (
          !txTransf.value.origen_id ||
          !txTransf.value.destino_id ||
          !txTransf.value.monto
        ) {
          mostrarToast("Falta completar datos", "warning");
          return;
        }
        if (txTransf.value.origen_id === txTransf.value.destino_id) {
          mostrarToast("Las cuentas no pueden ser iguales", "warning");
          return;
        }

        cargando.value = true;
        const catSalida = categorias.value.find(
          (c) => c.nombre === "Transferencia Saliente",
        );
        const catEntrada = categorias.value.find(
          (c) => c.nombre === "Transferencia Entrante",
        );
        const concepto = txTransf.value.descripcion || "Transferencia";

        try {
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
          mostrarToast("Transferencia registrada con éxito", "success");
        } catch (error) {
          mostrarToast("Ocurrió un error en el servidor", "error");
        }
      } else {
        if (
          !tx.value.cuenta_id ||
          !tx.value.categoria_id ||
          !tx.value.monto ||
          !tx.value.descripcion
        ) {
          mostrarToast("Por favor, llena todos los campos", "warning");
          return;
        }

        cargando.value = true;
        try {
          await api.guardarTransaccion({
            ...tx.value,
            cuenta_id: parseInt(tx.value.cuenta_id),
            categoria_id: parseInt(tx.value.categoria_id),
            monto: parseFloat(tx.value.monto),
          });
          tx.value.monto = "";
          tx.value.descripcion = "";
          mostrarToast("Operación registrada con éxito", "success");
        } catch (error) {
          mostrarToast("Ocurrió un error en el servidor", "error");
        }
      }

      showModal.value = false;
      await cargarDatos();
      cargando.value = false;
    };

    const guardarCategoria = async () => {
      if (!nuevaCat.value.nombre) {
        mostrarToast("Ponle un nombre a la categoría", "warning");
        return;
      }
      cargando.value = true;
      try {
        await api.guardarCategoria(nuevaCat.value);
        nuevaCat.value.nombre = "";
        await cargarDatos();
        mostrarToast("Categoría creada", "success");
      } catch (error) {
        mostrarToast("Error al guardar", "error");
      }
      cargando.value = false;
    };

    const guardarCuenta = async () => {
      if (!nuevaCuenta.value.nombre) {
        mostrarToast("El nombre de la cuenta es obligatorio", "warning");
        return;
      }
      cargando.value = true;

      try {
        let saldo = parseFloat(nuevaCuenta.value.saldo_inicial || 0);
        if (
          ["Credito", "Prestamo", "Pagar"].includes(nuevaCuenta.tipo_cuenta)
        ) {
          saldo = -Math.abs(saldo);
        }

        const payload = {
          usuario_id: currentUserId.value,
          nombre: nuevaCuenta.value.nombre,
          tipo_cuenta: nuevaCuenta.value.tipo_cuenta,
          moneda: nuevaCuenta.value.moneda,
          saldo_inicial: saldo,
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
        mostrarToast("Cuenta registrada correctamente", "success");
      } catch (error) {
        mostrarToast("Error de conexión", "error");
      }
      cargando.value = false;
    };

    const guardarPagoFijo = async () => {
      if (
        !nuevoPagoFijo.value.nombre ||
        !nuevoPagoFijo.value.monto ||
        !nuevoPagoFijo.value.dia_cobro
      ) {
        mostrarToast("Faltan datos en la proyección", "warning");
        return;
      }
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
        await api.guardarPagoFijo(payload);
        nuevoPagoFijo.value = {
          nombre: "",
          monto: "",
          tipo_flujo: "Egreso",
          dia_cobro: "",
          moneda: "PEN",
        };
        await cargarDatos();
        mostrarToast("Proyección guardada con éxito", "success");
      } catch (error) {
        mostrarToast("Error de servidor", "error");
      }
      cargando.value = false;
    };

    // Función mock para eliminar (Prepara el terreno para el backend)
    const eliminarRegistro = (tipo, id) => {
      mostrarToast(
        "Falta conectar la función DELETE en tu Backend (Python) para poder borrar elementos.",
        "warning",
      );
      console.log(`Intento de eliminar ${tipo} con ID: ${id}`);
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

    Vue.watch(tab, (newTab) => {
      if (newTab === "analitica") nextTick(() => renderizarGraficosAnalitica());
      if (newTab === "deudas") nextTick(() => renderizarGraficoDeuda());
    });

    return {
      cargando,
      isLoggedIn,
      currentUserId,
      tab,
      tituloCabecera,
      showModal,
      tipoOperacion,
      toast,
      mostrarToast,
      eliminarRegistro,
      cuentas,
      categorias,
      categoriasFiltradas,
      historial,
      saldosLiquidos,
      saldosAhorro,
      pagosFijos,
      cuentasActivas,
      cuentasPorCobrar,
      deudasActivas,
      pagosFijosIngresos,
      pagosFijosEgresos,
      totalIngresosFijos,
      totalGastosFijos,
      flujoNetoMensual,
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
