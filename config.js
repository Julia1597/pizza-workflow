require('dotenv').config();
const { Camunda8 } = require('@camunda8/sdk');

// Configuration stricte qui écrase le fichier .env
const camunda = new Camunda8({
  ZEEBE_ADDRESS: 'localhost:26500',
  ZEEBE_INSECURE_CONNECTION: true, // Force la connexion sans SSL
  CAMUNDA_OAUTH_DISABLED: true,    // Désactive l'authentification
});

const zeebeClient = camunda.getZeebeGrpcApiClient();

module.exports = { zeebeClient };