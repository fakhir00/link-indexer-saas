# IndexFlow SaaS - Complete API Documentation

## Base URL
```
Production: https://api.indexflow.io/v1
Development: http://localhost:3000/api/v1
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Register User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp"
}

Response (201):
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "role": "user",
  "credits": 100,
  "createdAt": "2026-05-08T10:30:00Z",
  "accessToken": "eyJhbGc...",
  "refreshToken": "rt_xyz789"
}
```

### 2. Login
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "accessToken": "eyJhbGc...",
  "refreshToken": "rt_xyz789",
  "expiresIn": 3600
}
```

### 3. Refresh Token
```
POST /auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "rt_xyz789"
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "rt_new456",
  "expiresIn": 3600
}
```

### 4. Logout
```
POST /auth/logout
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Logged out successfully"
}
```

### 5. Verify Email Token
```
POST /auth/verify-email
Content-Type: application/json

Request Body:
{
  "token": "email_verification_token_123"
}

Response (200):
{
  "message": "Email verified successfully",
  "user": {
    "id": "usr_123abc",
    "emailVerified": true
  }
}
```

### 6. Resend Verification Email
```
POST /auth/resend-verification
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Verification email sent"
}
```

### 7. Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "Password reset link sent to email"
}
```

### 8. Reset Password
```
POST /auth/reset-password
Content-Type: application/json

Request Body:
{
  "token": "reset_token_123",
  "newPassword": "NewSecurePass456!"
}

Response (200):
{
  "message": "Password reset successfully"
}
```

### 9. Change Password
```
POST /auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}

Response (200):
{
  "message": "Password changed successfully"
}
```

---

## 👤 USER PROFILE ENDPOINTS

### 1. Get Current User Profile
```
GET /users/me
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "phone": "+1-555-0123",
  "avatar": "https://...",
  "role": "user",
  "credits": 450,
  "creditsUsed": 50,
  "createdAt": "2026-05-08T10:30:00Z",
  "updatedAt": "2026-05-08T15:45:00Z"
}
```

### 2. Update Profile
```
PUT /users/me
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "phone": "+1-555-0123",
  "avatar": "https://..."
}

Response (200):
{
  "id": "usr_123abc",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "phone": "+1-555-0123",
  "avatar": "https://...",
  "updatedAt": "2026-05-08T16:00:00Z"
}
```

### 3. Delete Account
```
DELETE /users/me
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "password": "SecurePass123!",
  "reason": "No longer needed"
}

Response (200):
{
  "message": "Account deleted successfully"
}
```

### 4. Get User Preferences
```
GET /users/me/preferences
Authorization: Bearer <accessToken>

Response (200):
{
  "theme": "dark",
  "emailNotifications": true,
  "dailySummary": true,
  "weeklyReport": true,
  "language": "en",
  "timezone": "UTC"
}
```

### 5. Update User Preferences
```
PUT /users/me/preferences
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "theme": "dark",
  "emailNotifications": true,
  "dailySummary": true,
  "weeklyReport": false,
  "language": "en",
  "timezone": "America/New_York"
}

Response (200):
{
  "theme": "dark",
  "emailNotifications": true,
  "dailySummary": true,
  "weeklyReport": false,
  "language": "en",
  "timezone": "America/New_York"
}
```

---

## 💳 BILLING & CREDITS ENDPOINTS

### 1. Get Credit Balance
```
GET /credits/balance
Authorization: Bearer <accessToken>

Response (200):
{
  "totalCredits": 500,
  "usedCredits": 50,
  "availableCredits": 450,
  "currency": "USD",
  "lastUpdated": "2026-05-08T16:00:00Z"
}
```

### 2. Get Credit History
```
GET /credits/history?page=1&limit=20&type=usage,purchase
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "txn_123abc",
      "type": "usage",
      "amount": -10,
      "description": "Campaign Campaign-ID-001 processed 10 URLs",
      "campaignId": "camp_001",
      "balance": 440,
      "createdAt": "2026-05-08T15:30:00Z"
    },
    {
      "id": "txn_456def",
      "type": "purchase",
      "amount": 100,
      "description": "Purchase Pro Plan",
      "paymentId": "pay_xyz789",
      "balance": 450,
      "createdAt": "2026-05-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### 3. Get Pricing Plans
```
GET /billing/plans
Authorization: Bearer <accessToken>

