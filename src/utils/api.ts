// utils/api.ts

// 🎯 Configuración de tu API real
const API_CONFIG = {
  BASE_URL: 'https://api.kmmh.com.mx',
  ENDPOINTS: {
    HUGGINGFACE: '/huggingface',
    XCEPTION_WEIGHTS: '/xception/weights',
    XCEPTION_DETECT: '/xception/detect',
    CUT_FACE: '/cut_face',
    ENSEMBLE_DETECT: '/ensemble/detect'
  }
};

// 🎯 Interfaz estándar para tu frontend (basada en tu API)
export interface APIAnalysisResult {
  fake: string;
  real: string;
  prediccion: string;
  model_name?: string;
}

// 📦 Nueva interfaz para resultados de ensemble
export interface EnsembleResult {
  model_name: string;
  prediction: string;
  real: number;
  fake: number;
}

export interface EnsembleAnalysisResult {
  results: EnsembleResult[];
  final_decision_majority: {
    prediction: string;
    confidence: number;
  };
  final_decision_average: {
    prediction: string;
    confidence: number;
  };
}

// 📦 Interfaz para modelos disponibles
export interface AvailableModel {
  filename: string;
  size_bytes: number;
  model_type: string;
}

// 🔄 FUNCIÓN 1: Análisis con Huggingface (actualizada)
export const analyzeWithHuggingface = async (
  file: File
): Promise<APIAnalysisResult> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HUGGINGFACE}`;
  console.log('🚀 Intentando conectar a:', url);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('device', 'cpu');

    console.log('📤 Enviando datos...', {
      fileName: file.name,
      fileSize: file.size
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
      prediccion: result.result.prediction,
      model_name: result.result.model_name
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

// 🔄 FUNCIÓN 2: Análisis con Xception (actualizada)
export const analyzeWithXception = async (
  file: File,
  modelName: string
): Promise<APIAnalysisResult> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_DETECT}`;
  console.log('🚀 Intentando conectar a:', url);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    formData.append('device', 'cpu');

    console.log('📤 Enviando datos...', {
      fileName: file.name,
      fileSize: file.size,
      modelName
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
      prediccion: result.result.prediction,
      model_name: result.result.model_name
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

// 🔄 FUNCIÓN 3: Obtener modelos disponibles (existente)
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

// 🆕 FUNCIÓN 4: Recortar cara
export const cutFace = async (file: File): Promise<Blob> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUT_FACE}`;
  console.log('🚀 Intentando recortar cara en:', url);
  
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Enviando imagen para recorte...', {
      fileName: file.name,
      fileSize: file.size
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

    // Devolvemos la imagen procesada como blob
    const imageBlob = await response.blob();
    console.log('✅ Imagen recortada exitosamente');
    
    return imageBlob;

  } catch (error) {
    console.error('💥 Error completo:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se puede conectar con la API. Verifica que esté ejecutándose en http://localhost:8000');
    }
    if (error instanceof Error) {
      throw new Error(`Error al recortar cara: ${error.message}`);
    }
    throw new Error('Error desconocido al recortar la cara.');
  }
};

// 🆕 FUNCIÓN 5: Análisis con Ensemble (actualizada)
export const analyzeWithEnsemble = async (
  file: File
): Promise<EnsembleAnalysisResult> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENSEMBLE_DETECT}`;
  console.log('🚀 Intentando conectar a:', url);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('device', 'cpu');

    console.log('📤 Enviando datos para análisis ensemble...', {
      fileName: file.name,
      fileSize: file.size
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
    console.log('✅ Resultado ensemble:', result);
    
    return result;

  } catch (error) {
    console.error('💥 Error completo:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se puede conectar con la API. Verifica que esté ejecutándose en http://localhost:8000');
    }
    if (error instanceof Error) {
      throw new Error(`Error al analizar con Ensemble: ${error.message}`);
    }
    throw new Error('Error desconocido al analizar con Ensemble.');
  }
};

// 🚀 FUNCIÓN PRINCIPAL - Actualizada
export const analyzeImage = async (
  file: File,
  method: 'huggingface' | 'xception' | 'ensemble' = 'huggingface',
  options: {
    modelName?: string;
  } = {}
): Promise<APIAnalysisResult | EnsembleAnalysisResult> => {
  
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

  const { modelName } = options;

  console.log('🎯 Iniciando análisis:', {
    method,
    fileName: file.name,
    fileSize: file.size,
    modelName
  });

  try {
    switch (method) {
      case 'huggingface':
        return await analyzeWithHuggingface(file);
      
      case 'xception':
        if (!modelName) {
          throw new Error('Se requiere seleccionar un modelo para Xception.');
        }
        return await analyzeWithXception(file, modelName);
      
      case 'ensemble':
        return await analyzeWithEnsemble(file);
      
      default:
        throw new Error(`Método "${method}" no soportado`);
    }
  } catch (error) {
    console.error(`💥 Error con método ${method}:`, error);
    throw error;
  }
};

// 🛠️ Función helper para detectar dispositivo (existente)
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

// 📊 Función para obtener estado de la API (existente)
export const getAPIStatus = () => {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    endpoints: API_CONFIG.ENDPOINTS,
    isConfigured: true
  };
};

// 🧪 Función para probar conectividad (existente)
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