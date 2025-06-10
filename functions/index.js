const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Stripe = require("stripe");

const STRIPE_SECRET = defineSecret("STRIPE_KEY");

admin.initializeApp();

exports.createStripeCheckout = onRequest({ secrets: [STRIPE_SECRET] }, (req, res) => {
  cors(req, res, async () => {
    const stripe = new Stripe(STRIPE_SECRET.value(), {
      apiVersion: "2022-11-15",
    });

    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { member, cart, successUrl, cancelUrl } = req.body;

      if (!member || !cart || !successUrl || !cancelUrl) {
        return res.status(400).send("Missing required fields");
      }

      const lineItems = cart.map(item => {
        return {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Annual Membership' },
            unit_amount: 20000,
          },
          quantity: Number(item.options?.quantity || 1),
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          memberUid: member.uid,
          memberEmail: member.email,
          memberName: `${member.firstName} ${member.lastName}`,
        },
      });

      return res.status(200).send({ sessionId: session.id });

    } catch (error) {
      console.error("Stripe session creation error:", error); 
      return res.status(500).send('Internal Server Error');
    }
  });
});
