// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable para Visualización Gráfica (ApexCharts)

const { ref } = window.Vue;

export function useCharts(data, calcs) {
  const { historial } = data;
  const { diagnosticoDeuda } = calcs;

  const chartCatRef = ref(null);
  const chartFlujoRef = ref(null);
  const chartDeudaRef = ref(null);

  let chartCatInstance = null;
  let chartFlujoInstance = null;
  let chartDeudaInstance = null;

  const destruirGraficos = () => {
    if (chartCatInstance) {
      chartCatInstance.destroy();
      chartCatInstance = null;
    }
    if (chartFlujoInstance) {
      chartFlujoInstance.destroy();
      chartFlujoInstance = null;
    }
    if (chartDeudaInstance) {
      chartDeudaInstance.destroy();
      chartDeudaInstance = null;
    }
  };

  const renderizarGraficosAnalitica = () => {
    destruirGraficos(); // Limpiar previos por seguridad

    if (chartCatRef.value) {
      const egresos = historial.value.filter(
        (h) =>
          h.tipo_flujo === "Egreso" &&
          !h.categoria_nombre.includes("Transferencia"),
      );
      const datosAgrupados = {};
      egresos.forEach((e) => {
        if (!datosAgrupados[e.categoria_nombre])
          datosAgrupados[e.categoria_nombre] = 0;
        datosAgrupados[e.categoria_nombre] += e.monto;
      });

      if (Object.keys(datosAgrupados).length > 0) {
        chartCatInstance = new window.ApexCharts(chartCatRef.value, {
          series: Object.values(datosAgrupados),
          labels: Object.keys(datosAgrupados),
          chart: {
            type: "donut",
            height: "100%",
            width: "100%",
            fontFamily: "inherit",
            background: "transparent",
          },
          plotOptions: {
            pie: {
              donut: {
                size: "70%",
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 600,
                  },
                  value: {
                    show: true,
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#0f172a",
                    formatter: function (val) {
                      return "S/ " + parseFloat(val).toFixed(2);
                    },
                  },
                  total: {
                    show: true,
                    label: "Total Egresos",
                    color: "#64748b",
                    fontWeight: 600,
                    formatter: function (w) {
                      return (
                        "S/ " +
                        w.globals.seriesTotals
                          .reduce((a, b) => a + b, 0)
                          .toFixed(2)
                      );
                    },
                  },
                },
              },
            },
          },
          dataLabels: { enabled: false },
          stroke: { width: 0 },
          theme: { palette: "palette1" },
          legend: { position: "bottom", fontSize: "13px", fontWeight: 600 },
          tooltip: {
            y: {
              formatter: function (val) {
                return "S/ " + val.toFixed(2);
              },
            },
          },
        });
        chartCatInstance.render();
      }
    }

    if (chartFlujoRef.value) {
      const ingresosPEN = historial.value
        .filter(
          (h) =>
            h.tipo_flujo === "Ingreso" &&
            h.moneda === "PEN" &&
            !h.categoria_nombre.includes("Transferencia"),
        )
        .reduce((a, b) => a + b.monto, 0);
      const egresosPEN = historial.value
        .filter(
          (h) =>
            h.tipo_flujo === "Egreso" &&
            h.moneda === "PEN" &&
            !h.categoria_nombre.includes("Transferencia"),
        )
        .reduce((a, b) => a + b.monto, 0);

      chartFlujoInstance = new window.ApexCharts(chartFlujoRef.value, {
        series: [{ name: "Monto en Soles", data: [ingresosPEN, egresosPEN] }],
        chart: {
          type: "bar",
          height: "100%",
          width: "100%",
          fontFamily: "inherit",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            distributed: true,
            horizontal: false,
            columnWidth: "50%",
          },
        },
        colors: ["#10b981", "#f43f5e"],
        dataLabels: { enabled: false },
        xaxis: {
          categories: ["Ingresos", "Egresos"],
          labels: {
            style: {
              fontSize: "13px",
              fontWeight: 600,
              colors: ["#64748b", "#64748b"],
            },
          },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return "S/ " + val.toFixed(0);
            },
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "S/ " + val.toFixed(2);
            },
          },
        },
      });
      chartFlujoInstance.render();
    }
  };

  const renderizarGraficoDeuda = () => {
    if (!chartDeudaRef.value) return;
    if (chartDeudaInstance) {
      chartDeudaInstance.destroy();
      chartDeudaInstance = null;
    }

    chartDeudaInstance = new window.ApexCharts(chartDeudaRef.value, {
      series: [diagnosticoDeuda.value.porcentajeCobertura],
      chart: {
        type: "radialBar",
        height: "100%",
        width: "100%",
        fontFamily: "inherit",
        sparkline: { enabled: false },
      },
      plotOptions: {
        radialBar: {
          startAngle: -100,
          endAngle: 100,
          hollow: { size: "65%" },
          track: { background: "#f1f5f9", strokeWidth: "100%", margin: 5 },
          dataLabels: {
            name: {
              show: true,
              fontSize: "11px",
              color: "#64748b",
              offsetY: 30,
              fontWeight: 700,
            },
            value: {
              offsetY: -5,
              fontSize: "32px",
              fontWeight: 900,
              color: "#0f172a",
              formatter: function (val) {
                return val + "%";
              },
            },
          },
        },
      },
      fill: { colors: [diagnosticoDeuda.value.colorGrafico] },
      stroke: { lineCap: "round" },
      labels: ["Cobertura Segura"],
    });
    chartDeudaInstance.render();
  };

  return {
    chartCatRef,
    chartFlujoRef,
    chartDeudaRef,
    renderizarGraficosAnalitica,
    renderizarGraficoDeuda,
    destruirGraficos,
  };
}
