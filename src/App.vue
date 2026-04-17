<template>
  <transition name="toast">
    <div v-if="toast.show"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[90%] pointer-events-none"
      :class="toast.type === 'success' ? 'bg-emerald-600 text-white' : (toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white')">
      <p class="font-bold text-sm leading-tight text-center w-full">{{ toast.message }}</p>
    </div>
  </transition>

  <div v-if="cargando"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 transition-opacity">
    <div class="spinner"></div>
  </div>

  <PantallaLogin v-else-if="!isLoggedIn" @iniciar-sesion="iniciarSesionGoogle" />

  <div v-else class="flex flex-col md:flex-row w-full h-full overflow-hidden">

    <Sidebar :tab="tab" :userName="userName" :userAvatar="userAvatar" @cambiar-tab="tab = $event"
      @cerrar-sesion="cerrarSesion" />

    <main class="flex-1 flex flex-col h-full w-full min-w-0 bg-slate-50 relative">

      <TopHeader :tituloCabecera="tituloCabecera" :fechaGlobal="fechaGlobal" :formatoMes="formatoMes"
        :userAvatar="userAvatar" :userName="userName" @update:fechaGlobal="fechaGlobal = $event"
        @abrir-modal-tx="abrirModalTransaccion" @cambiar-tab="tab = $event" />

      <div class="flex-1 overflow-hidden relative">
        <VistaInicio v-show="tab === 'inicio'" :saldosLiquidos="saldosLiquidos" :saldosAhorro="saldosAhorro"
          :bolsaCashback="bolsaCashback" :creditoDisponible="creditoDisponible"
          :proyeccionProximoMes="proyeccionProximoMes" :historialFiltrado="historialFiltrado"
          :formatoMoneda="formatoMoneda" @editar-cashback="editarCashbackInicial"
          @preparar-rescate="prepararRescateCashback" @abrir-modal-tx="abrirModalTransaccion"
          @eliminar-registro="eliminarRegistro" />

        <VistaCuentas v-show="tab === 'cuentas'" :cuentasActivas="cuentasActivas" :cuentasPorCobrar="cuentasPorCobrar"
          :formatoMoneda="formatoMoneda" :getClaseColorBanco="getClaseColorBanco"
          @abrir-modal-nueva="abrirModalNuevaCuenta" @abrir-modal="abrirModalCuenta" />

        <VistaDeudas v-show="tab === 'deudas'" :diagnosticoDeuda="diagnosticoDeuda" :deudasActivas="deudasActivas"
          :getClaseColorPasivo="getClaseColorPasivo" :formatoMoneda="formatoMoneda" @bind-ref="bindChartRef"
          @abrir-modal-nueva="abrirModalNuevaCuenta" @abrir-modal="abrirModalCuenta" />

        <VistaAsesor v-show="tab === 'asesor'" :diagnosticoDeuda="diagnosticoDeuda" :saldosLiquidos="saldosLiquidos"
          :saldosAhorro="saldosAhorro" @bind-ref="bindChartRef" />

        <VistaPagos v-show="tab === 'pagos'" :flujoNetoMensual="flujoNetoMensual"
          :totalIngresosFijos="totalIngresosFijos" :totalGastosFijos="totalGastosFijos"
          :pagosFijosIngresos="pagosFijosIngresos" :pagosFijosEgresos="pagosFijosEgresos" :formatoMoneda="formatoMoneda"
          @abrir-modal-nuevo="abrirModalNuevoPagoFijo" @abrir-modal="abrirModalPagoFijo"
          @eliminar-registro="eliminarRegistro" />

        <VistaHistorial v-show="tab === 'historial'" :historialFiltrado="historialFiltrado"
          :formatoMoneda="formatoMoneda" @bind-ref="bindChartRef" @abrir-modal-tx="abrirModalTransaccion"
          @eliminar-registro="eliminarRegistro" />

        <VistaContactos v-if="vistaActual === 'Contactos'" :etiquetas="etiquetas" v-model:tagSearch="tagSearch"
          :operacionesTerceros="operacionesTerceros" @bind-ref="bindRef" @abrir-modal-nueva="abrirModalNuevaEtiqueta"
          @abrir-modal="abrirModalEtiqueta" @eliminar-registro="eliminarRegistro" />

        <VistaPerfil v-show="tab === 'perfil'" :userName="userName" :userAvatar="userAvatar" :userEmail="userEmail"
          @cerrar-sesion="cerrarSesion" />

        <VistaAjustes v-show="tab === 'ajustes'" :categorias="categorias" @abrir-modal-nueva="abrirModalNuevaCategoria"
          @abrir-modal="abrirModalCategoria" @eliminar-registro="eliminarRegistro" />

      </div>
    </main>

    <BottomNav :tab="tab" @cambiar-tab="tab = $event" @abrir-modal="abrirModalTransaccion()" />
  </div>

  <ModalBase :show="showModal"
    :titulo="isRescateCashback ? 'Abonar Cashback' : (editandoTx.estado ? 'Editar Operación' : 'Nueva Operación')"
    lineaMobile @cerrar="showModal = false">
    <FormTransaccion :editandoTx="editandoTx" :isRescateCashback="isRescateCashback" :tipoOperacion="tipoOperacion"
      :bolsaCashback="bolsaCashback" :tx="tx" :txTransf="txTransf" :cuentas="cuentas"
      :categoriasFiltradas="categoriasFiltradas" :etiquetas="etiquetas" @update:tipoOperacion="tipoOperacion = $event"
      @update-tx="(prop, val) => tx[prop] = val" @update-txTransf="(prop, val) => txTransf[prop] = val"
      @ejecutar="ejecutarOperacion" @cancelar="showModal = false" :txTercero="txTercero"
      @update-txTercero="(prop, val) => txTercero[prop] = val" />
  </ModalBase>

  <ModalBase :show="showModalCuenta" :titulo="editandoCuenta.estado ? 'Editar Cuenta' : 'Nueva Cuenta'"
    @cerrar="showModalCuenta = false">
    <FormCuenta :nuevaCuenta="nuevaCuenta" @update-cuenta="(prop, val) => nuevaCuenta[prop] = val"
      @guardar="guardarCuenta" />
  </ModalBase>

  <ModalBase :show="showModalPagoFijo" :titulo="editandoPagoFijo.estado ? 'Editar Proyección' : 'Nueva Proyección'"
    @cerrar="showModalPagoFijo = false">
    <FormPagoFijo :nuevoPagoFijo="nuevoPagoFijo" @update-pago="(prop, val) => nuevoPagoFijo[prop] = val"
      @guardar="guardarPagoFijo" />
  </ModalBase>

  <ModalBase :show="showModalCat" :titulo="editandoCat.estado ? 'Editar Categoría' : 'Nueva Categoría'"
    maxWidth="max-w-sm" @cerrar="showModalCat = false">
    <FormCategoria :nuevaCat="nuevaCat" @update-cat="(prop, val) => nuevaCat[prop] = val" @guardar="guardarCategoria" />
  </ModalBase>

  <ModalBase :show="showModalEtiq" :titulo="editandoEtiq.estado ? 'Editar Contacto' : 'Nuevo Contacto'"
    maxWidth="max-w-sm" @cerrar="showModalEtiq = false">
    <FormEtiqueta :nuevaEtiq="nuevaEtiq" @update-etiq="(prop, val) => nuevaEtiq[prop] = val"
      @guardar="guardarEtiqueta" />
  </ModalBase>

