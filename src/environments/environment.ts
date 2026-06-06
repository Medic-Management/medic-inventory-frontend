// Environment de desarrollo (apuntando al servidor / producción)
export const environment = {
  production: false,
  // Conectado al servidor Azure (lo usado para las pruebas reales)
  apiUrl: 'http://172.200.21.101:8080/api'

  // Para desarrollo 100% local (comentar la de arriba y descomentar esta)
  // apiUrl: 'http://localhost:8080/api'
};