Response (200):
{
  "plans": [
    {
      "id": "plan_starter",
      "name": "Starter",
      "description": "Perfect for beginners",
      "price": 29,
      "currency": "USD",
      "billingCycle": "monthly",
      "creditsPerMonth": 500,
      "features": [
        "URL Submissions",
        "Basic Analytics",
        "Email Support",
        "Up to 3 Campaigns"
      ],
      "maxCampaigns": 3,
      "rateLimit": 100,
      "prioritySupport": false
    },
    {
      "id": "plan_pro",
      "name": "Pro",
      "description": "For growing businesses",
      "price": 99,
      "currency": "USD",
      "billingCycle": "monthly",
      "creditsPerMonth": 2500,
      "features": [
        "Unlimited Submissions",
        "Advanced Analytics",
        "Priority Support",
        "Unlimited Campaigns",
        "API Access"
      ],
      "maxCampaigns": -1,
      "rateLimit": 500,
      "prioritySupport": true
    },
    {
      "id": "plan_agency",
      "name": "Agency",
      "description": "For enterprises",
      "price": 299,
      "currency": "USD",
      "billingCycle": "monthly",
      "creditsPerMonth": 10000,
      "features": [
        "Everything in Pro",
        "Team Management",
        "Webhook Integration",
        "White Label",
        "Dedicated Support",
        "Custom Strategies"
      ],
      "maxCampaigns": -1,
      "rateLimit": 2000,
      "prioritySupport": true
    }
  ]
}
```

### 4. Get Current Subscription
```
GET /billing/subscription
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "sub_123abc",
  "planId": "plan_pro",
  "planName": "Pro",
  "status": "active",
  "currentPeriodStart": "2026-05-01T00:00:00Z",
  "currentPeriodEnd": "2026-06-01T00:00:00Z",
  "daysUntilRenewal": 24,
  "monthlyCredits": 2500,
  "creditsUsedThisMonth": 350,
  "creditsRemainingThisMonth": 2150,
  "autoRenew": true,
  "paymentMethodId": "pm_xyz789",
  "price": 99,
  "currency": "USD"
}
```

### 5. Subscribe to Plan
```
POST /billing/subscribe
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "planId": "plan_pro",
  "paymentMethodId": "pm_xyz789",
  "billingCycle": "monthly"
}

Response (201):
{
  "id": "sub_456def",
  "planId": "plan_pro",
  "planName": "Pro",
  "status": "active",
  "currentPeriodStart": "2026-05-08T16:30:00Z",
  "currentPeriodEnd": "2026-06-08T16:30:00Z",
  "monthlyCredits": 2500,
  "price": 99,
  "currency": "USD"
}
```

### 6. Cancel Subscription
```
POST /billing/subscription/cancel
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "reason": "No longer needed",
  "cancelImmediately": false
}

Response (200):
{
  "id": "sub_123abc",
  "status": "cancelled",
  "cancellationDate": "2026-06-08T16:30:00Z",
  "refund": {
    "amount": 0,
    "reason": "Prorated credit"
  }
}
```

### 7. Add Payment Method
```
POST /billing/payment-methods
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "type": "card",
  "cardNumber": "4242424242424242",
  "expiryMonth": 12,
  "expiryYear": 2028,
  "cvc": "123",
  "holderName": "John Doe",
  "isDefault": true
}

Response (201):
{
  "id": "pm_xyz789",
  "type": "card",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2028,
  "holderName": "John Doe",
  "isDefault": true,
  "createdAt": "2026-05-08T16:30:00Z"
}
```

### 8. List Payment Methods
```
GET /billing/payment-methods
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "pm_xyz789",
      "type": "card",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2028,
      "holderName": "John Doe",
      "isDefault": true,
      "createdAt": "2026-05-08T16:30:00Z"
    }
  ]
}
```

### 9. Delete Payment Method
```
DELETE /billing/payment-methods/:paymentMethodId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Payment method deleted successfully"
}
```

### 10. Get Invoices
```
GET /billing/invoices?page=1&limit=20&status=paid,pending
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "inv_123abc",
      "invoiceNumber": "INV-2026-0001",
      "amount": 99,
      "currency": "USD",
      "status": "paid",
      "dueDate": "2026-06-08T00:00:00Z",
      "paidAt": "2026-05-08T16:30:00Z",
      "downloadUrl": "https://...",
      "createdAt": "2026-05-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

---

## 📋 CAMPAIGN ENDPOINTS

