require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

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
            success_url: 'http://localhost:5173?success=true',
            cancel_url: 'http://localhost:5173?canceled=true',
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(4242, function() {
    console.log("Server in ascolto sulla porta 4242");
});