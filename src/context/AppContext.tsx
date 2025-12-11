
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Show = Database['public']['Tables']['shows']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

interface AppContextType {
  userRole: 'admin' | 'user';
  setUserRole: (role: 'admin' | 'user') => void;
  shows: Show[];
  setShows: (shows: Show[]) => void;
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  loading: boolean;
  refreshShows: () => Promise<void>;
  createShow: (payload: Partial<Show>) => Promise<void>;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY);

const defaultState: AppContextType = {
  userRole: 'user',
  setUserRole: () => {},
  shows: [],
  setShows: () => {},
  bookings: [],
  setBookings: () => {},
  loading: true,
  refreshShows: async () => {},
  createShow: async () => {},
};

export const AppContext = createContext<AppContextType>(defaultState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [shows, setShows] = useState<Show[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

const refreshShows = async () => {
  setLoading(true);
  try {
    if (USE_MOCK) {
      const res = await fetch(import.meta.env.VITE_MOCK_BASE_URL ? import.meta.env.VITE_MOCK_BASE_URL + '/shows' : 'http://localhost:4001/shows');
      const data = await res.json();
      setShows(data ?? []);
    } else if (supabase) {
      const { data, error } = await supabase.from('shows').select('*').order('start_time', { ascending: true });
      if (error) {
        console.error('Error fetching shows', error);
        setShows([]);
      } else {
        setShows(data ?? []);
      }
    } else {
      setShows([]);
    }
  } catch (err) {
    console.error(err);
    setShows([]);
  } finally {
    setLoading(false);
  }
};

const refreshBookings = async () => {
  try {
    if (USE_MOCK) {
      const res = await fetch(import.meta.env.VITE_MOCK_BASE_URL ? import.meta.env.VITE_MOCK_BASE_URL + '/bookings' : 'http://localhost:4001/bookings');
      const data = await res.json();
      setBookings(data ?? []);
    } else if (supabase) {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching bookings', error);
        setBookings([]);
      } else {
        setBookings(data ?? []);
      }
    } else {
      setBookings([]);
    }
  } catch (err) {
    console.error(err);
    setBookings([]);
  }
};

  const createShow = async (payload: Partial<Show>) => {
  const insertPayload: any = {
    name: payload.name ?? (payload.title as any) ?? 'Untitled',
    start_time: payload.start_time ?? new Date().toISOString(),
    total_seats: (payload as any).total_seats ?? null,
    type: (payload as any).type ?? 'show',
    price: (payload as any).price ?? null,
  };
  if ((payload as any).description !== undefined && (payload as any).description !== null) {
    insertPayload.description = (payload as any).description;
  }

  if (USE_MOCK) {
    const base = import.meta.env.VITE_MOCK_BASE_URL || 'http://localhost:4001';
    const res = await fetch(base + '/shows', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(insertPayload) });
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:'create failed'}));
      throw new Error(err?.error || 'Failed to create show');
    }
    await refreshShows();
    return await res.json();
  }

  if (!supabase) {
    throw new Error('No supabase client available and mock disabled.');
  }

  const { data, error } = await supabase.from('shows').insert([insertPayload]);
  if (error) {
    console.error('Error creating show', error);
    // Provide a clearer message for schema mismatch
    if (error?.message && error.message.includes('Could not find')) {
      throw new Error('Schema mismatch: please run database migrations to add required columns (e.g. description). ' + (error.message || ''));
    }
    throw error;
  }
  await refreshShows();
  return data;
};
useEffect(() => {
    refreshShows();
    // optionally, set up realtime subscription
    // optionally, set up realtime subscription (only when using supabase)
if (!USE_MOCK && supabase) {
  const subscription = supabase
    .channel('public:shows')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shows' }, () => {
      refreshShows();
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel && supabase.removeChannel(subscription);
    } catch (err) {
      console.warn('Failed to remove supabase channel', err);
    }
  };
}

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        shows,
        setShows,
        bookings,
        setBookings,
        loading,
        refreshShows,
        createShow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
