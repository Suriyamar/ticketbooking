const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4001;

// In-memory data
let shows = [
  { id: 's1', name: 'Sample Show 1', start_time: new Date(Date.now()+3600*1000).toISOString(), total_seats: 30, type: 'show', price: 199 },
  { id: 's2', name: 'City Trip', start_time: new Date(Date.now()+7200*1000).toISOString(), total_seats: 20, type: 'trip', price: 299 },
  { id: 's3', name: 'Doctor Appointment', start_time: new Date(Date.now()+10800*1000).toISOString(), total_seats: null, type: 'appointment', price: null }
];

let bookings = []; // { id, show_id, seats: [], name, email, status, created_at }

app.get('/health', (req, res) => res.json({ok:true}));

app.get('/shows', (req, res) => {
  // support order by start_time ascending
  const sorted = [...shows].sort((a,b)=> new Date(a.start_time)-new Date(b.start_time));
  res.json(sorted);
});

app.post('/shows', (req, res) => {
  const payload = req.body || {};
  const id = payload.id || nanoid(8);
  const item = {
    id,
    name: payload.name || payload.title || 'Untitled',
    description: payload.description || null,
    start_time: payload.start_time || new Date().toISOString(),
    total_seats: (payload.total_seats===undefined)? null : payload.total_seats,
    type: payload.type || 'show',
    price: payload.price || null,
    created_at: new Date().toISOString()
  };
  shows.push(item);
  res.status(201).json(item);
});

app.get('/shows/:id', (req, res) => {
  const s = shows.find(x=>x.id===req.params.id);
  if(!s) return res.status(404).json({error:'Not found'});
  res.json(s);
});

app.get('/bookings', (req, res) => {
  res.json(bookings.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)));
});

app.post('/bookings', (req, res) => {
  const payload = req.body || {};
  const id = nanoid(10);
  const show = shows.find(x=>x.id===payload.show_id);
  if(!show) return res.status(400).json({error:'Invalid show_id'});
  // seat conflict check
  const requestedSeats = payload.seats || [];
  if(show.total_seats !== null) {
    // ensure seats are within total_seats
    const invalid = requestedSeats.some(s => s < 1 || s > show.total_seats);
    if(invalid) return res.status(400).json({error:'Invalid seats requested'});
    // check already booked seats for that show
    const taken = bookings.filter(b=>b.show_id===show.id && b.seats && b.seats.length>0).flatMap(b=>b.seats);
    const conflict = requestedSeats.some(s=> taken.includes(s));
    if(conflict) return res.status(409).json({error:'Some seats already booked'});
  }
  const booking = {
    id,
    show_id: show.id,
    seats: requestedSeats,
    name: payload.name || 'Guest',
    email: payload.email || null,
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

// simple reset endpoint for testing
app.post('/reset', (req,res)=>{
  shows = [
    { id: 's1', name: 'Sample Show 1', start_time: new Date(Date.now()+3600*1000).toISOString(), total_seats: 30, type: 'show', price: 199 },
    { id: 's2', name: 'City Trip', start_time: new Date(Date.now()+7200*1000).toISOString(), total_seats: 20, type: 'trip', price: 299 },
    { id: 's3', name: 'Doctor Appointment', start_time: new Date(Date.now()+10800*1000).toISOString(), total_seats: null, type: 'appointment', price: null }
  ];
  bookings = [];
  res.json({ok:true});
});

app.listen(PORT, ()=> console.log('Mock backend running on port', PORT));
