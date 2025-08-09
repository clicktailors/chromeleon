import React from 'react';
import { createRoot } from 'react-dom/client';

// TODO: Inject UI layer into page without clashing with host site styles
const root = document.createElement('div');
root.id = 'chromeleon-root';
document.body.appendChild(root);

createRoot(root).render(<div>Injected Content UI</div>);
