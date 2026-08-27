require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');
const app = express();
const webpush = require('web-push');

app.use(express.json());
app.use(cors());

//Configuro web-push con le chiavi VAPID
webpush.setVapidDetails(
    'mailto:miaferramenta@example.it', 
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

app.post('/checkout-session', async function(req, res) {
    const { carrello } = req.body;

    //Traforma il carrello come richiesto da STRIPE
    const carrelloStripe = carrello.map(function(item) {
        return {
            price_data: {
                currency: 'eur',
                product_data: { name: item.nome },
                unit_amount: Math.round(item.prezzo * 100),
            },
            quantity: item.quantita || 1,
        };
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: carrelloStripe,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/simula-spedizione', function(req, res) {
    const { subscription } = req.body;

    if (!subscription) {
        return res.status(400).json({ error: 'Subscription mancante' });
    }

    // Rispondo subito al client, i timer proseguono in background sul server
    res.status(202).json({ ok: true });

    setTimeout(function() {
        webpush.sendNotification(subscription, JSON.stringify({
            title: 'Ordine spedito 📦',
            body: 'Il tuo ordine è partito dal magazzino!',
        })).catch(function(error) {
            console.error('Errore invio notifica "spedito":', error.message);
        });
    }, 5000);

    setTimeout(function() {
        webpush.sendNotification(subscription, JSON.stringify({
            title: 'Ordine consegnato ✅',
            body: 'Il tuo ordine ha raggiunto la destinazione!',
        })).catch(function(error) {
            console.error('Errore invio notifica "consegnato":', error.message);
        });
    }, 15000);
});

app.listen(4242, function() {
    console.log("Server in ascolto sulla porta 4242");
});