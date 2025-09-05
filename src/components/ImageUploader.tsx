import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import ProcessingSpinner from './ProcessingSpinner';
import ResultsDisplay from './ResultsDisplay';
import { analyzeImage, getAvailableModels, APIAnalysisResult, AvailableModel } from '../utils/api';

type UploadState = 'idle' | 'uploaded' | 'processing' | 'complete' | 'error';
type AnalysisMethod = 'huggingface' | 'xception';

export default function ImageUploader() {
  const [state, setState] = useState<UploadState>('idle');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<APIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<AnalysisMethod>('huggingface');
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loadingModels, setLoadingModels] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar modelos disponibles cuando se selecciona Xception
  useEffect(() => {
    if (method === 'xception') {
      loadAvailableModels();
    }
  }, [method]);

  const loadAvailableModels = async () => {
    setLoadingModels(true);
    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0].filename); // Seleccionar el primero por defecto
      }
    } catch (error) {
      console.error('Error cargando modelos:', error);
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
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setState('uploaded');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const analyzeImageAPI = async () => {
    if (!selectedImage) return;

    setState('processing');
    setError(null);
    
    try {
      const apiResult = await analyzeImage(
        selectedImage, 
        method,
        method === 'xception' ? selectedModel : undefined
      );
      setResult(apiResult);
      setState('complete');
    } catch (error) {
      console.error('Error en análisis:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setState('error');
    }
  };

  const resetUploader = () => {
    setState('idle');
    setSelectedImage(null);
    setImagePreview(null);
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
          name: 'Hugging Face',
          description: 'Modelo preentrenado de Hugging Face',
          icon: '🤗'
        };
      case 'xception':
        return {
          name: 'Xception',
          description: 'Modelo Xception personalizado',
          icon: '🧠'
        };
    }
  };

  if (state === 'processing') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Badge variant="default" className="mb-4">
            {getMethodInfo(method).icon} Analizando con {getMethodInfo(method).name}
            {method === 'xception' && selectedModel && (
              <span className="ml-1">({selectedModel})</span>
            )}
          </Badge>
        </div>
        <ProcessingSpinner />
      </div>
    );
  }

  if (state === 'complete' && result) {
    return <ResultsDisplay result={result} onReset={resetUploader} />;
  }

  return (
    <Card className="p-8">
      {/* Selector de método de análisis */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-center">Método de análisis:</h4>
        <div className="flex gap-2 justify-center">
          {(['huggingface', 'xception'] as AnalysisMethod[]).map((methodType) => {
            const info = getMethodInfo(methodType);
            return (
              <Button
                key={methodType}
                variant={method === methodType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMethod(methodType)}
                className="text-xs"
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
              <div className="text-center text-sm text-muted-foreground">
                Cargando modelos...
              </div>
            ) : availableModels.length > 0 ? (
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 text-xs border rounded"
              >
                {availableModels.map((model) => (
                  <option key={model.filename} value={model.filename}>
                    {model.filename} ({(model.size_bytes / (1024*1024)).toFixed(1)}MB)
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                No se pudieron cargar los modelos
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
            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-destructive">Error con {getMethodInfo(method).name}</h4>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3" 
            onClick={() => setState('uploaded')}
          >
            Intentar de nuevo
          </Button>
        </div>
      )}

      {state === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-accent/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">
                Arrastra tu imagen aquí
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                O haz clic para seleccionar una imagen
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos soportados: JPG, PNG, WebP (máx. 10MB)
              </p>
            </div>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              Seleccionar Imagen
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {(state === 'uploaded' || state === 'error') && imagePreview && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold mb-4">Imagen seleccionada</h3>
            <div className="relative max-w-md mx-auto">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedImage?.name}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              onClick={analyzeImageAPI} 
              size="lg" 
              className="px-8"
              disabled={state === 'processing' || (method === 'xception' && !selectedModel)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Analizar con {getMethodInfo(method).name}
            </Button>
            <Button variant="outline" onClick={resetUploader}>
              Cambiar Imagen
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}