### 1. Create Campaign
```
POST /campaigns
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "name": "Q2 2026 SEO Push",
  "description": "Submit all new blog posts",
  "tags": ["blog", "seo", "q2"],
  "strategies": ["ping", "sitemap", "api"],
  "drippingRate": 50,
  "drippingPeriod": "daily",
  "maxRetries": 3,
  "status": "draft"
}

Response (201):
{
  "id": "camp_001",
  "userId": "usr_123abc",
  "name": "Q2 2026 SEO Push",
  "description": "Submit all new blog posts",
  "tags": ["blog", "seo", "q2"],
  "strategies": ["ping", "sitemap", "api"],
  "drippingRate": 50,
  "drippingPeriod": "daily",
  "maxRetries": 3,
  "status": "draft",
  "urlCount": 0,
  "successCount": 0,
  "failureCount": 0,
  "createdAt": "2026-05-08T16:30:00Z",
  "updatedAt": "2026-05-08T16:30:00Z"
}
```

### 2. List Campaigns
```
GET /campaigns?page=1&limit=20&status=active,draft,completed&sort=-createdAt
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "camp_001",
      "userId": "usr_123abc",
      "name": "Q2 2026 SEO Push",
      "description": "Submit all new blog posts",
      "tags": ["blog", "seo", "q2"],
      "status": "active",
      "urlCount": 250,
      "successCount": 200,
      "failureCount": 10,
      "pendingCount": 40,
      "successRate": 80,
      "createdAt": "2026-05-08T16:30:00Z",
      "updatedAt": "2026-05-08T17:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### 3. Get Campaign Details
```
GET /campaigns/:campaignId
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "camp_001",
  "userId": "usr_123abc",
  "name": "Q2 2026 SEO Push",
  "description": "Submit all new blog posts",
  "tags": ["blog", "seo", "q2"],
  "strategies": ["ping", "sitemap", "api"],
  "drippingRate": 50,
  "drippingPeriod": "daily",
  "maxRetries": 3,
  "status": "active",
  "urlCount": 250,
  "successCount": 200,
  "failureCount": 10,
  "pendingCount": 40,
  "successRate": 80,
  "processingSpeed": "12.5 URLs/min",
  "timeToDiscovery": "2-4 hours",
  "creditsUsed": 250,
  "createdAt": "2026-05-08T16:30:00Z",
  "updatedAt": "2026-05-08T17:00:00Z",
  "startedAt": "2026-05-08T17:00:00Z",
  "completedAt": null
}
```

### 4. Update Campaign
```
PUT /campaigns/:campaignId
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "name": "Q2 2026 SEO Push - Updated",
  "description": "Submit all new blog posts and landing pages",
  "tags": ["blog", "seo", "q2", "lp"],
  "drippingRate": 75,
  "drippingPeriod": "daily"
}

Response (200):
{
  "id": "camp_001",
  "name": "Q2 2026 SEO Push - Updated",
  "description": "Submit all new blog posts and landing pages",
  "tags": ["blog", "seo", "q2", "lp"],
  "drippingRate": 75,
  "drippingPeriod": "daily",
  "updatedAt": "2026-05-08T17:15:00Z"
}
```

### 5. Delete Campaign
```
DELETE /campaigns/:campaignId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Campaign deleted successfully",
  "id": "camp_001"
}
```

### 6. Pause Campaign
```
POST /campaigns/:campaignId/pause
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "camp_001",
  "status": "paused",
  "pausedAt": "2026-05-08T17:15:00Z"
}
```

### 7. Resume Campaign
```
POST /campaigns/:campaignId/resume
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "camp_001",
  "status": "active",
  "resumedAt": "2026-05-08T17:15:00Z"
}
```

### 8. Get Campaign Analytics
```
GET /campaigns/:campaignId/analytics?period=7d,30d,all
Authorization: Bearer <accessToken>

Response (200):
{
  "campaignId": "camp_001",
  "period": "7d",
  "metrics": {
    "totalUrls": 250,
    "submitted": 200,
    "success": 160,
    "failed": 40,
    "pending": 50,
    "successRate": 64,
    "failureRate": 16,
    "pendingRate": 20,
    "creditsUsed": 250,
    "creditsPerUrl": 1,
    "averageProcessingTime": "45 minutes",
    "urls": {
      "queued": 0,
      "processing": 5,
      "submitted": 150,
      "crawled": 45,
      "failed": 40,
      "retrying": 10
    }
  },
  "hourlyStats": [
    {
      "hour": "2026-05-08T10:00:00Z",
      "submitted": 25,
      "success": 20,
      "failed": 5
    }
  ],
  "strategyPerformance": {
    "ping": {
      "successRate": 75,
      "submissions": 167,
      "success": 125
    },
    "sitemap": {
      "successRate": 60,
      "submissions": 167,
      "success": 100
    },
    "api": {
      "successRate": 55,
      "submissions": 166,
      "success": 91
    }
  }
}
```

### 9. Duplicate Campaign
```
POST /campaigns/:campaignId/duplicate
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "includeUrls": true,
  "newName": "Q2 2026 SEO Push - Copy"
}

