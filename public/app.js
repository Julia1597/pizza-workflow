document.addEventListener('DOMContentLoaded', async () => {
    const pizzaSelect = document.getElementById('pizzaType');
    const orderForm = document.getElementById('orderForm');
    const statusMessage = document.getElementById('statusMessage');

    // 1. Charger le menu depuis l'API
    try {
        const response = await fetch('/api/menu');
        const pizzas = await response.json();
        pizzas.forEach(pizza => {
            const option = document.createElement('option');
            option.value = pizza.name;
            option.textContent = `${pizza.name} (${pizza.price}€)`;
            pizzaSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Impossible de charger le menu");
    }

    // 2. Envoyer la commande
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const orderData = {
            customerName: document.getElementById('customerName').value,
            pizzaType: pizzaSelect.value,
            address: document.getElementById('address').value
        };

        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            if (result.success) {
                statusMessage.textContent = `Commande ${result.orderId} envoyée !`;
                statusMessage.classList.remove('hidden');
                orderForm.reset();
            }
        } catch (err) {
            alert("Erreur lors de l'envoi");
        }
    });
});