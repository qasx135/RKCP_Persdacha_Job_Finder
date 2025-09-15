# API Documentation

## Authentication

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "job_seeker" | "employer"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

## Jobs

### Get Jobs
```
GET /api/jobs?page=1&limit=10&search=string&category=string&location=string&type=string
```

### Get Job by ID
```
GET /api/jobs/{id}
```

### Create Job (Employer only)
```
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "company": "string",
  "location": "string",
  "salary": "string",
  "type": "full-time" | "part-time" | "contract",
  "category": "string",
  "requirements": "string",
  "benefits": "string"
}
```

### Update Job
```
PUT /api/jobs/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### Delete Job
```
DELETE /api/jobs/{id}
Authorization: Bearer {token}
```

## Applications

### Create Application
```
POST /api/applications
Authorization: Bearer {token}
Content-Type: application/json

{
  "job_id": number,
  "message": "string"
}
```

### Get User Applications
```
GET /api/applications/my
Authorization: Bearer {token}
```

### Get Job Applications (Employer only)
```
GET /api/jobs/{jobId}/applications
Authorization: Bearer {token}
```

### Update Application Status
```
PUT /api/applications/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "pending" | "accepted" | "rejected"
}
```

## Profile

### Get Profile
```
GET /api/profile
Authorization: Bearer {token}
```

### Update Profile
```
PUT /api/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "phone": "string",
  "location": "string",
  "experience": "string",
  "skills": "string",
  "education": "string",
  "resume": "string"
}
```




