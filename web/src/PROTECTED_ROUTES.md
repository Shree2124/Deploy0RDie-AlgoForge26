# Protected Routes Setup

Your application now has a complete protected routes system!

## 🛡️ Route Structure

### Public Routes (No Authentication Required)
- `/` - Landing page (accessible to everyone)

### Authentication Routes (Public, but redirect if logged in)
- `/login` - Login page
- `/register` - Registration page
- `/reset-password` - Password reset page
- `/verify-email` - Email verification page

**Behavior:** If user is already authenticated and verified, they are redirected to `/mapview`

### Protected Routes (Authentication Required)
All routes under `(site)` folder require authentication:
- `/mapview` - Map view dashboard
- `/dashboard` - Main dashboard
- `/auditview` - Audit submission page
- `/alertview` - Alerts and notifications
- `/profileview` - User profile page

**Behavior:** If user is not authenticated, they are redirected to `/login?redirect=[current-path]`

## 🔐 How It Works

### 1. Authentication Layout (`src/app/(auth)/layout.tsx`)
```typescript
- Checks if user is authenticated and email verified
- If YES → Redirect to /mapview
- If NO → Show auth pages (login, register, etc.)
```

### 2. Site Layout (`src/app/(site)/layout.tsx`)
```typescript
- Checks if user is authenticated
- If NO → Redirect to /login with return URL
- If authenticated but email not verified → Redirect to /verify-email
- If YES → Show protected pages with header/footer
```

### 3. Landing Page (`src/app/page.tsx`)
```typescript
- Always accessible
- "Get Started" button smart routing:
  - If authenticated → Go to /mapview
  - If not authenticated → Go to /register
```

## 🚀 Testing Protected Routes

### Test 1: Access Protected Route (Not Logged In)
1. Make sure you're logged out
2. Try to visit: `http://localhost:3000/mapview`
3. ✅ Expected: Redirected to `/login?redirect=/mapview`
4. After login, you're redirected back to `/mapview`

### Test 2: Access Auth Route (Already Logged In)
1. Make sure you're logged in
2. Try to visit: `http://localhost:3000/login`
3. ✅ Expected: Redirected to `/mapview`

### Test 3: Landing Page Navigation
1. Visit: `http://localhost:3000/`
2. Click "Get Started"
3. ✅ Expected:
   - If logged out → Go to `/register`
   - If logged in → Go to `/mapview`

### Test 4: Email Verification Required
1. Register a new account (don't verify email)
2. Try to access: `http://localhost:3000/mapview`
3. ✅ Expected: Redirected to `/verify-email`
4. After verifying email, you can access protected routes

### Test 5: Sign Out
1. Click profile icon → "Sign Out"
2. Try to access: `http://localhost:3000/dashboard`
3. ✅ Expected: Redirected to `/login?redirect=/dashboard`

## 📂 File Structure

```
src/app/
├── (auth)/              # Auth routes group
│   ├── layout.tsx       # Auth layout (redirects if logged in)
│   ├── login/
│   ├── register/
│   ├── reset-password/
│   └── verify-email/
├── (site)/              # Protected routes group
│   ├── layout.tsx       # Site layout (requires auth)
│   ├── mapview/
│   ├── dashboard/
│   ├── auditview/
│   ├── alertview/
│   └── profileview/
├── layout.tsx           # Root layout (wraps everything with AuthProvider)
└── page.tsx             # Landing page (public)
```

## 🔧 How to Add New Protected Routes

### Add a Protected Page:
1. Create page inside `src/app/(site)/your-page/page.tsx`
2. That's it! The `(site)/layout.tsx` automatically protects it

### Add a Public Page:
1. Create page inside `src/app/your-page/page.tsx`
2. It will be accessible without authentication

### Add an Auth Page:
1. Create page inside `src/app/(auth)/your-page/page.tsx`
2. It will redirect authenticated users automatically

## 🎯 Key Features

✅ **Automatic Redirects**
- Unauthenticated users → Login page
- Authenticated users trying to access auth pages → Dashboard
- Return URL preserved (e.g., `/login?redirect=/mapview`)

✅ **Email Verification Enforcement**
- Users must verify email before accessing protected routes
- Email verification banner shows on protected pages if not verified

✅ **Loading States**
- Shows loading screen while checking authentication status
- Prevents flash of wrong content

✅ **Session Management**
- Session persists across page refreshes
- Uses HTTP-only cookies for security
- Automatic session cleanup on logout

## 🔒 Security Features

1. **Client-Side Protection**: React Router guards prevent unauthorized navigation
2. **Session Cookies**: HTTP-only cookies prevent XSS attacks
3. **Email Verification**: Required for accessing protected routes
4. **Automatic Cleanup**: Sessions cleared on logout
5. **Return URLs**: Users redirected back to intended page after login

## 🐛 Troubleshooting

### Issue: Infinite redirect loop
**Solution:** Clear browser cache and cookies, restart dev server

### Issue: Not redirecting after login
**Solution:** Check that `router.push()` is called after successful login

### Issue: Can access protected routes without login
**Solution:** Make sure the page is inside `(site)` folder, not root `app` folder

### Issue: Email verified but still showing banner
**Solution:** Hard refresh browser (Ctrl+Shift+R) or check Firebase user's `emailVerified` status

---

## Summary

Your protected routes system is **production-ready** and provides:
- Complete access control
- Email verification requirement
- Smart redirects with return URLs
- Secure session management
- Loading states and error handling

All routes are properly protected and the user experience is smooth!