Response (201):
{
  "id": "camp_002",
  "name": "Q2 2026 SEO Push - Copy",
  "status": "draft",
  "urlCount": 250,
  "createdAt": "2026-05-08T17:20:00Z"
}
```

---

## 🔗 URL ENDPOINTS

### 1. Upload URLs (Single)
```
POST /urls/upload
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "campaignId": "camp_001",
  "url": "https://example.com/blog/new-post",
  "priority": "high",
  "tags": ["blog", "new"],
  "customMetadata": {
    "lastModified": "2026-05-08T10:00:00Z",
    "source": "wordpress"
  }
}

Response (201):
{
  "id": "url_001",
  "campaignId": "camp_001",
  "url": "https://example.com/blog/new-post",
  "priority": "high",
  "tags": ["blog", "new"],
  "status": "queued",
  "retryCount": 0,
  "maxRetries": 3,
  "creditsRequired": 1,
  "createdAt": "2026-05-08T17:20:00Z",
  "queuedAt": "2026-05-08T17:20:00Z"
}
```

### 2. Bulk Upload URLs (CSV)
```
POST /urls/bulk-upload
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Request Body (form-data):
- campaignId: "camp_001"
- file: [CSV file]
- priority: "medium" (default for all)
- tags: "blog,seo" (comma-separated, applied to all)

CSV Format:
url,priority,tags,lastModified
https://example.com/blog/post1,high,"blog,new",2026-05-08T10:00:00Z
https://example.com/blog/post2,medium,"blog",2026-05-07T10:00:00Z
https://example.com/page/landing,high,"landing,conversion",2026-05-06T10:00:00Z

Response (202):
{
  "jobId": "job_bulk_123",
  "campaignId": "camp_001",
  "status": "processing",
  "totalUrls": 150,
  "validUrls": 148,
  "invalidUrls": 2,
  "estimatedProcessingTime": "5 minutes",
  "invalidUrlsDetails": [
    {
      "row": 45,
      "url": "invalid-url",
      "reason": "Invalid URL format"
    }
  ],
  "createdAt": "2026-05-08T17:20:00Z"
}
```

### 3. List URLs in Campaign
```
GET /campaigns/:campaignId/urls?page=1&limit=50&status=queued,processing,submitted,crawled,failed,retrying&sort=-createdAt
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "url_001",
      "campaignId": "camp_001",
      "url": "https://example.com/blog/new-post",
      "priority": "high",
      "tags": ["blog", "new"],
      "status": "submitted",
      "retryCount": 1,
      "maxRetries": 3,
      "lastAttempt": "2026-05-08T17:25:00Z",
      "nextRetry": null,
      "strategiesApplied": ["ping", "sitemap"],
      "createdAt": "2026-05-08T17:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "pages": 5
  },
  "summary": {
    "total": 250,
    "queued": 10,
    "processing": 5,
    "submitted": 180,
    "crawled": 45,
    "failed": 10,
    "retrying": 0
  }
}
```

### 4. Get URL Details
```
GET /urls/:urlId
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "url_001",
  "campaignId": "camp_001",
  "url": "https://example.com/blog/new-post",
  "priority": "high",
  "tags": ["blog", "new"],
  "status": "submitted",
  "retryCount": 1,
  "maxRetries": 3,
  "creditsUsed": 1,
  "createdAt": "2026-05-08T17:20:00Z",
  "queuedAt": "2026-05-08T17:20:30Z",
  "processingStartedAt": "2026-05-08T17:21:00Z",
  "submittedAt": "2026-05-08T17:21:30Z",
  "crawledAt": null,
  "failedAt": null,
  "statusHistory": [
    {
      "status": "queued",
      "timestamp": "2026-05-08T17:20:30Z"
    },
    {
      "status": "processing",
      "timestamp": "2026-05-08T17:21:00Z"
    },
    {
      "status": "submitted",
      "timestamp": "2026-05-08T17:21:30Z"
    }
  ],
  "strategiesApplied": [
    {
      "strategy": "ping",
      "status": "success",
      "endpoint": "https://ping.example.com",
      "response": 200,
      "timestamp": "2026-05-08T17:21:15Z"
    },
    {
      "strategy": "sitemap",
      "status": "success",
      "sitemapUrl": "https://example.com/sitemap.xml",
      "timestamp": "2026-05-08T17:21:30Z"
    }
  ],
  "errors": [],
  "customMetadata": {
    "lastModified": "2026-05-08T10:00:00Z",
    "source": "wordpress"
  }
}
```

### 5. Update URL
```
PUT /urls/:urlId
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "priority": "critical",
  "tags": ["blog", "new", "urgent"]
}

