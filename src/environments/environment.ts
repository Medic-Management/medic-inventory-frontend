// Environment de desarrollo (apuntando al servidor / producción)
export const environment = {
  production: false,
  // Servidor Azure por HTTPS (puerto 8443)
  apiUrl: 'https://172.200.21.101:8443/api'

  // Para desarrollo 100% local (comentar la de arriba y descomentar esta)
  // apiUrl: 'http://localhost:8080/api'
};
