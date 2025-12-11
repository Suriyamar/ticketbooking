import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import BusHero from '../assets/bus.svg';

export default function Home() {
  const { shows = [], loading } = useApp();

  if (loading) return <div className="flex justify-center items-center py-20">Loading shows...</div>;
  if (!shows || shows.length === 0) return <div className="text-center py-20">No shows available yet. Check back later.</div>;

  return (
    <div>
      <section className="mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold">Find and Book Your Next Trip</h2>
          <p className="text-slate-600 mt-2">Fast booking, seat selection and instant confirmation — redesigned experience inspired by major bus aggregators.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/admin" className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow">Admin</Link>
            <a href="#features" className="text-indigo-600 px-4 py-2 rounded-md border border-indigo-100">Features</a>
          </div>
        </div>
        <motion.div className="w-full md:w-1/3 rounded-lg overflow-hidden shadow-lg" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <img src={BusHero} alt="bus" className="w-full h-40 object-cover bg-indigo-50" />
        </motion.div>
      </section>

      <section className="mb-6">
        <h3 className="text-2xl font-semibold mb-4">Available Shows & Trips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((s: any, i:number) => (
            <motion.article key={s.id} className="bg-white rounded-2xl p-5 shadow-md border" whileHover={{ scale: 1.02 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{s.title || s.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{s.description || s.type || 'Show / Trip'}</p>
                  <div className="mt-3 text-sm text-slate-600">
                    <div><strong>Start:</strong> {new Date(s.start_time || s.start || Date.now()).toLocaleString()}</div>
                    {s.total_seats !== null && <div><strong>Seats:</strong> {s.total_seats}</div>}
                    {s.price && <div><strong>Price:</strong> ₹{s.price}</div>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${s.type==='appointment' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {s.type?.toUpperCase() || 'SHOW'}
                  </div>
                  <Link to={`/booking/${s.id}`} className="inline-block bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700">
                    Book
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
