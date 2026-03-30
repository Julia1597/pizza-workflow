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