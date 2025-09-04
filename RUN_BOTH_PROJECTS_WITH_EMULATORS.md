# 🚀 Running Both Projects with Firebase Emulators

## 🎯 **Overview**
This guide shows you how to run both the **Dashboard-v14_2** (main web app) and **dashboard-v14-licensing-website 2** (licensing website) through the Firebase emulators with your seeded enterprise data.

---

## 🔧 **Current Emulator Status**
✅ **Emulators Running**: Auth (9099), Firestore (8080), Functions (5001)  
✅ **Enterprise Data**: 1,293+ documents seeded  
✅ **Emulator UI**: http://localhost:4000  

---

## 📱 **Method 1: Dashboard-v14_2 Web App**

### 🏗️ **Build and Serve the Web App**

```bash
# Navigate to Dashboard-v14_2
cd Dashboard-v14_2

# Set emulator environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Build the web application
cd apps/web && npm run build

# Go back to root and start hosting emulator
cd ../..
firebase emulators:start --only hosting --port 3000
```

### 🌐 **Access Points**
- **Web App**: http://localhost:3000
- **API**: http://localhost:5001/backbone-logic/us-central1/api/*
- **Emulator UI**: http://localhost:4000

---

## 🌐 **Method 2: Licensing Website**

### 🏗️ **Build and Serve the Licensing Website**

```bash
# Navigate to licensing website (in a new terminal)
cd "dashboard-v14-licensing-website 2"

# Set emulator environment variables to connect to existing emulators
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Build the licensing website
npm run build

# Start hosting emulator on different port
firebase emulators:start --only hosting --port 5001
```

### 🌐 **Access Points**
- **Licensing Website**: http://localhost:5001
- **Shared API**: http://localhost:5001/backbone-logic/us-central1/api/*
- **Shared Emulator UI**: http://localhost:4000

---

## 🔄 **Method 3: Run Both Simultaneously**

### 🚀 **Terminal 1: Keep Current Emulators Running**
```bash
# Your emulators are already running with:
# - Auth: 9099
# - Firestore: 8080  
# - Functions: 5001
# - UI: 4000
# Keep this terminal running!
```

### 📱 **Terminal 2: Dashboard Web App**
```bash
cd Dashboard-v14_2

# Set environment variables
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Build and serve
cd apps/web && npm run build && cd ../..
firebase emulators:start --only hosting --port 3000
```

### 🌐 **Terminal 3: Licensing Website**
```bash
cd "dashboard-v14-licensing-website 2"

# Set environment variables  
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Build and serve on different port
npm run build
firebase emulators:start --only hosting --port 8080
```

---

## 🎯 **Access All Services**

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard Web App** | http://localhost:5002 | Main BACKBONE application |
| **Licensing Website** | http://localhost:5001 | License management portal |
| **Firebase Emulator UI** | http://localhost:4000 | Database & auth management |
| **API Endpoints** | http://localhost:5001/backbone-logic/us-central1/api/* | Shared backend API |

---

## 🔑 **Test Credentials**

### 👤 **Enterprise User**
- **Email**: `enterprise.user@enterprisemedia.com`
- **Password**: `Enterprise123!`
- **Organization**: Enterprise Media Solutions
- **Role**: Admin (Full Access)

### 👤 **Alternative Test User**
- **Email**: `chebacca@gmail.com`  
- **Password**: `admin1234`
- **Role**: ADMIN (Full system access)

---

## 🛠️ **Client-Side Configuration**

### 📱 **Dashboard Web App Configuration**
Create or update `Dashboard-v14_2/apps/web/src/firebase-config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'backbone-logic',
  // Add other config as needed
};

const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Connect to emulators in development
if (location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { auth, db, functions, storage };
```

### 🌐 **Licensing Website Configuration**
Create or update `dashboard-v14-licensing-website 2/client/src/firebase-config.js`:

```javascript
// Same configuration as above - both projects share the same Firebase project
```

---

## 🔍 **Troubleshooting**

### ❌ **Port Conflicts**
If you get port conflicts:
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### 🔄 **Environment Variables Not Working**
Make sure to export variables in each terminal:
```bash
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### 📱 **Build Issues**
If builds fail, try:
```bash
# Dashboard
cd Dashboard-v14_2/apps/web
npm install
npm run build

# Licensing Website  
cd "../../dashboard-v14-licensing-website 2"
npm install
npm run build
```

---

## 🎉 **Success Indicators**

### ✅ **Dashboard Web App Working**
- ✅ Loads at http://localhost:3000
- ✅ Can login with test credentials
- ✅ Shows enterprise data (26 team members, 15 projects)
- ✅ API calls work (check Network tab)

### ✅ **Licensing Website Working**  
- ✅ Loads at http://localhost:8080
- ✅ Can login with same test credentials
- ✅ Shows license data (250 licenses)
- ✅ Shares same backend data

### ✅ **Both Projects Connected**
- ✅ Same user can login to both
- ✅ Data changes reflect in both apps
- ✅ Emulator UI shows all activity

---

## 🚀 **Quick Start Commands**

### 🎯 **One-Command Setup**
```bash
# Terminal 1: Keep emulators running (already done)

# Terminal 2: Dashboard
cd Dashboard-v14_2 && export FIRESTORE_EMULATOR_HOST=localhost:8080 && export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 && cd apps/web && npm run build && cd ../.. && firebase emulators:start --only hosting --port 3000

# Terminal 3: Licensing  
cd "dashboard-v14-licensing-website 2" && export FIRESTORE_EMULATOR_HOST=localhost:8080 && export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 && npm run build && firebase emulators:start --only hosting --port 8080
```

Now you can develop and test both projects locally with your complete enterprise dataset! 🎯
