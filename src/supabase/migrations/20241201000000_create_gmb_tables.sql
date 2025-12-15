-- Create keywords table
CREATE TABLE IF NOT EXISTS gmb_keywords (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  keyword TEXT NOT NULL,
  monthly_searches INTEGER NOT NULL,
  competition TEXT NOT NULL,
  cpc DECIMAL(10, 2) NOT NULL,
  avg_job_size DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(state, city, keyword)
);

-- Create GMB rankings table
CREATE TABLE IF NOT EXISTS gmb_rankings (
  id TEXT PRIMARY KEY,
  keyword_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  gmb_name TEXT NOT NULL,
  traffic_share DECIMAL(5, 2) NOT NULL,
  is_my_business BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  FOREIGN KEY (keyword_id) REFERENCES gmb_keywords(id) ON DELETE CASCADE,
  UNIQUE(keyword_id, rank, gmb_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_keywords_state ON gmb_keywords(state);
CREATE INDEX IF NOT EXISTS idx_keywords_city ON gmb_keywords(city);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON gmb_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_location ON gmb_keywords(state, city);
CREATE INDEX IF NOT EXISTS idx_rankings_keyword_id ON gmb_rankings(keyword_id);
CREATE INDEX IF NOT EXISTS idx_rankings_my_business ON gmb_rankings(is_my_business);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_gmb_keywords_updated_at BEFORE UPDATE ON gmb_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmb_rankings_updated_at BEFORE UPDATE ON gmb_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE gmb_keywords IS 'Stores keyword data from Google Keyword Planner with location information';
COMMENT ON TABLE gmb_rankings IS 'Stores GMB ranking positions for each keyword';
COMMENT ON COLUMN gmb_keywords.state IS 'US State where the keyword is being searched';
COMMENT ON COLUMN gmb_keywords.city IS 'City where the keyword is being searched';
COMMENT ON COLUMN gmb_keywords.monthly_searches IS 'Average monthly search volume';
COMMENT ON COLUMN gmb_keywords.avg_job_size IS 'Average revenue per job/conversion in USD';
COMMENT ON COLUMN gmb_rankings.traffic_share IS 'Percentage of traffic this ranking position receives';
COMMENT ON COLUMN gmb_rankings.is_my_business IS 'Flag to identify if this is the user''s business';
