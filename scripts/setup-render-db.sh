#!/bin/bash

# Database Migration Script for Render.com PostgreSQL

# This script should be run after deploying to Render.com
# to initialize the database with the proper schema and sample data

echo "🚀 Starting GRANITE TECH Database Setup for Render.com..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo "Please set your Render.com PostgreSQL connection string."
    exit 1
fi

echo "✅ DATABASE_URL is configured"

# Install psql if not available (for local testing)
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql not found. Installing postgresql-client..."
    apt-get update && apt-get install -y postgresql-client
fi

# Run database schema
echo "📊 Creating database schema..."
psql $DATABASE_URL -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Failed to create database schema"
    exit 1
fi

# Run sample data insertion
echo "📝 Inserting sample data..."
psql $DATABASE_URL -f database/sample-data.sql

if [ $? -eq 0 ]; then
    echo "✅ Sample data inserted successfully"
else
    echo "❌ Failed to insert sample data"
    exit 1
fi

# Create indexes for performance
echo "🔍 Creating database indexes..."
psql $DATABASE_URL -c "
-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Chat session indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_type_timestamp ON system_metrics(metric_type, timestamp);
"

if [ $? -eq 0 ]; then
    echo "✅ Database indexes created successfully"
else
    echo "❌ Failed to create database indexes"
    exit 1
fi

echo "🎉 Database setup completed successfully!"
echo "🔗 Your GRANITE TECH system is ready to use with Render.com PostgreSQL"