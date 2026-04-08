// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    // Credenciales y Rutas
    const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
    const SUPABASE_KEY = "TU_SUPABASE_PUBLISHABLE_KEY";
    const API_URL = "https://finanzas-backend-dgv5.onrender.com";

    // Inicialización de Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Estados
    const isLoggedIn = ref(false);
    const currentUserId = ref("");
    const tab = ref("inicio");
    const showModal = ref(false);

    // Datos
    const cuentas = ref([]);
    const categorias = ref([]);
    const historial = ref([]);

    // Formularios
    const tx = ref({
      monto: "",
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
      cuenta_id: "",
      categoria_id: "",
    });
    const nuevaCat = ref({ nombre: "", tipo_flujo: "Egreso" });
    const nuevaCuenta = ref({
      nombre: "",
      tipo_cuenta: "Debito",
      saldo_inicial: "",
    });

    // Cálculos
    const saldoTotalLiquido = computed(() => {
      return cuentas.value
        .filter((c) => c.tipo_cuenta !== "Credito")
        .reduce((acc, c) => acc + c.saldo_actual, 0);
    });

    // Funciones de Sesión
    const iniciarSesionGoogle = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        console.error("Error de conexión con Google:", error);
        alert("Hubo un error al intentar autenticar.");
      }
    };

    const cerrarSesion = async () => {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        isLoggedIn.value = false;
        currentUserId.value = "";
      }
    };

    // Funciones de Base de Datos
    const cargarDatos = async () => {
      try {
        const [resCuentas, resHistorial, resCategorias] = await Promise.all([
          fetch(`${API_URL}/cuentas/${currentUserId.value}`),
          fetch(`${API_URL}/historial/${currentUserId.value}`),
          fetch(`${API_URL}/categorias/`),
        ]);

        if (resCuentas.ok) cuentas.value = (await resCuentas.json()).cuentas;
        if (resHistorial.ok)
          historial.value = (await resHistorial.json()).historial;
        if (resCategorias.ok)
          categorias.value = (await resCategorias.json()).categorias;
      } catch (error) {
        console.error("Error conectando con la API:", error);
      }
    };

    const guardarTransaccion = async () => {
      if (
        !tx.value.cuenta_id ||
        !tx.value.categoria_id ||
        !tx.value.monto ||
        !tx.value.descripcion
      ) {
        alert("Completa todos los datos del formulario.");
        return;
      }
      await fetch(`${API_URL}/transacciones/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tx.value,
          cuenta_id: parseInt(tx.value.cuenta_id),
          categoria_id: parseInt(tx.value.categoria_id),
          monto: parseFloat(tx.value.monto),
        }),
      });
      showModal.value = false;
      tx.value.monto = "";
      tx.value.descripcion = "";
      cargarDatos();
    };

    const guardarCategoria = async () => {
      if (!nuevaCat.value.nombre) return;
      await fetch(`${API_URL}/categorias/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCat.value),
      });
      nuevaCat.value.nombre = "";
      cargarDatos();
    };

    const guardarCuenta = async () => {
      if (!nuevaCuenta.value.nombre) return;
      await fetch(`${API_URL}/cuentas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevaCuenta.value,
          usuario_id: currentUserId.value,
          saldo_inicial: parseFloat(nuevaCuenta.value.saldo_inicial || 0),
        }),
      });
      nuevaCuenta.value.nombre = "";
      nuevaCuenta.value.saldo_inicial = "";
      cargarDatos();
    };

    // Verificación de Autenticación Continua
    onMounted(() => {
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          isLoggedIn.value = true;
          currentUserId.value = session.user.id;
          cargarDatos();
        } else {
          isLoggedIn.value = false;
          currentUserId.value = "";
        }
      });
    });

    // Exposición de variables y funciones al HTML
    return {
      isLoggedIn,
      currentUserId,
      tab,
      showModal,
      cuentas,
      categorias,
      historial,
      saldoTotalLiquido,
      tx,
      nuevaCat,
      nuevaCuenta,
      iniciarSesionGoogle,
      cerrarSesion,
      guardarTransaccion,
      guardarCategoria,
      guardarCuenta,
    };
  },
}).mount("#app");
