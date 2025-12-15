# Excel Import Guide - Competitor Performance Calculations

## Overview
The Top Competitors Performance section calculates competitor profits based on data imported from Excel files. This guide explains the required columns and formulas.

## Required Excel Columns for Keywords Import

When importing keywords, your Excel file must include these columns:

### Basic Keyword Information
- `client_business_name` - The name of your client's business
- `keyword` - The search keyword/phrase
- `category` - Business category (plumbing, hvac, roofing, etc.)
- `search_volume` - Monthly search volume for this keyword
- `current_rank` - Your client's current ranking position (1-20+)
- `target_rank` - Desired ranking position (typically 1-3)
- `cpc` - Cost per click in dollars (e.g., 8.50 for $8.50)

### Competitor Rankings (Required for Performance Calculations)
- `competitor_1` - Ranking position of first competitor (1-20, or blank if not ranking)
- `competitor_2` - Ranking position of second competitor (1-20, or blank if not ranking)
- `competitor_3` - Ranking position of third competitor (1-20, or blank if not ranking)

### Optional Columns
- `difficulty` - Keyword difficulty (easy/medium/hard)
- `intent` - Search intent (informational/transactional/navigational)

## Example Excel Data

| client_business_name | keyword | category | search_volume | current_rank | target_rank | cpc | competitor_1 | competitor_2 | competitor_3 |
|---------------------|---------|----------|---------------|--------------|-------------|-----|--------------|--------------|--------------|
| ABC Plumbing | emergency plumber la | plumbing | 3200 | 4 | 1 | 8.50 | 2 | 3 | 7 |
| ABC Plumbing | water heater repair | plumbing | 1800 | 7 | 3 | 12.75 | 2 | 4 | 6 |
| Elite HVAC | ac repair santa monica | hvac | 2400 | 5 | 2 | 15.00 | 1 | 3 | 4 |

## How Calculations Work

### 1. Click-Through Rate (CTR) by Position
The system uses industry-standard CTR rates based on ranking position:
- Position 1: 31.6% CTR
- Position 2: 15.8% CTR
- Position 3: 10.7% CTR
- Position 4: 7.4% CTR
- Position 5: 5.5% CTR
- Position 6-10: Decreasing rates
- Position 10+: <2% CTR

### 2. Competitor Profit Formula

For each competitor, for each keyword they rank on:

```
Monthly Clicks = Search Volume × CTR (based on their ranking position)
Conversions = Monthly Clicks × 3.5% (industry standard conversion rate)
Revenue = Conversions × Average Job Price
Ad Cost = Monthly Clicks × CPC
Profit = Revenue - Ad Cost
```

### 3. Example Calculation

Using the first row from the example above:
- Keyword: "emergency plumber la"
- Search Volume: 3,200
- Competitor 1 Rank: 2
- CPC: $8.50
- Avg Job Price: $500 (set in client profile)

**Competitor 1 Performance:**
```
CTR for position 2 = 15.8%
Monthly Clicks = 3,200 × 0.158 = 506 clicks
Conversions = 506 × 0.035 = 17.7 conversions
Revenue = 17.7 × $500 = $8,850
Ad Cost = 506 × $8.50 = $4,301
Profit = $8,850 - $4,301 = $4,549/month
```

This calculation is done for all keywords where the competitor ranks in top 10, then summed to show total monthly profit.

## Important Notes

1. **Competitor rankings must be in top 10** - Only rankings 1-10 are included in calculations as these get meaningful traffic

2. **Blank competitor columns** - If a competitor doesn't rank for a keyword, leave the column blank or enter 0

3. **CPC values are critical** - Accurate CPC data ensures realistic cost calculations. Use Google Keyword Planner or SEMrush for accurate CPC values

4. **Average Job Price** - Set this in the client profile (e.g., $500 for plumbing jobs, $3,000 for roofing jobs). This significantly affects profit calculations

5. **Conversion Rate** - The system uses 3.5% as a conservative industry standard for local service businesses

## How to Import

1. Download the template from Admin Panel → Data Management → Keywords Template
2. Fill in all required columns with accurate data
3. Upload the Excel file
4. The system will validate data and show any errors
5. Once imported, view Top Competitors Performance on the Keywords tab

## Template Download

You can download a pre-formatted Excel template with sample data and formulas from:
**Admin Panel → Data Management → Import Keywords → Download Template**

## Viewing Results

After importing keywords with competitor rankings:
1. Navigate to the Keywords tab
2. Scroll to "Top Competitors Performance" section
3. View the three competitor cards showing:
   - Monthly profit for each competitor
   - Revenue vs. Ad Cost breakdown
   - ROI percentage
   - Top 3 most profitable keywords for each competitor

## Troubleshooting

**No data showing in Top Competitors Performance?**
- Check that your Excel file has `competitor_1`, `competitor_2`, or `competitor_3` columns
- Verify competitor rankings are numbers between 1-10
- Ensure keywords have valid search volumes and CPC values
- Confirm your client has an Average Job Price set in their profile

**Calculations seem incorrect?**
- Verify CPC values are in dollars (e.g., 8.50 not 850)
- Check that search volumes are monthly numbers
- Ensure competitor rankings are correct (1 = best, 20+ = poor)
- Confirm Average Job Price is set correctly for the industry

## Additional Resources

- See `src/lib/excel-utils.ts` for exact validation rules
- See `src/components/CompetitorPerformance.tsx` for calculation formulas
- Contact support for help with bulk imports or custom requirements
