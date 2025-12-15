import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { initializeDatabase } from "./database.tsx";
import { seedKeywords, businessCategories } from "./seed-data.tsx";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-dc7dce20/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize database
app.post("/make-server-dc7dce20/init-db", async (c) => {
  try {
    const result = await initializeDatabase();
    return c.json(result);
  } catch (error) {
    console.error('Database initialization failed:', error);
    return c.json({ 
      error: `Database initialization failed: ${error}`,
      success: false
    }, 500);
  }
});

// Reload schema cache (useful after manual database changes)
app.post("/make-server-dc7dce20/reload-schema", async (c) => {
  try {
    const dbUrl = Deno.env.get('SUPABASE_DB_URL');
    if (!dbUrl) {
      return c.json({
        success: false,
        message: 'SUPABASE_DB_URL not found'
      }, 500);
    }

    const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
    const client = new Client(dbUrl);
    await client.connect();
    
    try {
      console.log('Reloading PostgREST schema cache...');
      await client.queryArray(`NOTIFY pgrst, 'reload schema';`);
      await client.end();
      
      console.log('Schema cache reloaded successfully');
      return c.json({ 
        success: true, 
        message: 'Schema cache reloaded successfully' 
      });
    } catch (error) {
      await client.end();
      console.error('Schema reload error:', error);
      return c.json({ 
        success: false, 
        message: `Failed to reload schema: ${error.message}` 
      }, 500);
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return c.json({ 
      success: false, 
      message: `Database connection failed: ${error}` 
    }, 500);
  }
});

// Seed database with keywords
app.post("/make-server-dc7dce20/seed-keywords", async (c) => {
  try {
    console.log('=== SEEDING KEYWORDS START ===');
    console.log('Total keywords to seed:', seedKeywords.length);
    
    let successCount = 0;
    let skipCount = 0;
    const errors: string[] = [];

    for (const keywordData of seedKeywords) {
      try {
        // Check if keyword already exists
        const { data: existing } = await supabase
          .from('global_keywords')
          .select('id')
          .eq('keyword', keywordData.keyword)
          .single();

        if (existing) {
          skipCount++;
          continue;
        }

        // Insert keyword
        const { error } = await supabase
          .from('global_keywords')
          .insert({
            keyword: keywordData.keyword,
            category: keywordData.category,
            search_volume: keywordData.search_volume,
            competition: keywordData.competition,
            cpc: keywordData.cpc,
          });

        if (error) {
          throw new Error(error.message);
        }

        successCount++;
      } catch (error) {
        console.error('Failed to seed keyword:', keywordData.keyword, error);
        errors.push(`${keywordData.keyword}: ${error.message}`);
      }
    }

    console.log('=== SEEDING KEYWORDS END ===');
    console.log('Success:', successCount, 'Skipped:', skipCount, 'Errors:', errors.length);

    return c.json({
      success: true,
      message: `Seeded ${successCount} keywords (${skipCount} already existed)`,
      details: { successCount, skipCount, errors },
    });
  } catch (error) {
    console.error('Seed keywords error:', error);
    return c.json({ 
      success: false, 
      message: `Failed to seed keywords: ${error.message}` 
    }, 500);
  }
});

// Get business categories
app.get("/make-server-dc7dce20/categories", (c) => {
  return c.json({ categories: businessCategories });
});

// Seed "Geter Done 2" demo client
app.post("/make-server-dc7dce20/seed-demo-client", async (c) => {
  try {
    console.log('=== SEEDING DEMO CLIENT START ===');
    
    // Check if client already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('business_name', 'Geter Done 2')
      .single();

    if (existingClient) {
      console.log('Demo client already exists');
      return c.json({
        success: true,
        message: 'Demo client already exists',
        clientId: existingClient.id,
      });
    }

    // Create client with correct column names
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_name: 'Geter Done 2',
        phone_number: '(816) 522-1605',
        website_url: 'https://www.yelp.com/biz/geter-done-2-kansas-city',
        area: 'Kansas City Metro',
        location: 'Kansas City, MO',
        category: 'junk_removal',
        gbp_score: 62,
        damage_score: 32,
        avg_job_price: 0, // User needs to set this in Admin Panel
      })
      .select()
      .single();

    if (clientError) {
      throw new Error(`Failed to create client: ${clientError.message}`);
    }

    console.log('Created client:', newClient.id);

    // Get ALL junk removal keywords (47 total)
    const { data: junkKeywords, error: keywordsError } = await supabase
      .from('global_keywords')
      .select('*')
      .eq('category', 'junk_removal');

    if (keywordsError) {
      throw new Error(`Failed to fetch keywords: ${keywordsError.message}`);
    }

    // Add keywords to client
    const keywordInserts = junkKeywords.map(kw => ({
      client_id: newClient.id,
      keyword_id: kw.id,
      current_rank: Math.floor(Math.random() * 10) + 1, // Random rank 1-10
      previous_rank: Math.floor(Math.random() * 15) + 1,
    }));

    const { error: ckError } = await supabase
      .from('client_keywords')
      .insert(keywordInserts);

    if (ckError) {
      console.error('Failed to add keywords:', ckError);
    } else {
      console.log('Added', keywordInserts.length, 'keywords');
    }

    // Add Kansas City service areas
    const serviceAreas = [
      { area_name: 'Downtown Kansas City', latitude: 39.0997, longitude: -94.5786, radius_km: 10, is_primary: true },
      { area_name: 'Overland Park', latitude: 38.9822, longitude: -94.6708, radius_km: 15, is_primary: false },
      { area_name: 'Independence', latitude: 39.0911, longitude: -94.4155, radius_km: 12, is_primary: false },
      { area_name: 'Olathe', latitude: 38.8814, longitude: -94.8191, radius_km: 15, is_primary: false },
      { area_name: 'Lee\'s Summit', latitude: 38.9108, longitude: -94.3822, radius_km: 12, is_primary: false },
    ];

    await kv.set(`client:${newClient.id}:service_areas`, serviceAreas);
    console.log('Added', serviceAreas.length, 'service areas');

    // Add device performance data
    const devicePerformance = {
      mobile_traffic_percentage: 65,
      desktop_traffic_percentage: 35,
      mobile_revenue: 45000,
      desktop_revenue: 30000,
      mobile_conversion_rate: 3.2,
      desktop_conversion_rate: 4.5,
    };

    await kv.set(`client:${newClient.id}:device_performance`, devicePerformance);
    console.log('Added device performance data');

    // Add analytics metrics
    const analyticsMetrics = [
      { metric_name: 'Total Revenue', metric_value: 75000, metric_type: 'revenue', period_start: '2024-01', period_end: '2024-12' },
      { metric_name: 'Total Traffic', metric_value: 12500, metric_type: 'traffic', period_start: '2024-01', period_end: '2024-12' },
      { metric_name: 'Conversion Rate', metric_value: 3.8, metric_type: 'conversion', period_start: '2024-01', period_end: '2024-12' },
      { metric_name: 'Avg. Job Value', metric_value: 180, metric_type: 'revenue', period_start: '2024-01', period_end: '2024-12' },
    ];

    await kv.set(`client:${newClient.id}:analytics`, analyticsMetrics);
    console.log('Added analytics metrics');

    // Add SEO data
    const seoData = {
      domain_authority: 42,
      page_authority: 38,
      backlinks: 156,
      referring_domains: 45,
      organic_keywords: 89,
      monthly_organic_traffic: 8500,
    };

    await kv.set(`client:${newClient.id}:seo`, seoData);
    console.log('Added SEO data');

    // Add social media data
    const socialMedia = [
      { platform: 'facebook', url: 'https://facebook.com/geterdone2', followers: 1250, engagement_rate: 4.2 },
      { platform: 'instagram', url: 'https://instagram.com/geterdone2', followers: 850, engagement_rate: 5.8 },
      { platform: 'yelp', url: 'https://www.yelp.com/biz/geter-done-2-kansas-city', followers: 0, engagement_rate: 4.5 },
    ];

    await kv.set(`client:${newClient.id}:social_media`, socialMedia);
    console.log('Added social media data');

    console.log('=== SEEDING DEMO CLIENT END ===');

    return c.json({
      success: true,
      message: 'Demo client "Geter Done 2" seeded successfully!',
      clientId: newClient.id,
    });

  } catch (error) {
    console.error('Seed demo client error:', error);
    return c.json({ 
      success: false, 
      message: `Failed to seed demo client: ${error.message}` 
    }, 500);
  }
});

