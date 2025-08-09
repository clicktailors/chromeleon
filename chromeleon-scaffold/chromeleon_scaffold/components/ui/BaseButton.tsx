import React from 'react';

export const BaseButton = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
  <button
    className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
    onClick={onClick}
  >
    {children}
  </button>
);

// TODO: This is a UI abstraction layer. Keep logic separate from presentation.
