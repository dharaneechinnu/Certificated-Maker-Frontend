import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import CertificateGuide from './components/CertificateGuide';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div>
      <CertificateGuide />
    </div>
    <App />
  </React.StrictMode>
);

