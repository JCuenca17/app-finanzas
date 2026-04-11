// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

const { ref } = window.Vue;

export function useCharts(data, calcs) {
  const chartCatRef = ref(null);
  const chartContactoRef = ref(null);
  const chartDeudaRef = ref(null);

  let chartCat, chartContacto, chartDeuda;

  const destruirGraficos = () => {
    if (chartCat) chartCat.destroy();
    if (chartContacto) chartContacto.destroy();
    if (chartDeuda) chartDeuda.destroy();
  };

  const renderizarGraficosHistorial = () => {
    if (chartCatRef.value) {
      if (chartCat) chartCat.destroy();
      const datos = calcs.datosGraficoCat.value;
      if (datos.series.length > 0) {
        const optionsCat = {
          series: datos.series,
          labels: datos.labels,
          chart: { type: "donut", height: 300, fontFamily: "inherit" },
          dataLabels: { enabled: false },
          stroke: { width: 0 },
          plotOptions: {
            pie: {
              donut: {
                size: "75%",
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
          legend: { position: "right" },
          tooltip: {
            theme: "light",
            y: { formatter: (v) => "S/ " + v.toFixed(2) },
          },
        };
        chartCat = new ApexCharts(chartCatRef.value, optionsCat);
        chartCat.render();
      } else {
        chartCatRef.value.innerHTML =
          '<div class="flex items-center justify-center h-full text-slate-400 text-sm font-medium">No hay gastos registrados este mes</div>';
      }
    }
  };

  const renderizarGraficosContactos = () => {
    if (chartContactoRef.value) {
      if (chartContacto) chartContacto.destroy();
      const datos = calcs.datosGraficoContacto.value;
      if (datos.hasData && datos.series.length > 0) {
        const options = {
          series: datos.series,
          labels: datos.labels,
          chart: { type: "donut", height: 300, fontFamily: "inherit" },
          colors: ["#3b82f6", "#cbd5e1"], // Azul brillante para el contacto, gris suave para el resto
          dataLabels: { enabled: false },
          stroke: { width: 0 },
          plotOptions: {
            pie: {
              donut: {
                size: "75%",
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
          '<div class="flex items-center justify-center h-full text-slate-400 text-sm font-medium text-center px-4">Selecciona un contacto arriba para analizar los gastos compartidos del mes</div>';
      }
    }
  };

  const renderizarGraficoDeuda = () => {
    if (chartDeudaRef.value) {
      if (chartDeuda) chartDeuda.destroy();
      const diag = calcs.diagnosticoDeuda.value;
      const optionsDeuda = {
        series: [diag.porcentajeCobertura || 0],
        chart: { type: "radialBar", height: 250, fontFamily: "inherit" },
        plotOptions: {
          radialBar: {
            hollow: { size: "70%" },
            track: { background: "#f1f5f9" },
            dataLabels: {
              name: { show: false },
              value: {
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
                formatter: (v) => v + "%",
              },
            },
          },
        },
        colors: [diag.colorGrafico || "#10b981"],
        stroke: { lineCap: "round" },
      };
      chartDeuda = new ApexCharts(chartDeudaRef.value, optionsDeuda);
      chartDeuda.render();
    }
  };

  return {
    chartCatRef,
    chartContactoRef,
    chartDeudaRef,
    renderizarGraficosHistorial,
    renderizarGraficosContactos,
    renderizarGraficoDeuda,
    destruirGraficos,
  };
}
