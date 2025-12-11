import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Logo from '../assets/logo.svg';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-30 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={Logo} className="w-10 h-10 rounded-full" alt="logo" />
            <div>
              <h1 className="text-lg font-semibold">BookEase</h1>
              <p className="text-xs text-slate-500">Ticket Booking System</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/" className="text-slate-700 hover:text-indigo-600">Shows</Link>
            <Link to="/admin" className="text-slate-700 hover:text-indigo-600">Admin</Link>
            <a href="#features" className="hidden md:inline text-slate-500 text-sm">Features</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Outlet />
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
          © 2025 BookEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
