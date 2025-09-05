import React from 'react';
import ImageUploader from './ImageUploader';

export default function HomePage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-gray-600 bg-clip-text text-transparent">
          Detecta si una imagen es real o creada por IA
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Tecnología avanzada de Deep Learning para verificar la autenticidad de imágenes con precisión y confiabilidad.
        </p>
      </div>

      {/* Main Upload Component */}
      <div className="max-w-2xl mx-auto">
        <ImageUploader />
      </div>

      {/* Features Section */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-2">Análisis Instantáneo</h3>
          <p className="text-muted-foreground text-sm">
            Resultados precisos en segundos utilizando algoritmos de última generación
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-2">Alta Precisión</h3>
          <p className="text-muted-foreground text-sm">
            Modelo entrenado con millones de imágenes para máxima confiabilidad
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-2">Privacidad Total</h3>
          <p className="text-muted-foreground text-sm">
            Tus imágenes se procesan de forma segura y no se almacenan
          </p>
        </div>
      </div>
    </div>
  );
}