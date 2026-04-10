// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Motor de Renderizado Visual (ApexCharts)

const { ref } = window.Vue;

export function useCharts(data, calcs) {
  // Referencias obligatorias al HTML (Para que Vue no se cuelgue)
  const chartPatrimonioRef = ref(null);
  const chartDiversificacionRef = ref(null);
  const chartCalendarioRef = ref(null);
  const chartDeudaRef = ref(null);
  const chartFlujoRef = ref(null);
  const chartCatRef = ref(null);

  // Instancias internas
  let chartPatrimonio,
    chartDiversificacion,
    chartCalendario,
    chartDeuda,
    chartFlujo,
    chartCat;

  const destruirGraficos = () => {
    if (chartPatrimonio) chartPatrimonio.destroy();
    if (chartDiversificacion) chartDiversificacion.destroy();
    if (chartCalendario) chartCalendario.destroy();
    if (chartDeuda) chartDeuda.destroy();
    if (chartFlujo) chartFlujo.destroy();
    if (chartCat) chartCat.destroy();
  };

  const renderizarGraficosInicio = () => {
    if (!chartPatrimonioRef.value) return;
    if (chartPatrimonio) chartPatrimonio.destroy();
    const datos = calcs.datosPatrimonio.value;
    const options = {
      series: [{ name: "Patrimonio Neto (S/)", data: datos.series }],
      chart: {
        type: "area",
        height: 300,
        toolbar: { show: false },
        fontFamily: "inherit",
        parentHeightOffset: 0,
      },
      colors: ["#10b981"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: datos.labels,
        tooltip: { enabled: false },
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (v) => "S/ " + v.toFixed(0),
          style: { colors: "#64748b", fontWeight: 600 },
        },
      },
      grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
      tooltip: {
        theme: "light",
        y: { formatter: (v) => "S/ " + v.toFixed(2) },
      },
    };
    chartPatrimonio = new ApexCharts(chartPatrimonioRef.value, options);
    chartPatrimonio.render();
  };

  const renderizarGraficosAnalitica = () => {
    // 1. Gráfico de Ingresos vs Egresos
    if (chartFlujoRef.value) {
      if (chartFlujo) chartFlujo.destroy();
      const datos = calcs.datosGraficoFlujo.value;
      const options = {
        series: [{ name: "Monto (S/)", data: [datos.ingresos, datos.egresos] }],
        chart: {
          type: "bar",
          height: 280,
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
      };
      chartFlujo = new ApexCharts(chartFlujoRef.value, options);
      chartFlujo.render();
    }

    // 2. Gráfico de Categorías (Donut)
    if (chartCatRef.value) {
      if (chartCat) chartCat.destroy();
      const datos = calcs.datosGraficoCat.value;
      if (datos.series.length > 0) {
        const options = {
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
          legend: { position: "bottom" },
          tooltip: {
            theme: "light",
            y: { formatter: (v) => "S/ " + v.toFixed(2) },
          },
        };
        chartCat = new ApexCharts(chartCatRef.value, options);
        chartCat.render();
      } else {
        chartCatRef.value.innerHTML =
          '<div class="flex items-center justify-center h-full text-slate-400 text-sm">No hay gastos este mes</div>';
      }
    }
  };

  const renderizarGraficosCuentas = () => {
    if (!chartDiversificacionRef.value) return;
    if (chartDiversificacion) chartDiversificacion.destroy();
    const datos = calcs.datosDiversificacion.value;
    const options = {
      series: datos.series,
      labels: datos.labels,
      chart: { type: "donut", height: 320, fontFamily: "inherit" },
      colors: [
        "#002a8d",
        "#00A453",
        "#043263",
        "#EC111A",
        "#10b981",
        "#f59e0b",
        "#6366f1",
      ],
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
      tooltip: { theme: "light", y: { formatter: (v) => "S/ " + v } },
    };
    chartDiversificacion = new ApexCharts(
      chartDiversificacionRef.value,
      options,
    );
    chartDiversificacion.render();
  };

  const renderizarGraficosDeudas = () => {
    if (chartCalendarioRef.value) {
      if (chartCalendario) chartCalendario.destroy();
      const datosCal = calcs.datosCalendario.value;
      const optionsCal = {
        series: [{ name: "A Pagar", data: datosCal.series }],
        chart: {
          type: "bar",
          height: 250,
          toolbar: { show: false },
          fontFamily: "inherit",
        },
        colors: ["#e11d48"],
        plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: datosCal.categorias,
          title: { text: "Día del Mes", style: { color: "#94a3b8" } },
          labels: { style: { colors: "#64748b" } },
        },
        yaxis: {
          labels: {
            formatter: (v) => "S/ " + v.toFixed(0),
            style: { colors: "#64748b", fontWeight: 600 },
          },
        },
        grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
        tooltip: {
          theme: "light",
          y: { formatter: (v) => "S/ " + v.toFixed(2) },
        },
      };
      chartCalendario = new ApexCharts(chartCalendarioRef.value, optionsCal);
      chartCalendario.render();
    }

    if (chartDeudaRef.value) {
      if (chartDeuda) chartDeuda.destroy();
      const diag = calcs.diagnosticoDeuda.value;
      const opDeuda = {
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
      chartDeuda = new ApexCharts(chartDeudaRef.value, opDeuda);
      chartDeuda.render();
    }
  };

  // EXPORTAMOS TODAS LAS REFERENCIAS CORRECTAMENTE
  return {
    chartPatrimonioRef,
    chartDiversificacionRef,
    chartCalendarioRef,
    chartDeudaRef,
    chartFlujoRef,
    chartCatRef,
    renderizarGraficosInicio,
    renderizarGraficosAnalitica,
    renderizarGraficosCuentas,
    renderizarGraficosDeudas,
    destruirGraficos,
  };
}
