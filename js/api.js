// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Gestor de conexiones al Backend (Python)

const API_URL = "https://finanzas-backend-dgv5.onrender.com";

export const api = {
  async obtenerDatosCompletos(userId) {
    const [resCuentas, resHistorial, resCategorias, resPagosFijos] =
      await Promise.all([
        fetch(`${API_URL}/cuentas/${userId}`),
        fetch(`${API_URL}/historial/${userId}`),
        fetch(`${API_URL}/categorias/`),
        fetch(`${API_URL}/pagos_fijos/${userId}`),
      ]);

    return {
      cuentas: resCuentas.ok ? (await resCuentas.json()).cuentas : [],
      historialRaw: resHistorial.ok
        ? (await resHistorial.json()).historial
        : [],
      categorias: resCategorias.ok
        ? (await resCategorias.json()).categorias
        : [],
      pagosFijos: resPagosFijos.ok
        ? (await resPagosFijos.json()).pagos_fijos
        : [],
    };
  },

  async guardarTransaccion(datos) {
    return await fetch(`${API_URL}/transacciones/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },

  async guardarCategoria(datos) {
    return await fetch(`${API_URL}/categorias/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },

  async guardarCuenta(datos) {
    return await fetch(`${API_URL}/cuentas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },

  async guardarPagoFijo(datos) {
    return await fetch(`${API_URL}/pagos_fijos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
};
