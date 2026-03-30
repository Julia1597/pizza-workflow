require('dotenv').config();
const { Camunda8 } = require('@camunda8/sdk');
const path = require('path');

const camunda = new Camunda8({
  ZEEBE_ADDRESS: process.env.ZEEBE_ADDRESS,
  ZEEBE_SECURE_CONNECTION: false,
});

const { zeebeClient } = camunda.getCamundaClients();

async function deploy() {
  console.log('Déploiement en cours...');
  try {
    const result = await zeebeClient.deployResource({
      processFilename: path.join(__dirname, 'pizza-order.bpmn'),
    });
    const process = result.deployments[0].process;
    console.log('Déploiement réussi !');
    console.log('Process ID :', process.bpmnProcessId);
    console.log('Version :', process.version);
    console.log('Clé :', process.processDefinitionKey);
  } catch (err) {
    console.error('Erreur de déploiement :', err.message);
    process.exit(1);
  } finally {
    await zeebeClient.close();
    console.log('Connexion Zeebe fermée.');
  }
}

deploy();