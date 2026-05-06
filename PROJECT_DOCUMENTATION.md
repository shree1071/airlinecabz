 # AirlinCabz - Airport Taxi Booking System

## Project Overview

AirlinCabz is a modern, full-stack airport taxi booking platform built with Next.js 15, TypeScript, and InsForge (Backend-as-a-Service). The system provides a seamless booking experience for customers and a comprehensive admin dashboard for managing bookings and rides.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.1.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Material Symbols Icons
- **Maps**: Google Maps API (Places Autocomplete)
- **State Management**: React Hooks

### Backend
- **BaaS**: InsForge (PostgreSQL + PostgREST)
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: Admin password-based (localStorage)
- **API**: Next.js API Routes

### Key Dependencies
```json
{
  "@insforge/sdk": "^0.1.28",
  "@react-google-maps/api": "^2.20.3",
  "next": "15.1.3",
  "react": "^19.0.0",
  "tailwindcss": "^3.4.17"
}
```

## Project Structure

```
airtaxi/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── page.tsx        # Booking management
│   │   │   └── rides/
│   │   │       └── page.tsx    # Active rides management
│   │   ├── api/                # API routes
│   │   │   ├── bookings/       # Booking CRUD
│   │   │   └── vehicles/       # Vehicle data
│   │   ├── book/
│   │   │   └── page.tsx        # Customer booking form
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Footer.tsx          # Site footer
│   │   ├── Navbar.tsx          # Navigation bar
│   │   └── MobileBottomNav.tsx # Mobile navigation
│   ├── lib/
│   │   ├── insforge.ts         # InsForge client config
│   │   └── razorpay.ts         # Payment integration
│   └── hooks/
│       └── use-sync-user.ts    # User sync hook
├── public/                     # Static assets
├── .env.local                  # Environment variables
└── package.json
```

## Database Schema

### 1. `bookings` Table (Pending Requests)
Stores initial customer booking requests.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  trip_type TEXT DEFAULT 'to_airport',
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  landmark TEXT,
  area TEXT,
  pincode TEXT,
  pickup_date TIMESTAMPTZ NOT NULL,
  vehicle_type TEXT NOT NULL,
  base_fare NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Flow**: `pending` → `confirmed` → `cancelled`

### 2. `confirmed_rides` Table (Active Operations)
Stores confirmed bookings with driver assignments.

```sql
CREATE TABLE confirmed_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  trip_type TEXT DEFAULT 'to_airport',
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  landmark TEXT,
  area TEXT,
  pincode TEXT,
  pickup_date TIMESTAMPTZ NOT NULL,
  vehicle_type TEXT NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_number TEXT,
  base_fare NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'paid',
  ride_status TEXT DEFAULT 'scheduled',
  notes TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Ride Status Flow**: `scheduled` → `in_progress` → `completed`

### 3. `completed_rides` Table (Historical Archive)
Stores completed rides with ratings and feedback.

```sql
CREATE TABLE completed_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  confirmed_ride_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  trip_type TEXT,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_date TIMESTAMPTZ NOT NULL,
  vehicle_type TEXT NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_number TEXT,
  base_fare NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT,
  actual_amount NUMERIC,
  rating INTEGER,
  feedback TEXT,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `vehicle_types` Table
Stores available vehicle types and pricing.

```sql
CREATE TABLE vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  base_fare NUMERIC DEFAULT 0,
  per_km_rate NUMERIC DEFAULT 0,
  image_url TEXT,
  is_ev BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  capacity TEXT,
  vehicle_category TEXT, -- 'airport', 'outstation', 'local'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Key Features

### Customer-Facing Features

#### 1. Landing Page (`/`)
- Hero section with tagline: "Your Journey, Our Priority"
- Trip type selector (To Airport / From Airport)
- Vehicle showcase with pricing
- Service areas display
- Responsive design for mobile/desktop
- Call-to-action buttons

#### 2. Booking Page (`/book`)
- **Trip Type Selection**: Visual cards for direction
- **Google Maps Integration**: Address autocomplete
- **Detailed Address Form**:
  - House/Flat No., Building Name
  - Street Name, Area
  - Landmark
  - Area/Locality
  - Pincode (6-digit validation)
- **Fixed Airport Location**: Non-editable Kempegowda International Airport
- **Vehicle Selection**: Grid of available vehicles with images
- **Booking Summary**: Real-time fare calculation
- **Form Validation**: Prevents duplicate submissions
- **Mobile Optimized**: Touch-friendly interface

### Admin Features

#### 1. Admin Dashboard (`/admin`)
- **Password Protection**: Simple admin123 login
- **Real-time Updates**: WebSocket subscriptions
- **Statistics Dashboard**:
  - Total Bookings
  - Pending Count
  - Confirmed Count
  - Completed Count
- **Booking Management**:
  - View all bookings
  - Filter by status
  - Update status
  - Delete bookings
- **Confirmation Workflow**:
  - Prompts for payment method
  - Driver assignment
  - Vehicle number
  - Moves to confirmed_rides table

#### 2. Active Rides Page (`/admin/rides`)
- **Operational Dashboard**: Separate from bookings
- **Ride Statistics**:
  - Scheduled rides
  - In-progress rides
  - Total active rides
- **Ride Management**:
  - Update ride status
  - View driver details
  - Complete rides with rating
- **Archive System**: Moves completed rides to history

## Business Workflow

### 1. Customer Journey
```
Customer → Landing Page → Book Now → Fill Details → Select Vehicle → Submit
```

### 2. Admin Workflow
```
New Booking (Pending)
    ↓
Admin Reviews
    ↓
