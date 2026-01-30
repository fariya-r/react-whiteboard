// routes/getTeachers.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// GET /api/teachers
router.get('/teachers', async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'Teacher').get();

    const teachers = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.json(teachers);
  } catch (err) {
    console.error('❌ Error fetching teachers from Firestore:', err);
    res.status(500).json({ message: 'Error fetching teachers' });
  }
});

module.exports = router;
