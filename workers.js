// workers.js
require('dotenv').config();
const { Camunda8 } = require('@camunda8/sdk');

// ─── Connexion à Zeebe ───────────────────────────────────────
const camunda = new Camunda8({
  ZEEBE_ADDRESS: process.env.ZEEBE_ADDRESS || 'localhost:26500',
  ZEEBE_SECURE_CONNECTION: process.env.ZEEBE_SECURE_CONNECTION === 'true',
});

const { zeebeClient } = camunda.getCamundaClients();

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

// ─── Worker 2 : Préparer la pizza ────────────────────────────
zeebeClient.createWorker({
  taskType: 'prepare-pizza',
  taskHandler: async (job) => {
    // On récupère le type de pizza et le nom du client depuis les variables de l'étape précédente
    const { pizzaType, customerName } = job.variables;
    
    console.log(`Préparation de ${pizzaType} pour ${customerName}...`);
    console.log('Cuisson en cours...');
    
    // On simule 2 secondes de cuisson
    await delay(2000);
    console.log('Pizza prête !');
    
    // On termine la tâche et on met à jour le statut
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
    
    // On simule 1 seconde de trajet
    await delay(1000); 
    
    console.log('Pizza livrée ! Bon appétit');
    
    // On termine le job en produisant les variables de sortie
    return job.complete({
      status     : 'delivered',
      deliveredAt: new Date().toISOString(),
    });
  },
});