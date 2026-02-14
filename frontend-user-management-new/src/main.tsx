import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
// import { setupGlobalErrorHandler } from './utils/errorHandler';
import App from './App';

// Activer le handler d'erreurs
// setupGlobalErrorHandler();

console.log('🚀 Application démarrée');
console.log('📁 Environnement:', import.meta.env.MODE);
console.log('🔍 Base URL:', import.meta.env.BASE_URL);

// Vérifier que le root element existe
const rootElement = document.getElementById('root');
console.log('📦 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Element root #root non trouvé!');
  throw new Error('Failed to find the root element');
}

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ Root React créé avec succès');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ Application rendue');
} catch (error) {
  console.error('❌ Erreur lors du rendu:', error);
}