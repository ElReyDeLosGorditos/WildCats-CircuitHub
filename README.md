# CircuitHub - Equipment Management System

A comprehensive web-based equipment management system for tracking and managing laboratory equipment, built with React + Vite frontend and Spring Boot backend.

---

## ⚠️ IMPORTANT: Firebase Setup Required

**Before running this application, you MUST configure Firebase authentication.**

### 🚀 Quick Setup (5 minutes)

1. **Get Firebase Service Account JSON** from Firebase Console or your team lead
2. **Set Environment Variable:**
   - See [QUICK_SETUP.md](./QUICK_SETUP.md) for step-by-step instructions
   - Variable name: `FIREBASE_CONFIG_JSON`
   - Variable value: Entire JSON content from service account file

3. **Verify it works:**
   ```
   ✅ Firebase initialized successfully!
   ```

**Detailed guides:**
- [QUICK_SETUP.md](./QUICK_SETUP.md) - Fast setup instructions for all IDEs
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Complete setup guide
- [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md) - Why we changed this

---

## 🏗️ Project Structure

```
WildCats-CircuitHub/
├── backend/                 # Spring Boot Backend
│   └── src/main/java/
│       └── com/example/CircuitHub/
│           ├── config/      # Firebase & Security Config
│           ├── controller/  # REST API Endpoints
│           ├── model/       # Data Models
│           ├── repository/  # Database Layer
│           └── service/     # Business Logic
├── src/                     # React Frontend
│   ├── components/          # Reusable Components
│   ├── contexts/            # React Contexts
│   ├── pages/               # Page Components
│   └── services/            # API Services
└── public/                  # Static Assets
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Material-UI (MUI)** for components
- **Firebase Authentication** for user management
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Spring Boot 3** (Java)
- **Firebase Admin SDK** for authentication
- **Spring Security** for authorization
- **Firestore** for database
- **Maven** for dependency management

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.8+
- Firebase Service Account JSON

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 2. Backend Setup

**CRITICAL:** Configure Firebase environment variable first!

```bash
# Navigate to backend directory
cd backend

# Set environment variable (see QUICK_SETUP.md for your IDE)
export FIREBASE_CONFIG_JSON='{"type":"service_account",...}'

# Build and run
mvn clean install
mvn spring-boot:run
```

The backend API will run on `http://localhost:8080`

---

## 📚 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
mvn clean install    # Build project
mvn spring-boot:run  # Run application
mvn test            # Run tests
```

---

## 🔐 Security & Configuration

### Environment Variables

**Required:**
- `FIREBASE_CONFIG_JSON` - Firebase service account credentials (backend)

**Optional:**
- `DB_HOST` - Database host (if using external DB)
- `DB_PORT` - Database port
- `SERVER_PORT` - Backend server port (default: 8080)

### Security Notes
- ✅ Firebase service account stored as environment variable
- ✅ All sensitive files in `.gitignore`
- ✅ CORS configured for local development
- ✅ JWT token-based authentication
- ❌ Never commit `firebase-service-account.json` to Git

---

## 📖 API Documentation

### Authentication
All API requests require a Firebase JWT token in the Authorization header:
```
Authorization: Bearer <firebase-jwt-token>
```

### Main Endpoints

**Users:**
- `GET /api/users` - Get all users
- `GET /api/users/{uid}/profile` - Get user profile
- `PUT /api/users/{uid}/profile` - Update user profile
- `POST /api/users/{uid}/profile-image` - Upload profile image

**Items (Equipment):**
- `GET /api/items` - Get all items
- `GET /api/items/{id}` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

**Borrow Requests:**
- `GET /api/requests` - Get all requests
- `GET /api/requests/user/{userId}` - Get user's requests
- `POST /api/requests` - Create new request
- `PUT /api/requests/{id}/teacher-approve` - Teacher approval
- `PUT /api/requests/{id}/lab-approve` - Lab approval

See full API documentation: [API_DOCS.md](./API_DOCS.md) (if available)

---

## 🧪 Running Tests

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
mvn test
```

---

## 🚢 Deployment

### Frontend (Vercel, Netlify, etc.)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku, Railway, Render, etc.)

1. Set environment variable `FIREBASE_CONFIG_JSON` in your platform
2. Deploy using platform-specific instructions
3. Update frontend API base URL to production URL

**Example (Heroku):**
```bash
heroku config:set FIREBASE_CONFIG_JSON="$(cat firebase-service-account.json)"
git push heroku main
```

---

## 🔧 Troubleshooting

### "FIREBASE_CONFIG_JSON environment variable is not set"
→ Follow [QUICK_SETUP.md](./QUICK_SETUP.md) to configure the environment variable

### "Failed to initialize Firebase"
→ Check JSON format, ensure no line breaks in the middle

### CORS errors
→ Verify backend URL in `src/services/api.js`

### Build fails
→ Run `mvn clean install` and `npm install` to refresh dependencies

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Team

WildCats Development Team

---

## 📞 Support

For issues or questions:
1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for setup help
2. Review troubleshooting section above
3. Contact your team lead
4. Create an issue in the repository

---

**Remember: Always configure Firebase environment variable before running the application!**
