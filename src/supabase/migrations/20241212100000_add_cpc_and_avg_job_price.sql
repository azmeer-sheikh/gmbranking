-- Add CPC column to client_keywords table
ALTER TABLE client_keywords ADD COLUMN IF NOT EXISTS cpc DECIMAL(10, 2) DEFAULT 0.0;

-- Add avg_job_price column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS avg_job_price DECIMAL(10, 2) DEFAULT 0.0;

-- Add comments
COMMENT ON COLUMN client_keywords.cpc IS 'Cost Per Click for the keyword';
COMMENT ON COLUMN clients.avg_job_price IS 'Average job price for revenue calculations';