Response (200):
{
  "id": "url_001",
  "priority": "critical",
  "tags": ["blog", "new", "urgent"],
  "updatedAt": "2026-05-08T17:30:00Z"
}
```

### 6. Delete URL
```
DELETE /urls/:urlId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "URL deleted successfully",
  "id": "url_001"
}
```

### 7. Retry Failed URL
```
POST /urls/:urlId/retry
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "url_001",
  "status": "queued",
  "retryCount": 2,
  "maxRetries": 3,
  "retriedAt": "2026-05-08T17:30:00Z"
}
```

### 8. Retry All Failed URLs in Campaign
```
POST /campaigns/:campaignId/retry-failed
Authorization: Bearer <accessToken>

Response (200):
{
  "campaignId": "camp_001",
  "retriedCount": 45,
  "jobId": "job_retry_001",
  "status": "queued",
  "createdAt": "2026-05-08T17:30:00Z"
}
```

### 9. Get URL Status (Public - for tracking)
```
GET /urls/status/:urlId?token=public_tracking_token
OR
GET /status/:urlId?token=public_tracking_token

Response (200):
{
  "id": "url_001",
  "url": "https://example.com/blog/new-post",
  "status": "submitted",
  "submittedAt": "2026-05-08T17:21:30Z",
  "crawledAt": null,
  "successRate": 66,
  "strategiesApplied": ["ping", "sitemap", "api"],
  "estimatedIndexingTime": "2-4 hours"
}
```

---

## 🔑 API KEY ENDPOINTS

### 1. Generate API Key
```
POST /api-keys/generate
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "name": "Production Key",
  "expiresIn": 365,
  "scopes": ["campaigns:read", "campaigns:write", "urls:read", "urls:write", "credits:read"]
}

Response (201):
{
  "id": "key_123abc",
  "name": "Production Key",
  "key": "ifx_sk_live_1234567890abcdef",
  "keyPreview": "ifx_sk_live_***cdef",
  "scopes": ["campaigns:read", "campaigns:write", "urls:read", "urls:write", "credits:read"],
  "expiresAt": "2027-05-08T17:30:00Z",
  "rateLimit": 500,
  "createdAt": "2026-05-08T17:30:00Z",
  "lastUsed": null
}
```

### 2. List API Keys
```
GET /api-keys
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "key_123abc",
      "name": "Production Key",
      "keyPreview": "ifx_sk_live_***cdef",
      "scopes": ["campaigns:read", "campaigns:write", "urls:read", "urls:write", "credits:read"],
      "expiresAt": "2027-05-08T17:30:00Z",
      "rateLimit": 500,
      "createdAt": "2026-05-08T17:30:00Z",
      "lastUsed": "2026-05-08T18:00:00Z"
    }
  ]
}
```

### 3. Revoke API Key
```
DELETE /api-keys/:keyId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "API key revoked successfully",
  "id": "key_123abc"
}
```

### 4. Rotate API Key
```
POST /api-keys/:keyId/rotate
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "key_123abc",
  "newKey": "ifx_sk_live_0987654321fedcba",
  "oldKeyExpiration": "2026-05-15T17:30:00Z",
  "message": "Old key will expire in 7 days"
}
```

### 5. Update API Key Scopes
```
PUT /api-keys/:keyId
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "scopes": ["campaigns:read", "urls:read", "credits:read"]
}

Response (200):
{
  "id": "key_123abc",
  "name": "Production Key",
  "scopes": ["campaigns:read", "urls:read", "credits:read"],
  "updatedAt": "2026-05-08T17:35:00Z"
}
```

---

## 🔌 API ENDPOINTS (Using API Key)

### 1. Create Campaign (API)
```
POST /api-key/campaigns
Authorization: Bearer <API_KEY>
Content-Type: application/json

Request Body:
{
  "name": "API Campaign",
  "description": "Created via API",
  "strategies": ["ping", "sitemap"],
  "drippingRate": 100
}

Response (201):
{
  "id": "camp_002",
  "name": "API Campaign",
  "status": "draft"
}
```

### 2. Add URLs via API
```
POST /api-key/urls
Authorization: Bearer <API_KEY>
Content-Type: application/json

