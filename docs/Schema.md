# Database Schema - Cloud-Base

## 1. USER Model (`packages/schemaPackage/models/User.js`)

| Field | Type | Description |
|---|---|---|
| userName | String | Unique username (Required) |
| email | String | Unique email (Required) |
| recoveryEmail | String | Optional recovery email (Default: 'not added') |
| password | String | Hashed password (Bcryptjs) |
| firstName | String | User's first name |
| lastName | String | User's last name |
| profilePic | String | URL to profile image (Default: /icons/person.svg) |
| dob | Date | Date of birth |
| gender | String | Enum: ['Male', 'Female', 'Other', 'Not selected'] |
| countryCode | String | Mobile country code |
| phonenumber | String | Unique mobile number |
| accountStatus | String | Enum: ['active', 'deleted', 'banned'] (Default: 'active') |
| role | String | Enum: ['User', 'PartialUser', 'Admin'] (Default: 'User') |
| isEmailVerified | Boolean | Email verification status (Default: false) |
| lastLogin | Date | Timestamp of last successful login |
| createdAt | Date | Auto-generated timestamp |
| updatedAt | Date | Auto-generated timestamp |

## 2. ManagedApp Model
- Managed services within the ecosystem.

## 3. AuditLog Model
- Activity tracking for security and monitoring.