// ============ GLOBAL KEYWORDS ROUTES ============

app.get("/make-server-dc7dce20/global-keywords", async (c) => {
  try {
    const { data, error } = await supabase
      .from('global_keywords')
      .select('*')
      .order('keyword', { ascending: true });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ keywords: data || [] });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

// Get all client keywords with global keyword details and competitor data
app.get("/make-server-dc7dce20/client-keywords", async (c) => {
  try {
    const { data, error } = await supabase
      .from('client_keywords')
      .select(`
        *,
        global_keywords(*),
        clients(business_name, category)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ client_keywords: data || [] });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.post("/make-server-dc7dce20/global-keywords", async (c) => {
  try {
    const body = await c.req.json();
    const { keyword, category, searchVolume, competition, cpc, competitor1, competitor2, competitor3 } = body;

    if (!keyword) {
      return c.json({ error: "Keyword is required" }, 400);
    }

    const { data, error } = await supabase
      .from('global_keywords')
      .insert({
        keyword,
        category: category || null,
        search_volume: searchVolume || 0,
        competition: competition || 'medium',
        cpc: cpc || 0,
        competitor_1: competitor1 || null,
        competitor_2: competitor2 || null,
        competitor_3: competitor3 || null,
      })
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ keyword: data });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.delete("/make-server-dc7dce20/global-keywords/:id", async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabase
      .from('global_keywords')
      .delete()
      .eq('id', id);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: "Keyword deleted successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.put("/make-server-dc7dce20/global-keywords/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { keyword, category, searchVolume, competition, cpc, competitor1, competitor2, competitor3 } = body;

    const updates: any = {};
    if (keyword !== undefined) updates.keyword = keyword;
    if (category !== undefined) updates.category = category;
    if (searchVolume !== undefined) updates.search_volume = searchVolume;
    if (competition !== undefined) updates.competition = competition;
    if (cpc !== undefined) updates.cpc = cpc;
    if (competitor1 !== undefined) updates.competitor_1 = competitor1;
    if (competitor2 !== undefined) updates.competitor_2 = competitor2;
    if (competitor3 !== undefined) updates.competitor_3 = competitor3;

    const { data, error } = await supabase
      .from('global_keywords')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ keyword: data, message: "Keyword updated successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

// ============ CLIENTS ROUTES ============

app.get("/make-server-dc7dce20/clients", async (c) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    // Calculate avg_rank for each client
    const clientsWithRank = await Promise.all(
      (data || []).map(async (client) => {
        const { data: keywords } = await supabase
          .from('client_keywords')
          .select('current_rank')
          .eq('client_id', client.id);

        let avg_rank = null;
        if (keywords && keywords.length > 0) {
          const sum = keywords.reduce((acc, kw) => acc + kw.current_rank, 0);
          avg_rank = Math.round(sum / keywords.length);
        }

        return { ...client, avg_rank };
      })
    );

    return c.json({ clients: clientsWithRank });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.get("/make-server-dc7dce20/clients/:id", async (c) => {
  try {
    const id = c.req.param('id');

    // Get client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError) {
      return c.json({ error: clientError.message }, 500);
    }

    // Get client keywords with global keyword details
    const { data: keywords, error: keywordsError } = await supabase
      .from('client_keywords')
      .select('*, global_keywords(*)')
      .eq('client_id', id);

    if (keywordsError) {
      return c.json({ error: keywordsError.message }, 500);
    }

    // Get competitors with their keywords
    const { data: competitors, error: competitorsError } = await supabase
      .from('competitors')
      .select('*, competitor_keywords(*, global_keywords(*))')
      .eq('client_id', id);

    if (competitorsError) {
      return c.json({ error: competitorsError.message }, 500);
    }

    return c.json({
      client,
      keywords: keywords || [],
      competitors: competitors || [],
    });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.post("/make-server-dc7dce20/clients", async (c) => {
  try {
    const body = await c.req.json();
    const { businessName, websiteUrl, area, location, category, phoneNumber, keywordIds } = body;

    console.log('=== CREATE CLIENT REQUEST ===');
    console.log('Received data:', { businessName, websiteUrl, area, location, category, phoneNumber, keywordIds });

    if (!businessName || !area || !location || !category) {
      console.error('Missing required fields:', { businessName, area, location, category });
      return c.json({ error: "Missing required fields: businessName, area, location, and category are required" }, 400);
    }

    // Insert client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_name: businessName,
        website_url: websiteUrl || null,
        area,
        location,
        category,
        phone_number: phoneNumber || null,
        gbp_score: 0,
        damage_score: 0,
      })
      .select()
      .single();

    if (clientError) {
      console.error('Database error creating client:', clientError);
      return c.json({ error: `Failed to create client: ${clientError.message}` }, 500);
    }

    console.log('Client created successfully:', client.id);

    // Add keywords if provided
    if (keywordIds && Array.isArray(keywordIds) && keywordIds.length > 0) {
      console.log('Adding keywords to client:', keywordIds.length);
      
      const clientKeywords = keywordIds.map((keywordId: string) => ({
        client_id: client.id,
        keyword_id: keywordId,
        current_rank: 20, // Default rank
        target_rank: 1,
        search_volume: 0,
      }));

      const { error: keywordsError } = await supabase
        .from('client_keywords')
        .insert(clientKeywords);

      if (keywordsError) {
        console.error('Error adding client keywords:', keywordsError);
        // Don't fail the whole request if keywords fail
      } else {
        console.log('Keywords added successfully');
      }
    }

    console.log('=== CLIENT CREATED SUCCESSFULLY ===');
    return c.json({ client });
  } catch (error) {
    console.error('Unexpected error creating client:', error);
    return c.json({ error: `Unexpected error: ${error.message || error}` }, 500);
  }
});

app.put("/make-server-dc7dce20/clients/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { businessName, area, location, category, phoneNumber, gbpScore, damageScore } = body;

    const updates: any = {};
    if (businessName !== undefined) updates.business_name = businessName;
    if (area !== undefined) updates.area = area;
    if (location !== undefined) updates.location = location;
    if (category !== undefined) updates.category = category;
    if (phoneNumber !== undefined) updates.phone_number = phoneNumber;
    if (gbpScore !== undefined) updates.gbp_score = gbpScore;
    if (damageScore !== undefined) updates.damage_score = damageScore;

    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: "Client updated successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.delete("/make-server-dc7dce20/clients/:id", async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: "Client deleted successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

// ============ COMPETITORS ROUTES ============

app.get("/make-server-dc7dce20/competitors", async (c) => {
  try {
    const { data, error } = await supabase
      .from('competitors')
      .select('*, competitor_keywords(*, global_keywords(*))')
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ competitors: data || [] });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.post("/make-server-dc7dce20/bulk-import/competitors", async (c) => {
  try {
    const body = await c.req.json();
    const competitors = body.competitors || [];
    
    console.log('=== BULK IMPORT COMPETITORS START ===');
    console.log('Received competitors count:', competitors.length);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Get all global keywords to match by keyword name
    const { data: globalKeywords, error: keywordsError } = await supabase
      .from('global_keywords')
      .select('id, keyword');

    if (keywordsError) {
      console.error('Error fetching global keywords:', keywordsError);
    }

    for (const competitorData of competitors) {
      try {
        // Insert competitor
        const { data: newCompetitor, error: insertError } = await supabase
          .from('competitors')
          .insert({
            competitor_name: competitorData.competitor_name,
            area: competitorData.area,
            category: competitorData.category || null,
            client_id: null,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Handle keyword assignment
        if (competitorData.keywords && globalKeywords) {
          const keywordNames = competitorData.keywords
            .split(',')
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0);

          const keywordIds: string[] = [];
          for (const keywordName of keywordNames) {
            const keyword = globalKeywords.find((gk: any) => 
              gk.keyword.toLowerCase() === keywordName.toLowerCase()
            );
            if (keyword) {
              keywordIds.push(keyword.id);
            }
          }

          // Insert competitor_keywords relationships
          if (keywordIds.length > 0) {
            const competitorKeywords = keywordIds.map(keywordId => ({
              competitor_id: newCompetitor.id,
              keyword_id: keywordId,
            }));

            const { error: ckError } = await supabase
              .from('competitor_keywords')
              .insert(competitorKeywords);

            if (ckError) {
              console.error('Error inserting competitor keywords:', ckError);
            }
          }
        }

        console.log('Successfully saved competitor:', competitorData.competitor_name);
        successCount++;
      } catch (error) {
        console.error('Failed to import competitor:', competitorData.competitor_name, error);
        errorCount++;
        errors.push(`${competitorData.competitor_name}: ${error.message}`);
      }
    }

    console.log('=== BULK IMPORT COMPETITORS END ===');
    console.log('Success:', successCount, 'Failed:', errorCount);

    return c.json({
      success: errorCount === 0,
      message: `Imported ${successCount} competitors successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      details: { successCount, errorCount, errors },
    });
  } catch (error) {
    console.error('Bulk import competitors error:', error);
    return c.json({ 
      success: false, 
      message: `Failed to bulk import competitors: ${error.message}` 
    }, 500);
  }
});

