# BookEase - Ticket Booking System

A full-stack ticket booking application built with React, TypeScript, and Supabase. This system supports multiple booking types including shows, trips, and appointments with real-time seat availability management.

## Features

### Admin Panel
- Create new shows/trips/appointment slots
- Form validation for all inputs
- View all created shows with details
- Support for different booking types:
  - **Shows**: Entertainment events with seat selection
  - **Trips**: Bus/travel bookings with seat selection
  - **Appointments**: Doctor/consultation slots (no seat numbers)

### User Interface
- Browse all available shows/trips/appointments
- Search functionality by name
- Filter by booking type (show/trip/appointment)
- Real-time seat availability display
- Visual seat selection grid
- Instant booking confirmation

### Booking System
- Interactive seat selection with visual feedback
- Real-time seat status (Available/Selected/Booked)
- Form validation for user details
- Booking status tracking (PENDING → CONFIRMED/FAILED)
- Prevents double-booking with database constraints
- Error handling for concurrent bookings

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router DOM** for routing
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** database with Row Level Security
- Real-time data updates

## Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout with navigation
├── context/
│   └── AppContext.tsx      # Global state management
├── lib/
│   ├── database.types.ts   # TypeScript database types
│   └── supabase.ts         # Supabase client configuration
├── pages/
│   ├── Admin.tsx           # Admin dashboard
│   ├── Home.tsx            # User show listing
│   └── Booking.tsx         # Booking page with seat selection
├── App.tsx                 # Main app with routing
└── main.tsx                # Entry point
```

## Database Schema

### Shows Table
- `id`: UUID (Primary Key)
- `name`: Text (Show/Bus/Doctor name)
- `type`: Enum ('show', 'trip', 'appointment')
- `start_time`: Timestamp with timezone
- `total_seats`: Integer (nullable for appointments)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Bookings Table
- `id`: UUID (Primary Key)
- `show_id`: UUID (Foreign Key → shows)
- `seat_number`: Integer (nullable for appointments)
- `user_name`: Text
- `user_email`: Text
- `status`: Enum ('PENDING', 'CONFIRMED', 'FAILED')
- `created_at`: Timestamp
- `updated_at`: Timestamp
- **Unique Constraint**: (show_id, seat_number)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticket-booking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - The database schema is already configured
   - Copy your project URL and anon key

4. **Configure environment variables**

   Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Usage Guide

### For Admins

1. **Switch to Admin Mode**
   - Click the "Switch to Admin" button in the navigation bar

2. **Create a Show/Trip/Appointment**
   - Navigate to the Admin Panel
   - Fill in the form:
     - Name: Enter the event/bus/doctor name
     - Type: Select show, trip, or appointment
     - Start Time: Choose a future date and time
     - Total Seats: Enter number of seats (not required for appointments)
   - Click "Create Show"

3. **View All Shows**
   - Scroll down to see all created shows
   - View details including date, time, and seat availability

### For Users

1. **Browse Shows**
   - Visit the home page to see all available shows
   - Use the search bar to find specific shows
   - Filter by type (All/Shows/Trips/Appointments)

2. **Book a Show**
   - Click "Book Now" on any available show
   - For shows/trips:
     - Select your desired seats from the visual grid
     - Green seats are available
     - Blue seats are your selection
     - Gray seats are already booked
   - Enter your name and email
   - Click "Confirm Booking"

3. **Booking Confirmation**
   - Status changes from PENDING → CONFIRMED
   - You'll be redirected to the home page
   - Booking details are stored in the database

## Key Features Explained

### State Management with Context API
- `AppContext` manages global state including:
  - User role (admin/user)
  - Shows and bookings data
  - Refresh triggers for data updates

### Efficient API Calls
- Data is fetched once and cached
- Automatic refresh after create/update operations
- Optimistic UI updates for better UX

### Error Handling
- Form validation with helpful error messages
- API error handling with user-friendly messages
- Concurrent booking conflict detection
- Loading states for all async operations

### DOM Manipulation
- Direct DOM updates for seat selection
- CSS class toggling for visual feedback
- Cleanup on component unmount

### Security
- Row Level Security (RLS) enabled on all tables
- Public access policies for demo purposes
- Email validation
- SQL injection prevention through parameterized queries

## Assumptions Made

1. **Authentication**: Mock authentication with role switching (admin/user) for demo purposes. In production, implement proper authentication.

2. **Public Access**: All users can create and view shows for demo purposes. In production, restrict admin operations to authenticated admin users.

3. **Seat Layout**: Seats are displayed in a 10-column grid. This can be customized based on venue requirements.

4. **Booking Confirmation**: Bookings are automatically confirmed after creation. In production, you might want a payment gateway integration.

5. **Email Validation**: Basic email format validation only. In production, implement email verification.

6. **Appointment Slots**: Each appointment can have only one booking (one-to-one). For multiple slots, create multiple appointment entries.

## Known Limitations

1. **Real-time Updates**: Currently uses manual refresh. Can be enhanced with Supabase real-time subscriptions for live updates.

2. **Payment Integration**: No payment gateway integration. This is a booking management system only.

3. **Email Notifications**: No automated email notifications after booking confirmation.

4. **Multi-language Support**: Currently English only.

5. **Mobile Optimization**: While responsive, the seat selection grid could be optimized further for small screens.

6. **Booking History**: No user booking history view. Users need to keep their confirmation details.

7. **Cancellation**: No booking cancellation feature implemented.

8. **Date Range Filter**: Shows are filtered to show only future events, but no custom date range selection.

## Deployment

### Frontend Deployment Options
- **Vercel**: `vercel --prod`
- **Netlify**: Connect GitHub repository
- **AWS Amplify**: Deploy through AWS Console

### Environment Variables for Production
Ensure the following environment variables are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Database
- Supabase automatically handles database hosting
- RLS policies are configured for security
- Automatic backups enabled by default

## API Documentation

### Shows Endpoints (via Supabase)

#### Get All Shows
```typescript
const { data, error } = await supabase
  .from('shows')
  .select('*')
  .order('start_time', { ascending: true });
