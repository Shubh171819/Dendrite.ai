import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import keycloak from './utils/KeycloakUtil';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
  if (authenticated) {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.log('Login required')
  }
}).catch((error) => {
  console.error(error);
}); 