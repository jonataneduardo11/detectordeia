// components/ImageUploader.tsx

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
  const [method, setMethod] = useState<AnalysisMethod>('ensemble');
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [processingFace, setProcessingFace] = useState(false);
  const [shouldCropFace, setShouldCropFace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAPIConnection();
  }, []);

  useEffect(() => {
    if (method === 'xception') {
      loadAvailableModels();
    }
  }, [method]);

  const checkAPIConnection = async () => {
    try {
      const connected = await testAPIConnection();
      setApiConnected(connected);
      if (!connected) setError('No se puede conectar con la API');
    } catch (error) {
      setApiConnected(false);
      setError('Error de conectividad con la API');
    }
  };

  const loadAvailableModels = async () => {
    setLoadingModels(true);
    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0].filename);
      } else {
        setError('No hay modelos Xception disponibles.');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no válido. Solo PNG, JPG, JPEG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo supera los 10MB.');
      return;
    }
    setSelectedImage(file);
    setCroppedImage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setState('uploaded');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleCutFace = async () => {
    if (!selectedImage) return;
    setProcessingFace(true);
    setError(null);
    try {
      const croppedBlob = await cutFace(selectedImage);
      setCroppedImage(URL.createObjectURL(croppedBlob));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcessingFace(false);
    }
  };

  const analyzeImageAPI = async () => {
    if (!selectedImage) return;
    setState('processing');
    setError(null);
    try {
      const apiResult = await analyzeImage(selectedImage, method, {
        modelName: method === 'xception' ? selectedModel : undefined,
        recortarCara: shouldCropFace,
      });
      setResult(apiResult);
      setState('complete');
    } catch (e) {
      setError((e as Error).message);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const getMethodInfo = (methodType: AnalysisMethod) => ({
    'huggingface': { name: 'HuggingFace', description: 'Modelo rápido y general.', icon: '🤗' },
    'xception': { name: 'Xception', description: 'Modelos especializados de alta precisión.', icon: '🧠' },
    'ensemble': { name: 'Ensemble', description: 'Combina todos los modelos para el mejor resultado.', icon: '🎯' }
  })[methodType];

  const formatModelName = (filename: string) => filename.replace(/\.(pkl|pth)$/i, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (state === 'processing') return <ProcessingSpinner />;
  if (state === 'complete' && result) {
    return <ResultsDisplay result={result} onReset={resetUploader} imagePreview={imagePreview} croppedImage={croppedImage} cropFaceEnabled={shouldCropFace} />;
  }

  return (
    <Card className="p-8">
      {apiConnected === false && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">Error: No se puede conectar con la API.</div>}
      
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-center">Método de análisis:</h4>
        <div className="flex gap-2 justify-center flex-wrap">
          {(['huggingface', 'xception', 'ensemble'] as AnalysisMethod[]).map((methodType) => (
            <Button key={methodType} variant={method === methodType ? 'default' : 'outline'} size="sm" onClick={() => setMethod(methodType)} disabled={!apiConnected}>
              {getMethodInfo(methodType).icon} {getMethodInfo(methodType).name}
            </Button>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">{getMethodInfo(method).description}</p>
      </div>

      {method === 'xception' && (
        <div className="mb-4">
          {loadingModels && <div className="text-center text-sm">Cargando modelos...</div>}
          {!loadingModels && availableModels.length > 0 && (
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full p-2 text-sm border rounded-md bg-background">
              {availableModels.map((model) => (
                <option key={model.filename} value={model.filename}>{formatModelName(model.filename)}</option>
              ))}
            </select>
          )}
          {!loadingModels && availableModels.length === 0 && <div className="text-center text-sm text-destructive">No hay modelos Xception disponibles.</div>}
        </div>
      )}
      
      {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}

      {state === 'idle' && (
        <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
             onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <div className="space-y-2">
            <h3 className="font-semibold">Arrastra tu imagen aquí</h3>
            <p className="text-muted-foreground text-sm">o haz clic para seleccionar</p>
            <Button onClick={() => fileInputRef.current?.click()} disabled={!apiConnected}>Seleccionar Imagen</Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg" onChange={handleFileInput} className="hidden" />
        </div>
      )}

      {(state === 'uploaded' || state === 'error') && imagePreview && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Imagen original</h4>
              <img src={imagePreview} alt="Preview" className="w-full rounded-lg shadow-md" />
            </div>
            {croppedImage && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Cara Recortada (Prueba)</h4>
                <img src={croppedImage} alt="Cropped face" className="w-full rounded-lg shadow-md" />
              </div>
            )}
          </div>
          
          <div className="flex gap-4 justify-center items-center flex-wrap border-t pt-4">
            <Button onClick={handleCutFace} variant="outline" size="sm" disabled={processingFace || !apiConnected}>
              {processingFace ? 'Recortando...' : '✂️ Probar Recorte'}
            </Button>
            <Button variant="outline" onClick={resetUploader} size="sm">🔄 Cambiar Imagen</Button>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <input type="checkbox" id="crop-face-checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                   checked={shouldCropFace} onChange={(e) => setShouldCropFace(e.target.checked)} disabled={!apiConnected} />
            <label htmlFor="crop-face-checkbox" className="text-sm font-medium text-foreground">Recortar cara antes de analizar</label>
          </div>

          <div className="flex justify-center">
            <Button onClick={analyzeImageAPI} size="lg" className="px-8"
                    disabled={!apiConnected || processingFace || (method === 'xception' && !selectedModel)}>
              Analizar con {getMethodInfo(method).name}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}