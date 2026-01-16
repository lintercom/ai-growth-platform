-- PostgreSQL Storage Adapter Migrations

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(255) PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE TABLE IF NOT EXISTS runs (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_runs_project_id ON runs(project_id);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at);

CREATE TABLE IF NOT EXISTS artifacts (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  run_id VARCHAR(255) NOT NULL,
  artifact_type VARCHAR(255) NOT NULL,
  artifact_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_artifacts_project_run ON artifacts(project_id, run_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(artifact_type);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  run_id VARCHAR(255) NOT NULL,
  entry_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_log_project_run ON audit_log(project_id, run_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Update triggers

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_runs_updated_at ON runs;
CREATE TRIGGER update_runs_updated_at
  BEFORE UPDATE ON runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Event Aggregates Tables

CREATE TABLE IF NOT EXISTS daily_page_views (
  id BIGSERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  count INT DEFAULT 0,
  UNIQUE (project_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_page_views_project ON daily_page_views(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_page_views_date ON daily_page_views(date);

CREATE TABLE IF NOT EXISTS daily_funnel_steps (
  id BIGSERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  step VARCHAR(255) NOT NULL,
  count INT DEFAULT 0,
  UNIQUE (project_id, date, step)
);

CREATE INDEX IF NOT EXISTS idx_daily_funnel_steps_project ON daily_funnel_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_funnel_steps_date ON daily_funnel_steps(date);
