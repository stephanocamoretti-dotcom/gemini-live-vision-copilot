import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { VisionCopilot } from './components/VisionCopilot';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VisionCopilot />
  </StrictMode>
);
