
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import { ArrowLeft, Loader } from "lucide-react";

type Show = Database['public']['Tables']['shows']['Row'];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY);
const MOCK_BASE = import.meta.env.VITE_MOCK_BASE_URL || 'http://localhost:4001';

export const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle'|'pending'|'confirmed'|'failed'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShow = async () => {
      setLoading(true);
      try {
        if (USE_MOCK) {
          const res = await fetch(`${MOCK_BASE}/shows/${id}`);
          if (!res.ok) throw new Error('Show not found');
          const data = await res.json();
          setShow(data);
        } else {
          if (!supabase) throw new Error('Supabase not initialized');
          const { data, error } = await supabase.from('shows').select('*').eq('id', id).single();
          if (error) throw error;
          setShow(data as Show);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load show');
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [id]);

  const seatsArray = (() => {
    if (!show || show.total_seats === null) return [];
    const n = show.total_seats;
    const arr = [];
    for (let i = 1; i <= n; i++) arr.push(i);
    return arr;
  })();

  // Fetch taken seats for the show (mock backend returns bookings)
  const [takenSeats, setTakenSeats] = useState<number[]>([]);
  useEffect(() => {
    const fetchTaken = async () => {
      if (!show) return;
      try {
        if (USE_MOCK) {
          const res = await fetch(`${MOCK_BASE}/bookings`);
          if (!res.ok) return;
          const data = await res.json();
          const taken = data.filter((b:any)=> b.show_id === show.id && b.seats).flatMap((b:any)=> b.seats);
          setTakenSeats(taken);
        } else {
          if (!supabase) return;
          const { data, error } = await supabase.from('bookings').select('*').eq('show_id', show.id);
          if (error) return;
          const taken = (data || []).flatMap((b:any)=> b.seats || []);
          setTakenSeats(taken);
        }
      } catch (err) {
        console.warn(err);
      }
    };
    fetchTaken();
  }, [show, bookingStatus]);

  const toggleSeat = (n:number) => {
    if (takenSeats.includes(n)) return;
    setSelectedSeats(prev => prev.includes(n) ? prev.filter(x=>x!==n) : [...prev, n]);
  };

  const handleBooking = async (e:React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!show) return;
    if (show.total_seats !== null && selectedSeats.length === 0) {
      setError('Select at least one seat');
      return;
    }
    if (!bookName.trim() || !bookEmail.trim()) {
      setError('Name and email are required');
      return;
    }
    setBookingStatus('pending');
    try {
      const payload:any = {
        show_id: show.id,
        seats: selectedSeats,
        name: bookName,
        email: bookEmail,
      };
      let result;
      if (USE_MOCK) {
        const res = await fetch(`${MOCK_BASE}/bookings`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(payload)});
        if (!res.ok) {
          const body = await res.json().catch(()=>({error:'unknown'}));
          throw new Error(body.error || 'Booking failed');
        }
        result = await res.json();
      } else {
        if (!supabase) throw new Error('Supabase not initialized');
        const { data, error } = await supabase.from('bookings').insert([payload]);
        if (error) throw error;
        result = data;
      }
      setBookingStatus('confirmed');
      // refresh taken seats
      setSelectedSeats([]);
      setTimeout(()=> setBookingStatus('idle'), 2000);
    } catch (err:any) {
      console.error(err);
      setBookingStatus('failed');
      setError(err?.message || 'Booking failed');
      setTimeout(()=> setBookingStatus('idle'), 2000);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader className="animate-spin inline-block" /></div>;
  if (!show) return <div className="py-20 text-center">Show not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={()=>navigate(-1)} className="text-slate-600 hover:text-slate-900 flex items-center gap-2"><ArrowLeft /> Back</button>
        <h2 className="text-2xl font-semibold">{show.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow">
          <p className="text-slate-600 mb-4">{show.description || (show.type || 'Show')}</p>

          {show.total_seats !== null ? (
            <>
              <div className="mb-4">
                <div className="text-sm text-slate-500 mb-2">Select seats</div>
                <div className="grid grid-cols-8 gap-2" role="list" aria-label="seat map">
                  {seatsArray.map(n => {
                    const taken = takenSeats.includes(n);
                    const selected = selectedSeats.includes(n);
                    return (
                      <motion.button
                        key={n}
                        onClick={()=>toggleSeat(n)}
                        className={`seat ${taken ? 'seat--taken' : selected ? 'seat--selected' : 'seat--available'}`}
                        whileTap={{ scale: 0.95 }}
                        layout
                        aria-pressed={selected}
                        disabled={taken}
                      >
                        {n}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-3 text-sm text-slate-500">Legend: <span className="inline-block mx-2 px-2 py-1 rounded bg-slate-100">available</span><span className="inline-block mx-2 px-2 py-1 rounded bg-indigo-600 text-white">selected</span><span className="inline-block mx-2 px-2 py-1 rounded bg-red-500 text-white">taken</span></div>
              </div>
            </>
          ) : (
            <div className="mb-4 text-sm text-slate-600">This is an appointment slot (no seats).</div>
          )}

        </div>

        <aside className="bg-white p-6 rounded-2xl shadow">
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Name</label>
              <input value={bookName} onChange={e=>setBookName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <input value={bookEmail} onChange={e=>setBookEmail(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
            <div>
              <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md">
                {bookingStatus === 'pending' ? 'Processing...' : show.type==='appointment' ? 'Book Slot' : `Confirm Booking${selectedSeats.length? ` (${selectedSeats.length})`:''}`}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default Booking;
