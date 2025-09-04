#!/bin/bash

# Test Runner Script for User Registration Flow
# This script allows running specific parts of the comprehensive test

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --full              Run the complete test suite"
    echo "  --registration      Test only user registration"
    echo "  --firebase          Test only Firebase Auth integration"
    echo "  --firestore         Test only Firestore document creation"
    echo "  --email-verify      Test only email verification"
    echo "  --2fa               Test only 2FA setup"
    echo "  --subscription      Test only subscription creation"
    echo "  --team-member       Test only team member creation"
    echo "  --project           Test only project creation"
    echo "  --cleanup           Clean up test data only"
    echo "  --setup             Setup test environment only"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --full                    # Run all tests"
    echo "  $0 --registration            # Test user registration only"
    echo "  $0 --2fa --subscription     # Test 2FA and subscription"
    echo "  $0 --cleanup                 # Clean up test data"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check if test file exists
    if [ ! -f "test-user-registration-flow.js" ]; then
        print_error "test-user-registration-flow.js not found in current directory"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Running setup..."
        ./setup-test-environment.sh
    fi
    
    print_success "Prerequisites check passed"
}

# Function to run specific test
run_specific_test() {
    local test_name="$1"
    local test_function="$2"
    
    print_status "Running $test_name test..."
    
    # Create a temporary test file with only the specific test
    cat > "temp-test-${test_name}.js" << EOF
#!/usr/bin/env node

const { runTests } = require('./test-user-registration-flow.js');

// Override runTests to only run specific test
async function runSpecificTest() {
    console.log('🧪 Running $test_name test only...');
    
    try {
        // Import the test function from the main file
        const mainTest = require('./test-user-registration-flow.js');
        
        // Run only the specific test
        await mainTest.${test_function}();
        
        console.log('✅ $test_name test completed successfully');
    } catch (error) {
        console.error('❌ $test_name test failed:', error.message);
        process.exit(1);
    }
}

runSpecificTest();
EOF
    
    # Run the specific test
    node "temp-test-${test_name}.js"
    
    # Clean up temporary file
    rm "temp-test-${test_name}.js"
}

# Function to run full test
run_full_test() {
    print_status "Running full test suite..."
    node test-user-registration-flow.js
}

# Function to setup environment
setup_environment() {
    print_status "Setting up test environment..."
    ./setup-test-environment.sh
}

# Function to cleanup test data
cleanup_test_data() {
    print_status "Cleaning up test data..."
    
    # Create a cleanup script
    cat > "temp-cleanup.js" << 'EOF'
#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
const app = admin.initializeApp({
    projectId: 'backbone-logic'
});

const auth = admin.auth();
const db = admin.firestore();

async function cleanupTestData() {
    try {
        console.log('🧹 Cleaning up test data...');
        
        // Clean up test user
        try {
            const userRecord = await auth.getUserByEmail('chrismole@example.com');
            await auth.deleteUser(userRecord.uid);
            console.log('✅ Test user deleted from Firebase Auth');
        } catch (error) {
            console.log('ℹ️  Test user not found in Firebase Auth');
        }
        
        // Clean up team member
        try {
            const teamMemberRecord = await auth.getUserByEmail('teammember@example.com');
            await auth.deleteUser(teamMemberRecord.uid);
            console.log('✅ Team member deleted from Firebase Auth');
        } catch (error) {
            console.log('ℹ️  Team member not found in Firebase Auth');
        }
        
        // Clean up Firestore documents
        const userDocs = await db.collection('users').where('email', 'in', ['chrismole@example.com', 'teammember@example.com']).get();
        for (const doc of userDocs.docs) {
            await doc.ref.delete();
        }
        console.log('✅ Test user documents deleted from Firestore');
        
        // Clean up projects (if any)
        const projectDocs = await db.collection('projects').where('name', '==', 'Test Project').get();
        for (const doc of projectDocs.docs) {
            await doc.ref.delete();
        }
        console.log('✅ Test projects deleted from Firestore');
        
        console.log('✅ Cleanup completed successfully');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

cleanupTestData();
EOF
    
    # Run cleanup
    node "temp-cleanup.js"
    
    # Clean up temporary file
    rm "temp-cleanup.js"
}

# Main script logic
main() {
    # Check if no arguments provided
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Process arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                run_full_test
                shift
                ;;
            --registration)
                run_specific_test "User Registration" "testUserRegistration"
                shift
                ;;
            --firebase)
                run_specific_test "Firebase Auth" "testFirebaseAuthUser"
                shift
                ;;
            --firestore)
                run_specific_test "Firestore" "testFirestoreUserDocument"
                shift
                ;;
            --email-verify)
                run_specific_test "Email Verification" "testEmailVerification"
                shift
                ;;
            --2fa)
                run_specific_test "2FA Setup" "test2FASetup"
                shift
                ;;
            --subscription)
                run_specific_test "Subscription Creation" "testSubscriptionCreation"
                shift
                ;;
            --team-member)
                run_specific_test "Team Member Creation" "testTeamMemberCreation"
                shift
                ;;
            --project)
                run_specific_test "Project Creation" "testProjectCreation"
                shift
                ;;
            --cleanup)
                cleanup_test_data
                shift
                ;;
            --setup)
                setup_environment
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Run main function with all arguments
main "$@"
