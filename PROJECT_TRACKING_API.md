# Project Tracking API - Quick Reference

## Complete Workflow Example

### 1. Create Project
```bash
POST /api/v1/projects
{
  "title": "E-Commerce Platform",
  "description": "Full-featured online store",
  "type": "website",
  "budget": 15000,
  "clientId": "client-uuid"
}
```

### 2. Add Milestones

```bash
# Milestone 1
POST /api/v1/milestones
{
  "name": "Phase 1: Foundation",
  "description": "Setup infrastructure and core features",
  "projectId": "project-uuid",
  "dueDate": "2025-03-31",
  "estimatedHours": 160,
  "orderIndex": 1
}

# Milestone 2
POST /api/v1/milestones
{
  "name": "Phase 2: Features",
  "description": "Build main functionality",
  "projectId": "project-uuid",
  "dueDate": "2025-06-30",
  "estimatedHours": 320,
  "orderIndex": 2
}
```

### 3. Add Modules

```bash
# Module for Authentication
POST /api/v1/modules
{
  "name": "Authentication System",
  "description": "User login, registration, password reset",
  "milestoneId": "milestone-1-uuid",
  "estimatedHours": 40,
  "orderIndex": 1
}

# Module for Product Catalog
POST /api/v1/modules
{
  "name": "Product Catalog",
  "description": "Product listings, categories, search",
  "milestoneId": "milestone-2-uuid",
  "estimatedHours": 80,
  "orderIndex": 1
}
```

### 4. Add Features

```bash
# Feature 1
POST /api/v1/features
{
  "name": "User Registration",
  "description": "Email signup with verification",
  "moduleId": "module-uuid",
  "priority": "critical",
  "estimatedHours": 8,
  "orderIndex": 1
}

# Feature 2
POST /api/v1/features
{
  "name": "Login with Google",
  "description": "OAuth2 Google authentication",
  "moduleId": "module-uuid",
  "priority": "high",
  "estimatedHours": 6,
  "orderIndex": 2
}
```

### 5. Work on Features

```bash
# Mark as in progress
PATCH /api/v1/features/feature-uuid
{
  "status": "in_progress"
}

# Add notes while working
PATCH /api/v1/features/feature-uuid
{
  "notes": "Blocked: Need client approval on email templates"
}

# Mark as complete ✅
PATCH /api/v1/features/feature-uuid/toggle
{
  "isCompleted": true
}

# Update actual time spent
PATCH /api/v1/features/feature-uuid
{
  "actualHours": 10
}
```

### 6. Update Progress

```bash
# Recalculate module progress from features
PATCH /api/v1/modules/module-uuid/progress

# Recalculate milestone progress from modules
PATCH /api/v1/milestones/milestone-uuid/progress
```

### 7. View Progress

```bash
# Get all milestones with nested data
GET /api/v1/milestones?projectId=project-uuid

Response:
[
  {
    "id": "milestone-uuid",
    "name": "Phase 1: Foundation",
    "status": "in_progress",
    "progress": 75,
    "modules": [
      {
        "id": "module-uuid",
        "name": "Authentication System",
        "progress": 75,
        "features": [
          {
            "id": "feature-uuid",
            "name": "User Registration",
            "isCompleted": true
          },
          {
            "id": "feature-uuid-2",
            "name": "Login with Google",
            "isCompleted": true
          },
          {
            "id": "feature-uuid-3",
            "name": "Password Reset",
            "isCompleted": false
          }
        ]
      }
    ]
  }
]
```

## Status Values

### Milestone/Module/Feature Status
- `not_started` - Not yet begun
- `in_progress` - Currently working on it
- `completed` - Finished
- `blocked` - Waiting on something

### Feature Priority
- `low` - Nice to have
- `medium` - Should have
- `high` - Must have soon
- `critical` - Must have now

## Filtering

