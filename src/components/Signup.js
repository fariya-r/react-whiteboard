import React, { useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import RightAnimation from "../components/RightAnimation";

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const signupWithEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let role = "Student";
      if (email.endsWith("@school.edu")) {
        role = "Teacher";
      }

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: user.email,
        role,
        assignedClasses: [],
        savedBoards: [],
        sessionHistory: []
      });

      navigate("/"); // redirect to login
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-0 font-sans overflow-hidden">
      <div className="flex flex-col lg:flex-row max-w-6xl w-full h-screen">
        
        {/* Left Section - Signup Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between h-full overflow-hidden">
          <div className="flex-shrink-0">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Sign Up</h2>
            <p className="text-gray-600 mb-6">
              Already have an account?{' '}
              <Link to="/" className="text-blue-600 hover:underline">
                Login here!
              </Link>
            </p>
          </div>

          {/* Middle part: Form Inputs */}
          <div className="flex-grow flex flex-col justify-center space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <i className="bi bi-person text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-lg"></i>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <i className="bi bi-envelope text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-lg"></i>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <i className="bi bi-lock text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 text-lg"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <i className="bi bi-eye-slash text-lg" />
                  ) : (
                    <i className="bi bi-eye text-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={signupWithEmail}
                className="w-full max-w-xs bg-indigo-900 text-white py-2.5 px-4 rounded-lg text-base font-medium shadow-md hover:bg-indigo-800 hover:shadow-lg transition-all duration-300 ease-in-out"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Same Animation as Login */}
        <RightAnimation />
      </div>
    </div>
  );
}
