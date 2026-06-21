// Environment para producción (Netlify)
export const environment = {
  production: true,
  // Servidor Azure por HTTPS (puerto 8443) — requerido porque Netlify usa HTTPS
  apiUrl: 'https://172.200.21.101:8443/api'
};