Request Body:
{
  "campaignId": "camp_002",
  "urls": [
    {
      "url": "https://example.com/api-post-1",
      "priority": "high"
    },
    {
      "url": "https://example.com/api-post-2",
      "priority": "medium"
    }
  ]
}

Response (202):
{
  "jobId": "job_api_001",
  "addedUrls": 2,
  "campaignId": "camp_002",
  "status": "processing"
}
```

### 3. Get Campaign Status (API)
```
GET /api-key/campaigns/:campaignId
Authorization: Bearer <API_KEY>

Response (200):
{
  "id": "camp_002",
  "name": "API Campaign",
  "status": "active",
  "urlCount": 100,
  "successCount": 85,
  "failureCount": 10,
  "pendingCount": 5,
  "successRate": 85
}
```

### 4. Get URL Status (API)
```
GET /api-key/urls/:urlId
Authorization: Bearer <API_KEY>

Response (200):
{
  "id": "url_001",
  "url": "https://example.com/api-post-1",
  "status": "submitted",
  "submittedAt": "2026-05-08T17:40:00Z"
}
```

---

## 🎣 WEBHOOK ENDPOINTS (OUTBOUND)

### Webhook Event: URL Status Changed
```
POST <YOUR_WEBHOOK_URL>
Headers:
  X-IndexFlow-Signature: sha256=...
  X-IndexFlow-Timestamp: 2026-05-08T17:45:00Z
  Content-Type: application/json

Body:
{
  "event": "url.status_changed",
  "data": {
    "id": "url_001",
    "campaignId": "camp_001",
    "url": "https://example.com/blog/new-post",
    "oldStatus": "processing",
    "newStatus": "submitted",
    "timestamp": "2026-05-08T17:45:00Z"
  },
  "timestamp": 1714176300,
  "signature": "sha256=..."
}
```

### Webhook Event: Campaign Completed
```
POST <YOUR_WEBHOOK_URL>

Body:
{
  "event": "campaign.completed",
  "data": {
    "id": "camp_001",
    "name": "Q2 2026 SEO Push",
    "totalUrls": 250,
    "successCount": 200,
    "failureCount": 10,
    "pendingCount": 40,
    "successRate": 80,
    "completedAt": "2026-05-08T20:00:00Z"
  }
}
```

### Webhook Event: Credits Low Warning
```
POST <YOUR_WEBHOOK_URL>

Body:
{
  "event": "credits.low_balance",
  "data": {
    "userId": "usr_123abc",
    "currentCredits": 50,
    "threshold": 100,
    "timestamp": "2026-05-08T17:45:00Z"
  }
}
```

---

## 👨‍💼 ADMIN ENDPOINTS

### 1. Get All Users (Admin)
```
GET /admin/users?page=1&limit=50&sort=-createdAt&search=email
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "usr_123abc",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp",
      "role": "user",
      "status": "active",
      "credits": 450,
      "totalSpent": 200,
      "campaignCount": 5,
      "urlCount": 1250,
      "lastLogin": "2026-05-08T16:00:00Z",
      "createdAt": "2026-05-08T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

### 2. Get User Details (Admin)
```
GET /admin/users/:userId
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "role": "user",
  "status": "active",
  "credits": 450,
  "creditsUsed": 50,
  "subscriptionId": "sub_123abc",
  "subscriptionPlan": "pro",
  "apiKeysCount": 3,
  "campaignCount": 5,
  "totalUrlsSubmitted": 1250,
  "successRate": 85,
  "createdAt": "2026-05-08T10:30:00Z",
  "lastLogin": "2026-05-08T16:00:00Z"
}
```

### 3. Suspend/Ban User (Admin)
```
POST /admin/users/:userId/suspend
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "reason": "Spam/Abuse detected",
  "duration": 7,
  "notifyUser": true
}

Response (200):
{
  "id": "usr_123abc",
  "status": "suspended",
  "suspendedUntil": "2026-05-15T17:45:00Z",
  "reason": "Spam/Abuse detected"
}
```

### 4. Unsuspend User (Admin)
```
POST /admin/users/:userId/unsuspend
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "usr_123abc",
  "status": "active"
}
```

### 5. Add Credits (Admin)
```
POST /admin/users/:userId/credits
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "amount": 1000,
  "reason": "Promotional credits",
  "expiresAt": "2026-12-31T23:59:59Z"
}

Response (200):
{
  "id": "usr_123abc",
  "previousCredits": 450,
  "addedCredits": 1000,
  "newCredits": 1450,
  "transactionId": "txn_admin_001"
}
```

