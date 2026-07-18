# CRM Schema Error Fix

## Issue
The original `CRM_DATABASE_SCHEMA.sql` had a generated column that wasn't compatible with PostgreSQL:
```sql
is_overdue BOOLEAN GENERATED ALWAYS AS (...) STORED
```

## Solution
Removed the generated column and implemented the overdue check in application code instead.

## Changes Made

### 1. CRM_DATABASE_SCHEMA.sql
- ✅ Removed `is_overdue` generated column from `crm_tasks` table
- ✅ Removed index on `is_overdue` column
- ✅ Added helper function `is_task_overdue()` for manual checks if needed

### 2. lib/supabase/crm-actions.ts
- ✅ Updated `getTasks()` function to calculate `is_overdue` dynamically
- ✅ Returns tasks with `is_overdue` property computed in JavaScript
- ✅ Overdue filter now uses `due_date` comparison directly

## How to Use

### Run the Fixed Schema
Now you can run `CRM_DATABASE_SCHEMA.sql` in Supabase SQL Editor without errors.

### Query Overdue Tasks
```typescript
// Get all overdue tasks
const { data } = await getTasks({ overdue: true })

// Each task will have is_overdue calculated
data.forEach(task => {
  if (task.is_overdue) {
    console.log(`Task ${task.title} is overdue!`)
  }
})
```

### Manual Check (if needed)
```sql
-- Using the helper function
SELECT *, is_task_overdue(status, due_date) as is_overdue
FROM crm_tasks
WHERE is_task_overdue(status, due_date) = TRUE;
```

## Benefits of This Approach
- ✅ Compatible with all PostgreSQL versions
- ✅ No complex generated column syntax
- ✅ More flexible - can adjust overdue logic without schema changes
- ✅ Same functionality from application perspective

## Next Steps
1. Run the fixed `CRM_DATABASE_SCHEMA.sql` in Supabase
2. Verify all tables created successfully
3. Start building CRM UI components
4. The `is_overdue` property will be automatically included in all task queries

## Testing
```typescript
// Test creating a task
const task = await createTask({
  title: 'Follow up with lead',
  due_date: '2024-01-01', // Past date
  status: 'pending'
})

// Test querying overdue tasks
const { data: overdue } = await getTasks({ overdue: true })
console.log('Overdue tasks:', overdue)
```

All fixed! Ready to run the schema. 🚀
