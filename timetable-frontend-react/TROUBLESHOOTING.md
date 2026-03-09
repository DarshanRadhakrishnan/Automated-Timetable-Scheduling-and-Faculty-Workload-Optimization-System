# Quick Troubleshooting Guide

## ✅ Current Status (as of now):

### Servers Running:
- ✅ Backend: http://localhost:5000 (RESPONDING)
- ✅ Frontend: http://localhost:5173 (SERVING HTML)

### What to Check if Nothing is Displayed:

## 1. **Hard Refresh the Browser**
The most common issue is cached files. Do a **HARD REFRESH**:
- **Windows**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Or**: Open DevTools (F12), right-click the refresh button, select "Empty Cache and Hard Reload"

## 2. **Check Browser Console for Errors**
1. Press `F12` to open Developer Tools
2. Click on the "Console" tab
3. Look for any red error messages
4. Common errors to look for:
   - CORS errors
   - Failed to fetch
   - Module not found
   - Tailwind CSS errors

## 3. **Verify Backend Connection**
Test the backend directly:
```
http://localhost:5000/
```
Should show JSON with API information

## 4. **Check Network Tab**
1. Open DevTools (F12)
2. Go to "Network" tab
3. Refresh the page
4. Check if:
   - index.html loads (200 status)
   - main.jsx loads (200 status)
   - CSS files load (200 status)

## 5. **MongoDB Connection**
The backend might be slow if MongoDB is connecting. Check terminal output for:
```
"Server is running on port 5000"
```

## 6. **Clear Browser Cache Completely**
If hard refresh doesn't work:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

## 7. **Try Different Browser**
Sometimes one browser has issues. Try:
- Chrome
- Edge
- Firefox

## 8. **Check if JavaScript is Enabled**
1. In browser settings
2. Ensure JavaScript is not blocked

## 9. **Restart Everything**
If nothing works:
1. Close all browser tabs
2. Stop both servers (Ctrl+C in terminals)
3. Run `START-FULLSTACK.bat` again
4. Wait 10 seconds
5. Open browser to http://localhost:5173

## 10. **Manual Server Check**

**Terminal 1** - Backend:
```bash
cd timetable-backend-mern
npm start
```
Wait for: "Server is running on port 5000"

**Terminal 2** - Frontend:
```bash
cd timetable-frontend-react
npm run dev
```
Wait for: "Local: http://localhost:5173"

Then open browser to http://localhost:5173

---

## What You SHOULD See:

When working correctly, you'll see:
- **Left**: Sidebar with navigation (Dashboard, Schedule, Conflicts, Settings)
- **Top**: Header with search bar and dark mode toggle
- **Main**: Dashboard with 4 stat cards showing:
  - Total Classes
  - Conflicts Detected  
  - Conflict Free
  - Quality Score

---

## If You See a Blank White Page:

1. **Press F12** (Developer Tools)
2. **Go to Console tab**
3. **Take a screenshot of any errors**
4. Common causes:
   - Tailwind CSS not loading
   - JavaScript error in components
   - API not responding
   - CORS issue

---

## Quick Fix Commands:

**Kill all Node processes and restart:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then run:
```powershell
.\START-FULLSTACK.bat
```

---

## Expected Browser URL:
```
http://localhost:5173/
```

**NOT**:
- http://localhost:5173/index.html ❌
- http://localhost:5000/ ❌ (this is the backend API)

---

## Still Not Working?

1. Check if port 5173 is already in use
2. Check if port 5000 is already in use
3. Try killing all node processes and restarting
4. Check Windows Firewall settings
5. Make sure antivirus isn't blocking ports

---

## Success Checklist:

- [ ] Backend shows "Server is running on port 5000"
- [ ] Frontend shows "Local: http://localhost:5173"
- [ ] Browser opens to http://localhost:5173
- [ ] Hard refresh performed (Ctrl+Shift+R)
- [ ] No console errors (F12 → Console)
- [ ] You see the sidebar and dashboard

If all checked, the app should be working! 🎉
