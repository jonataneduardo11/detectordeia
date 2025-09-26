// ImageUploader.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import ProcessingSpinner from './ProcessingSpinner';
import ResultsDisplay from './ResultsDisplay';
import { 
  analyzeImage, 
  cutFace,
  getAvailableModels, 
  testAPIConnection, 
  APIAnalysisResult, 
  EnsembleAnalysisResult,
  AvailableModel 
} from '../utils/api';

type UploadState = 'idle' | 'uploaded' | 'processing' | 'complete' | 'error';
type AnalysisMethod = 'huggingface' | 'xception' | 'ensemble';

export default function ImageUploader() {
  const [state, setState] = useState<UploadState>('idle');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<APIAnalysisResult | EnsembleAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<AnalysisMethod>('huggingface');
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [processingFace, setProcessingFace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar conectividad con la API al montar el componente
  useEffect(() => {
    checkAPIConnection();
  }, []);

  // Cargar modelos disponibles cuando se selecciona Xception
  useEffect(() => {
    if (method === 'xception') {
      loadAvailableModels();
    } else {
      setSelectedModel('');
      setAvailableModels([]);
    }
  }, [method]);

  const checkAPIConnection = async () => {
    try {
      const connected = await testAPIConnection();
      setApiConnected(connected);
      if (!connected) {
        setError('No se puede conectar con la API');
      }
    } catch (error) {
      setApiConnected(false);
      setError('Error de conectividad con la API');
    }
  };

  const loadAvailableModels = async () => {
    setLoadingModels(true);
    setError(null);
    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0].filename);
      } else {
        setError('No hay modelos Xception disponibles en el servidor');
      }
    } catch (error) {
      console.error('Error cargando modelos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`No se pudieron cargar los modelos: ${errorMessage}`);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no válido. Solo se permiten PNG, JPG, JPEG.');
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setSelectedImage(file);
    setCroppedImage(null); // Limpiar imagen recortada previa
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setState('uploaded');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Función para recortar cara
  const handleCutFace = async () => {
    if (!selectedImage) return;

    setProcessingFace(true);
    setError(null);
    
    try {
      console.log('🎯 Recortando cara de la imagen...');
      const croppedBlob = await cutFace(selectedImage);
      
      // Convertir blob a URL para mostrar la preview
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setCroppedImage(croppedUrl); 
      
      console.log('✅ Cara recortada exitosamente');
    } catch (error) {
      console.error('❌ Error recortando cara:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al recortar la cara';
      setError(errorMessage);
    } finally {
      setProcessingFace(false);
    }
  };

  const analyzeImageAPI = async () => {
    if (!selectedImage) return;

    setState('processing');
    setError(null);
    
    try {
      console.log('🎯 Iniciando análisis de imagen...');
      const apiResult = await analyzeImage(selectedImage, method, {
        modelName: method === 'xception' ? selectedModel : undefined,
      });
      
      console.log('✅ Análisis completado:', apiResult);
      setResult(apiResult);
      setState('complete');
    } catch (error) {
      console.error('❌ Error en análisis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al analizar la imagen';
      setError(errorMessage);
      setState('error');
    }
  };

  const resetUploader = () => {
    setState('idle');
    setSelectedImage(null);
    setImagePreview(null);
    setCroppedImage(null); 
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getMethodInfo = (methodType: AnalysisMethod) => {
    switch (methodType) {
      case 'huggingface':
        return {
          name: 'HuggingFace',
          description: 'Modelo preentrenado de Hugging Face para detección de deepfakes',
          icon: '🤗',
          color: 'bg-orange-500'
        };
      case 'xception':
        return {
          name: 'Xception',
          description: 'Modelos Xception personalizados para detección de deepfakes',
          icon: '🧠',
          color: 'bg-purple-500'
        };
      case 'ensemble':
        return {
          name: 'Ensemble',
          description: 'Análisis con TODOS los modelos disponibles (HuggingFace + Xception)',
          icon: '🎯',
          color: 'bg-green-600'
        };
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Estado de procesamiento
  if (state === 'processing') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Badge 
            variant="default" 
            className={`mb-4 text-white ${getMethodInfo(method).color}`}
          >
            {getMethodInfo(method).icon} Analizando con {getMethodInfo(method).name}
            {method === 'xception' && selectedModel && (
              <span className="ml-1 text-xs">({selectedModel})</span>
            )}
          </Badge>
        </div>
        <ProcessingSpinner />
      </div>
    );
  }

  // Estado de resultados completos
  if (state === 'complete' && result) {
    return <ResultsDisplay result={result} onReset={resetUploader} imagePreview={imagePreview} croppedImage={croppedImage} />;
  }

  return (
    <Card className="p-8">
      {/* Estado de conectividad de la API */}
      {apiConnected === false && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-semibold text-destructive">API no disponible</h4>
                <p className="text-sm text-destructive/80">
                  Verifica que tu API esté ejecutándose
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkAPIConnection}
            >
              Verificar
            </Button>
          </div>
        </div>
      )}

      {/* El bloque que mostraba "API conectada correctamente" ha sido eliminado de aquí.
      */}

      {/* Selector de método de análisis */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-center">Método de análisis:</h4>
        <div className="flex gap-2 justify-center flex-wrap">
          {(['huggingface', 'xception', 'ensemble'] as AnalysisMethod[]).map((methodType) => {
            const info = getMethodInfo(methodType);
            return (
              <Button
                key={methodType}
                variant={method === methodType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMethod(methodType)}
                className="text-xs"
                disabled={apiConnected === false}
              >
                {info.icon} {info.name}
              </Button>
            );
          })}
        </div>
        
        {/* Selector de modelo para Xception */}
        {method === 'xception' && (
          <div className="mt-4 space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Modelo Xception:
            </label>
            {loadingModels ? (
              <div className="text-center text-sm text-muted-foreground py-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Cargando modelos disponibles...
                </div>
              </div>
            ) : availableModels.length > 0 ? (
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 text-xs border border-border rounded-md bg-background"
                disabled={apiConnected === false}
              >
                {availableModels.map((model) => (
                  <option key={model.filename} value={model.filename}>
                    {model.filename} ({formatFileSize(model.size_bytes)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center text-sm text-destructive py-2 border border-dashed border-destructive/30 rounded-md">
                {error && error.includes('modelos') ? error : 'No hay modelos disponibles'}
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          {getMethodInfo(method).description}
        </p>
      </div>

      {/* Estado de Error */}
      {state === 'error' && error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-destructive">Error</h4>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3" 
            onClick={() => {
              setError(null);
              if (state !== 'uploaded') setState('idle');
            }}
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Error de conectividad con modelos */}
      {method === 'xception' && !loadingModels && availableModels.length === 0 && error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800">Problema de conectividad</h4>
              <p className="text-sm text-yellow-700">
                No se puede conectar con la API
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3" 
            onClick={loadAvailableModels}
            disabled={apiConnected === false}
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Estado inicial: Subir imagen */}
      {state === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : apiConnected === false 
                ? 'border-muted bg-muted/20' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
          } ${apiConnected === false ? 'opacity-50' : ''}`}
          onDragEnter={apiConnected !== false ? handleDrag : undefined}
          onDragLeave={apiConnected !== false ? handleDrag : undefined}
          onDragOver={apiConnected !== false ? handleDrag : undefined}
          onDrop={apiConnected !== false ? handleDrop : undefined}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">
                {apiConnected === false ? 'API no disponible' : 'Arrastra tu imagen aquí'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {apiConnected === false ? 'Conecta tu API primero' : 'O haz clic para seleccionar una imagen'}
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos: PNG, JPG, JPEG (máx. 10MB)
              </p>
            </div>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
              disabled={apiConnected === false}
            >
              Seleccionar Imagen
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileInput}
            className="hidden"
            disabled={apiConnected === false}
          />
        </div>
      )}

      {/* Estado: Imagen subida */}
      {(state === 'uploaded' || state === 'error') && imagePreview && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold mb-4">Imagen seleccionada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {/* Imagen original */}
              <div className="relative">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Imagen original</h4>
                <img 
                  src={imagePreview} 
                  alt="Original" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              
              {/* Imagen recortada (si existe) */}
              {croppedImage && (
                <div className="relative">
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Cara recortada</h4>
                  <img 
                    src={croppedImage} 
                    alt="Cara recortada" 
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">
              {selectedImage?.name} ({selectedImage && formatFileSize(selectedImage.size)})
            </p>
          </div>

          {/* Herramientas adicionales */}
          <div className="flex gap-3 justify-center flex-wrap">
            {/* Botón para recortar cara */}
            <Button 
              onClick={handleCutFace}
              variant="outline"
              size="sm"
              disabled={processingFace || apiConnected === false}
              className="text-xs"
            >
              {processingFace ? (
                <>
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Recortando...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  ✂️ Recortar Cara
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={resetUploader} size="sm" className="text-xs">
              🔄 Cambiar Imagen
            </Button>
          </div>

          {/* Botón principal de análisis */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={analyzeImageAPI} 
              size="lg" 
              className="px-8"
              disabled={
                state === 'processing' || 
                processingFace ||
                apiConnected === false ||
                (method === 'xception' && (!selectedModel || loadingModels || availableModels.length === 0))
              }
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {method === 'ensemble' ? '🎯 Analizar con TODOS los modelos' : `Analizar con ${getMethodInfo(method).name}`}
            </Button>
          </div>

          {/* Información sobre el método seleccionado */}
          {method === 'ensemble' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-green-800 text-sm">Modo Ensemble Activado</h4>
                  <p className="text-xs text-green-700">
                    Se utilizarán todos los modelos disponibles (HuggingFace + todos los Xception) para obtener un resultado más preciso
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}