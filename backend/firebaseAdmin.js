const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Railway env var se JSON parse karo
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local dev ke liye fallback: local JSON file se load karo
    serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
  }
} catch (error) {
  process.exit(1); // Agar service account load nahi hua to app band kar do
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
