import React, { useState } from 'react';
import { Button } from './components/ui/button';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';

type Page = 'home' | 'about';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">AI</span>
            </div>
            <h1 className="text-lg font-medium">ImageDetect</h1>
          </div>
          
          <nav className="flex space-x-1">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('home')}
              className="px-4"
            >
              Inicio
            </Button>
            <Button
              variant={currentPage === 'about' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('about')}
              className="px-4"
            >
              Sobre el Proyecto
            </Button>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'about' && <AboutPage />}
      </main>
    </div>
  );
}