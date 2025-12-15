# GMB Dashboard - Database Setup Guide

## Overview
Your GMB Revenue Opportunity Dashboard now has a complete backend with Supabase PostgreSQL database integration. All uploaded keyword and ranking data is automatically saved and persisted in the database.

## Database Schema

### Tables Created

#### 1. **gmb_keywords** - Stores keyword data from Google Keyword Planner
- `id` (TEXT, Primary Key) - Unique identifier
- `state` (TEXT) - US State location
- `city` (TEXT) - City location
- `keyword` (TEXT) - Search keyword
- `monthly_searches` (INTEGER) - Average monthly search volume
- `competition` (TEXT) - Competition level (High/Medium/Low)
- `cpc` (DECIMAL) - Cost per click
- `avg_job_size` (DECIMAL) - Average revenue per job/conversion
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time
- **Unique Constraint:** (state, city, keyword) - Prevents duplicate keywords for same location

#### 2. **gmb_rankings** - Stores GMB ranking positions
- `id` (TEXT, Primary Key) - Unique identifier
- `keyword_id` (TEXT, Foreign Key) - References gmb_keywords.id
- `rank` (INTEGER) - Ranking position (1-8)
- `gmb_name` (TEXT) - Business name
- `traffic_share` (DECIMAL) - Percentage of traffic received
- `is_my_business` (BOOLEAN) - Flag for user's business
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time
- **Unique Constraint:** (keyword_id, rank, gmb_name) - One business per rank per keyword
- **Foreign Key:** CASCADE delete - Rankings deleted when keyword is deleted

### Indexes
Optimized indexes for fast filtering:
- State index
- City index
- Keyword index
- Location composite index (state, city)
- Keyword_id index
- My Business flag index

## Setup Instructions

### Step 1: Run the Migration
The database migration file is located at: `/supabase/migrations/20241201000000_create_gmb_tables.sql`

**To apply the migration:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of the migration file
4. Paste into the SQL Editor
5. Click **Run** to execute

The migration will automatically:
- ✅ Create both tables with proper schema
- ✅ Set up all indexes for performance
- ✅ Configure foreign key relationships
- ✅ Add triggers for automatic timestamp updates
- ✅ Handle "IF NOT EXISTS" - safe to run multiple times

### Step 2: Verify Tables
After running the migration, verify in Supabase:
1. Go to **Table Editor**
2. You should see:
   - `gmb_keywords` table
   - `gmb_rankings` table

## How It Works

### Automatic Data Persistence
1. **On App Load:** 
   - App automatically initializes database connection
   - Loads all existing keywords and rankings from database
   - Displays data in dashboard

2. **On CSV Upload:**
   - Parse CSV data
   - Save to database via API
   - Update local state
   - Show success/error messages

3. **Data Upsert:**
   - Keywords are upserted based on (state, city, keyword)
   - Rankings are upserted based on (keyword_id, rank, gmb_name)
   - Existing records are updated, new ones are inserted

### API Endpoints

All endpoints are prefixed with `/make-server-dc7dce20/`

#### Keywords
- `GET /keywords` - Fetch all keywords
- `POST /keywords` - Save/update keywords (bulk upsert)

#### Rankings  
- `GET /rankings` - Fetch all rankings
- `POST /rankings` - Save/update rankings (bulk upsert)
- `PUT /rankings/:id` - Update single ranking traffic share

#### Utilities
- `POST /init-db` - Check database initialization
- `DELETE /reset` - Delete all data (be careful!)

## Data Flow

```
CSV Upload → Parse CSV → API Call → Supabase Database → Success Response → Update UI
                                          ↓
                                    Persistent Storage
                                          ↓
                                    Future App Loads
```

## Features

✅ **Automatic Persistence** - All data saved to database on upload  
✅ **Location-Based** - Keywords and rankings organized by State → City  
✅ **Duplicate Prevention** - Unique constraints prevent data duplication  
✅ **Relationship Management** - Foreign keys maintain data integrity  
✅ **Automatic Timestamps** - Track when data was created/updated  
✅ **Optimized Queries** - Indexes ensure fast filtering and retrieval  
✅ **Error Handling** - Comprehensive error messages in console and UI  
✅ **Loading States** - Visual feedback during database operations  

## Troubleshooting

### Migration Errors
If you see "relation already exists":
- This is normal if tables already exist
- The migration uses `IF NOT EXISTS` so it's safe

### Connection Issues
If data isn't saving:
1. Check browser console for error messages
2. Verify Supabase connection in project settings
3. Ensure migration was run successfully
4. Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set

### Data Not Appearing
If uploaded data doesn't show:
1. Check for error alerts in the Data Management page
2. Click "Refresh Data" button to reload from database
3. Check browser console for API errors
4. Verify tables exist in Supabase Table Editor

## Data Management

### Viewing Data in Supabase
1. Go to Supabase dashboard
2. Navigate to **Table Editor**
3. Select `gmb_keywords` or `gmb_rankings`
4. View/edit records directly

### Resetting All Data
Use the reset endpoint carefully:
```javascript
// This will delete ALL keywords and rankings
DELETE /make-server-dc7dce20/reset
```

## Benefits

🎯 **Persistent Storage** - Data survives page refreshes and browser closes  
🎯 **Multi-Device Access** - Access your data from any device  
🎯 **Backup & Recovery** - Data safely stored in Supabase cloud  
🎯 **Scalability** - PostgreSQL handles large datasets efficiently  
🎯 **Professional Solution** - Production-ready database architecture  

## Next Steps

1. ✅ Run the migration in Supabase SQL Editor
2. ✅ Upload your keyword CSV files
3. ✅ Upload your GMB ranking CSV files
4. ✅ Data is now automatically persisted!
5. ✅ Use dashboard across sessions with saved data

Your GMB Dashboard is now fully backed by a professional database solution! 🚀
