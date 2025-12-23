import { createClient } from "jsr:@supabase/supabase-js@2";

// SQL to create tables if they don't exist
const CREATE_TABLES_SQL = `
-- Create business categories table
CREATE TABLE IF NOT EXISTS business_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📊',
  avg_job_value INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for category search
CREATE INDEX IF NOT EXISTS idx_business_categories_name ON business_categories(name);

-- Create global keywords table (shared across all clients)
CREATE TABLE IF NOT EXISTS global_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  category TEXT,
  search_volume INTEGER DEFAULT 0,
  competition TEXT DEFAULT 'medium',
  cpc DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
-- Add CPC column to global_keywords if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'global_keywords' AND column_name = 'cpc'
  ) THEN
    ALTER TABLE global_keywords ADD COLUMN cpc DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;
-- Add competitor ranking columns to global_keywords if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'global_keywords' AND column_name = 'competitor_1'
  ) THEN
    ALTER TABLE global_keywords ADD COLUMN competitor_1 INTEGER DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'global_keywords' AND column_name = 'competitor_2'
  ) THEN
    ALTER TABLE global_keywords ADD COLUMN competitor_2 INTEGER DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'global_keywords' AND column_name = 'competitor_3'
  ) THEN
    ALTER TABLE global_keywords ADD COLUMN competitor_3 INTEGER DEFAULT NULL;
  END IF;
END $$;

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  website_url TEXT,
  area TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  phone_number TEXT,
  gbp_score INTEGER DEFAULT 0,
  damage_score INTEGER DEFAULT 0,
  avg_job_price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add website_url column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE clients ADD COLUMN website_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'avg_job_price'
  ) THEN
    ALTER TABLE clients ADD COLUMN avg_job_price DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'manual_top3_count'
  ) THEN
    ALTER TABLE clients ADD COLUMN manual_top3_count INTEGER DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'manual_top10_count'
  ) THEN
    ALTER TABLE clients ADD COLUMN manual_top10_count INTEGER DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'competitor_1_name'
  ) THEN
    ALTER TABLE clients ADD COLUMN competitor_1_name TEXT DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'competitor_2_name'
  ) THEN
    ALTER TABLE clients ADD COLUMN competitor_2_name TEXT DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'competitor_3_name'
  ) THEN
    ALTER TABLE clients ADD COLUMN competitor_3_name TEXT DEFAULT NULL;
  END IF;
END $$;

-- Create client keywords table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS client_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES global_keywords(id) ON DELETE CASCADE,
  current_rank INTEGER NOT NULL,
  target_rank INTEGER DEFAULT 1,
  search_volume INTEGER DEFAULT 0,
  cpc DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(client_id, keyword_id)
);

-- Add CPC column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_keywords' AND column_name = 'cpc'
  ) THEN
    ALTER TABLE client_keywords ADD COLUMN cpc DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Add competitor ranking columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_keywords' AND column_name = 'competitor_1'
  ) THEN
    ALTER TABLE client_keywords ADD COLUMN competitor_1 INTEGER DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_keywords' AND column_name = 'competitor_2'
  ) THEN
    ALTER TABLE client_keywords ADD COLUMN competitor_2 INTEGER DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_keywords' AND column_name = 'competitor_3'
  ) THEN
    ALTER TABLE client_keywords ADD COLUMN competitor_3 INTEGER DEFAULT NULL;
  END IF;
END $$;

-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  area TEXT NOT NULL,
  category TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create competitor keywords table
CREATE TABLE IF NOT EXISTS competitor_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES global_keywords(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(competitor_id, keyword_id)
);

-- Create social media stats table
CREATE TABLE IF NOT EXISTS social_media_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  likes INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_global_keywords_category ON global_keywords(category);
CREATE INDEX IF NOT EXISTS idx_global_keywords_keyword ON global_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_clients_category ON clients(category);
CREATE INDEX IF NOT EXISTS idx_clients_area ON clients(area);
CREATE INDEX IF NOT EXISTS idx_client_keywords_client_id ON client_keywords(client_id);
CREATE INDEX IF NOT EXISTS idx_client_keywords_keyword_id ON client_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_competitors_client_id ON competitors(client_id);
CREATE INDEX IF NOT EXISTS idx_competitor_keywords_competitor_id ON competitor_keywords(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_keywords_keyword_id ON competitor_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_social_media_stats_client_id ON social_media_stats(client_id);
CREATE INDEX IF NOT EXISTS idx_social_media_stats_platform ON social_media_stats(platform);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_global_keywords_updated_at ON global_keywords;
CREATE TRIGGER update_global_keywords_updated_at 
  BEFORE UPDATE ON global_keywords
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitors_updated_at ON competitors;
CREATE TRIGGER update_competitors_updated_at 
  BEFORE UPDATE ON competitors
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const dbUrl = Deno.env.get('SUPABASE_DB_URL');
    if (!dbUrl) {
      return {
        success: false,
        message: 'SUPABASE_DB_URL not found in environment variables'
      };
    }

    // Use Deno's postgres connection
    const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
    const client = new Client(dbUrl);
    await client.connect();
    
    try {
      console.log('=== DATABASE INITIALIZATION START ===');
      
      // Set lock timeout to prevent deadlocks (5 seconds)
      await client.queryArray(`SET lock_timeout = '5s';`);
      await client.queryArray(`SET client_min_messages = WARNING;`);
      
      // Use advisory lock to prevent concurrent initializations
      const lockId = 123456789; // Unique ID for our initialization lock
      const lockResult = await client.queryArray(`SELECT pg_try_advisory_lock($1);`, [lockId]);
      
      if (lockResult.rows[0][0] === false) {
        console.log('Another initialization in progress, skipping...');
        await client.end();
        return {
          success: true,
          message: 'Database initialization already in progress'
        };
      }
      
      try {
        // Execute SQL with lock acquired
        await client.queryArray(CREATE_TABLES_SQL);
        console.log('Tables created/updated successfully');
        
        // Notify PostgREST to reload schema cache
        console.log('Reloading schema cache...');
        await client.queryArray(`NOTIFY pgrst, 'reload schema';`);
      } finally {
        // Always release the advisory lock
        await client.queryArray(`SELECT pg_advisory_unlock($1);`, [lockId]);
      }
      
      await client.end();
      
      console.log('=== DATABASE INITIALIZATION COMPLETE ===');
      
      return {
        success: true,
        message: 'Database initialized successfully'
      };
    } catch (error) {
      await client.end();
      console.error('Database initialization error:', error);
      
      // If deadlock detected, return success (table likely exists)
      if (error.fields?.code === '40P01') {
        console.log('Deadlock detected but continuing - tables likely already exist');
        return {
          success: true,
          message: 'Database initialization completed (concurrent access handled)'
        };
      }
      
      return {
        success: false,
        message: `Database initialization failed: ${error.message || error}`
      };
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      success: false,
      message: `Database connection failed: ${error}`
    };
  }
}