</template>

<script>
import PantallaLogin from './components/PantallaLogin.vue';
import TopHeader from './components/TopHeader.vue';
import Sidebar from './components/Sidebar.vue';
import BottomNav from './components/BottomNav.vue';
import VistaInicio from './components/VistaInicio.vue';
import VistaCuentas from './components/VistaCuentas.vue';
import VistaPagos from './components/VistaPagos.vue';
import VistaDeudas from './components/VistaDeudas.vue';
import VistaAsesor from './components/VistaAsesor.vue';
import VistaHistorial from './components/VistaHistorial.vue';
import VistaContactos from './components/VistaContactos.vue';
import VistaPerfil from './components/VistaPerfil.vue';
import VistaAjustes from './components/VistaAjustes.vue';

import ModalBase from './components/ModalBase.vue';
import FormTransaccion from './components/forms/FormTransaccion.vue';
import FormCuenta from './components/forms/FormCuenta.vue';
import FormPagoFijo from './components/forms/FormPagoFijo.vue';
import FormCategoria from './components/forms/FormCategoria.vue';
import FormEtiqueta from './components/forms/FormEtiqueta.vue';

import { onMounted, watch } from 'vue';
import { useAuth } from "./js/composables/useAuth.js";
import { useUI } from "./js/composables/useUI.js";
import { useFinanceData } from "./js/composables/useFinanceData.js";
import { useCalculations } from "./js/composables/useCalculations.js";
import { useCharts } from "./js/composables/useCharts.js";

