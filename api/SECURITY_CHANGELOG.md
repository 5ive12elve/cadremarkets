# SECURITY CHANGELOG

## [CRITICAL] Authentication System Separation - 2024

### Issues Fixed:
1. **Mixed Token Authentication**: Removed dual-token acceptance in main site authentication
2. **Privilege Escalation**: Separated back office and main site authentication completely
3. **Route Security**: Updated admin routes to use proper back office authentication
4. **Legacy Routes**: Removed insecure hardcoded credential routes

### Changes Made:

#### 1. Core Authentication Files:
- **`api/utils/verifyUser.js`**: Removed `backoffice_token` acceptance, now only accepts `access_token`
- **`api/utils/verifyBackOfficeUser.js`**: Enhanced to include tokenType and real-time role verification
- **`server/routes/auth.js`**: Removed legacy hardcoded credential routes

#### 2. Route Protection Updates:
- **`api/routes/user.route.js`**: 
  - Changed `/backoffice/statistics` to use `verifyBackOfficeToken`
  - Updated admin routes (`/`, `/:id/role`, `/:id/status`) to use back office auth
- **`api/controllers/user.controller.js`**:
  - Added tokenType verification for admin operations
  - Enhanced role checking for back office operations
  - Added proper permission validation

#### 3. Security Enhancements:
- Back office tokens now include `tokenType: 'backoffice'`
- Real-time role and permission verification from database
- Separation of main site and back office user management
- Removal of token mixing vulnerabilities

### Testing Requirements:
- All back office routes now require proper `backoffice_token`
- Main site routes only accept `access_token`
- Admin operations require both admin role AND back office token type
- Test files need updating to use correct token types

### Breaking Changes:
- Back office routes no longer accept main site tokens
- Legacy `/auth/backoffice/login` route removed
- Admin operations require explicit back office authentication

### Security Impact:
- **RESOLVED**: Cross-system privilege escalation
- **RESOLVED**: Token confusion vulnerabilities  
- **RESOLVED**: Authentication bypass possibilities
- **IMPROVED**: Role-based access control
- **IMPROVED**: System isolation between main site and back office 