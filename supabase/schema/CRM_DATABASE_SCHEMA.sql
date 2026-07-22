-- ============================================
-- ASRIVO TECH CRM DATABASE SCHEMA
-- Comprehensive CRM system for lead and deal management
-- ============================================

-- ============================================
-- 1. CRM LEADS TABLE
-- Enhanced lead tracking with scoring and assignment
-- ============================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id BIGSERIAL PRIMARY KEY,
  
  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  job_title TEXT,
  
  -- Lead Details
  lead_source TEXT, -- 'website', 'referral', 'linkedin', 'cold-outreach', 'event', 'partner'
  lead_status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'
  lead_score INTEGER DEFAULT 0, -- 0-100 scoring system
  priority TEXT DEFAULT 'medium', -- 'hot', 'warm', 'cold', 'medium'
  
  -- Company Details
  company_size TEXT, -- 'startup', 'small', 'medium', 'enterprise'
  industry TEXT,
  company_website TEXT,
  company_revenue TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Interaction
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  contact_attempts INTEGER DEFAULT 0,
  
  -- Conversion
  converted_to_deal_id BIGINT,
  conversion_date TIMESTAMP WITH TIME ZONE,
  
  -- Additional
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_score ON crm_leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_to ON crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_leads_next_follow_up ON crm_leads(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads(created_at DESC);

-- ============================================
-- 2. CRM DEALS TABLE
-- Sales opportunities and pipeline management
-- ============================================
CREATE TABLE IF NOT EXISTS crm_deals (
  id BIGSERIAL PRIMARY KEY,
  
  -- Deal Information
  deal_name TEXT NOT NULL,
  lead_id BIGINT REFERENCES crm_leads(id) ON DELETE SET NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  company_name TEXT,
  
  -- Pipeline
  stage TEXT DEFAULT 'qualification', -- 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'
  probability INTEGER DEFAULT 50, -- 0-100 percent chance of closing
  
  -- Financial
  deal_value DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Timing
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Assignment
  owner_id UUID REFERENCES auth.users(id),
  
  -- Classification
  deal_type TEXT, -- 'new-business', 'upsell', 'renewal', 'cross-sell'
  product_service TEXT, -- 'web-development', 'mobile-app', 'consulting', etc.
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  lost_reason TEXT,
  
  -- Additional
  description TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_owner ON crm_deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_lead_id ON crm_deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_expected_close ON crm_deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_crm_deals_is_active ON crm_deals(is_active);
CREATE INDEX IF NOT EXISTS idx_crm_deals_created_at ON crm_deals(created_at DESC);

-- ============================================
-- 3. CRM ACTIVITIES TABLE
-- Track all interactions with leads/deals
-- ============================================
CREATE TABLE IF NOT EXISTS crm_activities (
  id BIGSERIAL PRIMARY KEY,
  
  -- Related Records
  lead_id BIGINT REFERENCES crm_leads(id) ON DELETE CASCADE,
  deal_id BIGINT REFERENCES crm_deals(id) ON DELETE CASCADE,
  contact_email TEXT,
  
  -- Activity Details
  activity_type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'note', 'task', 'demo', 'proposal-sent'
  subject TEXT NOT NULL,
  description TEXT,
  
  -- Communication
  direction TEXT, -- 'inbound', 'outbound'
  duration_minutes INTEGER,
  outcome TEXT, -- 'success', 'no-answer', 'callback-requested', 'follow-up-needed'
  
  -- Attachments
  attachment_urls TEXT[],
  
  -- Assignment
  performed_by UUID REFERENCES auth.users(id),
  
  -- Scheduling
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal_id ON crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_date ON crm_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_performed_by ON crm_activities(performed_by);

-- ============================================
-- 4. CRM TASKS TABLE
-- Task management and reminders
-- ============================================
CREATE TABLE IF NOT EXISTS crm_tasks (
  id BIGSERIAL PRIMARY KEY,
  
  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'follow-up', -- 'follow-up', 'call', 'email', 'meeting', 'demo', 'proposal', 'other'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Related Records
  lead_id BIGINT REFERENCES crm_leads(id) ON DELETE CASCADE,
  deal_id BIGINT REFERENCES crm_deals(id) ON DELETE CASCADE,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  
  -- Timing
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'in-progress', 'completed', 'cancelled'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned_to ON crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead_id ON crm_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal_id ON crm_tasks(deal_id);

-- ============================================
-- 5. CRM TAGS TABLE
-- Flexible tagging system
-- ============================================
CREATE TABLE IF NOT EXISTS crm_tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1', -- Hex color for UI
  category TEXT, -- 'industry', 'product', 'status', 'custom'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tags_name ON crm_tags(name);
CREATE INDEX IF NOT EXISTS idx_crm_tags_category ON crm_tags(category);

-- ============================================
-- 6. CRM NOTES TABLE
-- Internal team notes
-- ============================================
CREATE TABLE IF NOT EXISTS crm_notes (
  id BIGSERIAL PRIMARY KEY,
  
  -- Related Records
  lead_id BIGINT REFERENCES crm_leads(id) ON DELETE CASCADE,
  deal_id BIGINT REFERENCES crm_deals(id) ON DELETE CASCADE,
  
  -- Note Content
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Author
  created_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_notes_lead_id ON crm_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_deal_id ON crm_notes(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_created_by ON crm_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_crm_notes_created_at ON crm_notes(created_at DESC);

-- ============================================
-- 7. CRM EMAIL TEMPLATES TABLE
-- Reusable email templates
-- ============================================
CREATE TABLE IF NOT EXISTS crm_email_templates (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT, -- 'follow-up', 'proposal', 'welcome', 'meeting-request'
  variables TEXT[], -- Available template variables like {{first_name}}, {{company_name}}
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_email_templates_category ON crm_email_templates(category);
CREATE INDEX IF NOT EXISTS idx_crm_email_templates_is_active ON crm_email_templates(is_active);

-- ============================================
-- 8. CRM PIPELINE STAGES TABLE
-- Customizable pipeline configuration
-- ============================================
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id BIGSERIAL PRIMARY KEY,
  stage_name TEXT NOT NULL UNIQUE,
  stage_order INTEGER NOT NULL,
  probability INTEGER DEFAULT 50, -- Default probability for deals in this stage
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_closed_stage BOOLEAN DEFAULT FALSE, -- TRUE for 'closed-won' or 'closed-lost'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_order ON crm_pipeline_stages(stage_order);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_is_active ON crm_pipeline_stages(is_active);

-- ============================================
-- 9. CRM SETTINGS TABLE
-- CRM-specific configuration
-- ============================================
CREATE TABLE IF NOT EXISTS crm_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Only authenticated admin users can access CRM data
-- ============================================

-- CRM Leads
DROP POLICY IF EXISTS "Authenticated users can view leads" ON crm_leads;
CREATE POLICY "Authenticated users can view leads" ON crm_leads
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert leads" ON crm_leads;
CREATE POLICY "Authenticated users can insert leads" ON crm_leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update leads" ON crm_leads;
CREATE POLICY "Authenticated users can update leads" ON crm_leads
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete leads" ON crm_leads;
CREATE POLICY "Authenticated users can delete leads" ON crm_leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- CRM Deals (repeat for all tables)
DROP POLICY IF EXISTS "Authenticated users can manage deals" ON crm_deals;
CREATE POLICY "Authenticated users can manage deals" ON crm_deals
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage activities" ON crm_activities;
CREATE POLICY "Authenticated users can manage activities" ON crm_activities
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON crm_tasks;
CREATE POLICY "Authenticated users can manage tasks" ON crm_tasks
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage tags" ON crm_tags;
CREATE POLICY "Authenticated users can manage tags" ON crm_tags
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage notes" ON crm_notes;
CREATE POLICY "Authenticated users can manage notes" ON crm_notes
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage templates" ON crm_email_templates;
CREATE POLICY "Authenticated users can manage templates" ON crm_email_templates
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage pipeline stages" ON crm_pipeline_stages;
CREATE POLICY "Authenticated users can manage pipeline stages" ON crm_pipeline_stages
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage CRM settings" ON crm_settings;
CREATE POLICY "Authenticated users can manage CRM settings" ON crm_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Default Pipeline Stages
INSERT INTO crm_pipeline_stages (stage_name, stage_order, probability, color, description, is_closed_stage) VALUES
  ('Qualification', 1, 10, '#6366f1', 'Initial qualification of lead', FALSE),
  ('Meeting Scheduled', 2, 25, '#8b5cf6', 'Meeting or demo scheduled', FALSE),
  ('Proposal Sent', 3, 50, '#ec4899', 'Proposal or quote sent to client', FALSE),
  ('Negotiation', 4, 75, '#f59e0b', 'In active negotiation', FALSE),
  ('Closed Won', 5, 100, '#10b981', 'Successfully closed deal', TRUE),
  ('Closed Lost', 6, 0, '#ef4444', 'Deal lost', TRUE)
ON CONFLICT (stage_name) DO NOTHING;

-- Default Email Templates
INSERT INTO crm_email_templates (name, subject, body, category, variables) VALUES
  (
    'Initial Follow-up',
    'Following up on your inquiry',
    'Hi {{first_name}},\n\nThank you for reaching out to Asrivo Tech! I wanted to follow up on your inquiry about {{service_type}}.\n\nWould you be available for a brief call this week to discuss your needs in more detail?\n\nBest regards,\nAsrivo Tech Team',
    'follow-up',
    ARRAY['first_name', 'last_name', 'company_name', 'service_type']
  ),
  (
    'Meeting Request',
    'Let''s schedule a meeting',
    'Hi {{first_name}},\n\nI''d love to learn more about {{company_name}}''s needs and how we can help.\n\nAre you available for a 30-minute call this week? You can book a time that works for you here: [Calendar Link]\n\nLooking forward to speaking with you!\n\nBest regards,\nAsrivo Tech Team',
    'meeting-request',
    ARRAY['first_name', 'company_name']
  ),
  (
    'Proposal Sent',
    'Proposal for {{company_name}}',
    'Hi {{first_name}},\n\nAs discussed, I''ve prepared a proposal outlining how Asrivo Tech can help {{company_name}} achieve its goals.\n\nPlease review the attached proposal and let me know if you have any questions. I''m happy to jump on a call to walk through it together.\n\nBest regards,\nAsrivo Tech Team',
    'proposal',
    ARRAY['first_name', 'company_name']
  )
ON CONFLICT DO NOTHING;

-- Default CRM Settings
INSERT INTO crm_settings (key, value, description) VALUES
  ('lead_scoring_enabled', 'true', 'Enable automatic lead scoring'),
  ('auto_assignment_enabled', 'false', 'Automatically assign leads to team members'),
  ('reminder_notifications_enabled', 'true', 'Send reminder notifications for tasks'),
  ('email_integration_enabled', 'false', 'Enable email integration'),
  ('default_follow_up_days', '3', 'Default days until next follow-up'),
  ('max_contact_attempts', '5', 'Maximum contact attempts before marking as unresponsive')
ON CONFLICT (key) DO NOTHING;

-- Default Tags
INSERT INTO crm_tags (name, color, category, description) VALUES
  ('Hot Lead', '#ef4444', 'priority', 'High-priority lead requiring immediate attention'),
  ('Enterprise', '#8b5cf6', 'company-size', 'Enterprise-level opportunity'),
  ('Referral', '#10b981', 'source', 'Lead from referral'),
  ('Event', '#f59e0b', 'source', 'Lead from event or conference'),
  ('VIP', '#ec4899', 'priority', 'VIP client or high-value opportunity')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to check if task is overdue
CREATE OR REPLACE FUNCTION is_task_overdue(task_status TEXT, task_due_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN task_status != 'completed' AND task_due_date < NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all CRM tables
DROP TRIGGER IF EXISTS update_crm_leads_updated_at ON crm_leads;
CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON crm_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_deals_updated_at ON crm_deals;
CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON crm_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_activities_updated_at ON crm_activities;
CREATE TRIGGER update_crm_activities_updated_at BEFORE UPDATE ON crm_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_tasks_updated_at ON crm_tasks;
CREATE TRIGGER update_crm_tasks_updated_at BEFORE UPDATE ON crm_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_notes_updated_at ON crm_notes;
CREATE TRIGGER update_crm_notes_updated_at BEFORE UPDATE ON crm_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- View for lead pipeline summary
CREATE OR REPLACE VIEW crm_lead_pipeline_summary AS
SELECT 
  lead_status,
  COUNT(*) as lead_count,
  AVG(lead_score) as avg_score,
  COUNT(CASE WHEN priority = 'hot' THEN 1 END) as hot_leads
FROM crm_leads
WHERE lead_status NOT IN ('converted', 'lost')
GROUP BY lead_status;

-- View for deal pipeline summary
CREATE OR REPLACE VIEW crm_deal_pipeline_summary AS
SELECT 
  stage,
  COUNT(*) as deal_count,
  SUM(deal_value) as total_value,
  AVG(probability) as avg_probability,
  SUM(deal_value * probability / 100) as weighted_value
FROM crm_deals
WHERE is_active = TRUE
GROUP BY stage;

-- View for team performance
CREATE OR REPLACE VIEW crm_team_performance AS
SELECT 
  u.id as user_id,
  u.email as user_email,
  COUNT(DISTINCT l.id) as assigned_leads,
  COUNT(DISTINCT d.id) as owned_deals,
  SUM(d.deal_value) as total_deal_value,
  COUNT(DISTINCT a.id) as activities_performed,
  COUNT(DISTINCT t.id) as tasks_assigned
FROM auth.users u
LEFT JOIN crm_leads l ON l.assigned_to = u.id
LEFT JOIN crm_deals d ON d.owner_id = u.id AND d.is_active = TRUE
LEFT JOIN crm_activities a ON a.performed_by = u.id
LEFT JOIN crm_tasks t ON t.assigned_to = u.id AND t.status != 'completed'
GROUP BY u.id, u.email;

-- ============================================
-- MIGRATION HELPER: Link existing data to CRM
-- ============================================

-- Function to migrate existing contacts to CRM leads
CREATE OR REPLACE FUNCTION migrate_contacts_to_crm_leads()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  INSERT INTO crm_leads (
    first_name,
    last_name,
    email,
    phone,
    company_name,
    lead_source,
    lead_status,
    notes,
    created_at
  )
  SELECT 
    SPLIT_PART(name, ' ', 1) as first_name,
    COALESCE(SPLIT_PART(name, ' ', 2), '') as last_name,
    email,
    phone,
    company,
    'website' as lead_source,
    CASE 
      WHEN status = 'unread' THEN 'new'
      WHEN status = 'read' THEN 'contacted'
      ELSE 'qualified'
    END as lead_status,
    message as notes,
    created_at
  FROM contacts
  WHERE email NOT IN (SELECT email FROM crm_leads);
  
  GET DIAGNOSTICS migrated_count = ROW_COUNT;
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Run migration (uncomment to execute)
-- SELECT migrate_contacts_to_crm_leads();

