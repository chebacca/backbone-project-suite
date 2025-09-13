#!/bin/bash

# 🚀 Cursor CLI Workflow Script for BACKBONE v14.2
# Optimized for Firebase Web-Only Development

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
LICENSING_DIR="$PROJECT_ROOT/dashboard-v14-licensing-website 2"
SHARED_LIBRARY="$PROJECT_ROOT/shared-mpc-library"

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

# Function to check if cursor CLI is installed
check_cursor_cli() {
    if ! command -v cursor &> /dev/null; then
        print_error "Cursor CLI not found. Please install it first:"
        echo "1. Open Cursor"
        echo "2. Press Cmd/Ctrl + Shift + P"
        echo "3. Type 'Install' and select 'Shell Command: Install cursor command in PATH'"
        exit 1
    fi
    print_success "Cursor CLI is installed"
}

# Function to open dashboard project
open_dashboard() {
    print_status "Opening BACKBONE Dashboard project..."
    cursor "$DASHBOARD_DIR/"
    print_success "Dashboard project opened"
}

# Function to open licensing website
open_licensing() {
    print_status "Opening Licensing website project..."
    cursor "$LICENSING_DIR/"
    print_success "Licensing project opened"
}

# Function to open specific feature
open_feature() {
    local feature=$1
    case $feature in
        "inventory")
            print_status "Opening Inventory feature..."
            cursor "$DASHBOARD_DIR/apps/web/src/features/inventory/"
            ;;
        "sessions")
            print_status "Opening Sessions feature..."
            cursor "$DASHBOARD_DIR/apps/web/src/features/sessions/"
            ;;
        "client")
            print_status "Opening Client feature..."
            cursor "$DASHBOARD_DIR/apps/web/src/features/client/"
            ;;
        "timecard")
            print_status "Opening Timecard feature..."
            cursor "$DASHBOARD_DIR/apps/web/src/features/timecard-approval/"
            ;;
        "callsheets")
            print_status "Opening Call Sheets feature..."
            cursor "$DASHBOARD_DIR/apps/web/src/features/daily-callsheets/"
            ;;
        *)
            print_error "Unknown feature: $feature"
            echo "Available features: inventory, sessions, client, timecard, callsheets"
            exit 1
            ;;
    esac
    print_success "Feature opened: $feature"
}

# Function to open Firebase functions
open_functions() {
    print_status "Opening Firebase Functions..."
    cursor "$DASHBOARD_DIR/functions/src/index.ts"
    print_success "Firebase Functions opened"
}

# Function to open configuration files
open_config() {
    print_status "Opening configuration files..."
    cursor "$DASHBOARD_DIR/.cursor-settings.json" \
           "$DASHBOARD_DIR/.cursor-auto-features.json" \
           "$DASHBOARD_DIR/firebase.json" \
           "$DASHBOARD_DIR/apps/web/src/services/firebaseConfig.ts"
    print_success "Configuration files opened"
}

# Function to open shared library
open_library() {
    local doc=$1
    if [ -z "$doc" ]; then
        print_status "Opening shared MPC library..."
        cursor "$SHARED_LIBRARY/"
    else
        print_status "Opening specific library document: $doc"
        cursor "$SHARED_LIBRARY/$doc"
    fi
    print_success "Library opened"
}

# Function to open development environment
open_dev_env() {
    print_status "Opening complete development environment..."
    
    # Open main dashboard
    cursor "$DASHBOARD_DIR/" --new-window
    
    # Open Firebase functions in same window
    cursor "$DASHBOARD_DIR/functions/src/index.ts" --add
    
    # Open shared library in same window
    cursor "$SHARED_LIBRARY/" --add
    
    print_success "Complete development environment opened"
}

# Function to open build and deploy workflow
open_build_deploy() {
    print_status "Opening build and deploy workflow..."
    
    # Open main project
    cursor "$DASHBOARD_DIR/" --new-window
    
    # Open build configuration
    cursor "$DASHBOARD_DIR/apps/web/package.json" --add
    cursor "$DASHBOARD_DIR/apps/web/esbuild.config.js" --add
    
    # Open deployment scripts
    cursor "$PROJECT_ROOT/deployment/" --add
    
    print_success "Build and deploy workflow opened"
}

# Function to open specific file with line number
open_file_at_line() {
    local file_path=$1
    local line_number=$2
    
    if [ -z "$line_number" ]; then
        cursor "$DASHBOARD_DIR/$file_path"
    else
        cursor --goto "$line_number:1" "$DASHBOARD_DIR/$file_path"
    fi
    print_success "File opened: $file_path at line $line_number"
}

# Function to show help
show_help() {
    echo "🚀 Cursor CLI Workflow Script for BACKBONE v14.2"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dashboard              Open main dashboard project"
    echo "  licensing             Open licensing website project"
    echo "  feature <name>        Open specific feature (inventory, sessions, client, timecard, callsheets)"
    echo "  functions             Open Firebase Functions"
    echo "  config                Open configuration files"
    echo "  library [doc]         Open shared MPC library (optionally specific document)"
    echo "  dev-env               Open complete development environment"
    echo "  build-deploy          Open build and deploy workflow"
    echo "  file <path> [line]    Open specific file (optionally at line number)"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dashboard"
    echo "  $0 feature inventory"
    echo "  $0 file apps/web/src/features/inventory/InventoryPage.tsx 100"
    echo "  $0 library CURSOR_AUTO_OPTIMIZATION_GUIDE.md"
    echo "  $0 dev-env"
}

# Main script logic
main() {
    check_cursor_cli
    
    case $1 in
        "dashboard")
            open_dashboard
            ;;
        "licensing")
            open_licensing
            ;;
        "feature")
            if [ -z "$2" ]; then
                print_error "Feature name required"
                echo "Available features: inventory, sessions, client, timecard, callsheets"
                exit 1
            fi
            open_feature "$2"
            ;;
        "functions")
            open_functions
            ;;
        "config")
            open_config
            ;;
        "library")
            open_library "$2"
            ;;
        "dev-env")
            open_dev_env
            ;;
        "build-deploy")
            open_build_deploy
            ;;
        "file")
            if [ -z "$2" ]; then
                print_error "File path required"
                exit 1
            fi
            open_file_at_line "$2" "$3"
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
