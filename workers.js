// workers.js
require('dotenv').config();
const { Camunda8 } = require('@camunda8/sdk');

// ─── Connexion à Zeebe ───────────────────────────────────────
// Grâce à notre super fichier .env, on a juste besoin de ces deux lignes !
const camunda = new Camunda8();
const zeebeClient = camunda.getZeebeGrpcApiClient();

// Utilitaire : pause simulée
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── WORKER 1 — receive-order ────────────────────────────────
zeebeClient.createWorker({
  taskType: 'receive-order',
  taskHandler: async (job) => {
    const { orderId, pizzaType, customerName } = job.variables;

    console.log(`Commande reçue — ID: ${orderId}, Pizza: ${pizzaType}`);

    await delay(500); // simule un appel base de données

    return job.complete({
      status: 'order-received',
      receivedAt: new Date().toISOString(),
    });
  },
});


// ─── WORKER 4 (en plus pour pouvoir valider la commande) ───
zeebeClient.createWorker({
  taskType: 'io.camunda.zeebe:userTask', // C'est le nom secret des tâches humaines
  taskHandler: async (job) => {
    console.log('[HUMAIN SIMULÉ] Le manager a vu la commande et la valide...');
    
    await delay(1500); // On simule le temps de réflexion de l'humain
    
    // On dit à Zeebe que la tâche est finie, ce qui débloque la suite !
    return job.complete();
  },
});

// ─── Worker 2 : Préparer la pizza ────────────────────────────
zeebeClient.createWorker({
  taskType: 'prepare-pizza',
  taskHandler: async (job) => {
    const { pizzaType, customerName } = job.variables;
    
    console.log(`Préparation de ${pizzaType} pour ${customerName}...`);
    console.log('Cuisson en cours...');
    
    await delay(2000); // On simule 2 secondes de cuisson
    console.log('Pizza prête !');
    
    return job.complete({
      status    : 'pizza-ready',
      preparedAt: new Date().toISOString(),
    });
  },
});

// ─── Worker 3 : Livrer la pizza ──────────────────────────────
zeebeClient.createWorker({
  taskType: 'deliver-pizza',
  taskHandler: async (job) => {
    // Récupération des variables d'entrée
    const { orderId, pizzaType, customerName, address } = job.variables;
    
    console.log(`Livraison de ${pizzaType} → ${customerName} (${address})`);
    
    await delay(1000); // On simule 1 seconde de trajet
    
    console.log('Pizza livrée ! Bon appétit');
    
    return job.complete({
      status     : 'delivered',
      deliveredAt: new Date().toISOString(),
    });
  },
});

console.log('Workers démarrés — en attente de jobs...');