// Database types for the GMB Rankings Tool

export interface GlobalKeyword {
  id: string;
  keyword: string;
  category: string | null;
  search_volume: number;
  competition: string;
  cpc: number;
  competitor_1: number | null;
  competitor_2: number | null;
  competitor_3: number | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  business_name: string;
  area: string;
  location: string;
  category: string;
  phone_number: string | null;
  address?: string | null;
  gbp_score: number;
  damage_score: number;
  avg_rank?: number | null;
  avg_job_price?: number | null;
  competitor_1_name?: string | null;
  competitor_2_name?: string | null;
  competitor_3_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientKeyword {
  id: string;
  client_id: string;
  keyword_id: string;
  current_rank: number;
  target_rank: number;
  search_volume: number;
  cpc: number;
  competitor_1?: number | null; // Rank of first competitor
  competitor_2?: number | null; // Rank of second competitor
  competitor_3?: number | null; // Rank of third competitor
  created_at: string;
  global_keywords?: GlobalKeyword;
}

export interface Competitor {
  id: string;
  competitor_name: string;
  area: string;
  category: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
  competitor_keywords?: CompetitorKeyword[];
}

export interface CompetitorKeyword {
  id: string;
  competitor_id: string;
  keyword_id: string;
  rank: number;
  created_at: string;
  global_keywords?: GlobalKeyword;
}

export interface SocialMediaStats {
  id: string;
  client_id: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  followers: number;
  engagement_rate: number;
  likes: number;
  reach: number;
  impressions: number;
  date: string;
  created_at: string;
}

export interface ClientDetails {
  client: Client;
  keywords: ClientKeyword[];
  competitors: Competitor[];
}

export interface ClientServiceArea {
  id: string;
  client_id: string;
  area_name: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientAnalytics {
  id: string;
  client_id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'traffic' | 'conversion' | 'revenue' | 'engagement';
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface ClientSEOData {
  id: string;
  client_id: string;
  technical_seo_score: number;
  on_page_seo_score: number;
  local_seo_score: number;
  backlinks_score: number;
  overall_score: number;
  mobile_responsive: boolean;
  page_speed_score: number;
  ssl_valid: boolean;
  sitemap_exists: boolean;
  robots_txt_valid: boolean;
  meta_titles_optimized: boolean;
  meta_descriptions_optimized: boolean;
  header_tags_proper: boolean;
  image_alt_text_percentage: number;
  internal_linking_score: number;
  nap_consistency_score: number;
  local_citations_count: number;
  gmb_complete: boolean;
  review_rating: number;
  review_count: number;
  total_backlinks: number;
  referring_domains: number;
  domain_authority: number;
  high_quality_links_percentage: number;
  toxic_links_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface ClientSocialMedia {
  id: string;
  client_id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  followers: number;
  engagement_rate: number;
  total_reach: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  posts_count: number;
  best_posting_time: string | null;
  best_posting_days: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientSocialPost {
  id: string;
  social_media_id: string;
  post_title: string;
  post_date: string;
  likes: number;
  comments: number;
  shares: number;
  engagement_score: number;
  is_viral: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientAudienceDemographics {
  id: string;
  client_id: string;
  age_group: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  percentage: number;
  gender_female_percentage: number;
  gender_male_percentage: number;
  top_locations: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComprehensiveClientData {
  client: Client;
  keywords: ClientKeyword[];
  competitors: Competitor[];
  service_areas: ClientServiceArea[];
  analytics: ClientAnalytics[];
  seo_data: ClientSEOData | null;
  social_media: ClientSocialMedia[];
  social_posts: ClientSocialPost[];
  demographics: ClientAudienceDemographics[];
}