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

    // Estados Globales
    const cargando = ref(true);
    const isLoggedIn = ref(false);
    const currentUserId = ref("");
    const tab = ref("inicio");
    const showModal = ref(false);
    const tipoOperacion = ref("Egreso");

    // Datos del Servidor
    const cuentas = ref([]);
    const categorias = ref([]);
    const historial = ref([]);
    const pagosFijos = ref([]);

    // Referencias de UI
    const chartRef = ref(null);
    let chartInstance = null;
    const hayGastosParaGrafico = ref(false);

    // Formularios
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

    // Cálculos
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

    const categoriasFiltradas = computed(() => {
      return categorias.value.filter(
        (c) =>
          c.tipo_flujo === tipoOperacion.value &&
          !c.nombre.includes("Transferencia"),
      );
    });

    // Utilidades
    const formatoMoneda = (monto, moneda) => {
      const simbolo = moneda === "USD" ? "$" : "S/";
      return `${simbolo} ${Math.abs(monto).toFixed(2)}`;
    };

    // Autenticación
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
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      cargando.value = false;
    };

    // Carga de Datos unificada
    const cargarDatos = async () => {
      try {
        const datos = await api.obtenerDatosCompletos(currentUserId.value);

        cuentas.value = datos.cuentas;
        categorias.value = datos.categorias;
        pagosFijos.value = datos.pagosFijos;

        // Mapear historial con nombres de categorías
        historial.value = datos.historialRaw.map((h) => ({
          ...h,
          categoria_nombre:
            categorias.value.find((c) => c.id == h.categoria)?.nombre ||
            h.categoria,
        }));

        // Aquí insertaremos la lógica del gráfico más adelante
        if (tab.value === "inicio") {
          // nextTick(() => renderizarGrafico());
        }
      } catch (error) {
        console.error("Error conectando con la API:", error);
      }
    };

    // Operaciones Core
    const ejecutarOperacion = async () => {
      cargando.value = true;

      if (tipoOperacion.value === "Transferencia") {
        if (
          !txTransf.value.origen_id ||
          !txTransf.value.destino_id ||
          !txTransf.value.monto
        ) {
          alert("Completa todos los datos de la transferencia");
          cargando.value = false;
          return;
        }
        if (txTransf.value.origen_id === txTransf.value.destino_id) {
          alert("No puedes transferir a la misma cuenta");
          cargando.value = false;
          return;
        }

        const cuentaOrigen = cuentas.value.find(
          (c) => c.id_cuenta == txTransf.value.origen_id,
        );
        const cuentaDestino = cuentas.value.find(
          (c) => c.id_cuenta == txTransf.value.destino_id,
        );
        if (
          cuentaOrigen &&
          cuentaDestino &&
          cuentaOrigen.moneda !== cuentaDestino.moneda
        ) {
          alert(
            "No se pueden hacer transferencias directas entre diferentes monedas por el momento.",
          );
          cargando.value = false;
          return;
        }

        const catSalida = categorias.value.find(
          (c) => c.nombre === "Transferencia Saliente",
        );
        const catEntrada = categorias.value.find(
          (c) => c.nombre === "Transferencia Entrante",
        );

        const concepto =
          txTransf.value.descripcion || "Transferencia entre cuentas";

        // Ejecutar ambas partes de la transferencia
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
          alert("Completa todos los datos obligatorios.");
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

    // Inicialización
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

    // Observador de pestañas
    Vue.watch(tab, (newTab) => {
      if (newTab === "inicio") {
        // nextTick(() => renderizarGrafico());
      }
    });

    return {
      cargando,
      isLoggedIn,
      currentUserId,
      tab,
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
      chartRef,
      hayGastosParaGrafico,
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