export default {
  components: {
    Sidebar, BottomNav, VistaInicio, VistaCuentas, VistaPagos, VistaDeudas,
    VistaHistorial, VistaContactos, VistaPerfil, VistaAjustes, PantallaLogin, TopHeader,
    ModalBase, FormTransaccion, FormCuenta, FormPagoFijo, FormCategoria, FormEtiqueta, VistaAsesor
  },
  setup() {
    const auth = useAuth();
    const ui = useUI();

    const onDatosActualizados = () => {
      setTimeout(() => {
        if (ui.tab.value === "historial") charts.renderizarGraficosHistorial();
        if (ui.tab.value === "contactos") charts.renderizarGraficosContactos();
      }, 50);
    };

    const data = useFinanceData(
      auth.currentUserId,
      ui.cargando,
      ui.mostrarToast,
      ui.showModal,
      ui.tipoOperacion,
      ui.tab,
      onDatosActualizados
    );

    const calcs = useCalculations(data, ui);
    const charts = useCharts(data, calcs);

    const bindChartRef = (type, el) => {
      if (type === 'cat') charts.chartCatRef.value = el;
      if (type === 'flujo') charts.chartFlujoRef.value = el;
      if (type === 'contacto') charts.chartContactoRef.value = el;
      if (type === 'deuda') charts.chartDeudaRef.value = el;
    };

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
          data.cargarDatos().then(() => { ui.cargando.value = false; });
        } else if (window.location.hash.includes("access_token")) {
          ui.cargando.value = true;
        } else {
          ui.cargando.value = false;
        }
      });

      auth.supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          auth.actualizarDatosUsuario(session);
          data.cargarDatos().then(() => { ui.cargando.value = false; });
        } else {
          auth.isLoggedIn.value = false;
          auth.currentUserId.value = "";
          ui.cargando.value = false;
        }
      });
    });

    watch(ui.tab, (newTab) => {
      setTimeout(() => {
        if (newTab === "historial") charts.renderizarGraficosHistorial();
        if (newTab === "contactos") charts.renderizarGraficosContactos();
      }, 50);
    });

    watch(() => ui.tagSearch.value, () => {
      if (ui.tab.value === "contactos") {
        setTimeout(() => charts.renderizarGraficosContactos(), 50);
      }
    });

    watch(() => data.fechaGlobal.value, () => {
      setTimeout(() => {
        if (ui.tab.value === "historial") charts.renderizarGraficosHistorial();
        if (ui.tab.value === "contactos") charts.renderizarGraficosContactos();
      }, 50);
    });

    return {
      ...auth, ...ui, ...data, ...calcs, ...charts, cerrarSesion, bindChartRef
    };
  }
}
</script>