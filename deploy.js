require('dotenv').config();
const { Camunda8 } = require('@camunda8/sdk');
const path = require('path');

const camunda = new Camunda8(); // Il va lire le .env tout seul comme un grand
const zeebeClient = camunda.getZeebeGrpcApiClient();

async function deploy() {
  console.log('Déploiement en cours...');
  try {
    const result = await zeebeClient.deployResource({
      processFilename: path.join(__dirname, 'pizza-order.bpmn'),
    });
    
    const process = result.deployments[0].process;
    console.log('Déploiement réussi !');
    console.log('Process ID :', process.bpmnProcessId);
    console.log('Version    :', process.version);
    
  } catch (err) {
    console.error('Erreur de déploiement :', err.message);
  } finally {
    console.log('Script terminé.');
    process.exit(0);
  }
}

deploy();