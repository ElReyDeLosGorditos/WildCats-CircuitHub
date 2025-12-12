# 🎯 IntelliJ IDEA - Environment Variable Setup (Step-by-Step)

This guide walks you through setting up the Firebase environment variable in IntelliJ IDEA with screenshots descriptions.

---

## 📋 What You'll Need

1. ✅ IntelliJ IDEA (Community or Ultimate)
2. ✅ Your `firebase-service-account.json` file
3. ✅ 5 minutes of your time

---

## 🚀 Setup Steps

### Step 1: Open Run Configurations

**Method 1 (Menu Bar):**
```
Run → Edit Configurations...
```

**Method 2 (Toolbar):**
- Click the dropdown next to the Run button (▶️)
- Select "Edit Configurations..."

**Method 3 (Keyboard Shortcut):**
- Press `Alt + Shift + F10` (Windows/Linux)
- Press `Ctrl + Alt + R` (Mac)
- Then press `0` to edit configurations

---

### Step 2: Select Your Application Configuration

In the left panel, you'll see:
```
Application
├── CircuitHubApplication (or your main class)
└── ...
```

Click on your Spring Boot application configuration.

If you don't have one:
1. Click the `+` button (top left)
2. Select "Application"
3. Main class: `com.example.CircuitHub.CircuitHubApplication`
4. Name it: "CircuitHub Backend"

---

### Step 3: Find Environment Variables Section

In the configuration panel, look for:
```
Environment variables: [                           ] 📁
```

Click the **folder icon** (📁) on the right side.

**Can't find it?**
- Look under "Configuration" section
- It might be collapsed - click to expand
- Look for a text field with a folder icon next to it

---

### Step 4: Add Environment Variable

A dialog window will open showing a table with two columns:
```
Name                    Value
------------------------+--------------------------------
(empty)                 (empty)
```

**Click the + button** (or press Insert key) to add a new variable.

---

### Step 5: Set Variable Name

In the "Name" field, type:
```
FIREBASE_CONFIG_JSON
```

**⚠️ Important:** 
- Must be EXACTLY this name (case-sensitive)
- No spaces, no typos
- Just: `FIREBASE_CONFIG_JSON`

---

### Step 6: Set Variable Value

In the "Value" field:

1. **Open your `firebase-service-account.json` file**
2. **Select ALL the content** (Ctrl+A or Cmd+A)
3. **Copy it** (Ctrl+C or Cmd+C)
4. **Paste into the Value field** (Ctrl+V or Cmd+V)

Your value should look like this (but much longer):
```json
{"type":"service_account","project_id":"circuithub-75f4a","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...
```

**Tips:**
- It's okay if it's all on one line
- Don't worry if it looks messy
- Make sure you got EVERYTHING from opening `{` to closing `}`
- Should be around 2000-3000 characters long

---

### Step 7: Verify and Save

**Verify:**
```
Name: FIREBASE_CONFIG_JSON
Value: {"type":"service_account","project_id":"circuithub-75f4a"...}
```

**Length Check:**
- The value should be quite long (2000+ characters)
- If it's less than 100 characters, something went wrong

**Click OK** to close the environment variables dialog.

---

### Step 8: Apply Changes

In the Run Configuration window:
1. Click **Apply** button (bottom right)
2. Click **OK** button to close

---

### Step 9: Restart IntelliJ IDEA

**This is crucial!**

1. File → Exit (or Cmd+Q on Mac)
2. Close IntelliJ completely
3. Reopen IntelliJ
4. Open your project again

**Why?** Environment variables are loaded when IntelliJ starts. Restarting ensures the variable is picked up.

---

### Step 10: Verify Setup

**Run your application:**
1. Click the Run button (▶️)
2. Or press Shift+F10 (Windows/Linux) or Ctrl+R (Mac)

**Check the console output. You should see:**
```
✅ Found FIREBASE_CONFIG_JSON environment variable (length: 2439 characters)
✅ Firebase initialized successfully!
✅ Storage Bucket: circuithub-75f4a.firebasestorage.app
✅ Firestore connection verified
```

**If you see errors, go to the Troubleshooting section below.**

---

## ✅ Success Checklist

- [ ] Opened Run Configurations (Run → Edit Configurations)
- [ ] Selected/Created application configuration
- [ ] Found Environment Variables section
- [ ] Added new variable with + button
- [ ] Set name as `FIREBASE_CONFIG_JSON` exactly
- [ ] Pasted entire JSON content as value
- [ ] Clicked OK to close variable dialog
- [ ] Clicked Apply and OK to save configuration
- [ ] Restarted IntelliJ IDEA completely
- [ ] Ran application and saw success messages

---

## 🎨 Visual Reference

### What You're Looking For:

