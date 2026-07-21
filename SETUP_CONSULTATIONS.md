# Setup Consultation System

## Step 1: Create Database Table

You need to run the SQL schema to create the `consultation_requests` table in your Supabase database.

### Instructions:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the contents from `CONSULTATION_REQUESTS_SCHEMA.sql`
5. Click **Run** to execute the SQL

The schema will create:
- `consultation_requests` table with all required columns
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps

## Step 2: Verify Setup

After running the SQL:

1. Go to **Table Editor** in Supabase
2. You should see the `consultation_requests` table
3. Check that the table has these columns:
   - id
   - name
   - email
   - phone
   - whatsapp
   - availability
   - preferred_modes
   - message
   - status
   - scheduled_date
   - scheduled_time
   - meeting_link
   - notes
   - created_at
   - updated_at

## Step 3: Test the Form

1. Go to `http://localhost:3000/book-consult/schedule`
2. Fill out the consultation form
3. Submit it
4. Check the admin panel at `/admin/consultations` to see the submission

## Troubleshooting

If you get errors:

1. **"relation consultation_requests does not exist"**: Run the SQL schema
2. **"permission denied"**: Check RLS policies in Supabase
3. **Form submission fails**: Check browser console and server logs for detailed error messages

## Admin Access

Once set up, admins can:
- View all consultation requests at `/admin/consultations`
- Click on any request to view details and edit
- Update status (pending → confirmed → completed)
- Schedule meetings with date, time, and meeting link
- Add internal notes
