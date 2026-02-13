import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppDebug from './AppDebug'; // Utilise le debug


console.log('🚀 Démarrage de React...');

// Gestionnaire d'erreurs global
window.addEventListener('error', (event) => {
  console.error('📛 ERREUR CAPTURÉE:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('📛 PROMISE REJECTION:', event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ ERREUR: Élément #root non trouvé');
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; font-family: Arial;">
      <h1>Erreur Critique</h1>
      <p>L'élément #root n'a pas été trouvé.</p>
    </div>
  `;
} else {
  try {
    console.log('✅ Root element trouvé, création du root React...');
    const root = ReactDOM.createRoot(rootElement);
    
    // Wrapper pour capturer les erreurs React
    const AppWithErrorBoundary = () => {
      try {
        return <App />;
      } catch (error) {
        console.error('❌ ERREUR DANS APP:', error);
        return (
          <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial' }}>
            <h1>Erreur dans le composant App</h1>
            <pre>{error instanceof Error ? error.message : String(error)}</pre>
            <pre>{error instanceof Error ? error.stack : ''}</pre>
          </div>
        );
      }
    };
    
    root.render(
      <React.StrictMode>
        <AppWithErrorBoundary />
      </React.StrictMode>
    );
    
    console.log('✅ Application React rendue !');
  } catch (error) {
    console.error('❌ ERREUR LORS DU RENDU:', error);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px; font-family: Arial;">
        <h1>Erreur de Rendu React</h1>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
}