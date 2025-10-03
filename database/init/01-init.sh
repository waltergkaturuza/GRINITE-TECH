#!/bin/bash
set -e

# Initialize the GRANITE TECH database
echo "🗄️  Initializing GRANITE TECH database..."

# Create the main database schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \i /docker-entrypoint-initdb.d/schema.sql
EOSQL

echo "✅ Database schema created successfully"

# Insert sample data if in development mode
if [ "$NODE_ENV" = "development" ]; then
    echo "🌱 Inserting sample data for development..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        \i /docker-entrypoint-initdb.d/sample-data.sql
EOSQL
    echo "✅ Sample data inserted successfully"
fi

echo "🚀 Database initialization complete!"