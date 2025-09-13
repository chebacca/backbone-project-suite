#!/bin/bash

# 🔥 Cursor Firebase Build & Deploy Script
# Optimized for BACKBONE v14.2 Web-Only Architecture

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files"
DASHBOARD_DIR="$PROJECT_ROOT/Dashboard-v14_2"
WEB_APP_DIR="$DASHBOARD_DIR/apps/web"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -d "$DASHBOARD_DIR" ]; then
        print_error "Dashboard directory not found: $DASHBOARD_DIR"
        exit 1
    fi
    
    # Check if web app directory exists
    if [ ! -d "$WEB_APP_DIR" ]; then
        print_error "Web app directory not found: $WEB_APP_DIR"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "$WEB_APP_DIR/package.json" ]; then
        print_error "package.json not found in web app directory"
        exit 1
    fi
    
    # Check if firebase.json exists
    if [ ! -f "$DASHBOARD_DIR/firebase.json" ]; then
        print_error "firebase.json not found in dashboard directory"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to build the web application
build_web_app() {
    print_status "Building web application..."
    
    # Navigate to web app directory
    cd "$WEB_APP_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Build the application
    print_status "Running build process..."
    npm run build
    
    # Check if build was successful
    if [ ! -d "public" ]; then
        print_error "Build failed - public directory not created"
        exit 1
    fi
    
    print_success "Web application built successfully"
}

# Function to deploy to Firebase
deploy_to_firebase() {
    local target=$1
    
    print_status "Deploying to Firebase..."
    
    # Navigate to dashboard directory (where firebase.json is located)
    cd "$DASHBOARD_DIR"
    
    # Deploy based on target
    case $target in
        "hosting")
            print_status "Deploying hosting only..."
            firebase deploy --only hosting
            ;;
        "functions")
            print_status "Deploying functions only..."
            firebase deploy --only functions
            ;;
        "both")
            print_status "Deploying hosting and functions..."
            firebase deploy --only hosting,functions
            ;;
        *)
            print_error "Unknown deployment target: $target"
            echo "Available targets: hosting, functions, both"
            exit 1
            ;;
    esac
    
    print_success "Firebase deployment completed"
}

# Function to open relevant files in Cursor after build
open_build_files() {
    print_status "Opening build-related files in Cursor..."
    
    # Open main project
    cursor "$DASHBOARD_DIR/" --new-window
    
    # Open build output
    cursor "$WEB_APP_DIR/public/" --add
    
    # Open build configuration
    cursor "$WEB_APP_DIR/esbuild.config.js" --add
    cursor "$WEB_APP_DIR/package.json" --add
    
    # Open Firebase configuration
    cursor "$DASHBOARD_DIR/firebase.json" --add
    
    print_success "Build files opened in Cursor"
}

# Function to run health check
run_health_check() {
    print_status "Running health check..."
    
    # Check if the API is responding
    local api_url="https://us-central1-backbone-logic.cloudfunctions.net/healthCheck"
    
    if curl -s "$api_url" > /dev/null; then
        print_success "Health check passed - API is responding"
    else
        print_warning "Health check failed - API may not be responding"
    fi
}

# Function to show build status
show_build_status() {
    print_status "Build Status Summary:"
    echo ""
    echo "📁 Project Structure:"
    echo "  Dashboard: $DASHBOARD_DIR"
    echo "  Web App: $WEB_APP_DIR"
    echo "  Build Output: $WEB_APP_DIR/public"
    echo ""
    echo "🌐 Deployment URLs:"
    echo "  Main App: https://backbone-client.web.app"
    echo "  Licensing: https://backbone-logic.web.app"
    echo "  API: https://api-oup5qxogca-uc.a.run.app"
    echo ""
    echo "🔧 Firebase Project: backbone-logic"
    echo "🎯 Hosting Target: backbone-client"
}

# Function to show help
show_help() {
    echo "🔥 Cursor Firebase Build & Deploy Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build                    Build web application only"
    echo "  deploy <target>          Deploy to Firebase (hosting, functions, both)"
    echo "  build-deploy <target>    Build and deploy in one command"
    echo "  health                   Run health check"
    echo "  status                   Show build status"
    echo "  open                     Open build files in Cursor"
    echo "  help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 deploy hosting"
    echo "  $0 deploy functions"
    echo "  $0 deploy both"
    echo "  $0 build-deploy hosting"
    echo "  $0 health"
    echo "  $0 status"
    echo "  $0 open"
}

# Main script logic
main() {
    case $1 in
        "build")
            check_prerequisites
            build_web_app
            show_build_status
            ;;
        "deploy")
            if [ -z "$2" ]; then
                print_error "Deployment target required"
                echo "Available targets: hosting, functions, both"
                exit 1
            fi
            check_prerequisites
            deploy_to_firebase "$2"
            run_health_check
            ;;
        "build-deploy")
            if [ -z "$2" ]; then
                print_error "Deployment target required"
                echo "Available targets: hosting, functions, both"
                exit 1
            fi
            check_prerequisites
            build_web_app
            deploy_to_firebase "$2"
            run_health_check
            show_build_status
            ;;
        "health")
            run_health_check
            ;;
        "status")
            show_build_status
            ;;
        "open")
            open_build_files
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
