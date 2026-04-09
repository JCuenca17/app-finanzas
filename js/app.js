// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Orquestador Principal de la Aplicación (Vue 3)

import { useAuth } from "./composables/useAuth.js";
import { useUI } from "./composables/useUI.js";
import { useFinanceData } from "./composables/useFinanceData.js";
import { useCalculations } from "./composables/useCalculations.js";
import { useCharts } from "./composables/useCharts.js";

const { createApp, onMounted, nextTick, watch } = window.Vue;

createApp({
  setup() {
    // 1. Instanciar módulos base
    const auth = useAuth();
    const ui = useUI();

    // 2. Instanciar gestor de datos (le pasamos el callback de actualización visual)
    const onDatosActualizados = () => {
      if (ui.tab.value === "analitica")
        nextTick(() => charts.renderizarGraficosAnalitica());
      if (ui.tab.value === "deudas")
        nextTick(() => charts.renderizarGraficoDeuda());
    };

    const data = useFinanceData(
      auth.currentUserId,
      ui.cargando,
      ui.mostrarToast,
      ui.showModal,
      ui.tipoOperacion,
      ui.tab,
      onDatosActualizados,
    );

    // 3. Instanciar módulos dependientes
    const calcs = useCalculations(data, ui);
    const charts = useCharts(data, calcs);

    // 4. Lógica Orquestada
    const cerrarSesion = async () => {
      ui.cargando.value = true;
      await auth.cerrarSesionAuth();
      data.limpiarDatos();
      charts.destruirGraficos();
      ui.cargando.value = false;
    };

    // 5. Ciclo de vida y Observadores
    onMounted(() => {
      auth.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          auth.isLoggedIn.value = true;
          auth.currentUserId.value = session.user.id;
          data.cargarDatos().then(() => {
            ui.cargando.value = false;
          });
        } else if (window.location.hash.includes("access_token")) {
          ui.cargando.value = true;
        } else {
          ui.cargando.value = false;
        }
      });

      auth.supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          auth.isLoggedIn.value = true;
          auth.currentUserId.value = session.user.id;
          data.cargarDatos().then(() => {
            ui.cargando.value = false;
          });
        } else {
          auth.isLoggedIn.value = false;
          auth.currentUserId.value = "";
          ui.cargando.value = false;
        }
      });
    });

    watch(ui.tab, (newTab) => {
      if (newTab === "analitica")
        nextTick(() => charts.renderizarGraficosAnalitica());
      if (newTab === "deudas") nextTick(() => charts.renderizarGraficoDeuda());
    });

    // 6. Exponer todo al HTML (El operador spread "..." desempaqueta los objetos)
    return {
      ...auth,
      ...ui,
      ...data,
      ...calcs,
      ...charts,
      cerrarSesion,
    };
  },
}).mount("#app");
