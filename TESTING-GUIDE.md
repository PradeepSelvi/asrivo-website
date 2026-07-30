# Testing Guide - User Profile System

## 🧪 Test Scenarios

### Scenario 1: First-Time Visitor (Not Logged In)

**Desktop Header:**
```
[Logo] [Home] [About] [Services] [Team] [Projects] [Contact]
                     [LinkedIn] [Instagram] | [Login] [Register] [Get Started]
```

**Mobile Menu:**
```
Navigation links...
Footer:
  [Login] [Register]  ← Two buttons side by side
  [Get Started]
  [LinkedIn] [Instagram]
```

### Scenario 2: User Registers

1. Click "Register" button in header
2. Fill registration form:
   - Email (validated with AbstractAPI)
   - Password (checked against breach database)
   - Name, etc.
3. Submit form
4. **Redirected to `/profile`** (new user's profile page)
5. Profile automatically created in database

### Scenario 3: Logged-In User

**Desktop Header:**
```
[Logo] [Home] [About] [Services] [Team] [Projects] [Contact]
                     [LinkedIn] [Instagram] | [Profile Avatar ▼] [Get Started]
                                                      |
                                    Dropdown menu: ────┘
                                    ┌─────────────────┐
                                    │ View Profile    │
                                    │ Settings        │
                                    │ Logout          │
                                    └─────────────────┘
```

**Mobile Menu:**
```
Navigation links...
Footer:
  [View Profile]     ← Full width button
  [Settings]         ← Full width button
  [Logout]           ← Full width button (red)
  [Get Started]
  [LinkedIn] [Instagram]
```

### Scenario 4: Profile Management

**View Profile (`/profile`):**
- Avatar image (if uploaded)
- Full name
- Email
- Phone number
- Bio
- Location
- [Edit Profile] button

**Edit Profile (`/profile/settings`):**
- Upload avatar image
- Edit full name
- Edit phone number
- Edit bio
- Edit location
- [Save Changes] button
- [Cancel] button

### Scenario 5: Logout

1. Click profile avatar
2. Click "Logout" from dropdown
3. Signed out from Supabase
4. Redirected to homepage
5. Header returns to showing "Login" and "Register" buttons

## ✅ Checklist

Before considering implementation complete, verify:

- [ ] Logged-out header shows Login + Register buttons
- [ ] Register button takes you to `/register`
- [ ] After registration, redirected to `/profile`
- [ ] Profile page shows user information
- [ ] Logged-in header shows profile avatar/icon
- [ ] Clicking avatar shows dropdown menu
- [ ] Dropdown has View Profile, Settings, Logout
- [ ] View Profile link goes to `/profile`
- [ ] Settings link goes to `/profile/settings`
- [ ] Can edit profile information
- [ ] Can upload avatar image
- [ ] Changes save successfully
- [ ] Logout button signs out user
- [ ] After logout, header shows Login + Register again
- [ ] Mobile menu shows correct buttons based on auth state
- [ ] All links work on mobile
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds

## 🚀 Quick Test Commands

```bash
# 1. Run database migration
supabase db push

# 2. Start development server
pnpm dev

# 3. Open browser to http://localhost:3000

# 4. Test registration flow:
#    - Click Register
#    - Fill form
#    - Submit
#    - Should redirect to /profile

# 5. Test profile:
#    - View at /profile
#    - Edit at /profile/settings
#    - Upload avatar
#    - Save changes

# 6. Test auth state:
#    - Header should show profile avatar
#    - Click for dropdown menu
#    - Click Logout
#    - Header should return to Login/Register

# 7. Test mobile:
#    - Open dev tools
#    - Toggle device toolbar
#    - Open mobile menu
#    - Verify auth buttons appear correctly
```

## 🐛 Common Issues

**Issue: Profile menu not showing**
- Solution: Clear browser cache, hard reload (Ctrl+Shift+R)

**Issue: "Login" and "Register" still showing when logged in**
- Solution: Check browser console for errors, verify Supabase connection

**Issue: Profile not created after registration**
- Solution: Verify database migration was run successfully

**Issue: Avatar upload fails**
- Solution: Create `avatars` bucket in Supabase Storage with public read permissions

## 📊 Expected Database Structure

After running migration, you should have:

**Table: `user_profiles`**
- id (UUID, references auth.users)
- email (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- phone (TEXT)
- bio (TEXT)
- location (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

**Policies:**
- Users can view their own profile
- Users can insert their own profile
- Users can update their own profile
- Users can delete their own profile

**Functions:**
- `handle_new_user()` - Auto-creates profile on signup
- `handle_updated_at()` - Updates timestamp on profile changes

**Triggers:**
- `on_auth_user_created` - Calls handle_new_user() after INSERT on auth.users
- `on_user_profile_updated` - Calls handle_updated_at() before UPDATE on user_profiles
