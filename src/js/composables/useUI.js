// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Interfaz de Usuario (UI)

import { ref, computed } from "vue";

export function useUI() {
  const cargando = ref(true);
  const tab = ref("inicio");
  const showModal = ref(false);
  const tipoOperacion = ref("Egreso");
  const tagSearch = ref("");

  // Sistema Global de Notificaciones (Toasts)
  const toast = ref({ show: false, message: "", type: "success" });
  let toastTimeout = null;

  const mostrarToast = (mensaje, tipo = "success") => {
    toast.value = { show: true, message: mensaje, type: tipo };
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.value.show = false;
    }, 3500);
  };

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

  return {
    cargando,
    tab,
    showModal,
    tipoOperacion,
    tagSearch,
    toast,
    mostrarToast,
    tituloCabecera,
  };
}
