import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter} from 'react-router'
import AppRoutes from './config/routes'
import { Toaster } from 'react-hot-toast';
import { ChatProvider } from './context/ChatContext';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <Toaster />
      <ChatProvider>
      <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
)