app.delete("/make-server-dc7dce20/competitors/:id", async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: "Competitor deleted successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.put("/make-server-dc7dce20/competitors/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { competitorName, area, category, keywordIds } = body;

    const updates: any = {};
    if (competitorName !== undefined) updates.competitor_name = competitorName;
    if (area !== undefined) updates.area = area;
    if (category !== undefined) updates.category = category;

    const { error } = await supabase
      .from('competitors')
      .update(updates)
      .eq('id', id);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    // Update keywords if provided
    if (keywordIds !== undefined && Array.isArray(keywordIds)) {
      // Delete existing keywords
      await supabase
        .from('competitor_keywords')
        .delete()
        .eq('competitor_id', id);

      // Add new keywords
      if (keywordIds.length > 0) {
        const competitorKeywords = keywordIds.map((keywordId: string) => ({
          competitor_id: id,
          keyword_id: keywordId,
          rank: Math.floor(Math.random() * 20) + 1,
        }));

        const { error: keywordsError } = await supabase
          .from('competitor_keywords')
          .insert(competitorKeywords);

        if (keywordsError) {
          console.error('Error updating competitor keywords:', keywordsError);
          return c.json({ error: `Updated competitor but failed to update keywords: ${keywordsError.message}` }, 500);
        }
      }
    }

    return c.json({ message: "Competitor updated successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

// ============ SOCIAL MEDIA STATS ROUTES ============

app.get("/make-server-dc7dce20/social-stats/:clientId", async (c) => {
  try {
    const clientId = c.req.param('clientId');

    const { data, error } = await supabase
      .from('social_media_stats')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ stats: data || [] });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

app.post("/make-server-dc7dce20/social-stats", async (c) => {
  try {
    const body = await c.req.json();
    const { clientId, platform, followers, engagementRate, likes, reach, impressions, date } = body;

    if (!clientId || !platform) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await supabase
      .from('social_media_stats')
      .insert({
        client_id: clientId,
        platform,
        followers: followers || 0,
        engagement_rate: engagementRate || 0,
        likes: likes || 0,
        reach: reach || 0,
        impressions: impressions || 0,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ stat: data });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

// ============ BULK IMPORT ENDPOINTS ============

// Bulk import clients
app.post("/make-server-dc7dce20/bulk-import/clients", async (c) => {
  try {
    const body = await c.req.json();
    const clients = body.clients || [];
    
    console.log('=== BULK IMPORT CLIENTS START ===');
    console.log('Received clients count:', clients.length);
    console.log('First client data:', clients[0]);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const clientData of clients) {
      try {
        const clientRecord = {
          business_name: clientData.business_name,
          area: clientData.area,
          location: clientData.area, // Using area as location for compatibility
          category: clientData.category,
          phone_number: clientData.contact_phone || null,
          gbp_score: clientData.gbp_score || 0,
          damage_score: 0,
        };

        console.log('Attempting to save client:', clientRecord.business_name);
        
        const { data, error } = await supabase
          .from('clients')
          .insert(clientRecord)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        console.log('Successfully saved client:', clientRecord.business_name);
        successCount++;
      } catch (error) {
        console.error('Failed to import client:', clientData.business_name, error);
        errorCount++;
        errors.push(`${clientData.business_name}: ${error.message}`);
      }
    }

    console.log('=== BULK IMPORT CLIENTS END ===');
    console.log('Success:', successCount, 'Failed:', errorCount);

    return c.json({
      success: errorCount === 0,
      message: `Imported ${successCount} clients successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      details: { successCount, errorCount, errors },
    });
  } catch (error) {
    console.error('Bulk import clients error:', error);
    return c.json({ 
      success: false, 
      message: `Failed to bulk import clients: ${error.message}` 
    }, 500);
  }
});

// Bulk import keywords (client keywords)
app.post("/make-server-dc7dce20/bulk-import/keywords", async (c) => {
  try {
    const body = await c.req.json();
    const keywords = body.keywords || [];
    
    console.log('=== BULK IMPORT KEYWORDS START ===');
    console.log('Received keywords count:', keywords.length);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Get all clients from database to match by business name
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, business_name');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return c.json({ 
        success: false, 
        message: `Failed to fetch clients: ${clientsError.message}` 
      }, 500);
    }

    console.log('Found', clients.length, 'clients in database');

    for (const keywordData of keywords) {
      try {
        // Find client by business name
        const client = clients.find((c: any) => 
          c.business_name.toLowerCase() === keywordData.client_business_name.toLowerCase()
        );

        if (!client) {
          errorCount++;
          errors.push(`Client not found: ${keywordData.client_business_name}`);
          console.error('Client not found:', keywordData.client_business_name);
          continue;
        }

        // First, create or find the global keyword
        const { data: existingKeyword } = await supabase
          .from('global_keywords')
          .select('id')
          .eq('keyword', keywordData.keyword)
          .single();

        let globalKeywordId;

        if (existingKeyword) {
          globalKeywordId = existingKeyword.id;
          
          // Update existing global keyword with new data from Excel
          const { error: updateError } = await supabase
            .from('global_keywords')
            .update({
              category: keywordData.category || null,
              search_volume: keywordData.search_volume || 0,
              competition: keywordData.difficulty || 'medium',
              cpc: keywordData.cpc || 0,
            })
            .eq('id', globalKeywordId);
          
          if (updateError) {
            console.warn('Failed to update global keyword:', updateError.message);
          } else {
            console.log('Updated existing global keyword:', keywordData.keyword);
          }
        } else {
          // Create new global keyword
          const { data: newKeyword, error: keywordError } = await supabase
            .from('global_keywords')
            .insert({
              keyword: keywordData.keyword,
              category: keywordData.category || null,
              search_volume: keywordData.search_volume || 0,
              competition: keywordData.difficulty || 'medium',
              cpc: keywordData.cpc || 0,
            })
            .select()
            .single();

          if (keywordError) {
            throw new Error(`Failed to create global keyword: ${keywordError.message}`);
          }

          globalKeywordId = newKeyword.id;
          console.log('Created new global keyword:', keywordData.keyword);
        }

        // Now create client keyword link
        const { error: clientKeywordError } = await supabase
          .from('client_keywords')
          .insert({
            client_id: client.id,
            keyword_id: globalKeywordId,
            current_rank: keywordData.current_rank || 20,
            target_rank: keywordData.target_rank || 1,
            search_volume: keywordData.search_volume || 0,
            cpc: keywordData.cpc || 0,
            competitor_1: keywordData.competitor_1 || null,
            competitor_2: keywordData.competitor_2 || null,
            competitor_3: keywordData.competitor_3 || null,
          });

        if (clientKeywordError) {
          // Check if this is a duplicate key error
          if (clientKeywordError.code === '23505') {
            console.log('Keyword already assigned to client, skipping:', keywordData.keyword, 'for client:', client.business_name);
            successCount++;
          } else {
            throw new Error(clientKeywordError.message);
          }
        } else {
          console.log('Successfully saved keyword:', keywordData.keyword, 'for client:', client.business_name);
          successCount++;
        }
      } catch (error) {
        console.error('Failed to import keyword:', keywordData.keyword, error);
        errorCount++;
        errors.push(`${keywordData.keyword}: ${error.message}`);
      }
    }

    console.log('=== BULK IMPORT KEYWORDS END ===');
    console.log('Success:', successCount, 'Failed:', errorCount);

    return c.json({
      success: errorCount === 0,
      message: `Imported ${successCount} keywords successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      details: { successCount, errorCount, errors },
    });
  } catch (error) {
    console.error('Bulk import keywords error:', error);
    return c.json({ 
      success: false, 
      message: `Failed to bulk import keywords: ${error.message}` 
    }, 500);
  }
});

// Bulk import global keywords
app.post("/make-server-dc7dce20/bulk-import/global-keywords", async (c) => {
  try {
    const body = await c.req.json();
    const keywords = body.keywords || [];
    
    console.log('=== BULK IMPORT GLOBAL KEYWORDS START ===');
    console.log('Received keywords count:', keywords.length);
    
    let successCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const keywordData of keywords) {
      try {
        // Check if keyword already exists
        const { data: existingKeyword } = await supabase
          .from('global_keywords')
          .select('id')
          .eq('keyword', keywordData.keyword)
          .single();

        if (existingKeyword) {
          // Update existing keyword with new data
          const { error: updateError } = await supabase
            .from('global_keywords')
            .update({
              category: keywordData.category || null,
              search_volume: keywordData.search_volume || 0,
              competition: keywordData.difficulty || 'medium',
              cpc: keywordData.cpc || 0,
              competitor_1: keywordData.competitor_1 || null,
              competitor_2: keywordData.competitor_2 || null,
              competitor_3: keywordData.competitor_3 || null,
            })
            .eq('id', existingKeyword.id);
          
          if (updateError) {
            throw new Error(updateError.message);
          }
          
          console.log('Updated existing keyword:', keywordData.keyword);
          updateCount++;
          successCount++;
        } else {
          // Insert new keyword
          const { error } = await supabase
            .from('global_keywords')
            .insert({
              keyword: keywordData.keyword,
              category: keywordData.category || null,
              search_volume: keywordData.search_volume || 0,
              competition: keywordData.difficulty || 'medium',
              cpc: keywordData.cpc || 0,
              competitor_1: keywordData.competitor_1 || null,
              competitor_2: keywordData.competitor_2 || null,
              competitor_3: keywordData.competitor_3 || null,
            });

          if (error) {
            throw new Error(error.message);
          }
          
          console.log('Successfully saved global keyword:', keywordData.keyword);
          successCount++;
        }
      } catch (error) {
        console.error('Failed to import keyword:', keywordData.keyword, error);
        errorCount++;
        errors.push(`${keywordData.keyword}: ${error.message}`);
      }
    }

    console.log('=== BULK IMPORT GLOBAL KEYWORDS END ===');
    console.log('Success:', successCount, 'Updated:', updateCount, 'Failed:', errorCount);

    return c.json({
      success: errorCount === 0,
      message: `Imported ${successCount} global keywords successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      details: { successCount, updateCount, errorCount, errors },
    });
  } catch (error) {
    console.error('Bulk import global keywords error:', error);
    return c.json({ 
      success: false, 
      message: `Failed to bulk import global keywords: ${error.message}` 
    }, 500);
  }
});

// ============ COMPREHENSIVE CLIENT ENDPOINTS ============

// Create comprehensive client with all data
app.post("/make-server-dc7dce20/comprehensive-clients", async (c) => {
  try {
    const data = await c.req.json();
    const clientId = crypto.randomUUID();
    
    // 1. Create client in existing clients table
    const { error: clientError } = await supabase.from('clients').insert({
      id: clientId,
      business_name: data.businessName,
      area: data.area,
      location: data.location,
      category: data.category,
      phone_number: data.phoneNumber || null,
      website_url: data.address || null,
      gbp_score: data.gbpScore || 85,
      damage_score: 0,
      avg_job_price: data.avgJobPrice || null,
      manual_top3_count: data.manualTop3Count || null,
      manual_top10_count: data.manualTop10Count || null,
    });
    
    if (clientError) {
      console.error('Error creating client:', clientError);
      return c.json({ success: false, message: clientError.message }, 500);
    }
    
    // 2. Store service areas in KV store
    if (data.serviceAreas && data.serviceAreas.length > 0) {
      await kv.set(`client:${clientId}:service_areas`, data.serviceAreas);
    }
    
    // 3. Link keywords in existing client_keywords table
    if (data.selectedKeywordIds && data.selectedKeywordIds.length > 0) {
      // Fetch global keywords to get CPC values
      const { data: globalKeywords } = await supabase
        .from('global_keywords')
        .select('id, cpc')
        .in('id', data.selectedKeywordIds);
      
      const keywordLinks = data.selectedKeywordIds.map((kwId: string) => {
        const globalKeyword = globalKeywords?.find((gk: any) => gk.id === kwId);
        const cpc = data.keywordCpcOverrides?.[kwId] ?? globalKeyword?.cpc ?? 0;
        
        return {
          id: crypto.randomUUID(),
          client_id: clientId,
          keyword_id: kwId,
          current_rank: 0,
          target_rank: 1,
          search_volume: 0,
          cpc: cpc,
        };
      });
      
      const { error: keywordsError } = await supabase.from('client_keywords').insert(keywordLinks);
      if (keywordsError) console.error('Error linking keywords:', keywordsError);
    }
    
    // 4. Store analytics metrics in KV store
    if (data.analyticsMetrics && data.analyticsMetrics.length > 0) {
      await kv.set(`client:${clientId}:analytics`, data.analyticsMetrics);
    }
    
    // 4a. Store device keyword data in KV store
    if (data.deviceKeywordData && data.deviceKeywordData.length > 0) {
      await kv.set(`client:${clientId}:device_keyword_data`, data.deviceKeywordData);
    }
    
    // 4b. Store device performance settings in KV store
    if (data.devicePerformance) {
      await kv.set(`client:${clientId}:device_performance`, data.devicePerformance);
    }
    
    // 5. Store SEO data in KV store
    if (data.seoData) {
      const seoDataWithScore = {
        ...data.seoData,
        overall_score: Math.round(
          (data.seoData.technical_seo_score + 
           data.seoData.on_page_seo_score + 
           data.seoData.local_seo_score + 
           data.seoData.backlinks_score) / 4
        ),
      };
      await kv.set(`client:${clientId}:seo`, seoDataWithScore);
    }
    
    // 6. Store social media data in KV store
    if (data.socialMedia && data.socialMedia.length > 0) {
      await kv.set(`client:${clientId}:social_media`, data.socialMedia);
    }
    
    // 7. Store demographics in KV store
    if (data.demographics && data.demographics.length > 0) {
      await kv.set(`client:${clientId}:demographics`, {
        age_groups: data.demographics,
        gender_female_percentage: data.genderFemalePercentage || 50,
        gender_male_percentage: data.genderMalePercentage || 50,
      });
    }
    
    return c.json({ success: true, clientId });
  } catch (error) {
    console.error('Error creating comprehensive client:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// Get comprehensive client data
app.get("/make-server-dc7dce20/comprehensive-clients/:id", async (c) => {
  try {
    const clientId = c.req.param('id');
    
    // 1. Fetch client from existing clients table
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (clientError) {
      console.error('Error fetching client:', clientError);
      return c.json({ error: clientError.message }, 500);
    }
    
    // 2. Fetch data from KV store
    const serviceAreas = await kv.get(`client:${clientId}:service_areas`) || [];
    const analytics = await kv.get(`client:${clientId}:analytics`) || [];
    const deviceKeywordData = await kv.get(`client:${clientId}:device_keyword_data`) || [];
    const devicePerformance = await kv.get(`client:${clientId}:device_performance`) || null;
    const seoData = await kv.get(`client:${clientId}:seo`) || null;
    const socialMedia = await kv.get(`client:${clientId}:social_media`) || [];
    const demographics = await kv.get(`client:${clientId}:demographics`) || null;
    
    // 3. Fetch keywords from existing client_keywords table
    const { data: keywords, error: keywordsError } = await supabase
      .from('client_keywords')
      .select('*, global_keywords(*)')
      .eq('client_id', clientId);
    
    if (keywordsError) {
      console.error('Error fetching keywords:', keywordsError);
    }
    
    return c.json({
      client,
      service_areas: serviceAreas,
      keywords: keywords || [],
      analytics,
      device_keyword_data: deviceKeywordData,
      device_performance: devicePerformance,
      seo_data: seoData,
      social_media: socialMedia,
      demographics,
    });
  } catch (error) {
    console.error('Error fetching comprehensive client:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update comprehensive client with all data
app.put("/make-server-dc7dce20/comprehensive-clients/:id", async (c) => {
  try {
    const clientId = c.req.param('id');
    const data = await c.req.json();
    
    // 1. Update client in existing clients table
    const clientUpdates: any = {};
    if (data.businessName !== undefined) clientUpdates.business_name = data.businessName;
    if (data.area !== undefined) clientUpdates.area = data.area;
    if (data.location !== undefined) clientUpdates.location = data.location;
    if (data.category !== undefined) clientUpdates.category = data.category;
    if (data.phoneNumber !== undefined) clientUpdates.phone_number = data.phoneNumber;
    if (data.address !== undefined) clientUpdates.website_url = data.address;
    if (data.gbpScore !== undefined) clientUpdates.gbp_score = data.gbpScore;
    if (data.avgJobPrice !== undefined) clientUpdates.avg_job_price = data.avgJobPrice;
    if (data.manualTop3Count !== undefined) clientUpdates.manual_top3_count = data.manualTop3Count;
    if (data.manualTop10Count !== undefined) clientUpdates.manual_top10_count = data.manualTop10Count;
    
    if (Object.keys(clientUpdates).length > 0) {
      const { error: clientError } = await supabase
        .from('clients')
        .update(clientUpdates)
        .eq('id', clientId);
      
      if (clientError) {
        console.error('Error updating client:', clientError);
        return c.json({ success: false, message: clientError.message }, 500);
      }
    }
    
    // 2. Update service areas in KV store
    if (data.serviceAreas !== undefined) {
      await kv.set(`client:${clientId}:service_areas`, data.serviceAreas);
    }
    
    // 3. Update keywords (delete old and insert new)
    if (data.selectedKeywordIds !== undefined) {
      // Delete existing keywords
      await supabase
        .from('client_keywords')
        .delete()
        .eq('client_id', clientId);
      
      // Insert new keywords
      if (data.selectedKeywordIds.length > 0) {
        // Fetch global keywords to get CPC values
        const { data: globalKeywords } = await supabase
          .from('global_keywords')
          .select('id, cpc')
          .in('id', data.selectedKeywordIds);
        
        const keywordLinks = data.selectedKeywordIds.map((kwId: string) => {
          const globalKeyword = globalKeywords?.find((gk: any) => gk.id === kwId);
          const cpc = data.keywordCpcOverrides?.[kwId] ?? globalKeyword?.cpc ?? 0;
          
          return {
            id: crypto.randomUUID(),
            client_id: clientId,
            keyword_id: kwId,
            current_rank: 0,
            target_rank: 1,
            search_volume: 0,
            cpc: cpc,
          };
        });
        
        const { error: keywordsError } = await supabase
          .from('client_keywords')
          .insert(keywordLinks);
        
        if (keywordsError) {
          console.error('Error updating keywords:', keywordsError);
        }
      }
    }
    
    // 4. Update analytics metrics in KV store
    if (data.analyticsMetrics !== undefined) {
      await kv.set(`client:${clientId}:analytics`, data.analyticsMetrics);
    }
    
    // 4a. Update device keyword data in KV store
    if (data.deviceKeywordData !== undefined) {
      await kv.set(`client:${clientId}:device_keyword_data`, data.deviceKeywordData);
    }
    
    // 4b. Update device performance settings in KV store
    if (data.devicePerformance !== undefined) {
      await kv.set(`client:${clientId}:device_performance`, data.devicePerformance);
    }
    
    // 5. Update SEO data in KV store
    if (data.seoData !== undefined) {
      const seoDataWithScore = {
        ...data.seoData,
        overall_score: Math.round(
          (data.seoData.technical_seo_score + 
           data.seoData.on_page_seo_score + 
           data.seoData.local_seo_score + 
           data.seoData.backlinks_score) / 4
        ),
      };
      await kv.set(`client:${clientId}:seo`, seoDataWithScore);
    }
    
    // 6. Update social media data in KV store
    if (data.socialMedia !== undefined) {
      await kv.set(`client:${clientId}:social_media`, data.socialMedia);
    }
    
    // 7. Update demographics in KV store
    if (data.demographics !== undefined) {
      await kv.set(`client:${clientId}:demographics`, {
        age_groups: data.demographics,
        gender_female_percentage: data.genderFemalePercentage || 50,
        gender_male_percentage: data.genderMalePercentage || 50,
      });
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating comprehensive client:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// Get service areas for a client (for map display)
app.get("/make-server-dc7dce20/service-areas/:clientId", async (c) => {
  try {
    const clientId = c.req.param('clientId');
    
    // Fetch service areas from KV store
    const areas = await kv.get(`client:${clientId}:service_areas`) || [];
    
    return c.json({ areas });
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update client keyword (including competitor ranks)
app.put("/make-server-dc7dce20/client-keywords/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { currentRank, targetRank, cpc, competitor1, competitor2, competitor3 } = body;

    const updates: any = {};
    if (currentRank !== undefined) updates.current_rank = currentRank;
    if (targetRank !== undefined) updates.target_rank = targetRank;
    if (cpc !== undefined) updates.cpc = cpc;
    if (competitor1 !== undefined) updates.competitor_1 = competitor1;
    if (competitor2 !== undefined) updates.competitor_2 = competitor2;
    if (competitor3 !== undefined) updates.competitor_3 = competitor3;

    const { data, error } = await supabase
      .from('client_keywords')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        global_keywords(*),
        clients(business_name, category)
      `)
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ client_keyword: data, message: "Client keyword updated successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

// Delete client keyword
app.delete("/make-server-dc7dce20/client-keywords/:id", async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabase
      .from('client_keywords')
      .delete()
      .eq('id', id);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: "Client keyword deleted successfully" });
  } catch (error) {
    return c.json({ error: `Unexpected error: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);