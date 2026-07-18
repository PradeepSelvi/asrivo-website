# Partnership System Setup Guide

## Database Setup

You need to run the SQL migration to create the partnerships table in your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/create_partnerships_table.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

## Features Implemented

### 1. Partnership Submission Form (`/partnership`)
- ✅ Complete form with company and contact information
- ✅ Partnership type selection
- ✅ API integration with database
- ✅ Success/error handling
- ✅ Production-level UI

### 2. Database Integration
- ✅ `partnerships` table in Supabase
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamps
- ✅ Status management (new, reviewing, accepted, rejected)

### 3. Admin Panel (`/admin/partnerships`)
- ✅ Real-time partnership list
- ✅ Status filtering (all, new, reviewing, accepted, rejected)
- ✅ Status update dropdown
- ✅ Detailed view modal
- ✅ Statistics cards
- ✅ Responsive design

### 4. Real-time Notifications
- ✅ Supabase Realtime subscription
- ✅ Browser notifications for new partnerships
- ✅ Auto-refresh on data changes
- ✅ New partnership count badge

### 5. API Endpoints
- ✅ `POST /api/partnerships` - Submit new partnership
- ✅ `GET /api/partnerships` - List partnerships (with filtering)
- ✅ `GET /api/partnerships/[id]` - Get single partnership
- ✅ `PATCH /api/partnerships/[id]` - Update partnership status

## Testing

### 1. Test Partnership Submission
1. Navigate to http://localhost:3000/partnership
2. Fill out the partnership form
3. Click "Submit Partnership Request"
4. You should see a success message

### 2. Test Admin Panel
1. Navigate to http://localhost:3000/admin/partnerships
2. You should see the submitted partnership
3. Try changing the status using the dropdown
4. Click "View" to see full details

### 3. Test Real-time Updates
1. Open admin panel in one browser window
2. Open partnership form in another window
3. Submit a new partnership
4. The admin panel should automatically update with the new entry
5. You should receive a browser notification (if permissions granted)

## Notification Permissions

For browser notifications to work:
1. The admin must grant notification permissions when prompted
2. Or manually enable notifications in browser settings for localhost

## Next Steps

1. Run the SQL migration in Supabase
2. Test the partnership submission form
3. Check the admin panel for submissions
4. Verify real-time updates are working

## Troubleshooting

### Notifications not working?
- Check if browser notifications are enabled
- Make sure you're on HTTPS (or localhost)
- Check browser console for errors

### Data not appearing in admin panel?
- Verify the SQL migration ran successfully
- Check browser console for API errors
- Verify you're logged in as an admin

### Real-time updates not working?
- Check Supabase Realtime is enabled for your project
- Verify the `partnerships` table has Realtime enabled
- Check browser console for WebSocket errors
