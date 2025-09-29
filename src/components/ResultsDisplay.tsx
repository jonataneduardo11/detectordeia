// components/ResultsDisplay.tsx

import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { APIAnalysisResult, EnsembleAnalysisResult } from '../utils/api';

interface ResultsDisplayProps {
  result: APIAnalysisResult | EnsembleAnalysisResult;
  onReset: () => void;
  imagePreview: string | null;
  croppedImage: string | null;
  cropFaceEnabled: boolean;
}

const isEnsembleResult = (result: any): result is EnsembleAnalysisResult => {
  return 'results' in result && 'final_decision_majority' in result;
};

// Helper function para formatear nombres de modelos
const formatModelName = (filename: string): string => {
  if (!filename) return 'N/A';
  return filename
    .replace(/\.(pkl|pth)$/i, '') // Elimina extensiones .pkl y .pth
    .replace(/_/g, ' ')           // Reemplaza guiones bajos con espacios
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitaliza cada palabra
};

export default function ResultsDisplay({ result, onReset, imagePreview, croppedImage, cropFaceEnabled }: ResultsDisplayProps) {
  let mainPrediction: string;
  let fakeValue: number;
  let realValue: number;

  if (isEnsembleResult(result)) {
    mainPrediction = result.final_decision_majority.prediction;
    const avg = result.final_decision_average;
    if (avg.prediction.toLowerCase() === 'fake') {
      fakeValue = avg.confidence;
      realValue = 1 - avg.confidence;
    } else {
      realValue = avg.confidence;
      fakeValue = 1 - avg.confidence;
    }
  } else {
    const singleResult = result as APIAnalysisResult;
    mainPrediction = singleResult.prediction;
    fakeValue = singleResult.fake;
    realValue = singleResult.real;
  }

  const fakePercentage = fakeValue * 100;
  const realPercentage = realValue * 100;
  
  const isAI = mainPrediction.toLowerCase() === 'fake';
  const confidence = Math.max(fakePercentage, realPercentage);

  const getDescription = () => {
    if (isEnsembleResult(result)) {
      const modelsCount = result.results.length;
      const fakeVotes = result.results.filter(r => r.prediction.toLowerCase() === 'fake').length;
      const realVotes = modelsCount - fakeVotes;
      
      return `Análisis de ${modelsCount} modelos: ${isAI ? fakeVotes : realVotes} votaron por "${isAI ? 'Artificial' : 'Real'}". Confianza promedio: ${(result.final_decision_average.confidence * 100).toFixed(1)}%`;
    }
    
    return isAI 
      ? `Se detectó que la imagen tiene un ${fakePercentage.toFixed(1)}% de probabilidad de ser artificial.`
      : `Se detectó que la imagen tiene un ${realPercentage.toFixed(1)}% de probabilidad de ser auténtica.`;
  };

  return (
    <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 printable-area">

      {(imagePreview || croppedImage) && (
        <div className="mb-8 border-b pb-8">
          <h3 className="text-center text-lg font-semibold mb-4">Imágenes Analizadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {imagePreview && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Imagen original</h4>
                <img src={imagePreview} alt="Original" className="w-full h-auto rounded-lg shadow-md" />
              </div>
            )}
            {croppedImage && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Cara Recortada (Prueba)</h4>
                <img src={croppedImage} alt="Cara recortada" className="w-full h-auto rounded-lg shadow-md" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center space-y-6">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isAI ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
          {isAI ? (
            <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          ) : (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </div>

        <div className="space-y-3">
          <Badge variant={isAI ? "destructive" : "default"} className="text-sm px-4 py-1">
            {isEnsembleResult(result) && "Análisis Ensemble: "}
            {isAI ? "Imagen Generada por IA" : "Imagen Real"}
          </Badge>
          <h2 className="text-2xl font-bold">{isAI ? "Artificial" : "Auténtica"}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">{getDescription()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-destructive/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-destructive mb-1">{fakePercentage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Probabilidad Fake</div>
          </div>
          <div className="bg-green-500/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{realPercentage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Probabilidad Real</div>
          </div>
        </div>
        
        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Nivel de confianza</span>
                <span className="font-semibold">{confidence.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
                <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                        confidence >= 80 
                            ? (isAI ? 'bg-destructive' : 'bg-green-500')
                            : 'bg-yellow-500'
                    }`}
                    style={{ width: `${confidence}%` }}
                ></div>
            </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 text-left space-y-2 text-sm">
            <h4 className="font-semibold text-center mb-3">
                Resumen del Análisis
            </h4>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Método:</span>
                    <span className="font-medium text-right truncate">
                        {isEnsembleResult(result) ? 'Ensemble' : formatModelName((result as APIAnalysisResult).model_name)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Recorte de Cara:</span>
                    <span className="font-medium">{cropFaceEnabled ? 'Activado' : 'Desactivado'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Predicción Final:</span>
                    <span className="font-medium">{mainPrediction}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Score Real (Promedio):</span>
                    <span className="font-mono text-xs">{realValue}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Score Fake (Promedio):</span>
                    <span className="font-mono text-xs">{fakeValue}</span>
                </div>
            </div>
        </div>

        {isEnsembleResult(result) && (
          <details className="bg-muted/20 rounded-lg p-4 text-left">
            <summary className="font-semibold text-sm cursor-pointer text-center">Ver Detalles por Modelo</summary>
            <div className="space-y-3 mt-3">
              {result.results.map((modelResult, index) => (
                <div key={index} className="border-l-2 pl-3 py-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold truncate max-w-[200px]" title={modelResult.model_name}>
                      {modelResult.model_name.includes('huggingface') ? '🤗' : '🧠'} {formatModelName(modelResult.model_name)}
                    </span>
                    <Badge variant={modelResult.prediction.toLowerCase() === 'fake' ? "destructive" : "default"} className="text-xs">
                      {modelResult.prediction}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                     <div className="flex justify-between">
                        <span>Score Real:</span>
                        <span className="font-mono">{modelResult.real.toFixed(6)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Score Fake:</span>
                        <span className="font-mono">{modelResult.fake.toFixed(6)}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="flex gap-3 justify-center pt-4 print-hide">
          <Button onClick={onReset} size="lg">Analizar Otra Imagen</Button>
          <Button variant="outline" onClick={() => window.print()}>Generar Reporte</Button>
        </div>
      </div>
    </Card>
  );
}