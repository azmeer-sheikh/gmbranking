-- Enhanced client management tables for comprehensive data

-- Add service areas table for map highlighting
CREATE TABLE IF NOT EXISTS client_service_areas (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_km DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add analytics data table
CREATE TABLE IF NOT EXISTS client_analytics (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15, 2) NOT NULL,
  metric_type TEXT NOT NULL, -- 'traffic', 'conversion', 'revenue', 'engagement'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add SEO analysis data table
CREATE TABLE IF NOT EXISTS client_seo_data (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  technical_seo_score INTEGER DEFAULT 0,
  on_page_seo_score INTEGER DEFAULT 0,
  local_seo_score INTEGER DEFAULT 0,
  backlinks_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  mobile_responsive BOOLEAN DEFAULT TRUE,
  page_speed_score INTEGER DEFAULT 0,
  ssl_valid BOOLEAN DEFAULT TRUE,
  sitemap_exists BOOLEAN DEFAULT TRUE,
  robots_txt_valid BOOLEAN DEFAULT TRUE,
  meta_titles_optimized BOOLEAN DEFAULT FALSE,
  meta_descriptions_optimized BOOLEAN DEFAULT FALSE,
  header_tags_proper BOOLEAN DEFAULT FALSE,
  image_alt_text_percentage INTEGER DEFAULT 0,
  internal_linking_score INTEGER DEFAULT 0,
  nap_consistency_score INTEGER DEFAULT 0,
  local_citations_count INTEGER DEFAULT 0,
  gmb_complete BOOLEAN DEFAULT FALSE,
  review_rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  total_backlinks INTEGER DEFAULT 0,
  referring_domains INTEGER DEFAULT 0,
  domain_authority INTEGER DEFAULT 0,
  high_quality_links_percentage INTEGER DEFAULT 0,
  toxic_links_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(client_id)
);

-- Add social media data table (enhanced)
CREATE TABLE IF NOT EXISTS client_social_media (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', 'linkedin'
  followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0.0,
  total_reach INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  best_posting_time TEXT,
  best_posting_days TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(client_id, platform)
);

-- Add social media posts table
CREATE TABLE IF NOT EXISTS client_social_posts (
  id TEXT PRIMARY KEY,
  social_media_id TEXT NOT NULL,
  post_title TEXT NOT NULL,
  post_date DATE NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0.0,
  is_viral BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  FOREIGN KEY (social_media_id) REFERENCES client_social_media(id) ON DELETE CASCADE
);

-- Add audience demographics table
CREATE TABLE IF NOT EXISTS client_audience_demographics (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  age_group TEXT NOT NULL, -- '18-24', '25-34', '35-44', '45-54', '55+'
  percentage DECIMAL(5, 2) NOT NULL,
  gender_female_percentage DECIMAL(5, 2) DEFAULT 50.0,
  gender_male_percentage DECIMAL(5, 2) DEFAULT 50.0,
  top_locations TEXT, -- JSON array of top locations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(client_id, age_group)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_service_areas_client ON client_service_areas(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_client ON client_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_seo_data_client ON client_seo_data(client_id);
CREATE INDEX IF NOT EXISTS idx_social_media_client ON client_social_media(client_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_social_media ON client_social_posts(social_media_id);
CREATE INDEX IF NOT EXISTS idx_demographics_client ON client_audience_demographics(client_id);

-- Add triggers for updated_at
CREATE TRIGGER update_service_areas_updated_at BEFORE UPDATE ON client_service_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON client_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_data_updated_at BEFORE UPDATE ON client_seo_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_updated_at BEFORE UPDATE ON client_social_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON client_social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demographics_updated_at BEFORE UPDATE ON client_audience_demographics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE client_service_areas IS 'Service areas with coordinates and radius for map visualization';
COMMENT ON TABLE client_analytics IS 'Analytics metrics for clients over time';
COMMENT ON TABLE client_seo_data IS 'Comprehensive SEO analysis data for clients';
COMMENT ON TABLE client_social_media IS 'Social media platform stats for clients';
COMMENT ON TABLE client_social_posts IS 'Individual social media posts performance';
COMMENT ON TABLE client_audience_demographics IS 'Audience age and gender demographics';
