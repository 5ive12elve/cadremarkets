import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster 
          toastOptions={{
            // Default options for all toasts
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #db2b2e',
              borderRadius: '0px',
              fontFamily: 'inherit',
            },
            // Success toasts
            success: {
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #db2b2e',
                borderRadius: '0px',
              },
              iconTheme: {
                primary: '#db2b2e',
                secondary: '#ffffff',
              },
            },
            // Error toasts
            error: {
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #db2b2e',
                borderRadius: '0px',
              },
              iconTheme: {
                primary: '#db2b2e',
                secondary: '#ffffff',
              },
            },
            // Loading toasts
            loading: {
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #db2b2e',
                borderRadius: '0px',
              },
              iconTheme: {
                primary: '#db2b2e',
                secondary: '#ffffff',
              },
            },
          }}
          position="top-right"
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
