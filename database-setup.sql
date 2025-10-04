-- GRANITE TECH Database Schema Creation
-- Run this in your Neon database SQL console

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  "firstName" VARCHAR NOT NULL,
  "lastName" VARCHAR NOT NULL,
  phone VARCHAR,
  company VARCHAR,
  role TEXT DEFAULT 'client',
  status TEXT DEFAULT 'active',
  avatar VARCHAR,
  "emailVerified" BOOLEAN DEFAULT false,
  "twoFactorSecret" VARCHAR,
  "twoFactorEnabled" BOOLEAN DEFAULT false,
  "lastLoginAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  "startDate" DATE,
  "endDate" DATE,
  budget DECIMAL(10,2),
  "clientId" UUID REFERENCES users(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR,
  "imageUrl" VARCHAR,
  "inStock" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  "stripePaymentId" VARCHAR,
  "userId" UUID REFERENCES users(id),
  "projectId" UUID REFERENCES projects(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionId" VARCHAR UNIQUE NOT NULL,
  "userId" UUID REFERENCES users(id),
  messages JSONB DEFAULT '[]',
  "lastMessageAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create admin user (password is bcrypt hash of 'GraniteTech2024!')
-- You'll need to replace this hash with a proper bcrypt hash
INSERT INTO users (
  email, 
  password, 
  "firstName", 
  "lastName", 
  phone, 
  company, 
  role, 
  status, 
  "emailVerified", 
  "twoFactorEnabled"
) VALUES (
  'admin@granitetech.com',
  '$2b$12$dummy.hash.replace.with.real.bcrypt.hash.of.GraniteTech2024!',
  'System',
  'Administrator',
  '+1234567890',
  'GRANITE TECH',
  'ADMIN',
  'ACTIVE',
  true,
  false
) ON CONFLICT (email) DO NOTHING;

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;