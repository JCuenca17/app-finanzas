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
    const auth = useAuth();
    const ui = useUI();

    const onDatosActualizados = () => {
      // Retraso minimo para asegurar que el DOM de la pestaña actual existe antes de dibujar
      setTimeout(() => {
        if (ui.tab.value === "inicio") charts.renderizarGraficosInicio();
        if (ui.tab.value === "analitica") charts.renderizarGraficosAnalitica();
        if (ui.tab.value === "cuentas") charts.renderizarGraficosCuentas();
        if (ui.tab.value === "deudas") charts.renderizarGraficosDeudas();
      }, 50);
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

    const calcs = useCalculations(data, ui);
    const charts = useCharts(data, calcs);

    const cerrarSesion = async () => {
      ui.cargando.value = true;
      await auth.cerrarSesionAuth();
      data.limpiarDatos();
      charts.destruirGraficos();
      ui.cargando.value = false;
    };

    onMounted(() => {
      auth.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          auth.actualizarDatosUsuario(session);
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
          auth.actualizarDatosUsuario(session);
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

    // Observador de Pestañas para Renderizado Perezoso
    watch(ui.tab, (newTab) => {
      setTimeout(() => {
        if (newTab === "inicio") charts.renderizarGraficosInicio();
        if (newTab === "analitica") charts.renderizarGraficosAnalitica();
        if (newTab === "cuentas") charts.renderizarGraficosCuentas();
        if (newTab === "deudas") charts.renderizarGraficosDeudas();
      }, 50);
    });

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
