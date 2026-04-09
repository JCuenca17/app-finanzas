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

  // --- TRANSACCIONES ---
  async guardarTransaccion(datos) {
    return await fetch(`${API_URL}/transacciones/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async actualizarTransaccion(id, datos) {
    return await fetch(`${API_URL}/transacciones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async eliminarTransaccion(id) {
    return await fetch(`${API_URL}/transacciones/${id}`, { method: "DELETE" });
  },

  // --- PAGOS FIJOS (PROYECCIÓN) ---
  async guardarPagoFijo(datos) {
    return await fetch(`${API_URL}/pagos_fijos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async actualizarPagoFijo(id, datos) {
    return await fetch(`${API_URL}/pagos_fijos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async eliminarPagoFijo(id) {
    return await fetch(`${API_URL}/pagos_fijos/${id}`, { method: "DELETE" });
  },

  // --- CUENTAS ---
  async guardarCuenta(datos) {
    return await fetch(`${API_URL}/cuentas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async actualizarCuenta(id, datos) {
    return await fetch(`${API_URL}/cuentas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async eliminarCuenta(id) {
    return await fetch(`${API_URL}/cuentas/${id}`, { method: "DELETE" });
  },

  // --- CATEGORÍAS ---
  async guardarCategoria(datos) {
    return await fetch(`${API_URL}/categorias/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async actualizarCategoria(id, datos) {
    return await fetch(`${API_URL}/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async eliminarCategoria(id) {
    return await fetch(`${API_URL}/categorias/${id}`, { method: "DELETE" });
  },
};
