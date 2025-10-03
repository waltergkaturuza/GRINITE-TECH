-- Sample data for GRANITE TECH system

-- Insert admin user
INSERT INTO users (email, password, first_name, last_name, role, email_verified) VALUES
('admin@granite-tech.com', '$2b$10$hash_for_admin123', 'Admin', 'User', 'admin', true);

-- Insert sample clients
INSERT INTO users (email, password, first_name, last_name, company, email_verified) VALUES
('john.doe@example.com', '$2b$10$hash_for_password123', 'John', 'Doe', 'Tech Startup Inc', true),
('jane.smith@example.com', '$2b$10$hash_for_password123', 'Jane', 'Smith', 'Digital Solutions LLC', true),
('mike.johnson@example.com', '$2b$10$hash_for_password123', 'Mike', 'Johnson', 'Innovation Labs', true);

-- Insert sample products
INSERT INTO products (name, description, category, type, price, featured) VALUES
('Premium Website Template', 'Modern, responsive website template for businesses', 'Templates', 'digital', 99.99, true),
('E-commerce Starter Kit', 'Complete e-commerce solution with admin panel', 'Templates', 'digital', 299.99, true),
('Custom Web Development', 'Professional website development service', 'Services', 'service', 2999.99, false),
('Mobile App Development', 'Native and cross-platform mobile app development', 'Services', 'service', 4999.99, true),
('Business Automation Tool', 'Custom automation solution for business processes', 'Tools', 'digital', 199.99, false),
('API Integration Package', 'Third-party API integration and documentation', 'Services', 'service', 999.99, false);

-- Insert sample projects
INSERT INTO projects (client_id, name, description, status, priority, budget, progress) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com'), 
 'Company Website Redesign', 
 'Complete redesign of company website with modern UI/UX', 
 'in_progress', 'high', 5000.00, 65),

((SELECT id FROM users WHERE email = 'jane.smith@example.com'), 
 'E-commerce Platform', 
 'Custom e-commerce platform with inventory management', 
 'in_progress', 'medium', 8000.00, 30),

((SELECT id FROM users WHERE email = 'mike.johnson@example.com'), 
 'Mobile App MVP', 
 'Minimum viable product for mobile application', 
 'pending', 'urgent', 12000.00, 0);

-- Insert sample payments
INSERT INTO payments (user_id, amount, status, description) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com'), 
 1500.00, 'succeeded', 'Initial payment for website redesign'),

((SELECT id FROM users WHERE email = 'jane.smith@example.com'), 
 2400.00, 'succeeded', 'First milestone payment for e-commerce platform'),

((SELECT id FROM users WHERE email = 'mike.johnson@example.com'), 
 3600.00, 'pending', 'Initial payment for mobile app development');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com'), 
 'project_update', 'Project Progress Update', 
 'Your website redesign project is now 65% complete. The new homepage design has been approved.'),

((SELECT id FROM users WHERE email = 'jane.smith@example.com'), 
 'payment_received', 'Payment Received', 
 'Thank you for your payment of $2,400.00. Your e-commerce platform development continues.'),

((SELECT id FROM users WHERE email = 'mike.johnson@example.com'), 
 'project_started', 'Project Started', 
 'Your mobile app MVP project has been scheduled and will begin next week.');

-- Insert sample system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_unit) VALUES
('active_projects', 3, 'count'),
('total_revenue', 7500.00, 'USD'),
('client_satisfaction', 4.8, 'rating'),
('average_project_duration', 45, 'days'),
('server_uptime', 99.9, 'percentage');