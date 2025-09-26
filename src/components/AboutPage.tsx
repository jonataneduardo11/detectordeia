import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export default function AboutPage() {
  return (
    <div className="py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          Sobre ImageDetect
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Una herramienta de vanguardia que utiliza inteligencia artificial para distinguir entre imágenes reales 
          y aquellas generadas por algoritmos, contribuyendo a la verificación de contenido digital y la prevención de desinformación.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              En una era donde la generación de imágenes por IA se vuelve cada vez más sofisticada, 
              proporcionamos una herramienta confiable para verificar la autenticidad del contenido visual, 
              protegiendo la integridad de la información digital.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Verificación de contenido periodístico</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Prevención de fraudes digitales</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Educación sobre deepfakes</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Visión Clara</h3>
            <p className="text-sm text-muted-foreground">
              Un futuro donde la autenticidad digital sea transparente y verificable para todos.
            </p>
          </div>
        </div>
      </Card>

      {/* Technology Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Tecnología de Punta</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nuestro sistema combina múltiples técnicas de machine learning y análisis de patrones 
            para lograr una precisión excepcional en la detección.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Redes Neuronales Profundas</h3>
            <p className="text-sm text-muted-foreground">
              Arquitecturas CNN avanzadas entrenadas con millones de imágenes reales y sintéticas
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Análisis Espectral</h3>
            <p className="text-sm text-muted-foreground">
              Detección de artefactos frecuenciales característicos de la generación artificial
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Procesamiento Rápido</h3>
            <p className="text-sm text-muted-foreground">
              Optimización de modelos para análisis en tiempo real sin comprometer la precisión
            </p>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Nuestro Equipo</h2>
          <p className="text-muted-foreground">
            Expertos en IA, visión computacional y seguridad digital trabajando por un futuro más transparente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-lg">DR</span>
            </div>
            <h3 className="font-semibold">Kevin Martin</h3>
            <p className="text-sm text-muted-foreground mb-2">Estudiante</p>
            <Badge variant="secondary" className="text-xs">PhD en Machine Learning</Badge>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-lg">AL</span>
            </div>
            <h3 className="font-semibold">Melquiades Morales</h3>
            <p className="text-sm text-muted-foreground mb-2">Estudiante</p>
            <Badge variant="secondary" className="text-xs">Especialista en Computer Vision</Badge>
          </div>

           <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-lg">AL</span>
            </div>
            <h3 className="font-semibold">Carlos Zavala</h3>
            <p className="text-sm text-muted-foreground mb-2">Estudiante</p>
            <Badge variant="secondary" className="text-xs">Experto en Deep Learning</Badge>
          </div>

           <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-lg">AL</span>
            </div>
            <h3 className="font-semibold">Eduardo Aguilar</h3>
            <p className="text-sm text-muted-foreground mb-2">Estudiante</p>
            <Badge variant="secondary" className="text-xs">Especialista en Computer Vision</Badge>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-lg">JS</span>
            </div>
            <h3 className="font-semibold">Brayan Alegría</h3>
            <p className="text-sm text-muted-foreground mb-2">Estudiante</p>
            <Badge variant="secondary" className="text-xs">Experto en Deep Learning</Badge>
          </div>
        </div>
      </Card>

      {/* Privacy & Ethics */}
      <Card className="p-8 bg-muted/30">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold">Privacidad y Ética</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <strong>Compromiso total con la privacidad:</strong> Las imágenes se procesan localmente cuando es posible 
            y nunca se almacenan en nuestros servidores. Creemos que la tecnología debe servir a las personas 
            respetando sus derechos fundamentales.
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Badge variant="outline">Sin almacenamiento</Badge>
            <Badge variant="outline">Procesamiento seguro</Badge>
            <Badge variant="outline">Código abierto</Badge>
            <Badge variant="outline">Transparencia total</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}