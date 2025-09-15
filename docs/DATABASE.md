# Database Schema

## Tables

### users
- `id` (primary key)
- `email` (unique, not null)
- `password` (hashed, not null)
- `name` (not null)
- `role` (default: 'job_seeker')
- `created_at`
- `updated_at`
- `deleted_at` (soft delete)

### user_profiles
- `id` (primary key)
- `user_id` (foreign key to users)
- `phone`
- `location`
- `experience`
- `skills`
- `education`
- `resume`
- `created_at`
- `updated_at`
- `deleted_at` (soft delete)

### jobs
- `id` (primary key)
- `title` (not null)
- `description`
- `company` (not null)
- `location`
- `salary`
- `type` (full-time, part-time, contract)
- `category`
- `requirements`
- `benefits`
- `employer_id` (foreign key to users)
- `is_active` (default: true)
- `created_at`
- `updated_at`
- `deleted_at` (soft delete)

### job_applications
- `id` (primary key)
- `job_id` (foreign key to jobs)
- `user_id` (foreign key to users)
- `status` (default: 'pending')
- `message`
- `created_at`
- `updated_at`
- `deleted_at` (soft delete)

## Relationships

- User has one UserProfile
- User has many Jobs (as employer)
- User has many JobApplications (as applicant)
- Job belongs to User (employer)
- Job has many JobApplications
- JobApplication belongs to Job and User




