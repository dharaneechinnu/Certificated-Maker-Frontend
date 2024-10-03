// components/ui/alert.jsx
import React from 'react';

export const Alert = ({ children, className = '' }) => (
  <div className={`alert ${className}`}>
    <div className="alert-content">
      {children}
    </div>
  </div>
);

export const AlertTitle = ({ children }) => (
  <h5 className="alert-title">{children}</h5>
);

export const AlertDescription = ({ children, className = '' }) => (
  <div className={`alert-description ${className}`}>{children}</div>
);

