// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

const { ref } = window.Vue;

export function useCharts(data, calcs) {
  const chartFlujoRef = ref(null);
  const chartCatRef = ref(null);
  const chartDeudaRef = ref(null);

  let chartFlujo, chartCat, chartDeuda;

  const destruirGraficos = () => {
    if (chartFlujo) chartFlujo.destroy();
    if (chartCat) chartCat.destroy();
    if (chartDeuda) chartDeuda.destroy();
  };

  const renderizarGraficosAnalitica = () => {
    // 1. Calcular Datos de Flujo Mensual
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    let ingresosMes = 0;
    let egresosMes = 0;
    const gastosPorCat = {};

    data.historial.value.forEach((tx) => {
      const fechaTx = new Date(tx.fecha + "T00:00:00");
      if (
        fechaTx.getMonth() === mesActual &&
        fechaTx.getFullYear() === añoActual
      ) {
        if (tx.tipo_flujo === "Ingreso") ingresosMes += tx.monto || 0;
        else if (tx.tipo_flujo === "Egreso") {
          egresosMes += tx.monto || 0;
          const catNombre = tx.categoria_nombre || "Otros";
          if (!gastosPorCat[catNombre]) gastosPorCat[catNombre] = 0;
          gastosPorCat[catNombre] += tx.monto || 0;
        }
      }
    });

    // 2. Renderizar Flujo
    if (chartFlujoRef.value) {
      if (chartFlujo) chartFlujo.destroy();
      const optionsFlujo = {
        series: [
          {
            name: "Monto (S/)",
            data: [
              Number(ingresosMes.toFixed(2)),
              Number(egresosMes.toFixed(2)),
            ],
          },
        ],
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
      chartFlujo = new ApexCharts(chartFlujoRef.value, optionsFlujo);
      chartFlujo.render();
    }

    // 3. Renderizar Categorías
    if (chartCatRef.value) {
      if (chartCat) chartCat.destroy();
      const labels = Object.keys(gastosPorCat);
      const series = Object.values(gastosPorCat).map((v) =>
        Number(v.toFixed(2)),
      );

      if (series.length > 0) {
        const optionsCat = {
          series: series,
          labels: labels,
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
        chartCat = new ApexCharts(chartCatRef.value, optionsCat);
        chartCat.render();
      } else {
        chartCatRef.value.innerHTML =
          '<div class="flex items-center justify-center h-full text-slate-400 text-sm">No hay gastos este mes</div>';
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
    chartFlujoRef,
    chartCatRef,
    chartDeudaRef,
    renderizarGraficosAnalitica,
    renderizarGraficoDeuda,
    destruirGraficos,
  };
}
