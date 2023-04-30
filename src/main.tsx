import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StrictMode>
);

//AIzaSyB5rk666lWxXOOS9MyAJy2dj--Eis4C5KY
