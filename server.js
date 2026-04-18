// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const { zeebeClient } = require('./config'); // On importe notre connexion à Zeebe

const app = express();

// Configuration pour comprendre le JSON et lire le dossier 'public'
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// "Base de données" en mémoire (Map) comme demandé dans le TP
const ordersDB = new Map();

// ─── ENDPOINTS REST (API) ──────────────────────────────────────

// 1. GET /api/health — Vérifier l'état du système
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', message: 'API Express opérationnelle' });
});

// 2. GET /api/menu — Obtenir le menu des pizzas
app.get('/api/menu', (req, res) => {
    const menu = [
        { id: 'margherita', name: 'Margherita', price: 10, prepTime: '10 min' },
        { id: 'pepperoni', name: 'Pepperoni', price: 12, prepTime: '12 min' },
        { id: 'reine', name: 'Reine', price: 11, prepTime: '11 min' }
    ];
    res.json(menu);
});

// (Les routes /api/order pour démarrer le processus arriveront ici)

// 3. POST /api/order — Créer une nouvelle commande et lancer le workflow Zeebe
app.post('/api/order', async (req, res) => {
    try {
        // On récupère les infos envoyées par le futur formulaire web
        const { pizzaType, customerName, address } = req.body;

        // On génère un numéro de commande unique
        const orderId = `ORDER-${Date.now()}`;

        console.log(`\nNouvelle commande reçue via API: ${orderId} pour ${customerName}`);

        // On démarre l'instance dans Zeebe (comme le faisait start-process.js)
        const result = await zeebeClient.createProcessInstance({
            bpmnProcessId: 'pizza-order-process',
            variables: {
                orderId: orderId,
                pizzaType: pizzaType,
                customerName: customerName,
                address: address || 'Sur place' // Adresse par défaut si vide
            }
        });

        // On sauvegarde en mémoire (comme demandé dans le TP)
        const processInstanceKey = result.processInstanceKey;
        ordersDB.set(orderId, {
            orderId,
            pizzaType,
            customerName,
            status: 'initiée',
            processInstanceKey
        });

        // On répond au site web que tout s'est bien passé
        res.json({
            success: true,
            message: 'Commande envoyée en cuisine !',
            orderId: orderId,
            processInstanceKey: processInstanceKey
        });

    } catch (error) {
        console.error('Erreur lors de la création de la commande :', error);
        res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
    }
});

// 4. GET /api/orders — Lister toutes les commandes de la session
app.get('/api/orders', (req, res) => {
    // On transforme notre Map() en tableau (Array) pour l'envoyer au site web
    const allOrders = Array.from(ordersDB.values());
    res.json(allOrders);
});

// 5. GET /api/orders/:orderId — Obtenir le détail d'une commande spécifique
app.get('/api/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const order = ordersDB.get(orderId);
    
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: "Commande introuvable" });
    }
});

// ─── DÉMARRAGE DU SERVEUR ──────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur Web démarré sur http://localhost:${PORT}`);
});