### 6. Get System Health (Admin)
```
GET /admin/health
Authorization: Bearer <accessToken>

Response (200):
{
  "status": "healthy",
  "timestamp": "2026-05-08T17:45:00Z",
  "services": {
    "database": {
      "status": "operational",
      "responseTime": "45ms"
    },
    "redis": {
      "status": "operational",
      "memoryUsage": "65%"
    },
    "queue": {
      "status": "operational",
      "pendingJobs": 1250,
      "activeJobs": 45,
      "failedJobs": 12
    },
    "storage": {
      "status": "operational",
      "diskUsage": "42%"
    }
  }
}
```

### 7. Get Queue Statistics (Admin)
```
GET /admin/queue/stats
Authorization: Bearer <accessToken>

Response (200):
{
  "overview": {
    "totalPendingJobs": 5432,
    "totalActiveJobs": 120,
    "totalCompletedJobs": 450000,
    "totalFailedJobs": 1250,
    "averageProcessingTime": "2.5 minutes"
  },
  "byJobType": {
    "url_processing": {
      "pending": 4800,
      "active": 100,
      "failed": 800
    },
    "bulk_upload": {
      "pending": 300,
      "active": 10,
      "failed": 150
    },
    "analytics_calculation": {
      "pending": 332,
      "active": 10,
      "failed": 300
    }
  },
  "throughput": {
    "jobsPerMinute": 120,
    "successRate": 98.5,
    "failureRate": 1.5
  }
}
```

### 8. Manually Process Job (Admin)
```
POST /admin/queue/jobs/:jobId/process
Authorization: Bearer <accessToken>

Response (200):
{
  "jobId": "job_123abc",
  "status": "processing",
  "processedAt": "2026-05-08T17:45:00Z"
}
```

### 9. View System Logs (Admin)
```
GET /admin/logs?level=error,warning&page=1&limit=100&since=2026-05-01
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "timestamp": "2026-05-08T17:45:00Z",
      "level": "error",
      "service": "url_processor",
      "message": "Failed to submit URL",
      "details": {
        "urlId": "url_001",
        "error": "Timeout after 30s"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5430,
    "pages": 55
  }
}
```

### 10. Get Revenue Analytics (Admin)
```
GET /admin/analytics/revenue?period=monthly&from=2026-01-01&to=2026-05-08
Authorization: Bearer <accessToken>

Response (200):
{
  "period": "2026-01-01 to 2026-05-08",
  "totalRevenue": 45000,
  "currency": "USD",
  "breakdown": {
    "subscriptions": 35000,
    "oneTimeCredits": 10000
  },
  "byPlan": {
    "starter": 8000,
    "pro": 22000,
    "agency": 15000
  },
  "chartData": [
    {
      "date": "2026-05-01",
      "revenue": 3500,
      "newSubscriptions": 25,
      "churnedSubscriptions": 5
    }
  ],
  "metrics": {
    "mrr": 8500,
    "arr": 102000,
    "activeSubscriptions": 145,
    "churnRate": 2.5
  }
}
```

---

## 📊 DASHBOARD ANALYTICS ENDPOINTS

### 1. Get Dashboard Overview
```
GET /dashboard/overview
Authorization: Bearer <accessToken>

Response (200):
{
  "summary": {
    "totalUrls": 5432,
    "successRate": 82.5,
    "failureRate": 5.2,
    "pendingRate": 12.3,
    "creditsUsed": 5432,
    "creditsRemaining": 7568
  },
  "activeCampaigns": 3,
  "totalCampaigns": 12,
  "recentActivity": [
    {
      "type": "campaign_created",
      "campaign": "Q2 2026 SEO Push",
      "timestamp": "2026-05-08T17:00:00Z"
    },
    {
      "type": "urls_uploaded",
      "count": 150,
      "campaign": "Q2 2026 SEO Push",
      "timestamp": "2026-05-08T16:30:00Z"
    }
  ]
}
```

### 2. Get Performance Metrics
```
GET /dashboard/metrics?period=7d,30d,all
Authorization: Bearer <accessToken>

Response (200):
{
  "period": "7d",
  "metrics": {
    "urlsProcessed": 1250,
    "successCount": 1032,
    "failureCount": 65,
    "averageProcessingTime": "45 minutes",
    "peakProcessingRate": "250 URLs/hour",
    "creditsUsed": 1250,
    "costPerUrl": 0.01
  },
  "dailyBreakdown": [
    {
      "date": "2026-05-08",
      "urlsProcessed": 180,
      "successCount": 150,
      "failureCount": 30
    }
  ]
}
```

---

