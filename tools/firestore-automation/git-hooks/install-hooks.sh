#!/bin/bash

# ============================================================================
# GIT HOOKS INSTALLER
# ============================================================================
# 
# Installs Firestore automation Git hooks for automatic collection scanning
# and rules generation.
# 
# Usage: ./install-hooks.sh
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Installing Firestore automation Git hooks...${NC}"

# Get project root
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
SOURCE_DIR="$PROJECT_ROOT/tools/firestore-automation/git-hooks"

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo -e "${RED}❌ Not in a Git repository. Please run this from your project root.${NC}"
    exit 1
fi

# Check if source hooks exist
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Source hooks directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Install pre-commit hook
if [ -f "$SOURCE_DIR/pre-commit" ]; then
    echo -e "${BLUE}📋 Installing pre-commit hook...${NC}"
    
    # Backup existing hook if it exists
    if [ -f "$HOOKS_DIR/pre-commit" ]; then
        echo -e "${YELLOW}⚠️  Backing up existing pre-commit hook...${NC}"
        cp "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-commit.backup.$(date +%s)"
    fi
    
    # Copy and make executable
    cp "$SOURCE_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    
    echo -e "${GREEN}✅ Pre-commit hook installed${NC}"
else
    echo -e "${YELLOW}⚠️  Pre-commit hook not found in source directory${NC}"
fi

# Install post-merge hook (for pulling changes)
if [ -f "$SOURCE_DIR/post-merge" ]; then
    echo -e "${BLUE}📋 Installing post-merge hook...${NC}"
    
    # Backup existing hook if it exists
    if [ -f "$HOOKS_DIR/post-merge" ]; then
        echo -e "${YELLOW}⚠️  Backing up existing post-merge hook...${NC}"
        cp "$HOOKS_DIR/post-merge" "$HOOKS_DIR/post-merge.backup.$(date +%s)"
    fi
    
    # Copy and make executable
    cp "$SOURCE_DIR/post-merge" "$HOOKS_DIR/post-merge"
    chmod +x "$HOOKS_DIR/post-merge"
    
    echo -e "${GREEN}✅ Post-merge hook installed${NC}"
fi

# Test the collection scanner
echo -e "${BLUE}🧪 Testing collection scanner...${NC}"
SCANNER_PATH="$PROJECT_ROOT/tools/firestore-automation/collection-scanner.js"

if [ -f "$SCANNER_PATH" ]; then
    if command -v node &> /dev/null; then
        # Test run (dry run)
        if node "$SCANNER_PATH" --verbose > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Collection scanner test passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Collection scanner test failed, but hooks are installed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js for full functionality.${NC}"
    fi
else
    echo -e "${RED}❌ Collection scanner not found: $SCANNER_PATH${NC}"
    echo -e "${YELLOW}Please ensure the collection scanner is properly installed.${NC}"
fi

# Create reports directory
REPORTS_DIR="$PROJECT_ROOT/tools/firestore-automation/reports"
mkdir -p "$REPORTS_DIR"

# Add reports directory to .gitignore if not already there
GITIGNORE="$PROJECT_ROOT/.gitignore"
if [ -f "$GITIGNORE" ]; then
    if ! grep -q "tools/firestore-automation/reports" "$GITIGNORE"; then
        echo "" >> "$GITIGNORE"
        echo "# Firestore automation reports" >> "$GITIGNORE"
        echo "tools/firestore-automation/reports/" >> "$GITIGNORE"
        echo -e "${GREEN}✅ Added reports directory to .gitignore${NC}"
    fi
fi

echo -e "${GREEN}🎉 Git hooks installation complete!${NC}"
echo ""
echo -e "${BLUE}📋 What happens now:${NC}"
echo -e "  • ${GREEN}Pre-commit hook${NC}: Automatically scans for new collections before each commit"
echo -e "  • ${GREEN}Rules generation${NC}: Updates Firestore rules when new collections are detected"
echo -e "  • ${GREEN}Syntax validation${NC}: Validates rules syntax before committing"
echo ""
echo -e "${BLUE}💡 Manual usage:${NC}"
echo -e "  • Scan collections: ${YELLOW}node tools/firestore-automation/collection-scanner.js${NC}"
echo -e "  • Generate rules: ${YELLOW}node tools/firestore-automation/collection-scanner.js --generate-rules${NC}"
echo -e "  • Deploy rules: ${YELLOW}node tools/firestore-automation/collection-scanner.js --generate-rules --deploy${NC}"
echo ""
echo -e "${GREEN}✅ Your Firestore collections and rules will now stay automatically synchronized!${NC}"

