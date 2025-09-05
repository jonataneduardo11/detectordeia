// utils/api.ts

// 🎯 Configuración de tu API real
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    HUGGINGFACE: '/huggingface',
    XCEPTION_WEIGHTS: '/xception/weights',
    XCEPTION_DETECT: '/xception/detect'
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
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HUGGINGFACE}`;
  console.log('🚀 Intentando conectar a:', url);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recortar_cara', recortarCara.toString());
    formData.append('device', 'cpu');

    console.log('📤 Enviando datos...', {
      fileName: file.name,
      fileSize: file.size,
      recortarCara
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log('📨 Respuesta recibida:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del servidor:', errorText);
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Resultado:', result);
    
    return {
      fake: result.result.fake.toString(),
      real: result.result.real.toString(),
      prediccion: result.result.prediction
    };

  } catch (error) {
    console.error('💥 Error completo:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se puede conectar con la API. Verifica que esté ejecutándose en http://localhost:8000');
    }
    if (error instanceof Error) {
      throw new Error(`Error al analizar con Huggingface: ${error.message}`);
    }
    throw new Error('Error desconocido al analizar con Huggingface.');
  }
};

// 🔄 FUNCIÓN 2: Análisis con Xception
export const analyzeWithXception = async (
  file: File,
  modelName: string,
  recortarCara: boolean = false
): Promise<APIAnalysisResult> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_DETECT}`;
  console.log('🚀 Intentando conectar a:', url);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    formData.append('recortar_cara', recortarCara.toString());
    formData.append('device', 'cpu');

    console.log('📤 Enviando datos...', {
      fileName: file.name,
      fileSize: file.size,
      modelName,
      recortarCara
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log('📨 Respuesta recibida:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del servidor:', errorText);
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Resultado:', result);
    
    return {
      fake: result.result.fake.toString(),
      real: result.result.real.toString(),
      prediccion: result.result.prediction
    };

  } catch (error) {
    console.error('💥 Error completo:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se puede conectar con la API. Verifica que esté ejecutándose en http://localhost:8000');
    }
    if (error instanceof Error) {
      throw new Error(`Error al analizar con Xception: ${error.message}`);
    }
    throw new Error('Error desconocido al analizar con Xception.');
  }
};

// 🔄 FUNCIÓN 3: Obtener modelos disponibles
export const getAvailableModels = async (): Promise<AvailableModel[]> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_WEIGHTS}`;
  console.log('🚀 Intentando obtener modelos de:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    console.log('📨 Respuesta recibida:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del servidor:', errorText);
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Modelos obtenidos:', result);
    
    return result.available_models || [];

  } catch (error) {
    console.error('💥 Error completo:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se puede conectar con la API. Verifica que esté ejecutándose en http://localhost:8000');
    }
    if (error instanceof Error) {
      throw new Error(`Error al obtener modelos: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener modelos disponibles.');
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

  console.log('🎯 Iniciando análisis:', {
    method,
    fileName: file.name,
    fileSize: file.size,
    modelName,
    recortarCara
  });

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
    console.error(`💥 Error con método ${method}:`, error);
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
    console.log('🧪 Probando conectividad con la API...');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_WEIGHTS}`, {
      method: 'GET',
    });
    console.log('✅ Conectividad:', response.ok);
    return response.ok;
  } catch (error) {
    console.error('❌ Error de conectividad:', error);
    return false;
  }
};