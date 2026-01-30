const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.put('/teacher/:uid', async (req, res) => {
  console.log('UID:', req.params.uid);
  console.log('BODY:', req.body);
  try {
    const { uid } = req.params;
    const { name, email, password } = req.body;

    // 1️⃣ Update Firebase Auth
    const authUpdates = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(uid, authUpdates);
    }

    // 2️⃣ Update Firestore
    const firestoreUpdates = {};
    if (name) firestoreUpdates.name = name;
    if (email) firestoreUpdates.email = email;

    if (Object.keys(firestoreUpdates).length > 0) {
      await admin.firestore().collection('users').doc(uid).update(firestoreUpdates);
    }

    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