## 🌐 INTEGRATION ENDPOINTS

### 1. Get Available Integrations
```
GET /integrations
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "integration_webhook",
      "name": "Webhooks",
      "description": "Receive real-time notifications",
      "status": "configured",
      "configured": true
    },
    {
      "id": "integration_slack",
      "name": "Slack",
      "description": "Get notifications in Slack",
      "status": "available",
      "configured": false
    }
  ]
}
```

### 2. Configure Webhook
```
POST /integrations/webhooks
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "url": "https://example.com/webhooks/indexflow",
  "events": ["url.status_changed", "campaign.completed"],
  "active": true
}

Response (201):
{
  "id": "hook_123abc",
  "url": "https://example.com/webhooks/indexflow",
  "events": ["url.status_changed", "campaign.completed"],
  "active": true,
  "secret": "whsec_1234567890abcdef",
  "createdAt": "2026-05-08T17:50:00Z"
}
```

### 3. Test Webhook
```
POST /integrations/webhooks/:webhookId/test
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "statusCode": 200,
  "responseTime": "234ms",
  "message": "Webhook delivered successfully"
}
```

---

## 🔍 SEARCH & FILTER ENDPOINTS

### 1. Search Campaigns
```
GET /search/campaigns?q=Q2+2026&status=active&tags=seo
Authorization: Bearer <accessToken>

Response (200):
{
  "results": [
    {
      "id": "camp_001",
      "name": "Q2 2026 SEO Push",
      "status": "active",
      "urlCount": 250,
      "successRate": 85
    }
  ]
}
```

### 2. Search URLs
```
GET /search/urls?q=https://example.com&status=failed&campaignId=camp_001
Authorization: Bearer <accessToken>

Response (200):
{
  "results": [
    {
      "id": "url_001",
      "url": "https://example.com/blog",
      "status": "failed",
      "campaignId": "camp_001"
    }
  ]
}
```

---

## ✅ VALIDATION RULES & ERROR HANDLING

### Common HTTP Status Codes:
- **200 OK**: Successful GET request
- **201 Created**: Successful POST request (resource created)
- **202 Accepted**: Request accepted for processing (async)
- **204 No Content**: Successful DELETE/empty response
- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: User lacks permission
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflict (e.g., duplicate)
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service under maintenance

### Error Response Format:
```json
{
  "error": {
    "code": "INVALID_URL_FORMAT",
    "message": "The provided URL format is invalid",
    "details": {
      "field": "url",
      "value": "not-a-url"
    },
    "timestamp": "2026-05-08T17:50:00Z",
    "requestId": "req_123abc"
  }
}
```

### Rate Limiting Headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1714176300
```

---

## 📝 AUTHENTICATION METHODS

### 1. Bearer Token (Access Token)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 2. API Key
```
Authorization: Bearer ifx_sk_live_1234567890abcdef
OR
X-API-Key: ifx_sk_live_1234567890abcdef
```

### 3. Public Token (for public status tracking)
```
?token=public_tracking_token_123
```

---

## 🎯 KEY API FEATURES

### Pagination
All list endpoints support:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Sorting
- `sort=field` (ascending)
- `sort=-field` (descending)

### Filtering
Use query parameters:
- `status=value`
- `tags=tag1,tag2`
- `dateFrom=2026-05-01`
- `dateTo=2026-05-08`

### Expansion
Include related data:
- `?expand=user,campaign` (includes user and campaign details)

---

## 🚀 RATE LIMITS

| Plan | Requests/Hour | Concurrent Requests | Burst |
|------|---------------|-------------------|-------|
| Starter | 500 | 10 | 50 |
| Pro | 5,000 | 50 | 250 |
| Agency | Unlimited | 200 | Unlimited |

---

## 📚 EXAMPLE USE CASES

### Use Case 1: Submit URLs via API
```bash
curl -X POST https://api.indexflow.io/v1/urls \
  -H "Authorization: Bearer ifx_sk_live_key" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp_001",
    "urls": [
      {"url": "https://example.com/page1"},
      {"url": "https://example.com/page2"}
    ]
  }'
```

### Use Case 2: Check Campaign Status
```bash
curl https://api.indexflow.io/v1/campaigns/camp_001 \
  -H "Authorization: Bearer eyJhbGc..."
```

### Use Case 3: Download Invoices
```bash
curl https://api.indexflow.io/v1/billing/invoices/inv_123/download \
  -H "Authorization: Bearer eyJhbGc..." \
  -o invoice.pdf
```

---

**Last Updated**: 2026-05-08
**API Version**: v1
**Status**: Production Ready
