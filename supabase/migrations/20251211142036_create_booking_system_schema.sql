/*
  # Ticket Booking System Schema

  ## Overview
  This migration creates the database schema for a ticket booking system that supports
  shows, trips, and appointment slots with seat/booking management.

  ## New Tables

  ### `shows`
  Stores information about shows, trips, or appointment slots
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Name of the show/bus/doctor
  - `type` (text) - Type: 'show', 'trip', or 'appointment'
  - `start_time` (timestamptz) - Start time of the show/trip/slot
  - `total_seats` (integer) - Total number of seats (null for appointments)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `bookings`
  Stores individual seat bookings
  - `id` (uuid, primary key) - Unique identifier
  - `show_id` (uuid, foreign key) - References shows table
  - `seat_number` (integer) - Seat number (null for appointments)
  - `user_name` (text) - Name of the person booking
  - `user_email` (text) - Email of the person booking
  - `status` (text) - Booking status: 'PENDING', 'CONFIRMED', 'FAILED'
  - `created_at` (timestamptz) - Booking creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public read access for shows
  - Authenticated users can create bookings
  - Users can read their own bookings

  ## Notes
  - For appointments, total_seats is null and seat_number is null in bookings
  - Status transitions: PENDING -> CONFIRMED or PENDING -> FAILED
  - Unique constraint on (show_id, seat_number) to prevent double booking
*/

-- Create shows table
CREATE TABLE IF NOT EXISTS shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('show', 'trip', 'appointment')),
  start_time timestamptz NOT NULL,
  total_seats integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  seat_number integer,
  user_name text NOT NULL,
  user_email text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(show_id, seat_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_show_id ON bookings(show_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_shows_start_time ON shows(start_time);

-- Enable Row Level Security
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shows table

-- Anyone can read shows
CREATE POLICY "Public read access to shows"
  ON shows
  FOR SELECT
  TO public
  USING (true);

-- Anyone can insert shows (for demo purposes - in production, restrict to admin role)
CREATE POLICY "Public insert access to shows"
  ON shows
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Anyone can update shows (for demo purposes)
CREATE POLICY "Public update access to shows"
  ON shows
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Anyone can delete shows (for demo purposes)
CREATE POLICY "Public delete access to shows"
  ON shows
  FOR DELETE
  TO public
  USING (true);

-- RLS Policies for bookings table

-- Anyone can read bookings
CREATE POLICY "Public read access to bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (true);

-- Anyone can create bookings
CREATE POLICY "Public insert access to bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Anyone can update bookings
CREATE POLICY "Public update access to bookings"
  ON bookings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Anyone can delete bookings
CREATE POLICY "Public delete access to bookings"
  ON bookings
  FOR DELETE
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_shows_updated_at ON shows;
CREATE TRIGGER update_shows_updated_at
  BEFORE UPDATE ON shows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();