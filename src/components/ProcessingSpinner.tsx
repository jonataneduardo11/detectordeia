import React from 'react';
import { Card } from './ui/card';

export default function ProcessingSpinner() {
  return (
    <Card className="p-12">
      <div className="text-center space-y-6">
        {/* Animated Spinner */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>

        {/* Processing Text */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            Analizando imagen...
          </h3>
          <p className="text-muted-foreground">
            Nuestros algoritmos de IA están examinando la imagen para detectar patrones artificiales
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-sm mx-auto">
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Preparando imagen...</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
              <span className="text-muted-foreground">Extrayendo características...</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-500"></div>
              <span className="text-muted-foreground">Aplicando modelo de IA...</span>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <p className="text-xs text-muted-foreground">
          Tiempo estimado: 2-5 segundos
        </p>
      </div>
    </Card>
  );
}