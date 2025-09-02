import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const MyClasses = () => {
  const navigate = useNavigate();

  const [savedBoards, setSavedBoards] = useState([]);
  const [groupedBoards, setGroupedBoards] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState(null); // 👈 kis class pe click hua
  const [openLessons, setOpenLessons] = useState([]); // 👈 show karne ke liye lessons

  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchBoards = async () => {
      if (!currentUserUid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "whiteboards"),
          where("createdByUid", "==", currentUserUid)
        );

        const snapshot = await getDocs(q);
        const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedBoards(boards);

        // Group by label
        const grouped = boards.reduce((acc, board) => {
          const label = board.label || "Untagged";
          if (!acc[label]) acc[label] = [];
          acc[label].push(board);
          return acc;
        }, {});
        setGroupedBoards(grouped);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [currentUserUid]);

  const handleViewLessons = (label) => {
    setSelectedLabel(label);
    setOpenLessons(groupedBoards[label] || []);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Classes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(groupedBoards).map((label, index) => (
          <div
            key={index}
            className="bg-purple-600 text-white rounded-xl p-5 shadow-lg"
          >
            {/* Class Title */}
            <h3 className="text-xl font-semibold">{label}</h3>
            <p className="text-sm opacity-90">
              Lessons: {groupedBoards[label].length}
            </p>

            {/* Class code (optional) */}
            <p className="mt-2 text-xs italic">
              Class code: {label.substring(0, 3).toLowerCase() + "123"}
            </p>

            {/* Students / Lessons count */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <span>📚</span>
                {groupedBoards[label].length} Lessons
              </div>
            </div>

            {/* Action menu */}
            <div className="mt-4">
  <button
    onClick={() => handleViewLessons(label)} // ✅ ye change karo
    className="px-3 py-1 bg-white text-purple-600 font-medium rounded shadow hover:bg-gray-100"
  >
    View Lessons
  </button>
</div>

          </div>
        ))}
      </div>
      {selectedLabel && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">
            Lessons in <span className="text-purple-600">{selectedLabel}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="border rounded-lg p-4 shadow bg-white"
              >
                <h4 className="font-semibold text-gray-800">
                </h4>
                <p className="text-sm text-gray-500">
                  Created on:{" "}
                  {lesson.createdAt?.toDate
                    ? lesson.createdAt.toDate().toLocaleDateString()
                    : "N/A"}
                </p>
                <button
      className="mt-2 px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
      onClick={() => navigate(`/Lessonwhiteboard/${lesson.id}`)} // ✅ navigate to whiteboard
    >
      Open Lesson
    </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClasses;
