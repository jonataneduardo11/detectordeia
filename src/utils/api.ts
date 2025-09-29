// utils/api.ts

// 🎯 Configuración de tu API real
const API_CONFIG = {
  BASE_URL: 'https://api.kmmh.com.mx/api/',
  ENDPOINTS: {
    HUGGINGFACE: 'huggingface',
    XCEPTION_WEIGHTS: 'xception/weights',
    XCEPTION_DETECT: 'xception/detect',
    CUT_FACE: 'cut_face',
    ENSEMBLE_DETECT: 'ensemble/detect'
  }
};

// 🎯 Interfaces actualizadas para coincidir con la API
export interface APIAnalysisResult {
  fake: number;
  real: number;
  prediction: string;
  model_name: string;
}

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

export interface AvailableModel {
  filename: string;
  size_bytes: number;
  model_type: string;
}

// 🔄 FUNCIÓN 1: Análisis con Huggingface
export const analyzeWithHuggingface = async (
  file: File,
  recortarCara: boolean
): Promise<APIAnalysisResult> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HUGGINGFACE}`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('device', 'cpu');
  formData.append('recortar_cara', String(recortarCara));

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error en analyzeWithHuggingface:', error);
    throw error;
  }
};

// 🔄 FUNCIÓN 2: Análisis con Xception
export const analyzeWithXception = async (
  file: File,
  modelName: string,
  recortarCara: boolean
): Promise<APIAnalysisResult> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_DETECT}`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model_name', modelName);
  formData.append('device', 'cpu');
  formData.append('recortar_cara', String(recortarCara));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error en analyzeWithXception:', error);
    throw error;
  }
};

// 🔄 FUNCIÓN 3: Obtener modelos disponibles
export const getAvailableModels = async (): Promise<AvailableModel[]> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_WEIGHTS}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudieron obtener los modelos.');
    }
    const data = await response.json();
    return data.available_models || [];
  } catch (error) {
    console.error('Error en getAvailableModels:', error);
    throw error;
  }
};

// 🆕 FUNCIÓN 4: Recortar cara (CORREGIDA)
export const cutFace = async (file: File): Promise<Blob> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUT_FACE}`;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al recortar la cara: ${errorText}`);
    }
    // La respuesta es la imagen directamente, la leemos como un Blob
    const imageBlob = await response.blob();
    if (imageBlob.size === 0) {
        throw new Error("La API no devolvió una imagen. Es posible que no se haya encontrado una cara.");
    }
    return imageBlob;
  } catch (error) {
    console.error('Error en cutFace:', error);
    throw error;
  }
};


// 🆕 FUNCIÓN 5: Análisis con Ensemble
export const analyzeWithEnsemble = async (
  file: File,
  recortarCara: boolean
): Promise<EnsembleAnalysisResult> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENSEMBLE_DETECT}`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('device', 'cpu');
  formData.append('recortar_cara', String(recortarCara));

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en analyzeWithEnsemble:', error);
    throw error;
  }
};

// 🚀 FUNCIÓN PRINCIPAL - Orquestador de análisis
export const analyzeImage = async (
  file: File,
  method: 'huggingface' | 'xception' | 'ensemble' = 'huggingface',
  options: {
    modelName?: string;
    recortarCara?: boolean;
  } = {}
): Promise<APIAnalysisResult | EnsembleAnalysisResult> => {
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
      
      case 'ensemble':
        return await analyzeWithEnsemble(file, recortarCara);
      
      default:
        throw new Error(`Método "${method}" no soportado`);
    }
  } catch (error) {
    console.error(`💥 Error con método ${method}:`, error);
    throw error;
  }
};

// 🧪 Función para probar conectividad
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.XCEPTION_WEIGHTS}`);
    return response.ok;
  } catch (error) {
    return false;
  }
};