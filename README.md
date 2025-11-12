# AWS Cognito Authentication Service

[![AWS](https://img.shields.io/badge/AWS-Cloud-orange?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Serverless](https://img.shields.io/badge/Serverless-Framework-red?logo=serverless&logoColor=white)](https://www.serverless.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

**A production-ready serverless authentication boilerplate** using **AWS Cognito**, **Node.js**, and **Serverless Framework**.  
Implements signup/login, email verification, JWT-protected APIs, profile management, and S3 presigned uploads — ready to deploy with `serverless deploy`.

## 🧰 Tech Stack
- **Backend:** Node.js, Serverless Framework, AWS Lambda, API Gateway  
- **Authentication:** AWS Cognito (JWT-based)  
- **Storage:** Amazon S3 (Presigned URLs)  
- **Testing:** Postman, Jest  
- **Deployment:** Serverless CLI on AWS

## 📚 API Documentation

Complete API documentation with examples, request/response schemas, and validation rules:

**[View API Documentation on Postman](https://documenter.getpostman.com/view/9882680/2sB3WsQfa7)**

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- AWS CLI configured with appropriate credentials
- Serverless Framework CLI installed globally

```bash
npm install -g serverless
```

### Installation

```bash
npm install
```

### Deployment

```bash
# Deploy to AWS
serverless deploy

# Deploy to specific stage
serverless deploy --stage production
```

### Local Development

```bash
serverless dev
```

## 📋 Available Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /signin` - Sign in with email and password
- `GET /signout` - Sign out (requires authentication)
- `POST /refresh-token` - Refresh access token

### Account Confirmation
- `POST /confirm-account-by-code` - Confirm account with verification code
- `POST /confirm-account-manually` - Manually confirm account (admin)

### Password Management
- `POST /forgot-password` - Request password reset code (Cognito sends code to email)
- `POST /confirm-forgot-password` - Reset password with Cognito verification code
- `POST /reset-password` - Directly reset password (for custom forgot password flow)
- `POST /change-password` - Change password (requires authentication)

### User Management
- `GET /user-info` - Get current user information (requires authentication)
- `PATCH /update-user` - Update user attributes (requires authentication)
- `DELETE /delete-user` - Delete user account (requires authentication)

### Profile Pictures
- `POST /generate-presigned-url` - Generate S3 presigned URL for picture upload (requires authentication)
- `POST /get-presigned-picture-url` - Get presigned URL for existing picture (requires authentication)

## 🔐 Authentication

Most endpoints require authentication via Bearer token in the `Authorization` header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Access tokens are obtained from the `/signin` endpoint.

## 📝 Field Validations

### User Attributes

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| **name** | Yes (on signup) | Letters, spaces, hyphens, apostrophes only<br>Length: 2-50 characters | `"John Doe"`, `"Mary-Jane O'Connor"` |
| **email** | Yes (on signup) | Valid email address | `"user@example.com"` |
| **phoneNumber** | No | E.164 format (`+[country code][number]`) | `"+1234567890"`, `"+919876543210"` |
| **gender** | No | `"male"`, `"female"`, `"other"`, `"prefer-not-to-say"`, `"M"`, `"F"`, `"O"` (case insensitive) | `"male"` |
| **timeZone** | No | IANA timezone format | `"America/New_York"`, `"Asia/Kolkata"` |
| **birthdate** | No | `YYYY-MM-DD` (ISO 8601)<br>Valid date, not in future, min 13 years old | `"1990-01-15"` |
| **picture** | No | Valid HTTP/HTTPS URL<br>Extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`<br>Max length: 2048 characters | `"https://example.com/profile.jpg"` |

### Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

## 📸 Frontend Picture Upload Example

Complete implementation guide for profile picture uploads:

### Complete Upload Flow

```javascript
async function uploadProfilePicture(file, accessToken) {
  const API_BASE = 'https://your-api.execute-api.region.amazonaws.com';
  
  // Step 1: Get presigned URL
  const presignedResponse = await fetch(`${API_BASE}/generate-presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      filename: file.name,
      fileType: file.type
    })
  });
  
  if (!presignedResponse.ok) {
    throw new Error('Failed to get presigned URL');
  }
  
  const { uploadUrl, pictureUrl } = await presignedResponse.json();
  
  // Step 2: Upload file directly to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });
  
  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to S3');
  }
  
  // Step 3: Update user profile with picture URL
  const updateResponse = await fetch(`${API_BASE}/update-user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ picture: pictureUrl })
  });
  
  if (!updateResponse.ok) {
    throw new Error('Failed to update user profile');
  }
  
  return await updateResponse.json();
}
```

### Retrieve Presigned Picture URL

To get a presigned URL for an existing profile picture (for private S3 buckets):

```javascript
async function getPresignedPictureUrl(pictureUrl, accessToken) {
  const response = await fetch(
    'https://your-api.execute-api.region.amazonaws.com/get-presigned-picture-url',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ pictureUrl })
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch presigned picture URL');
  }
  
  const data = await response.json();
  // Returns: { presignedUrl, expiresIn: 86400 } (24 hours)
  return data.presignedUrl;
}
```

### Important Notes

- **File Validation**: Always validate file type and size on the frontend before uploading
- **Presigned URL Expiry**: 
  - Upload URLs expire after 1 hour (3600 seconds)
  - Picture retrieval URLs expire after 24 hours (86400 seconds)
- **File Size**: Recommended maximum: 5MB
- **Error Handling**: Always handle errors at each step of the upload process
- **Security**: Never expose AWS credentials in frontend code - always use presigned URLs

## 🏗️ Project Structure

```
src/
├── auth/              # Authentication endpoints
│   ├── signUp.js
│   ├── signIn.js
│   ├── signOut.js
│   └── refreshToken.js
├── password/          # Password management
│   └── forgotPassword.js
├── user/              # User management
│   └── userInfo.js
├── middleware/        # Authentication middleware
│   └── auth.js
├── cognito.js         # AWS Cognito service methods
├── helpers.js         # Helper functions
└── validations.js     # Input validation rules
```

## ⚙️ Configuration

The service is configured via `serverless.yml`. Key settings:

- **Region**: `ap-south-1` (configurable)
- **Runtime**: Node.js 20.x
- **CORS**: Enabled for all endpoints

### Environment Variables

Automatically set during deployment:
- `REGION` - AWS region
- `COGNITO_USER_POOL_ID` - Cognito User Pool ID
- `COGNITO_CLIENT_ID` - Cognito Client ID
- `S3_BUCKET_NAME` - S3 bucket for profile pictures

## 🔧 AWS Resources

The deployment creates:

1. **Cognito User Pool** - User authentication and management
2. **Cognito User Pool Client** - Application client configuration
3. **S3 Bucket** - Profile picture storage (with versioning enabled)

## 📦 Dependencies

- `@aws-sdk/client-cognito-identity-provider` - AWS Cognito SDK
- `@aws-sdk/client-s3` - AWS S3 SDK
- `@aws-sdk/s3-request-presigner` - S3 presigned URL generation

## 🧪 Testing

Test endpoints using the Postman collection or curl:

```bash
# Sign up
curl -X POST https://your-api.execute-api.region.amazonaws.com/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "Password123!"}'

# Sign in
curl -X POST https://your-api.execute-api.region.amazonaws.com/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Password123!"}'

# Update user (requires authentication)
curl -X PATCH https://your-api.execute-api.region.amazonaws.com/update-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"name": "Jane Doe", "phoneNumber": "+1234567890"}'
```

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For detailed API documentation and examples, visit the [Postman documentation](https://documenter.getpostman.com/view/9882680/2sB3WsQfa7).
