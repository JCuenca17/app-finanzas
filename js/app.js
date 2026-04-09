// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    // --- CREDENCIALES (REEMPLAZA CON LAS TUYAS) ---
    const SUPABASE_URL = "https://TU-ID-DE-PROYECTO.supabase.co";
    const SUPABASE_KEY = "TU-ANON-KEY";
    const API_URL = "https://TU-URL-DE-RENDER.onrender.com";
    // ----------------------------------------------

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const cargando = ref(true);
    const isLoggedIn = ref(false);
    const currentUserId = ref("");
    const tab = ref("inicio");
    const showModal = ref(false);
    const tipoOperacion = ref("Egreso");

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
    const txTransf = ref({
      origen_id: "",
      destino_id: "",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
      descripcion: "",
    });

    const nuevaCat = ref({ nombre: "", tipo_flujo: "Egreso" });

    // La variable ahora incluye los campos para Tarjeta de Crédito
    const nuevaCuenta = ref({
      nombre: "",
      tipo_cuenta: "Debito",
      saldo_inicial: "",
      limite: "",
      dia_corte: "",
      dia_pago: "",
    });

    const saldoTotalLiquido = computed(() => {
      return cuentas.value
        .filter((c) => c.tipo_cuenta !== "Credito")
        .reduce((acc, c) => acc + c.saldo_actual, 0);
    });

    const categoriasFiltradas = computed(() => {
      return categorias.value.filter(
        (c) =>
          c.tipo_flujo === tipoOperacion.value &&
          !c.nombre.includes("Transferencia"),
      );
    });

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
      cargando.value = false;
    };

    const cargarDatos = async () => {
      try {
        const [resCuentas, resHistorial, resCategorias] = await Promise.all([
          fetch(`${API_URL}/cuentas/${currentUserId.value}`),
          fetch(`${API_URL}/historial/${currentUserId.value}`),
          fetch(`${API_URL}/categorias/`),
        ]);

        if (resCuentas.ok) cuentas.value = (await resCuentas.json()).cuentas;
        if (resHistorial.ok) {
          const histData = await resHistorial.json();
          historial.value = histData.historial.map((h) => ({
            ...h,
            categoria_nombre:
              categorias.value.find((c) => c.id == h.categoria)?.nombre ||
              h.categoria,
          }));
        }
        if (resCategorias.ok)
          categorias.value = (await resCategorias.json()).categorias;
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
          alert("Completa todos los datos de la transferencia");
          cargando.value = false;
          return;
        }
        if (txTransf.value.origen_id === txTransf.value.destino_id) {
          alert("No puedes transferir a la misma cuenta");
          cargando.value = false;
          return;
        }

        const catSalida = categorias.value.find(
          (c) => c.nombre === "Transferencia Saliente",
        );
        const catEntrada = categorias.value.find(
          (c) => c.nombre === "Transferencia Entrante",
        );

        if (!catSalida || !catEntrada) {
          alert("Faltan las categorías de sistema en la Base de Datos.");
          cargando.value = false;
          return;
        }

        const concepto =
          txTransf.value.descripcion || "Transferencia entre cuentas";

        await fetch(`${API_URL}/transacciones/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cuenta_id: parseInt(txTransf.value.origen_id),
            categoria_id: catSalida.id,
            monto: parseFloat(txTransf.value.monto),
            fecha: txTransf.value.fecha,
            descripcion: concepto,
          }),
        });

        await fetch(`${API_URL}/transacciones/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cuenta_id: parseInt(txTransf.value.destino_id),
            categoria_id: catEntrada.id,
            monto: parseFloat(txTransf.value.monto),
            fecha: txTransf.value.fecha,
            descripcion: concepto,
          }),
        });

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
        tx.value.monto = "";
        tx.value.descripcion = "";
      }

      showModal.value = false;
      await cargarDatos();
      cargando.value = false;
    };

    const guardarCategoria = async () => {
      if (!nuevaCat.value.nombre) return;
      await fetch(`${API_URL}/categorias/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCat.value),
      });
      nuevaCat.value.nombre = "";
      await cargarDatos();
    };

    // LA NUEVA FUNCIÓN PARA GUARDAR CUENTAS (INCLUYENDO TARJETAS)
    const guardarCuenta = async () => {
      if (!nuevaCuenta.value.nombre) return;

      // Empaquetamos los datos, enviando las fechas y límites solo si es Crédito
      const payload = {
        usuario_id: currentUserId.value,
        nombre: nuevaCuenta.value.nombre,
        tipo_cuenta: nuevaCuenta.value.tipo_cuenta,
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

      await fetch(`${API_URL}/cuentas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Limpiamos el formulario
      nuevaCuenta.value = {
        nombre: "",
        tipo_cuenta: "Debito",
        saldo_inicial: "",
        limite: "",
        dia_corte: "",
        dia_pago: "",
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
      saldoTotalLiquido,
      tx,
      txTransf,
      nuevaCat,
      nuevaCuenta,
      iniciarSesionGoogle,
      cerrarSesion,
      ejecutarOperacion,
      guardarCategoria,
      guardarCuenta,
    };
  },
}).mount("#app");