```bash
# Get milestones for specific project
GET /api/v1/milestones?projectId=xxx

# Get modules for specific milestone
GET /api/v1/modules?milestoneId=xxx

# Get features for specific module
GET /api/v1/features?moduleId=xxx
```

## Bulk Operations Example

```javascript
// Create complete structure in one flow
async function setupProjectTracking(projectId) {
  // 1. Create milestone
  const milestone = await api.post('/milestones', {
    name: 'Sprint 1',
    projectId,
    dueDate: '2025-02-28'
  });
  
  // 2. Create modules
  const authModule = await api.post('/modules', {
    name: 'Authentication',
    milestoneId: milestone.id,
    estimatedHours: 40
  });
  
  // 3. Create features
  const features = [
    'User Registration',
    'Login System',
    'Password Reset',
    'OAuth Integration'
  ];
  
  for (const featureName of features) {
    await api.post('/features', {
      name: featureName,
      moduleId: authModule.id,
      priority: 'high'
    });
  }
  
  // 4. Calculate progress
  await api.patch(`/modules/${authModule.id}/progress`);
  await api.patch(`/milestones/${milestone.id}/progress`);
}
```

## Progress Calculation Logic

```javascript
// Feature level (manual checkbox)
feature.isCompleted = true/false

// Module level (auto-calculated)
module.progress = (completedFeatures / totalFeatures) × 100

// Milestone level (auto-calculated)
milestone.progress = average of all module.progress

// Project level (auto-calculated in future)
project.completionPercentage = average of all milestone.progress
```

## Common Workflows

### Daily Development Workflow
```bash
# 1. Get your assigned features
GET /api/v1/features?moduleId=xxx&status=in_progress

# 2. Start working on a feature
PATCH /api/v1/features/feature-id
{ "status": "in_progress" }

# 3. Complete the feature
PATCH /api/v1/features/feature-id/toggle
{ "isCompleted": true }

# 4. Update progress
PATCH /api/v1/modules/module-id/progress
PATCH /api/v1/milestones/milestone-id/progress
```

### Client Demo Workflow
```bash
# Get overview of all milestones
GET /api/v1/milestones?projectId=xxx

# Show completed features in demo
GET /api/v1/features?moduleId=xxx
  filter by isCompleted=true

# Update status after demo
PATCH /api/v1/milestones/milestone-id
{
  "status": "completed",
  "actualHours": 165
}
```

### Sprint Planning Workflow
```bash
# 1. Create new sprint milestone
POST /api/v1/milestones
{
  "name": "Sprint 5",
  "dueDate": "2025-03-15",
  "estimatedHours": 80
}

# 2. Create modules for sprint
POST /api/v1/modules
{
  "name": "Payment Integration",
  "milestoneId": "sprint-5-uuid"
}

# 3. Break down into features
POST /api/v1/features (multiple)
- Stripe Setup
- Payment Forms
- Webhook Handling
- Receipt Generation

# 4. Assign priorities
PATCH /api/v1/features/xxx { "priority": "critical" }
PATCH /api/v1/features/yyy { "priority": "high" }
```

## Error Responses

```json
// 404 - Not Found
{
  "statusCode": 404,
  "message": "Milestone not found"
}

// 403 - Forbidden (wrong role)
{
  "statusCode": 403,
  "message": "Forbidden resource"
}

// 400 - Bad Request
{
  "statusCode": 400,
  "message": ["projectId must be a string"],
  "error": "Bad Request"
}
```

## Tips

1. **Use orderIndex**: Set orderIndex to control display order
2. **Be consistent**: Update progress after checking features
3. **Add descriptions**: Help team understand what each item is
4. **Track time**: Compare estimated vs actual hours
5. **Use status**: Mark items as blocked if waiting on something
6. **Priorities matter**: Use them for sorting and focus

---

**Base URL:** `https://grinite-tech.onrender.com/api/v1`

**Authentication:** Include `Authorization: Bearer <token>` header
