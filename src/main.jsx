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

createRoot(document.getElementById('root')).render(<App />);
