import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Save a shape
export const saveShape = async (whiteboardId, shape) => {
  if (!whiteboardId || !shape?.id) {
    throw new Error("whiteboardId and shape.id are required");
  }

  // path: whiteboards/{whiteboardId}/shapes/{shape.id}
  const shapeRef = doc(db, "whiteboards", whiteboardId, "shapes", shape.id);
  await setDoc(shapeRef, shape, { merge: true });
};

// Fetch all shapes
export const fetchShapes = async (whiteboardId) => {
  if (!whiteboardId) {
    throw new Error("whiteboardId is required");
  }

  // path: whiteboards/{whiteboardId}/shapes
  const shapesRef = collection(db, "whiteboards", whiteboardId, "shapes");
  const snap = await getDocs(shapesRef);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