**Run Configuration Window:**
```
┌─ Run/Debug Configurations ─────────────────────┐
│                                                 │
│  Configuration                                  │
│  ┌─────────────────────────────────────────┐  │
│  │ Name: CircuitHub Backend                 │  │
│  │                                          │  │
│  │ Main class: com.example.CircuitHub...   │  │
│  │                                          │  │
│  │ Environment variables:                   │  │
│  │ [FIREBASE_CONFIG_JSON={"type":"servi...] 📁 │
│  │                                          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│                    [Apply]  [OK]  [Cancel]      │
└─────────────────────────────────────────────────┘
```

**Environment Variables Dialog:**
```
┌─ Environment Variables ───────────────────────┐
│                                               │
│  Name                    Value                │
│  ─────────────────────────────────────────── │
│  FIREBASE_CONFIG_JSON   {"type":"service_... │
│                                               │
│                         [+]  [-]  [▲]  [▼]   │
│                                               │
│                              [OK]  [Cancel]   │
└───────────────────────────────────────────────┘
```

---

## ❌ Common Mistakes

### Mistake 1: Wrong Variable Name
```
❌ FIREBASE_CONFIG           (missing _JSON)
❌ firebase_config_json      (wrong case)
❌ FIREBASE-CONFIG-JSON      (hyphens instead of underscores)
✅ FIREBASE_CONFIG_JSON      (correct!)
```

### Mistake 2: Incomplete JSON
```
❌ {"type":"service_account"  (incomplete)
❌ service_account            (not the full JSON)
✅ {"type":"service_account","project_id":"circuithub-75f4a",...} (complete)
```

### Mistake 3: Not Restarting IDE
- Setting the variable is not enough
- You MUST restart IntelliJ for it to take effect
- Just stopping and starting the application is not enough

### Mistake 4: Wrong Configuration
- Make sure you're editing the RIGHT configuration
- If you have multiple configurations, set it for the one you're using
- Check the dropdown next to the Run button shows the right config

---

## 🔧 Troubleshooting

### Problem: "FIREBASE_CONFIG_JSON environment variable is not set"

**Solution:**
1. ✅ Verify variable name is exactly `FIREBASE_CONFIG_JSON`
2. ✅ Check you're running the correct configuration
3. ✅ Restart IntelliJ IDEA completely
4. ✅ Try again

### Problem: "Failed to initialize Firebase"

**Solution:**
1. ✅ Verify you copied the ENTIRE JSON content
2. ✅ Check for any missing characters at start or end
3. ✅ Make sure JSON starts with `{` and ends with `}`
4. ✅ The value should be 2000+ characters long

### Problem: Can't Find Environment Variables Field

**Solution:**
1. ✅ Make sure you're in "Edit Configurations" window
2. ✅ Click on your application configuration on the left
3. ✅ Scroll down in the configuration panel
4. ✅ Look for a text field with a folder icon 📁

### Problem: Changes Not Taking Effect

**Solution:**
1. ✅ Click "Apply" before clicking "OK"
2. ✅ Restart IntelliJ IDEA (don't just rerun the app)
3. ✅ Clear IntelliJ cache: File → Invalidate Caches → Invalidate and Restart

---

## 💡 Pro Tips

### Tip 1: Copy Configuration to All Run Configs
If you have multiple run configurations:
1. Set up the environment variable in one
2. Copy that configuration
3. Paste it for other configurations

### Tip 2: Save for Team Members
Create a template configuration:
1. Set up your configuration correctly
2. Export it: Run → Edit Configurations → ... (three dots) → Share
3. Check "Store as project file"
4. But DON'T include the environment variable value
5. Share the template, team members just add their own value

### Tip 3: Verify Anytime
To check if the variable is set:
```java
String value = System.getenv("FIREBASE_CONFIG_JSON");
System.out.println("Variable set: " + (value != null));
System.out.println("Length: " + (value != null ? value.length() : 0));
```

---

## 🎓 Additional Resources

**IntelliJ Documentation:**
- [Run/Debug Configurations](https://www.jetbrains.com/help/idea/run-debug-configuration.html)
- [Environment Variables](https://www.jetbrains.com/help/idea/absolute-path-variables.html)

**Our Docs:**
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Complete setup guide
- [QUICK_SETUP.md](./QUICK_SETUP.md) - Quick reference
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Verification steps

---

## ✅ Final Verification

After completing all steps, you should:

1. **See this in your Run Configuration:**
   ```
   Environment variables: FIREBASE_CONFIG_JSON={"type"...
   ```

2. **See this when you run the application:**
   ```
   ✅ Found FIREBASE_CONFIG_JSON environment variable
   ✅ Firebase initialized successfully!
   ```

3. **Be able to:**
   - Start the backend without errors
   - Log in to the frontend
   - Make API calls successfully

---

**Congratulations! You're all set up! 🎉**

If you followed this guide and everything works, you're done! You should never need to regenerate your Firebase keys again (unless they're compromised).

---

*Need help with other IDEs? Check [QUICK_SETUP.md](./QUICK_SETUP.md)*
