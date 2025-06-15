const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Stripe = require("stripe");

const { onObjectFinalized } = require("firebase-functions/v2/storage");
const functions = require("firebase-functions"); // for https + params

const STRIPE_SECRET = defineSecret("STRIPE_KEY");

admin.initializeApp({
  storageBucket:  "website-f9d19.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// === 1. Stripe Checkout Function ===
exports.createStripeCheckout = onRequest({ secrets: [STRIPE_SECRET] }, (req, res) => {
  const stripe = new Stripe(STRIPE_SECRET.value(), {
    apiVersion: "2022-11-15",
  });

  cors(req, res, async () => {
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
      return res.status(500).send('Internal Server Error');
    }
  });
});



// === 2. Sync Storage Upload to Firestore ===
exports.syncImageUpload = onObjectFinalized({
  region: "us-central1",
}, async (event) => {
  const object = event.data;
  const filePath = object.name;
  const contentType = object.contentType;

  if (!filePath || !filePath.startsWith("photo-feed-images/")) {
    console.log(`Skipping unrelated file: ${filePath}`);
    return;
  }

  try {
    // Generate Firebase-style public URL
    const encodedPath = encodeURIComponent(filePath);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/website-f9d19.firebasestorage.app/o/${encodedPath}?alt=media`;

    await db.collection('photo-feed').add({
      url: publicUrl,
      name: filePath,
      contentType,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Synced ${filePath} to Firestore with public URL`);
  } catch (err) {
    console.error(`Error syncing ${filePath}`, err);
  }
});
