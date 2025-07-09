import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { JsonProvider } from './components/getLanguageJson';
import { HashRouter } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <JsonProvider>
      <HashRouter>
        <App/>
        
      </HashRouter>
    </JsonProvider>
  </ThemeProvider>


);

