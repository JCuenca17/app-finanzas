// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    // ID REAL Y CONEXIÓN
    const MI_USUARIO_ID = "509eceb0-8893-4907-b345-c6035e190ccf";
    const API_URL = "https://finanzas-backend-dgv5.onrender.com";

    // Estados de la aplicación
    const cuentas = ref([]);
    const categorias = ref([]);
    const historial = ref([]);

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

    // Cálculos Reactivos
    const saldoTotalLiquido = computed(() => {
      return cuentas.value
        .filter((c) => c.tipo_cuenta !== "Credito")
        .reduce((acc, c) => acc + c.saldo_actual, 0);
    });

    // Peticiones al Backend (Python)
    const cargarDatos = async () => {
      try {
        const [resCuentas, resHistorial, resCategorias] = await Promise.all([
          fetch(`${API_URL}/cuentas/${MI_USUARIO_ID}`),
          fetch(`${API_URL}/historial/${MI_USUARIO_ID}`),
          fetch(`${API_URL}/categorias/`),
        ]);

        if (resCuentas.ok) cuentas.value = (await resCuentas.json()).cuentas;
        if (resHistorial.ok)
          historial.value = (await resHistorial.json()).historial;
        if (resCategorias.ok)
          categorias.value = (await resCategorias.json()).categorias;
      } catch (error) {
        console.error("Error conectando al servidor:", error);
      }
    };

    const guardarTransaccion = async () => {
      if (
        !tx.value.cuenta_id ||
        !tx.value.categoria_id ||
        !tx.value.monto ||
        !tx.value.descripcion
      ) {
        alert("Completa todos los datos obligatorios.");
        return;
      }
      await fetch(`${API_URL}/transacciones/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuenta_id: parseInt(tx.value.cuenta_id),
          categoria_id: parseInt(tx.value.categoria_id),
          monto: parseFloat(tx.value.monto),
          fecha: tx.value.fecha,
          descripcion: tx.value.descripcion,
        }),
      });
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
          usuario_id: MI_USUARIO_ID,
          nombre: nuevaCuenta.value.nombre,
          tipo_cuenta: nuevaCuenta.value.tipo_cuenta,
          saldo_inicial: parseFloat(nuevaCuenta.value.saldo_inicial || 0),
        }),
      });
      nuevaCuenta.value.nombre = "";
      nuevaCuenta.value.saldo_inicial = "";
      cargarDatos();
    };

    // Inicialización
    onMounted(() => {
      cargarDatos();
    });

    return {
      cuentas,
      categorias,
      historial,
      saldoTotalLiquido,
      tx,
      nuevaCat,
      nuevaCuenta,
      guardarTransaccion,
      guardarCategoria,
      guardarCuenta,
    };
  },
}).mount("#app");
