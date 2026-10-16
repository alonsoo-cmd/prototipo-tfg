import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { polyfill } from 'mobile-drag-drop';
import 'mobile-drag-drop/default.css';
import App from './routes/App.jsx';
import './styles.css';
import './vivid.css';

// Habilita el soporte táctil para la API HTML5 de Drag & Drop (tablets/móviles)
polyfill({
  dragImageCenterOnTouch: true,
});

// En Safari/iOS es necesario para evitar el scroll de la página al intentar arrastrar
window.addEventListener('touchmove', () => {}, { passive: false });

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error no controlado capturado por ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '40px auto', textAlign: 'center', fontFamily: 'Manrope, sans-serif' }}>
          <h2 style={{ color: '#2d5134' }}>Ha ocurrido un error inesperado</h2>
          <p style={{ color: '#55695a', fontSize: '14px', marginBottom: '20px' }}>{this.state.error?.message || 'Error al renderizar la aplicación.'}</p>
          <button
            type="button"
            className="button primary"
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          >
            Recargar aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
