const { zeebeClient } = require('./config.js');

async function startProcess() {
  try {
    const result = await zeebeClient.createProcessInstance({
      bpmnProcessId: 'pizza-order-process',
      variables: {
        orderId: 'ORDER-' + Date.now(),
        pizzaType: 'Margherita',
        customerName: 'Alice Martin',
        address: '12 rue de la Paix'
      }
    });
    console.log('Instance créée !');
    console.log('Process Instance Key :', result.processInstanceKey);
  } catch (error) {
    console.error('Erreur :', error);
  }
}

startProcess();