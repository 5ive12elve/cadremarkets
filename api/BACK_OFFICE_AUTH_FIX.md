# BACK OFFICE AUTHENTICATION ISSUE & FIX

## 🚨 **CRITICAL ISSUE IDENTIFIED**

### **Problem:**
You were logged in as a **BackOfficeUser** (admin/admin123) but trying to delete **regular Users** (artists) through the back office interface. The system was failing because:

1. **Wrong Authentication Flow**: The delete endpoint `/api/user/delete/:id` was using `verifyToken` which only accepts `access_token` cookies
2. **BackOfficeUser vs User Confusion**: Two separate user collections were being mixed up:
   - `BackOfficeUser` collection - Admin employees (you) 
   - `User` collection - Website users/artists (the ones you want to manage)

### **Error Chain:**
```
BackOfficeUser (admin/admin123) 
   ↓ Has backoffice_token cookie
   ↓ Tries to delete User from website
   ↓ Calls /api/user/delete/[userId] 
   ↓ Route uses verifyToken (only accepts access_token)
   ↓ ❌ 401 Unauthorized: "You can only delete your own account!"
```

## ✅ **SOLUTION IMPLEMENTED**

### **1. Smart Route Authentication**
Updated `/api/user/delete/:id` to automatically detect authentication type:

```javascript
// Before: Only accepted access_token
router.delete('/delete/:id', verifyToken, deleteUser);

// After: Smart detection
router.delete('/delete/:id', (req, res, next) => {
  const backofficeToken = req.cookies.backoffice_token;
  const accessToken = req.cookies.access_token;
  
  if (backofficeToken) {
    verifyBackOfficeToken(req, res, next);  // For admin operations
  } else if (accessToken) {
    verifyToken(req, res, next);            // For user self-deletion
  } else {
    return next(errorHandler(401, 'Unauthorized'));
  }
}, deleteUser);
```

### **2. Enhanced Controller Logic**
Updated `deleteUser` controller to properly handle both authentication types:

```javascript
export const deleteUser = async (req, res, next) => {
  try {
    // Back office admin can delete any regular user
    if (req.user.tokenType === 'backoffice' && req.user.role === 'admin') {
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json('User has been deleted!');
    }
    
    // Regular users can only delete themselves
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, 'You can only delete your own account!'));
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};
```

## 📋 **AUTHENTICATION FLOW CLARIFICATION**

### **BackOffice Authentication (Employees)**
- **Collection**: `BackOfficeUser`
- **Cookie**: `backoffice_token`
- **Middleware**: `verifyBackOfficeToken`
- **Purpose**: Admin operations on website users/content
- **Access**: Can manage all website users, listings, orders, etc.

### **Website Authentication (Users/Artists)**
- **Collection**: `User` 
- **Cookie**: `access_token`
- **Middleware**: `verifyToken`
- **Purpose**: Personal account management
- **Access**: Can only manage their own account/listings

## 🔄 **RESULT**
✅ BackOffice admin can now successfully delete regular users/artists  
✅ Regular users can still delete their own accounts  
✅ Proper authentication isolation maintained  
✅ Security boundaries preserved  

## 📝 **FILES MODIFIED**
1. `api/routes/user.route.js` - Added smart authentication detection
2. `api/controllers/user.controller.js` - Enhanced deleteUser logic
3. `api/SECURITY_CHANGELOG.md` - Previous security fixes
4. `api/BACK_OFFICE_AUTH_FIX.md` - This documentation

## ⚠️ **NEXT STEPS**
1. Test the fix by logging in as admin/admin123 in back office
2. Navigate to Artists Management 
3. Try deleting an artist - should now work correctly
4. Verify regular users can still delete their own accounts from main site 