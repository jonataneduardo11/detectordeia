// utils/api.ts

// 🎯 Configuración de tu API real
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Cambiar por la URL real de tu API
  ENDPOINTS: {
    HUGGINGFACE: '/api/huggingface',
    XCEPTION: '/api/xception/detect',
    MODELS: '/api/xception/weights'
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
export const analyzeWithHuggingface = async (file: File): Promise<APIAnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recortar_cara', 'false'); // Valor por defecto
    formData.append('device', getDeviceType());

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HUGGINGFACE}`, {
      method: 'POST',
      body: formData, // Usar FormData, no JSON
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    // Procesar respuesta de tu API
    return {
      fake: result.result.fake.toString(),
      real: result.result.real.toString(),
      prediccion: result.result.prediction || 'unknown'
    };

  } catch (error) {
    console.error('Error con Huggingface API:', error);
    throw new Error('Error al analizar con Huggingface. Verifica que la API esté funcionando.');
  }
};

// 🔄 FUNCIÓN 2: Análisis con Xception
export const analyzeWithXception = async (
  file: File, 
  modelName?: string
): Promise<APIAnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (modelName) {
      formData.append('model_name', modelName);
    }
    
    formData.append('recortar_cara', 'false');
    formData.append('device', getDeviceType());

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    // Procesar respuesta de tu API
    return {
      fake: result.result.fake.toString(),
      real: result.result.real.toString(),
      prediccion: result.result.prediction || 'unknown'
    };

  } catch (error) {
    console.error('Error con Xception API:', error);
    throw new Error('Error al analizar con Xception. Verifica que la API esté funcionando.');
  }
};

// 🔄 FUNCIÓN 3: Obtener modelos disponibles
export const getAvailableModels = async (): Promise<AvailableModel[]> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODELS}`, {
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
  modelName?: string
): Promise<APIAnalysisResult> => {
  
  // Validar tamaño de archivo (opcional)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 10MB.');
  }

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.');
  }

  try {
    switch (method) {
      case 'huggingface':
        return await analyzeWithHuggingface(file);
      case 'xception':
        return await analyzeWithXception(file, modelName);
      default:
        throw new Error(`Método "${method}" no soportado`);
    }
  } catch (error) {
    console.error(`Error con método ${method}:`, error);
    throw error;
  }
};

// 🛠️ Función helper para detectar tipo de dispositivo
export const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  
  if (/Mobile|Android|iPhone/.test(userAgent)) {
    return 'mobile';
  } else if (/iPad|Tablet/.test(userAgent)) {
    return 'tablet';
  } else {
    return 'cpu'; // Por defecto para desktop
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

// 🧪 MODO DE PRUEBA (opcional para desarrollo)
const DEMO_MODE = false; // Cambiar a true para modo demo

export const analyzeImageDemo = async (file: File): Promise<APIAnalysisResult> => {
  if (!DEMO_MODE) {
    return analyzeImage(file);
  }

  // Simular respuesta mientras pruebas
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const fakeScore = Math.random() * 0.6 + 0.2; // 0.2 - 0.8
  const realScore = 1 - fakeScore;
  
  return {
    fake: fakeScore.toFixed(6),
    real: realScore.toFixed(6),
    prediccion: fakeScore > realScore ? 'fake' : 'real'
  };
};