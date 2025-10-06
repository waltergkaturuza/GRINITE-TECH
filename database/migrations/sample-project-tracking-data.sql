-- Sample milestones for SIRTIS SAYWHAT ERP project
-- First, get the project ID (assuming it's the first project)
DO $$
DECLARE
  v_project_id UUID;
  v_milestone1_id UUID;
  v_milestone2_id UUID;
  v_milestone3_id UUID;
  v_module1_id UUID;
  v_module2_id UUID;
  v_module3_id UUID;
  v_module4_id UUID;
BEGIN
  -- Get the SIRTIS project ID
  SELECT id INTO v_project_id FROM projects WHERE title = 'SIRTIS' LIMIT 1;
  
  IF v_project_id IS NOT NULL THEN
    -- Milestone 1: Planning & Design
    INSERT INTO milestones (id, name, description, status, order_index, progress, due_date, estimated_hours, project_id)
    VALUES (
      gen_random_uuid(),
      'Planning & Design',
      'Initial planning, requirements gathering, and system design',
      'completed',
      1,
      100,
      '2025-01-15',
      80,
      v_project_id
    ) RETURNING id INTO v_milestone1_id;

    -- Milestone 2: Core Development
    INSERT INTO milestones (id, name, description, status, order_index, progress, due_date, estimated_hours, project_id)
    VALUES (
      gen_random_uuid(),
      'Core Development',
      'Building core ERP functionality and modules',
      'in_progress',
      2,
      45,
      '2025-06-30',
      400,
      v_project_id
    ) RETURNING id INTO v_milestone2_id;

    -- Milestone 3: Testing & Deployment
    INSERT INTO milestones (id, name, description, status, order_index, progress, due_date, estimated_hours, project_id)
    VALUES (
      gen_random_uuid(),
      'Testing & Deployment',
      'Quality assurance, testing, and production deployment',
      'not_started',
      3,
      0,
      '2025-10-30',
      120,
      v_project_id
    ) RETURNING id INTO v_milestone3_id;

    -- Modules for Milestone 2: Core Development
    -- Module 1: User Management
    INSERT INTO modules (id, name, description, status, order_index, progress, estimated_hours, milestone_id)
    VALUES (
      gen_random_uuid(),
      'User Management',
      'User authentication, roles, and permissions',
      'completed',
      1,
      100,
      60,
      v_milestone2_id
    ) RETURNING id INTO v_module1_id;

    -- Module 2: Dashboard & Analytics
    INSERT INTO modules (id, name, description, status, order_index, progress, estimated_hours, milestone_id)
    VALUES (
      gen_random_uuid(),
      'Dashboard & Analytics',
      'Real-time analytics and reporting dashboard',
      'in_progress',
      2,
      70,
      80,
      v_milestone2_id
    ) RETURNING id INTO v_module2_id;

    -- Module 3: Inventory Management
    INSERT INTO modules (id, name, description, status, order_index, progress, estimated_hours, milestone_id)
    VALUES (
      gen_random_uuid(),
      'Inventory Management',
      'Product catalog, stock tracking, and warehouse management',
      'in_progress',
      3,
      40,
      120,
      v_milestone2_id
    ) RETURNING id INTO v_module3_id;

    -- Module 4: Financial Module
    INSERT INTO modules (id, name, description, status, order_index, progress, estimated_hours, milestone_id)
    VALUES (
      gen_random_uuid(),
      'Financial Module',
      'Accounting, invoicing, and financial reporting',
      'not_started',
      4,
      0,
      140,
      v_milestone2_id
    ) RETURNING id INTO v_module4_id;

    -- Features for Module 1: User Management (all completed)
    INSERT INTO features (name, description, status, priority, order_index, is_completed, estimated_hours, module_id)
    VALUES
      ('Login System', 'Email/password authentication with JWT', 'completed', 'critical', 1, true, 10, v_module1_id),
      ('User Registration', 'New user signup with email verification', 'completed', 'high', 2, true, 8, v_module1_id),
      ('Role-Based Access', 'Admin, Developer, Client roles with permissions', 'completed', 'critical', 3, true, 15, v_module1_id),
      ('Password Reset', 'Forgot password and reset functionality', 'completed', 'high', 4, true, 6, v_module1_id),
      ('Profile Management', 'User profile editing and avatar upload', 'completed', 'medium', 5, true, 8, v_module1_id);

    -- Features for Module 2: Dashboard & Analytics (some completed)
    INSERT INTO features (name, description, status, priority, order_index, is_completed, estimated_hours, module_id)
    VALUES
      ('Revenue Charts', 'Monthly revenue and growth charts', 'completed', 'high', 1, true, 12, v_module2_id),
      ('Project Statistics', 'Active projects and completion rates', 'completed', 'high', 2, true, 10, v_module2_id),
      ('User Activity Log', 'Track user actions and system events', 'in_progress', 'medium', 3, false, 15, v_module2_id),
      ('Export Reports', 'PDF and Excel report generation', 'not_started', 'medium', 4, false, 20, v_module2_id),
      ('Custom Widgets', 'Drag-and-drop dashboard customization', 'not_started', 'low', 5, false, 25, v_module2_id);

    -- Features for Module 3: Inventory Management (mixed)
    INSERT INTO features (name, description, status, priority, order_index, is_completed, estimated_hours, module_id)
    VALUES
      ('Product Catalog', 'Create and manage product listings', 'completed', 'critical', 1, true, 20, v_module3_id),
      ('Stock Tracking', 'Real-time inventory levels and alerts', 'in_progress', 'critical', 2, false, 25, v_module3_id),
      ('Barcode Scanner', 'Mobile barcode scanning for inventory', 'not_started', 'high', 3, false, 18, v_module3_id),
      ('Supplier Management', 'Manage suppliers and purchase orders', 'not_started', 'high', 4, false, 22, v_module3_id),
      ('Warehouse Locations', 'Multi-warehouse and location tracking', 'not_started', 'medium', 5, false, 30, v_module3_id);

    -- Features for Module 4: Financial Module (none started)
    INSERT INTO features (name, description, status, priority, order_index, is_completed, estimated_hours, module_id)
    VALUES
      ('Invoice Generation', 'Create and send professional invoices', 'not_started', 'critical', 1, false, 25, v_module4_id),
      ('Payment Tracking', 'Track payments and outstanding balances', 'not_started', 'critical', 2, false, 20, v_module4_id),
      ('Expense Management', 'Record and categorize business expenses', 'not_started', 'high', 3, false, 18, v_module4_id),
      ('Tax Calculations', 'Automatic tax calculation and reporting', 'not_started', 'high', 4, false, 30, v_module4_id),
      ('Financial Reports', 'P&L, balance sheet, cash flow reports', 'not_started', 'high', 5, false, 35, v_module4_id),
      ('Budget Planning', 'Create and track budgets vs actuals', 'not_started', 'medium', 6, false, 25, v_module4_id);

    RAISE NOTICE 'Sample project tracking data inserted successfully!';
  ELSE
    RAISE NOTICE 'Project "SIRTIS" not found. Please create the project first.';
  END IF;
END $$;
