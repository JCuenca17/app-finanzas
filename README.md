# Finanzas personales

App web que hice en abril de 2026 para llevar finanzas personales: saldos, gastos, deudas y pagos fijos. Estuvo desplegada un tiempo en Vercel y Render; ahora no está en línea, así que este repositorio queda como registro del proyecto.

## Qué hace

- Inicio de sesión con Google a través de Supabase.
- Cuentas con su saldo, separadas entre dinero disponible y cuentas por cobrar.
- Ingresos y gastos con categorías y etiquetas, y un historial para revisarlos o editarlos.
- Pagos fijos de cada mes, tanto ingresos como gastos.
- Deudas y préstamos con otras personas, agrupados por contacto.
- Una vista de análisis con la liquidez, la cobertura del mes y una proyección del flujo de caja, con gráficos de ApexCharts.
- Se instala como PWA y en el celular la navegación pasa a una barra inferior.

## Cómo está armada

El frontend es este repositorio: Vue 3 con Vite y Tailwind CSS. Cada pantalla es un componente en `src/components/`, y la lógica está repartida en composables (`src/js/composables/`) para la sesión, los datos, los cálculos y los gráficos.

El backend está en un repositorio aparte y privado. Es una API en FastAPI con SQLAlchemy sobre PostgreSQL (alojado en Supabase), con endpoints para usuarios, cuentas, transacciones, categorías, etiquetas, pagos fijos, operaciones con terceros y cashback. El frontend la llama desde `src/js/api.js`.

## Ejecutarlo

Copiar `.env.example` como `.env.local` y completar la URL y la clave publishable del proyecto de Supabase, y la URL de la API.

```
npm install
npm run dev
```
