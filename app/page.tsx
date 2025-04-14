'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from './components/Navbar';
import styles from './styles/Home.module.css';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Background Image Container */}
      <div className={`absolute inset-0 z-0 ${styles.backgroundImage}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      {/* Navbar - Fixed at the top */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-white">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Asset Management System
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-gray-200">
            Let&apos;s streamline your asset management process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">Track Assets</h3>
              <p className="text-gray-300">Monitor and manage all your assets in real-time</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">Department Management</h3>
              <p className="text-gray-300">Efficiently organize departments and their assets</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">Detailed Reports</h3>
              <p className="text-gray-300">Generate comprehensive asset management reports</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
