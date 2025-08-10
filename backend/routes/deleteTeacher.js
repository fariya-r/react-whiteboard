const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebaseAdmin'); // Ensure firebaseAdmin.js exports auth and db

// DELETE /api/teacher/:uid
router.delete('/:uid', async (req, res) => {
  const teacherUid = req.params.uid; // Renamed for clarity


  try {
    // 1. Delete all whiteboards owned by this teacher
    const whiteboardsRef = db.collection('whiteboards');
    // CORRECTED: Use 'createdByUid' as per your Firestore document structure
    const q = whiteboardsRef.where('createdByUid', '==', teacherUid); // <-- THIS IS THE CHANGE!

    const snapshot = await q.get();


    if (!snapshot.empty) {
      const batch = db.batch(); // Create a batch for atomic deletion
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref); // Add each whiteboard document to the batch
      });
      await batch.commit(); // Commit the batch deletion
    } else {
    }

    // 2. Delete the teacher's user account from Firebase Authentication
    await auth.deleteUser(teacherUid);

    // 3. Delete the teacher's document from your 'users' collection (or 'teachers' if you have one)
    await db.collection('users').doc(teacherUid).delete();

    res.status(200).json({ message: 'Teacher and associated whiteboards deleted successfully.' });

  } catch (err) {
    console.error('❌ Error deleting teacher or whiteboards:', err);
    // Provide more specific error messages for the client
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'Teacher not found in authentication system.' });
    }
    res.status(500).json({ message: 'Failed to delete teacher and associated whiteboards.', error: err.message });
  }
});

module.exports = router;