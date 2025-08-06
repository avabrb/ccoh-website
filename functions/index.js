const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Stripe = require("stripe");

// const { onObjectFinalized } = require("firebase-functions/v2/storage");
const functions = require("firebase-functions"); // for https + params
const crypto = require("crypto");
const nodemailer  = require('nodemailer');

const STRIPE_SECRET = defineSecret("STRIPE_KEY");
const GMAIL_EMAIL_SECRET    = defineSecret("GMAIL_EMAIL");
const GMAIL_PASSWORD_SECRET = defineSecret("GMAIL_PASSWORD");

admin.initializeApp({
  storageBucket:  "website-f9d19.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// === 1. Stripe Checkout Function ===
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


// === 2. Importing users in bulk function ===

exports.bulkCreateUsers = onRequest(
  { secrets: [GMAIL_EMAIL_SECRET, GMAIL_PASSWORD_SECRET] },
  async (req, res) => {
    // 🔐 Secure CORS headers
    res.set("Access-Control-Allow-Origin", "http://localhost:5173"); // Replace with production domain if needed
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // 🔐 Extract & verify Firebase ID token
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
      return res.status(401).send("Missing or invalid Authorization header");
    }

    const idToken = match[1];
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).send("Unauthorized");
    }

    // 🔐 Enforce admin-only access
    if (!decoded.admin) {
      return res.status(403).send("Forbidden: admin access required");
    }

    // ✅ Process CSV import
    try {
      const gmailEmail = GMAIL_EMAIL_SECRET.value();
      const gmailPassword = GMAIL_PASSWORD_SECRET.value();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailEmail, pass: gmailPassword },
      });

      const members = req.body.members;
      if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).send("Invalid payload");
      }

      const results = [];
      for (const m of members) {
        try {
          const tempPass = crypto.randomBytes(6).toString("base64");
          const u = await admin.auth().createUser({
            email: m.email,
            password: tempPass,
            displayName: `${m.firstName} ${m.lastName}`,
          });

          const resetLink = await admin.auth().generatePasswordResetLink(m.email);

          await transporter.sendMail({
            from: `"CCOH Admin" <${gmailEmail}>`,
            to: m.email,
            subject: "Set your CCOH password",
            html: `<p>Hi ${m.firstName},</p>
                   <p>Your account was created.
                   <a href="${resetLink}">Click here</a> to set your password.</p>`,
          });

          await db.collection("users-ccoh").doc(u.uid).set({
            uid: u.uid, 
            country: m.country,
            email: m.email,
            firstName: m.firstName,
            lastName: m.lastName,
            phoneNumber: m.phoneNumber,
            status: m.status,
            title: m.title,
            isProfileComplete: m.isProfileComplete,
            membershipPayment: false,
            membershipPaymentAllowed: true,
            membershipPaymentDate: null,
            membershipPaymentYear: null,
            activeStatus: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          results.push({ email: m.email, success: true });
        } catch (err) {
          console.error("Error for", m.email, err);
          results.push({ email: m.email, success: false, error: err.message });
        }
      }

      return res.status(200).json({ results });
    } catch (err) {
      console.error("Unexpected error:", err);
      return res.status(500).send("Internal Server Error");
    }
  }
);

exports.resendPasswordLink = onRequest(
  { secrets: [ GMAIL_EMAIL_SECRET, GMAIL_PASSWORD_SECRET ] },
  (req, res) => {
    cors(req, res, async () => {
      // 1) Preflight
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      // 2) Auth & admin guard
      const authHeader = req.headers.authorization || "";
      const match = authHeader.match(/^Bearer (.+)$/);
      if (!match) {
        return res.status(401).send("Missing or invalid Authorization header");
      }
      let decoded;
      try {
        decoded = await admin.auth().verifyIdToken(match[1]);
      } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).send("Unauthorized");
      }
      if (!decoded.admin) {
        return res.status(403).send("Forbidden: admin access required");
      }

      // 3) Payload check
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).send("Missing or invalid email in request body");
      }

      // 4) Load your secrets here
      const gmailEmail    = GMAIL_EMAIL_SECRET.value();
      const gmailPassword = GMAIL_PASSWORD_SECRET.value();

      // 5) Create a fresh transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailEmail, pass: gmailPassword },
      });

      // 6) Generate + send the link
      try {
        const resetLink = await admin.auth().generatePasswordResetLink(email);
        await transporter.sendMail({
          from:    `"Consular Corps of Houston Admin" <${gmailEmail}>`,
          to:      email,
          subject: "Your CCOH Password Setup Link",
          html:    `<p>Click <a href="${resetLink}">here</a> to set or reset your password.</p>`,
        });
        return res.status(200).send("Link sent");
      } catch (err) {
        console.error("resendPasswordLink error:", err);
        return res.status(500).send(err.message);
      }
    });
  }
);

exports.deleteUser = onRequest((req, res) => {
  // CORS + pre-flight
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }
    if (req.method !== "DELETE") {
      return res.status(405).send("Method Not Allowed");
    }

    // 1) Verify Firebase ID token from Authorization header
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
      return res.status(401).send("Missing or invalid Authorization header");
    }
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(match[1]);
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).send("Unauthorized");
    }

    // 2) Ensure caller is an admin
    if (!decoded.admin) {
      return res.status(403).send("Forbidden: admin access required");
    }

    // 3) Delete the user
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).send("Missing uid in request body");
    }

    try {
      // a) delete from Auth
      await admin.auth().deleteUser(uid);

      // b) delete their Firestore doc
      await db.collection("users-ccoh").doc(uid).delete();

      return res.status(200).send("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).send(err.message);
    }
  });
});


// === Sync Storage Upload to Firestore ===

// Ignore this function for now; for now, just use the frontend upload and
// worry about security, resizing, etc. later.
// exports.syncImageUpload = onObjectFinalized({
//   region: "us-central1",
// }, async (event) => {
//   const object = event.data;
//   const filePath = object.name;
//   const contentType = object.contentType;

//   if (!filePath || !filePath.startsWith("photo-feed-images/")) {
//     console.log(`Skipping unrelated file: ${filePath}`);
//     return;
//   }

//   try {
//     // Generate Firebase-style public URL
//     const encodedPath = encodeURIComponent(filePath);
//     const publicUrl = `https://firebasestorage.googleapis.com/v0/b/website-f9d19.firebasestorage.app/o/${encodedPath}?alt=media`;

//     await db.collection('photo-feed').add({
//       url: publicUrl,
//       name: filePath,
//       contentType,
//       uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     console.log(`Synced ${filePath} to Firestore with public URL`);
//   } catch (err) {
//     console.error(`Error syncing ${filePath}`, err);
//   }
// });
