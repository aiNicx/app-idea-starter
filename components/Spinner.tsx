
import React from 'react';

const Spinner: React.FC<{ message?: string }> = ({ message = "Elaborazione in corso..." }) => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    <p className="text-dark-text text-sm">{message}</p>
  </div>
);

export default Spinner;
