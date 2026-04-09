// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones

const API_URL = "https://finanzas-backend-dgv5.onrender.com";

export const api = {
  async obtenerDatosCompletos(userId) {
    const [
      resCuentas,
      resHistorial,
      resCategorias,
      resPagosFijos,
      resEtiquetas,
      resCashback,
    ] = await Promise.all([
      fetch(`${API_URL}/cuentas/${userId}`),
      fetch(`${API_URL}/historial/${userId}`),
      fetch(`${API_URL}/categorias/`),
      fetch(`${API_URL}/pagos_fijos/${userId}`),
      fetch(`${API_URL}/etiquetas/${userId}`),
      fetch(`${API_URL}/bolsa_cashback/${userId}`),
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
      etiquetas: resEtiquetas.ok ? (await resEtiquetas.json()).etiquetas : [],
      bolsaCashback: resCashback.ok
        ? await resCashback.json()
        : { saldo_inicial: 0, generado: 0, usado: 0, disponible: 0 },
    };
  },

  async actualizarBolsaCashback(userId, datos) {
    return await fetch(`${API_URL}/bolsa_cashback/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },

  // ... (El resto de tus llamadas POST, PUT y DELETE para transacciones, cuentas, etc. se mantiene igual, no las borraré aquí, tú ya las tienes en tu api.js)
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
  async guardarEtiqueta(datos) {
    return await fetch(`${API_URL}/etiquetas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async actualizarEtiqueta(id, datos) {
    return await fetch(`${API_URL}/etiquetas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  },
  async eliminarEtiqueta(id) {
    return await fetch(`${API_URL}/etiquetas/${id}`, { method: "DELETE" });
  },
};
