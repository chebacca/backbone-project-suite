#!/bin/bash

# Fix Firebase Auth Authentication for chebacca@gmail.com
# This script creates a Firebase Auth user for the existing server user

set -e

echo "🚀 Fixing Firebase Auth Authentication for chebacca@gmail.com..."

# Navigate to licensing website server
cd "dashboard-v14-licensing-website 2/server"

echo "📦 Installing dependencies..."
npm install

echo "🔧 Creating Firebase Auth user for chebacca@gmail.com..."

# Check if the user exists in the server database first
echo "🔍 Checking if user exists in server database..."
node -e "
import('./src/services/firestoreService.js').then(async (module) => {
  const { FirestoreService } = module;
  const firestoreService = new FirestoreService();
  
  try {
    const user = await firestoreService.getUserByEmail('chebacca@gmail.com');
    if (user) {
      console.log('✅ User found in server database:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } else {
      console.log('❌ User not found in server database');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error checking user:', error.message);
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Error importing service:', error.message);
  process.exit(1);
});
"

if [ $? -ne 0 ]; then
  echo "❌ Failed to verify user in server database"
  exit 1
fi

echo "🔑 Creating Firebase Auth user..."
cd "../scripts"

# Create Firebase Auth user with a temporary password
# The user will need to change this password on first login
node create-firebase-auth-user.js "chebacca@gmail.com" "TempPass123!" "Chebacca"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Firebase Auth user created successfully!"
  echo ""
  echo "🔑 Temporary Credentials:"
  echo "   📧 Email: chebacca@gmail.com"
  echo "   🔑 Password: TempPass123!"
  echo ""
  echo "💡 The user should now be able to:"
  echo "   1. Log in with these credentials"
  echo "   2. Access Firestore data in webonly mode"
  echo "   3. Change their password on first login"
  echo ""
  echo "🌐 Test the fix by logging in at:"
  echo "   https://backbone-logic.web.app"
  echo ""
  echo "🎉 Fix completed! The authentication issue should be resolved."
else
  echo "❌ Failed to create Firebase Auth user"
  exit 1
fi
