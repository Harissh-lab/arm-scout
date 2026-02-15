# 🚀 Deployment Checklist

## For Web Developer (You)

### Before Pushing to Git

- [x] ✅ All map dependencies removed
- [x] ✅ Camera detection service implemented
- [x] ✅ Coordinate database with sample data
- [x] ✅ GPS tracking integrated
- [x] ✅ Monitoring screen with HUD
- [x] ✅ Pi camera configuration in settings
- [x] ✅ localStorage persistence ready
- [x] ✅ TypeScript errors fixed
- [x] ✅ Dev server running without issues

### Ready to Push

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Raspberry Pi camera integration with GPS proximity alerts"

# Push to main branch
git push origin main
```

### Share with Pi Team

Send them:
1. Repository URL
2. This checklist
3. Link to [CONFIGURATION.md](CONFIGURATION.md)
4. Link to [RASPBERRY_PI_SETUP.md](RASPBERRY_PI_SETUP.md)
5. Link to [AI_TRAINING_GUIDE.md](AI_TRAINING_GUIDE.md) - **For training the hazard detection model**

---

## For Raspberry Pi Person (Your Collaborator)

### 1. Clone Repository

```bash
git clone [REPOSITORY-URL]
cd "Hazard Scout Prototype Design (Copy)"
```

### 2. Install Dependencies

```bash
npm install
```

**Expected output:**
- All packages installed successfully
- No errors
- Ready to run!

### 3. Start Application

```bash
npm run dev
```

**Expected output:**
```
VITE v6.3.5  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 4. Test in Browser

Open: **http://localhost:3000**

**You should see:**
- ✅ App loads (no black screen)
- ✅ Dashboard with sample hazards
- ✅ Safety Scout tab available
- ✅ Settings accessible

### 5. Setup Raspberry Pi Camera

**See RASPBERRY_PI_SETUP.md for complete guide**

Quick setup:
```bash
# On Raspberry Pi
sudo apt-get install motion
sudo nano /etc/motion/motion.conf
# Set: stream_port 8080, stream_localhost off
sudo systemctl start motion
```

### 6. Configure Pi Camera in App

1. Open app → **Safety Scout** → **Settings**
2. Scroll to **Raspberry Pi Camera**
3. Enter your Pi IP:
   ```
   Camera Stream URL: http://[YOUR-PI-IP]:8080
   ```
4. Click **Save Camera Settings**

### 7. Test Everything

#### Test 1: Sample Data
- Navigate to **Safety Scout** tab
- You should see 3 hazards listed
- Dashboard shows hazard count

#### Test 2: GPS Permission
- Click **Toggle Camera Detection** ON
- Browser will ask for location permission
- Click **Allow**

#### Test 3: Monitoring Screen
- After GPS permission granted
- Full-screen monitoring view should appear
- Shows: Speed, GPS coordinates, camera placeholder

#### Test 4: Camera Feed
- Monitoring screen should show your Pi camera stream
- If no feed: Check Pi IP address in settings
- Test stream directly: `http://[PI-IP]:8080`

#### Test 5: Proximity Alerts
- If near sample hazards (Chennai area), alerts will show
- Distance and direction displayed
- "All Clear" if no hazards nearby

### 8. Verify Database

Open browser console (F12) and run:
```javascript
// Check sample data loaded
JSON.parse(localStorage.getItem('coordinate-hazards-db'))

// Should show 3 hazards
```

### 9. Customize (Optional)

**Add Your Own Hazards:**
1. Use camera detection to auto-detect
2. Or manually add to database via code

**Change Sample Locations:**
Edit `src/components/CoordinateDatabase.ts` → `initializeSampleData()`

**Adjust Alert Distance:**
Edit `src/components/CoordinateDatabase.ts` → `ALERT_DISTANCE` (default: 500m)

---

## ✅ Verification Checklist

### Application
- [ ] App runs at localhost:3000
- [ ] No errors in browser console
- [ ] No TypeScript compilation errors
- [ ] All tabs load correctly

### Database
- [ ] Sample data loads (3 hazards)
- [ ] localStorage contains 'coordinate-hazards-db'
- [ ] Hazards visible in Safety Scout tab
- [ ] Dashboard shows hazard count

### GPS & Camera
- [ ] GPS permission granted
- [ ] Monitoring screen loads
- [ ] Speed displays (km/h)
- [ ] GPS coordinates show
- [ ] Pi camera URL configured

### Raspberry Pi
- [ ] Motion server running
- [ ] Stream accessible at :8080
- [ ] Camera feed shows in app
- [ ] No firewall blocking

### Proximity Alerts
- [ ] Monitoring active
- [ ] GPS tracking working
- [ ] Alerts show when near hazards
- [ ] Distance/bearing displayed correctly

---

## 🎯 Success Criteria

**You're ready when:**
1. ✅ App loads without errors
2. ✅ Sample hazards visible
3. ✅ GPS permission granted
4. ✅ Camera feed displays
5. ✅ Proximity alerts functional

---

## 📞 Common Issues

### Issue: Black Screen
**Solution:** Clear browser cache and reload
```javascript
localStorage.clear()
location.reload()
```

### Issue: No GPS Data
**Solution:** Check browser location settings
- Chrome: Settings → Privacy → Location
- Firefox: Preferences → Privacy & Security → Permissions

### Issue: No Camera Feed
**Solution:** Check Pi IP and Motion server
```bash
# On Pi
hostname -I
sudo systemctl status motion
```

### Issue: No Sample Data
**Solution:** Check browser console for errors
Sample data auto-loads on first run. If missing:
```javascript
// Clear and reload
localStorage.removeItem('coordinate-hazards-db')
location.reload()
```

---

## 🔄 Update Workflow

When web developer makes changes:

```bash
# Pi person pulls updates
git pull origin main

# Reinstall if package.json changed
npm install

# Restart dev server
npm run dev
```

---

## 📝 Notes

- **No external database required** - Uses localStorage
- **No API keys needed** - Browser Geolocation API is free
- **Plug and play** - Sample data included
- **Offline capable** - Works without internet (except GPS)

---

**Ready to go! 🎉**

Push the code and share this checklist with your Raspberry Pi collaborator!
