#!/bin/bash

# Database Migration Script for Project Tracking
# This script runs the SQL migrations to create the new tables

echo "🗄️  Running Project Tracking Database Migrations..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please set it like:"
  echo "export DATABASE_URL='postgresql://user:pass@host/db'"
  exit 1
fi

echo "📡 Connecting to database..."
echo ""

# Run the migration
psql "$DATABASE_URL" <<EOF
-- Create tables
\i database/migrations/add-project-tracking.sql

-- Add sample data (optional - comment out if you don't want sample data)
\i database/migrations/sample-project-tracking-data.sql

-- Verify tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('milestones', 'modules', 'features')
ORDER BY table_name;

EOF

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "📊 Tables created:"
  echo "  - milestones"
  echo "  - modules"  
  echo "  - features"
  echo ""
  echo "🎉 Your project tracking system is ready!"
  echo ""
  echo "Next steps:"
  echo "1. Render will auto-deploy the backend (~2-3 minutes)"
  echo "2. Test the API: curl https://grinite-tech.onrender.com/api/v1/milestones"
  echo "3. Check the guides: PROJECT_TRACKING_GUIDE.md"
else
  echo ""
  echo "❌ Migration failed. Please check the error messages above."
  exit 1
fi
