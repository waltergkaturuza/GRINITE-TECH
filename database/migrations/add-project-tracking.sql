-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  order_index INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  due_date DATE,
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  project_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  order_index INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  milestone_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
);

-- Create features table
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  priority VARCHAR(50) DEFAULT 'medium',
  order_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  module_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_modules_milestone_id ON modules(milestone_id);
CREATE INDEX idx_modules_status ON modules(status);
CREATE INDEX idx_features_module_id ON features(module_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_features_is_completed ON features(is_completed);
