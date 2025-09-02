import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import React, { useState, useEffect } from 'react';

const LessonWhiteboard = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      const docRef = doc(db, "whiteboards", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBoard(docSnap.data());
      }
    };
    fetchBoard();
  }, [id]);

  return (
    <div>
      {board ? (
        <div>
          <h2>{board.title || "Untitled Lesson"}</h2>
          {/* 👇 yahan apka Whiteboard render hoga with saved data */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
export default LessonWhiteboard;