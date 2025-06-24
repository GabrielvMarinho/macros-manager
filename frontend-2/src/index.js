import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { JsonProvider } from './components/getLanguageJson';
import { HashRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <JsonProvider>
    <HashRouter>

    <App/>
    </HashRouter>

  </JsonProvider>


);

