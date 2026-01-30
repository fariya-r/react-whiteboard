import React, { useState, useEffect } from 'react';

export default function AddTeacherForm({
  initialData,
  onClose,
  onAdd,
  onUpdate,
}) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🔥 Prefill data in edit mode
  useEffect(() => {
    if (isEdit) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
    }
  }, [initialData, isEdit]);

  const handleSubmit = () => {
    if (!name || !email) {
      alert('Name and Email are required');
      return;
    }

    if (isEdit) {
      onUpdate({
        uid: initialData.uid,
        name,
        email,
        password: password || null, // password optional
      });
    } else {
      if (!password) {
        alert('Password is required for new teacher');
        return;
      }
      onAdd({ name, email, password });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
        </h3>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder={isEdit ? 'New Password (optional)' : 'Password'}
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
          >
            {isEdit ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
