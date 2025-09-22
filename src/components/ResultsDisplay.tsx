// ResultsDisplay.tsx

import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { APIAnalysisResult, EnsembleAnalysisResult } from '../utils/api';

interface ResultsDisplayProps {
  result: APIAnalysisResult | EnsembleAnalysisResult;
  onReset: () => void;
  imagePreview: string | null; // <-- Imagen original
  croppedImage: string | null; // <-- AÑADIDO: Imagen de la cara recortada
}

// Función helper para determinar si es un resultado de ensemble
const isEnsembleResult = (result: APIAnalysisResult | EnsembleAnalysisResult): result is EnsembleAnalysisResult => {
  return 'results' in result && 'final_decision_majority' in result && 'final_decision_average' in result;
};

// ... (El resto de funciones helper no cambian)
const getPredictionColor = (prediction: string) => {
  return prediction.toLowerCase() === 'real' 
    ? 'bg-green-500' 
    : 'bg-red-500';
};
const formatPercentage = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return (num * 100).toFixed(1) + '%';
};
const getPredictionIcon = (prediction: string) => {
  return prediction.toLowerCase() === 'real' ? '✅' : '❌';
};


export default function ResultsDisplay({ result, onReset, imagePreview, croppedImage }: ResultsDisplayProps) {
  // Si es resultado de ensemble, usamos la decisión final
  const mainResult = isEnsembleResult(result) 
    ? {
        fake: (result.final_decision_average.prediction === 'fake' ? result.final_decision_average.confidence : 1 - result.final_decision_average.confidence).toString(),
        real: (result.final_decision_average.prediction === 'real' ? result.final_decision_average.confidence : 1 - result.final_decision_average.confidence).toString(),
        prediccion: result.final_decision_majority.prediction
      }
    : result;

  const { fake, real, prediccion } = mainResult;

  // Convertir los valores string a números para los cálculos
  const fakePercentage = parseFloat(fake) || 0;
  const realPercentage = parseFloat(real) || 0;
  
  // Determinar si es IA basado en la predicción o en los porcentajes
  const isAI = prediccion?.toLowerCase().includes('fake') || 
               prediccion?.toLowerCase().includes('artificial') || 
               fakePercentage > realPercentage;

  // Calcular confianza (el mayor porcentage)
  const confidence = Math.max(fakePercentage, realPercentage);

  // Crear descripción basada en la predicción de la API
  const getDescription = () => {
    if (isEnsembleResult(result)) {
      const modelsCount = result.results.length;
      const realVotes = result.results.filter(r => r.prediction.toLowerCase() === 'real').length;
      const fakeVotes = result.results.filter(r => r.prediction.toLowerCase() === 'fake').length;
      
      if (isAI) {
        return `Análisis de ${modelsCount} modelos: ${fakeVotes} detectaron contenido artificial vs ${realVotes} contenido real. Confianza promedio: ${(result.final_decision_average.confidence * 100).toFixed(1)}%`;
      } else {
        return `Análisis de ${modelsCount} modelos: ${realVotes} detectaron contenido real vs ${fakeVotes} contenido artificial. Confianza promedio: ${(result.final_decision_average.confidence * 100).toFixed(1)}%`;
      }
    }
    
    if (prediccion) {
      return prediccion;
    }
    
    if (isAI) {
      return `Se detectó que la imagen tiene un ${fakePercentage.toFixed(1)}% de probabilidad de ser generada artificialmente`;
    } else {
      return `Se detectó que la imagen tiene un ${realPercentage.toFixed(1)}% de probabilidad de ser auténtica`;
    }
  };

  const renderSingleResult = () => (
    <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ===== SECCIÓN PARA MOSTRAR IMÁGENES ORIGINAL Y RECORTADA ===== */}
      {(imagePreview || croppedImage) && (
        <div className="mb-8 border-b pb-8">
          <h3 className="text-center text-lg font-semibold mb-4 text-foreground">Imágenes Analizadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {imagePreview && (
              <div className="relative">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Imagen original</h4>
                <img
                  src={imagePreview}
                  alt="Original"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}
            {croppedImage && (
              <div className="relative">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Cara recortada</h4>
                <img
                  src={croppedImage}
                  alt="Cara recortada"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* ===== FIN DE LA SECCIÓN DE IMÁGENES ===== */}

      <div className="text-center space-y-6">
        {/* Result Icon */}
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isAI ? 'bg-destructive/10' : 'bg-green-500/10'
        }`}>
          {isAI ? (
            <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Main Verdict */}
        <div className="space-y-3">
          <Badge 
            variant={isAI ? "destructive" : "default"} 
            className="text-sm px-4 py-1"
          >
            {isEnsembleResult(result) && "Análisis Ensemble: "}
            {isAI ? "Imagen Generada por IA" : "Imagen Real"}
          </Badge>
          
          <h2 className="text-2xl font-bold">
            {isAI ? "Artificial" : "Auténtica"}
          </h2>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            {getDescription()}
          </p>
        </div>

        {/* Detailed Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-destructive/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-destructive mb-1">
              {fakePercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Probabilidad Fake</div>
          </div>
          
          <div className="bg-green-500/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {realPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Probabilidad Real</div>
          </div>
        </div>

        {/* Confidence Meter */}
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
          
          <p className="text-xs text-muted-foreground">
            {confidence >= 90 && "Muy alta confianza"}
            {confidence >= 80 && confidence < 90 && "Alta confianza"}
            {confidence >= 70 && confidence < 80 && "Confianza moderada"}
            {confidence < 70 && "Requiere análisis adicional"}
          </p>
        </div>

        {/* Technical Details */}
        <div className="bg-muted/30 rounded-lg p-4 text-left space-y-2">
          <h4 className="font-semibold text-sm text-center mb-3">
            {isEnsembleResult(result) ? "Resultados del Análisis Ensemble" : "Resultados del Análisis"}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Predicción:</span>
              <span className="font-medium">{prediccion || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fake Score:</span>
              <span className="font-medium">{fake}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Real Score:</span>
              <span className="font-medium">{real}%</span>
            </div>
            {isEnsembleResult(result) && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelos:</span>
                  <span className="font-medium">{result.results.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confianza mayoría:</span>
                  <span className="font-medium">{(result.final_decision_majority.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confianza promedio:</span>
                  <span className="font-medium">{(result.final_decision_average.confidence * 100).toFixed(1)}%</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <span className={`font-medium ${isAI ? 'text-destructive' : 'text-green-600'}`}>
                {isAI ? 'Artificial' : 'Auténtica'}
              </span>
            </div>
          </div>
        </div>

        {/* Ensemble Details - Expandible */}
        {isEnsembleResult(result) && (
          <details className="bg-muted/20 rounded-lg p-4 text-left">
            <summary className="font-semibold text-sm cursor-pointer text-center mb-3">
              Ver resultados individuales por modelo
            </summary>
            <div className="space-y-3 mt-3">
              {result.results.map((modelResult, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-3 py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium truncate max-w-[200px]" title={modelResult.model_name}>
                      {modelResult.model_name.includes('huggingface') ? '🤗' : '🧠'} {modelResult.model_name}
                    </span>
                    <Badge 
                      variant={modelResult.prediction.toLowerCase() === 'fake' ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {modelResult.prediction}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                    <span>Real: {(modelResult.real * 100).toFixed(1)}%</span>
                    <span>Fake: {(modelResult.fake * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={onReset} size="lg" className="px-8">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Analizar Otra Imagen
          </Button>
          
          <Button variant="outline" onClick={() => window.print()}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generar Reporte
          </Button>
        </div>
      </div>
    </Card>
  );

  return renderSingleResult();
}