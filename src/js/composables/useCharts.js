// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

import { ref } from "vue";

export function useCharts(data, calcs) {
  const chartCatRef = ref(null);
  const chartFlujoRef = ref(null);
  const chartContactoRef = ref(null);

  let chartCat, chartFlujo, chartContacto;

  const destruirGraficos = () => {
    if (chartCat) chartCat.destroy();
    if (chartFlujo) chartFlujo.destroy();
    if (chartContacto) chartContacto.destroy();
  };

  const renderizarGraficosHistorial = () => {
    // 1. Gráfico de Categorías (Donut)
    if (chartCatRef.value) {
      if (chartCat) chartCat.destroy();
      chartCatRef.value.innerHTML = "";

      const datos = calcs.datosGraficoCat.value;
      if (datos.series.length > 0) {
        const optionsCat = {
          series: datos.series,
          labels: datos.labels,
          chart: { type: "donut", height: 320, fontFamily: "inherit" },
          dataLabels: { enabled: false },
          stroke: { width: 0 },
          plotOptions: {
            pie: {
              donut: {
                size: "70%",
                labels: {
                  show: true,
                  name: { show: true },
                  value: {
                    show: true,
                    formatter: (v) => "S/ " + parseFloat(v).toFixed(2),
                    fontSize: "20px",
                    fontWeight: 800,
                  },
                },
              },
            },
          },
          legend: { position: "bottom" },
          tooltip: {
            theme: "light",
            y: { formatter: (v) => "S/ " + v.toFixed(2) },
          },
        };
        chartCat = new ApexCharts(chartCatRef.value, optionsCat);
        chartCat.render();
      } else {
        chartCatRef.value.innerHTML =
          '<div class="flex items-center justify-center h-[300px] text-slate-400 text-sm font-medium text-center">No hay gastos registrados este mes</div>';
      }
    }

    // 2. Gráfico Comparativo (Barras)
    if (chartFlujoRef.value) {
      if (chartFlujo) chartFlujo.destroy();
      chartFlujoRef.value.innerHTML = "";

      const datosF = calcs.datosGraficoFlujo.value;
      const optionsFlujo = {
        series: [
          {
            name: "Monto (S/)",
            data: [
              Number(datosF.ingresos.toFixed(2)),
              Number(datosF.egresos.toFixed(2)),
            ],
          },
        ],
        chart: {
          type: "bar",
          height: 300,
          toolbar: { show: false },
          fontFamily: "inherit",
        },
        colors: ["#10b981", "#f43f5e"],
        plotOptions: {
          bar: { borderRadius: 6, distributed: true, columnWidth: "50%" },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: ["Ingresos", "Gastos"],
          labels: { style: { colors: "#64748b", fontWeight: 600 } },
        },
        yaxis: {
          labels: {
            formatter: (v) => "S/ " + v.toFixed(0),
            style: { colors: "#64748b" },
          },
        },
        grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
        tooltip: {
          theme: "light",
          y: { formatter: (v) => "S/ " + v.toFixed(2) },
        },
        legend: { show: false },
      };
      chartFlujo = new ApexCharts(chartFlujoRef.value, optionsFlujo);
      chartFlujo.render();
    }
  };

  const renderizarGraficosContactos = () => {
    if (chartContactoRef.value) {
      if (chartContacto) chartContacto.destroy();
      chartContactoRef.value.innerHTML = "";

      const datos = calcs.datosGraficoContacto.value;
      if (datos.hasData && datos.series.length > 0) {
        const options = {
          series: datos.series,
          labels: datos.labels,
          chart: { type: "donut", height: 320, fontFamily: "inherit" },
          colors: ["#3b82f6", "#cbd5e1"],
          dataLabels: { enabled: false },
          stroke: { width: 0 },
          plotOptions: {
            pie: {
              donut: {
                size: "70%",
                labels: {
                  show: true,
                  name: { show: true },
                  value: {
                    show: true,
                    formatter: (v) => "S/ " + parseFloat(v).toFixed(2),
                    fontSize: "20px",
                    fontWeight: 800,
                  },
                },
              },
            },
          },
          legend: { position: "bottom" },
          tooltip: {
            theme: "light",
            y: { formatter: (v) => "S/ " + v.toFixed(2) },
          },
        };
        chartContacto = new ApexCharts(chartContactoRef.value, options);
        chartContacto.render();
      } else {
        chartContactoRef.value.innerHTML =
          '<div class="flex items-center justify-center h-[300px] text-slate-400 text-sm font-medium text-center px-4">Selecciona un contacto arriba para analizar los gastos compartidos del mes</div>';
      }
    }
  };

  return {
    chartCatRef,
    chartFlujoRef,
    chartContactoRef,
    renderizarGraficosHistorial,
    renderizarGraficosContactos,
    destruirGraficos,
  };
}
