import React from 'react';

// Test individuel de chaque composant
const AppTest: React.FC = () => {
  const [result, setResult] = React.useState<string>('Cliquez pour tester');
  const [error, setError] = React.useState<string | null>(null);

  const testComponent = async (componentName: string) => {
    setResult(`Test de ${componentName}...`);
    setError(null);
    
    try {
      switch (componentName) {
        case 'AuthContext':
          const authModule = await import('./contexts/AuthContext');
          console.log('AuthContext:', authModule);
          setResult('✅ AuthContext: OK');
          break;
          
        case 'LoginPage':
          const loginModule = await import('./pages/LoginPage');
          console.log('LoginPage:', loginModule);
          setResult('✅ LoginPage: OK');
          break;
          
        case 'ChatPage':
          const chatModule = await import('./pages/ChatPage');
          console.log('ChatPage:', chatModule);
          setResult('✅ ChatPage: OK');
          break;
          
        case 'ProtectedRoute':
          const protectedModule = await import('./components/common/ProtectedRoute');
          console.log('ProtectedRoute:', protectedModule);
          setResult('✅ ProtectedRoute: OK');
          break;
          
        default:
          setResult('Composant non reconnu');
      }
    } catch (err: any) {
      setResult(`❌ ${componentName}: ERREUR`);
      setError(err.message);
      console.error(`Erreur dans ${componentName}:`, err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#d32f2f' }}>Test des Composants</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Résultat: {result}</h3>
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '10px',
            borderRadius: '5px',
            marginTop: '10px'
          }}>
            <strong>Erreur:</strong> {error}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['AuthContext', 'LoginPage', 'ChatPage', 'ProtectedRoute'].map((name) => (
          <button
            key={name}
            onClick={() => testComponent(name)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test: {name}
          </button>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3>Debug Direct</h3>
        <button
          onClick={() => {
            // Test direct dans la console
            console.clear();
            console.log('=== DEBUG DIRECT ===');
            try {
              console.log('1. Testing window.React:', window.React);
              console.log('2. Testing React global:', React);
              console.log('3. Testing document.getElementById:', document.getElementById('root'));
              
              // Force un rendu simple
              const root = document.getElementById('root');
              if (root) {
                root.innerHTML = `
                  <div style="padding: 20px; background: #4caf50; color: white;">
                    <h1>DEBUG DIRECT SUCCESS</h1>
                    <p>React est chargé et fonctionne</p>
                  </div>
                `;
                setResult('✅ Debug direct: SUCCESS');
              }
            } catch (err) {
              console.error('Debug error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }

            setResult('❌ Debug direct: FAILED');
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Direct React
        </button>
      </div>
    </div>
  );
};

export default AppTest;