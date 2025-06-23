import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { JsonProvider } from './components/getLanguageJson';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <JsonProvider>

    <App/>
  </JsonProvider>


);