```

#### Create Show
```typescript
const { data, error } = await supabase
  .from('shows')
  .insert([{
    name: 'Show Name',
    type: 'show',
    start_time: '2024-01-01T10:00:00Z',
    total_seats: 100
  }]);
```

### Bookings Endpoints

#### Get Bookings for Show
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('show_id', showId)
  .eq('status', 'CONFIRMED');
```

#### Create Booking
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert([{
    show_id: 'uuid',
    seat_number: 1,
    user_name: 'John Doe',
    user_email: 'john@example.com',
    status: 'PENDING'
  }]);
```

## Testing

### Manual Testing Checklist

**Admin Features:**
- [ ] Create show with valid data
- [ ] Form validation (empty fields, past dates, invalid seat numbers)
- [ ] View all created shows
- [ ] Create different types (show/trip/appointment)

**User Features:**
- [ ] Browse all shows
- [ ] Search functionality
- [ ] Filter by type
- [ ] View show details
- [ ] Select multiple seats
- [ ] Book seats successfully
- [ ] Handle booked seats
- [ ] Form validation on booking page

**Error Scenarios:**
- [ ] Concurrent booking (two users booking same seat)
- [ ] Network errors
- [ ] Invalid show ID
- [ ] Booking sold-out show

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning and development purposes.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing issues for solutions
- Review the code comments for implementation details

## Acknowledgments

- Built with React and TypeScript
- Powered by Supabase
- Icons by Lucide React
- Styled with Tailwind CSS


---

## Deployment & Production Notes (Updated)

This project is a frontend-heavy application that uses Supabase for backend (database, auth, and serverless functions).
The recommended production deployment flow:

### 1) Vercel (recommended)
- Connect this repository to Vercel.
- Set Environment Variables in Vercel project settings:
  - `VITE_SUPABASE_URL` — your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key
- Build command: `npm run build`
- Output directory: `dist`

### 2) Local Docker preview
Build and preview using Docker:
```
docker-compose up --build
# open http://localhost:5173
```

### 3) CI
A GitHub Actions workflow `/.github/workflows/deploy-vercel.yml` builds and triggers a Vercel deployment on push to `main`.
Add these secrets in GitHub repo:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 4) Checklist before submission
- Ensure `vercel.json` present (routes and builds configured)
- Ensure `README.md` includes the deployed frontend URL and video link
- Add screenshots to `/assets` and link them in README


### Start both frontend and mock backend with one command

After `npm install`, run:

```
npm run dev:all
```

This will install mock-backend deps and start both services.
