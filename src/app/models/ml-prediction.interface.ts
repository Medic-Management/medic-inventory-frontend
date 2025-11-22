/**
 * Interfaces para predicciones de Machine Learning
 */

export interface PrediccionPicoDemanda {
  productoId: number;
  nombre: string;
  tienePicoDemanda: boolean;
  probabilidad: number;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  recomendacion: string;
}

export interface PrediccionRiesgoVencimiento {
  productoId: number;
  nombre: string;
  tieneRiesgo: boolean;
  probabilidad: number;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  recomendacion: string;
}

export interface PicoDemandaResponse {
  totalProductos: number;
  productosConPico: number;
  predicciones: PrediccionPicoDemanda[];
}

export interface RiesgoVencimientoResponse {
  totalProductos: number;
  productosEnRiesgo: number;
  predicciones: PrediccionRiesgoVencimiento[];
}

export interface ResumenPredicciones {
  picos_demanda: PicoDemandaResponse;
  riesgo_vencimiento: RiesgoVencimientoResponse;
  timestamp: number;
}

export interface MLHealthStatus {
  ml_service_status: 'healthy' | 'unhealthy';
  ml_service_url: string;
}
