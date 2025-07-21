const admin = require("firebase-admin");

// Load your service account key
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = "linda_krajcik@gmail.com";

async function makeAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ ${email} is now an admin`);

    const user2 = await admin.auth().getUserByEmail(email);
    console.log(user2.customClaims); 
  } catch (err) {
    console.error("Error setting admin claim:", err.message);
  }
}

makeAdmin();