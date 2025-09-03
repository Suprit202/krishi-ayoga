import React from 'react';

const Alert = ({ type = 'info', title, children, className = '' }) => {
  const styles = {
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
    info: 'alert-info',
  };
  
  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };
  
  return (
    <div className={`${styles[type]} ${className} p-4 rounded-lg`}>
      <div className="flex items-start">
        <span className="text-lg mr-3">{icons[type]}</span>
        <div>
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert;