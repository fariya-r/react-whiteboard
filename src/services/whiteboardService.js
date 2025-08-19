// src/services/whiteboardService.js

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
  onSnapshot, setDoc,arrayUnion
} from 'firebase/firestore';
import axios from 'axios';
import { API_BASE } from '../components/apiConfig';

import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';

// Save a new whiteboard (including textBoxes)
export const saveWhiteboard = async (
  dataUrl,
  tool,
  color,
  lineWidth,
  textBoxes,
  circles,
  shapes,
  fileUrls,
  ocrText,
  stickyNotes,
  backgroundColor
) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const docRef = await addDoc(collection(db, "whiteboards"), {
    uid: user.uid,
    snapshot: dataUrl || "",
    tool: tool || "pencil",
    color: color || "#000000",
    lineWidth: lineWidth || 2,
    textBoxes: textBoxes || [],
    circles: circles || [],
    shapes: shapes || [],      // ✅ ensure always an array
    files: fileUrls || [],
    ocrText: ocrText || "",
    stickyNotes: stickyNotes || [],
    backgroundColor: backgroundColor || "#ffffff",
    createdAt: serverTimestamp(),
    createdByUid: user.uid,
    createdByName: user.displayName || "Unknown",
    createdByEmail: user.email || "",
  });

  return docRef.id;
};

export const getWhiteboards = async (isAdminView = false, teacherUid = null) => {
  const auth = getAuth(); // ✅ FIXED earlier
  const user = auth.currentUser;
  if (!user) throw new Error('User not logged in');

  let q;
  if (isAdminView && teacherUid) {
    q = query(collection(db, 'whiteboards'), where('uid', '==', teacherUid), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, 'whiteboards'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};



export const updateWhiteboard = async (
  id,
  dataUrl,
  tool,
  color,
  lineWidth,
  textBoxes,
  circles,
  shapes,
  fileUrls,
  ocrText,
  stickyNotes,
  backgroundColor
) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const docRef = doc(db, "whiteboards", id);
  await updateDoc(docRef, {
    snapshot: dataUrl || "",
    tool: tool || "pencil",
    color: color || "#000000",
    lineWidth: lineWidth || 2,
    textBoxes: textBoxes || [],
    circles: circles || [],
    shapes: shapes || [],      // ✅ ensure always an array
    files: fileUrls || [],
    ocrText: ocrText || "",
    stickyNotes: stickyNotes || [],
    backgroundColor: backgroundColor || "#ffffff",
    updatedAt: new Date(),     // 👈 createdAt ki jagah updatedAt rakho
  });
};

// Delete whiteboard
export const deleteWhiteboard = async (id) => {
  const docRef = doc(db, 'whiteboards', id);
  await deleteDoc(docRef);
};
export const uploadFile = async (file, whiteboardId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('whiteboardId', whiteboardId); // ✅ now defined

  try {
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url; // ✅ fixed
  } catch (err) {
    console.error('❌ Upload error:', err);
    throw err;
  }
};

export const createLiveWhiteboardSession = async (sessionId, userId) => {
  const docRef = doc(db, 'whiteboardSessions', sessionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await setDoc(docRef, {
      creator: userId,
      strokes: [],
      createdAt: new Date(),
    });
  }
};

export const listenToStrokes = (sessionId, callback) => {
  const docRef = doc(db, 'whiteboardSessions', sessionId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.strokes || []);
    }
  });
};

export const addStroke = async (sessionId, stroke) => {
  const docRef = doc(db, 'whiteboardSessions', sessionId);
  await updateDoc(docRef, {
    strokes: arrayUnion(stroke),
  });
};