Confirm + Payment Details → Moved to Active Rides (Scheduled)
    ↓
Driver Assigned
    ↓
Ride In Progress
    ↓
Ride Completed + Rating → Moved to History
```

### 3. Data Flow
```
bookings (pending) 
    → confirmed_rides (scheduled → in_progress) 
    → completed_rides (archived)
```

## Environment Variables

```env
# InsForge Database
NEXT_PUBLIC_INSFORGE_URL=https://m6ys432n.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
INSFORGE_API_KEY=ik_11e58adc23e77846e670fd25f97eeafe

# Admin Password
NEXT_PUBLIC_ADMIN_PASSWORD=admin123

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCvpeyfSsCuAZo9sg9jO3DNNfJCaYxdVRw
```

## API Endpoints

### `/api/vehicles`
- **Method**: GET
- **Description**: Fetches active airport vehicles
- **Filter**: `vehicle_category = 'airport'`
- **Response**: `{ vehicles: Vehicle[] }`

### `/api/bookings`
- **Method**: POST
- **Description**: Creates new booking
- **Body**: Booking details with address
- **Response**: `{ booking: Booking, error?: string }`

### `/api/bookings/[id]`
- **Method**: GET, PUT, DELETE
- **Description**: Manage specific booking
- **Response**: Booking data or error

## Styling & Design

### Color Scheme
- **Primary Blue**: `#2563eb` (brandBlue)
- **Dark**: `#1e293b` (brandDark)
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`

### Design System
- **Typography**: System fonts with headline variants
- **Spacing**: Tailwind's spacing scale
- **Shadows**: Custom shadow utilities (shadow-brand, shadow-soft)
- **Borders**: Rounded corners (rounded-xl, rounded-2xl, rounded-3xl)
- **Animations**: Fade-in, scale, and hover effects

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Key Components

### 1. Navbar
- Logo and branding
- Navigation links
- Call button
- Mobile responsive

### 2. Footer
- Contact information
- Service areas
- Quick links
- Social media

### 3. Vehicle Cards
- Vehicle image
- Name and capacity
- Pricing
- Book now button
- Highlight for popular vehicles

### 4. Booking Form
- Multi-step validation
- Real-time fare calculation
- Address autocomplete
- Mobile-optimized inputs

## Real-time Features

### WebSocket Subscriptions
- **Channel**: `bookings`
- **Events**:
  - `INSERT_booking`: New booking notification
  - `UPDATE_booking`: Status change updates
  - `DELETE_booking`: Booking removal

### Implementation
```typescript
await insforge.realtime.connect();
await insforge.realtime.subscribe("bookings");

insforge.realtime.on("INSERT_booking", (payload) => {
  // Handle new booking
});
```

## Security Considerations

### Current Implementation
- Admin password stored in environment variable
- Client-side authentication with localStorage
- InsForge anon key for database access

### Recommended Improvements
1. Implement proper authentication (JWT, OAuth)
2. Add role-based access control
3. Encrypt sensitive data
4. Add rate limiting
5. Implement CSRF protection
6. Add input sanitization

## Performance Optimizations

1. **Image Optimization**: Next.js Image component
2. **Code Splitting**: Automatic with App Router
3. **Database Indexing**: On frequently queried columns
4. **Real-time Subscriptions**: Only when needed
5. **Lazy Loading**: Components and images
6. **Caching**: Static pages and API responses

## Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- InsForge account
- Google Maps API key

### Build Commands
```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Fill in all environment variables
3. Restart dev server

## Future Enhancements

### Phase 1 (Immediate)
- [ ] SMS notifications for bookings
- [ ] Email confirmations
- [ ] Payment gateway integration (Razorpay)
- [ ] Driver mobile app
- [ ] Customer dashboard

### Phase 2 (Short-term)
- [ ] Real-time GPS tracking
- [ ] Automated driver assignment
- [ ] Dynamic pricing
- [ ] Promo codes and discounts
- [ ] Multi-language support

### Phase 3 (Long-term)
- [ ] Mobile apps (iOS/Android)
- [ ] AI-powered route optimization
- [ ] Fleet management system
- [ ] Analytics dashboard
- [ ] Customer loyalty program

## Testing

### Manual Testing Checklist
- [ ] Booking form submission
- [ ] Vehicle selection
- [ ] Address autocomplete
- [ ] Admin login
- [ ] Status updates
- [ ] Real-time notifications
- [ ] Mobile responsiveness
- [ ] Payment flow

### Recommended Testing Tools
- Jest for unit tests
- Playwright for E2E tests
- React Testing Library for components

## Troubleshooting

### Common Issues

**1. Vehicles not loading**
- Check InsForge anon key is valid
- Verify API endpoint is accessible
- Check browser console for errors
- Restart dev server after env changes

**2. Real-time not working**
- Verify WebSocket connection
- Check InsForge subscription status
- Ensure database triggers are set up

**3. Google Maps not loading**
- Verify API key is valid
- Check API key restrictions
- Enable Places API in Google Cloud Console

**4. Duplicate bookings**
- Check form submission handler
- Verify button disabled state
- Check for multiple event listeners

## Contact & Support

- **Phone**: +91 98806 91116
- **Email**: support@airlincabz.com
- **Admin Dashboard**: `/admin` (Password: admin123)

## License

Proprietary - All rights reserved

## Version History

- **v1.0.0** (Current)
  - Initial release
  - Basic booking system
  - Admin dashboard
  - Real-time updates
  - Multi-stage workflow
  - Mobile responsive design

---

**Last Updated**: April 24, 2026
**Maintained By**: Development Team
