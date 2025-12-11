import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Admin() {
  const { shows = [], createShow } = useApp();
  const [form, setForm] = useState({ name: '', start_time: '', total_seats: '', type: 'show' });
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.start_time) {
      setError('Please enter required fields: name and start time.');
      return;
    }
    const payload: any = {
      name: form.name,
      start_time: new Date(form.start_time).toISOString(),
      type: form.type
    };
    if (form.type !== 'appointment') payload.total_seats = form.total_seats ? parseInt(form.total_seats,10) : 0;
    try {
      await createShow(payload);
      setForm({ name: '', start_time: '', total_seats: '', type: 'show' });
    } catch (err: any) {
      setError(err?.message || 'Failed to create show');
    }
  };

  return (
    <div>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <p className="text-sm text-slate-500">Create new shows, trips or appointment slots.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow border">
          <h3 className="text-lg font-medium mb-4">Create show / trip / appointment</h3>
          {error && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm text-slate-600">Name</div>
              <input name="name" value={form.name} onChange={onChange} className="mt-1 w-full rounded-md border px-3 py-2" />
            </label>

            <label className="block">
              <div className="text-sm text-slate-600">Start time</div>
              <input name="start_time" type="datetime-local" value={form.start_time} onChange={onChange} className="mt-1 w-full rounded-md border px-3 py-2" />
            </label>

            <label className="block">
              <div className="text-sm text-slate-600">Type</div>
              <select name="type" value={form.type} onChange={onChange} className="mt-1 w-full rounded-md border px-3 py-2">
                <option value="show">Show</option>
                <option value="trip">Trip</option>
                <option value="appointment">Appointment</option>
              </select>
            </label>

            {form.type !== 'appointment' && (
              <label className="block">
                <div className="text-sm text-slate-600">Total seats</div>
                <input name="total_seats" value={form.total_seats} onChange={onChange} className="mt-1 w-full rounded-md border px-3 py-2" />
              </label>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create</button>
            <button type="button" onClick={() => setForm({ name: '', start_time: '', total_seats: '', type: 'show' })} className="text-sm text-slate-600">Reset</button>
          </div>
        </form>

        <div className="bg-white p-6 rounded-2xl shadow border">
          <h3 className="text-lg font-medium mb-4">All shows & slots</h3>
          <div className="space-y-3">
            {shows.length === 0 && <div className="text-sm text-slate-500">No shows created yet.</div>}
            {shows.map((s: any) => (
              <div key={s.id} className="p-3 border rounded-md flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name || s.title}</div>
                  <div className="text-xs text-slate-500">{new Date(s.start_time || s.start || Date.now()).toLocaleString()}</div>
                </div>
                <div className="text-sm text-slate-500">{s.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
