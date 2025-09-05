// utils/api.ts

// 🎯 Configuración de tu API real
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Cambiar por la URL real de tu API
  ENDPOINTS: {
    HUGGINGFACE: '/huggingface',
    XCEPTION_DETECT: '/xception/detect',
    XCEPTION_WEIGHTS: '/xception/weights'
  }
};

// 🎯 Interfaz estándar para tu frontend (basada en tu API)
export interface APIAnalysisResult {
  fake: string;
  real: string;
  prediccion: string;
}

// 📦 Interfaz para modelos disponibles
export interface AvailableModel {
  filename: string;
  size_bytes: number;
  model_type: string;
}

// 🔄 FUNCIÓN 1: Análisis con Huggingface
export const analyzeWithHuggingface = async (
  file: File, 
  recortarCara: boolean = false
): Promise<APIAnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recortar_cara', recortarCara.toString());
    formData.append('device', 'cpu'); // o 'cuda' si tienes GPU

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HUGGINGFACE}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    // Procesar respuesta exacta de tu API
    return {
      fake: result.result.fake.toString(),
      real: result.result.real.toString(),
      prediccion: result.result.prediction
    };

  } catch (error) {
    console.error('Error con Huggingface API:', error);
    throw new Error('Error al analizar con Huggingface. Verifica que la API esté funcionando.');
  }
};

// 🔄 FUNCIÓN 2: Análisis con Xception
export const analyzeWithXception = async (
  file: File,
  modelName: string,
  recortarCara: boolean = false
): Promise<APIAnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    formData.append('recortar_cara', recortarCara.toString());
    formData.append('device', 'cpu'); // o 'cuda' si tienes GPU

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_DETECT}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    // Procesar respuesta exacta de tu API
    return {
      fake: result.result.fake.toString(),
      real: result.result.real.toString(),
      prediccion: result.result.prediction
    };

  } catch (error) {
    console.error('Error con Xception API:', error);
    throw new Error('Error al analizar con Xception. Verifica que la API esté funcionando.');
  }
};

// 🔄 FUNCIÓN 3: Obtener modelos disponibles
export const getAvailableModels = async (): Promise<AvailableModel[]> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_WEIGHTS}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    return result.available_models || [];

  } catch (error) {
    console.error('Error obteniendo modelos:', error);
    throw new Error('Error al obtener modelos disponibles.');
  }
};

// 🚀 FUNCIÓN PRINCIPAL - La que usas en tus componentes
export const analyzeImage = async (
  file: File,
  method: 'huggingface' | 'xception' = 'huggingface',
  options: {
    modelName?: string;
    recortarCara?: boolean;
  } = {}
): Promise<APIAnalysisResult> => {
  
  // Validar tamaño de archivo (10MB máximo)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 10MB.');
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato no válido. Solo se permiten PNG, JPG, JPEG.');
  }

  const { modelName, recortarCara = false } = options;

  try {
    switch (method) {
      case 'huggingface':
        return await analyzeWithHuggingface(file, recortarCara);
      
      case 'xception':
        if (!modelName) {
          throw new Error('Se requiere seleccionar un modelo para Xception.');
        }
        return await analyzeWithXception(file, modelName, recortarCara);
      
      default:
        throw new Error(`Método "${method}" no soportado`);
    }
  } catch (error) {
    console.error(`Error con método ${method}:`, error);
    throw error;
  }
};

// 🛠️ Función helper para detectar dispositivo
export const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  
  if (/Mobile|Android|iPhone/.test(userAgent)) {
    return 'mobile';
  } else if (/iPad|Tablet/.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

// 📊 Función para obtener estado de la API
export const getAPIStatus = () => {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    endpoints: API_CONFIG.ENDPOINTS,
    isConfigured: true
  };
};

// 🧪 Función para probar conectividad
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_WEIGHTS}`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Error de conectividad:', error);
    return false;
  }
};