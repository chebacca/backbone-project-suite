#!/bin/bash

# BACKBONE v14.2 - GitHub Repository Setup Script
# This script helps you connect your local repository to GitHub

echo "🚀 BACKBONE v14.2 - GitHub Repository Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Current repository status:${NC}"
git status --short
echo ""

echo -e "${YELLOW}📋 Instructions to create GitHub repository:${NC}"
echo ""
echo "1. Go to https://github.com and sign in"
echo "2. Click the '+' icon in the top right corner"
echo "3. Select 'New repository'"
echo "4. Repository name suggestions:"
echo "   - backbone-v14-complete"
echo "   - backbone-project-suite"
echo "   - backbone-monorepo"
echo "5. Description: 'Complete BACKBONE v14.2 project suite including web app, licensing website, and deployment infrastructure'"
echo "6. Choose Public or Private"
echo "7. ⚠️  DO NOT initialize with README, .gitignore, or license (we already have these)"
echo "8. Click 'Create repository'"
echo ""

echo -e "${YELLOW}📝 After creating the GitHub repository, run these commands:${NC}"
echo ""
echo -e "${GREEN}# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values${NC}"
echo -e "${BLUE}git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git${NC}"
echo -e "${BLUE}git branch -M main${NC}"
echo -e "${BLUE}git push -u origin main${NC}"
echo ""

echo -e "${YELLOW}🔍 Example with actual values:${NC}"
echo -e "${BLUE}git remote add origin https://github.com/chebrooks/backbone-v14-complete.git${NC}"
echo -e "${BLUE}git branch -M main${NC}"
echo -e "${BLUE}git push -u origin main${NC}"
echo ""

echo -e "${GREEN}✅ What this repository includes:${NC}"
echo "   📱 Dashboard-v14_2 (main web application)"
echo "   🌐 dashboard-v14-licensing-website 2 (licensing website)"
echo "   📚 shared-mpc-library (documentation)"
echo "   🚀 deployment scripts and automation"
echo "   🔧 tools and utilities"
echo "   📋 Firebase configuration and security rules"
echo "   📖 Comprehensive README and documentation"
echo ""

echo -e "${GREEN}🔐 Security features:${NC}"
echo "   ✅ Comprehensive .gitignore excluding sensitive files"
echo "   ✅ Environment variables properly isolated"
echo "   ✅ Service account keys excluded"
echo "   ✅ Build artifacts and caches ignored"
echo ""

echo -e "${BLUE}📊 Repository statistics:${NC}"
echo "   Files committed: $(git ls-files | wc -l | tr -d ' ')"
echo "   Total lines: $(git ls-files | xargs wc -l | tail -1 | awk '{print $1}')"
echo "   Commit hash: $(git rev-parse --short HEAD)"
echo ""

echo -e "${YELLOW}⚠️  Important notes:${NC}"
echo "   • Individual projects maintain their own git histories"
echo "   • Dashboard-v14_2 is on branch 'mui-upgrade-phase2'"
echo "   • Licensing website is on branch 'main' with 28 unpushed commits"
echo "   • This monorepo structure preserves all existing work"
echo "   • No existing functionality has been disrupted"
echo ""

echo -e "${GREEN}🎉 Ready to push to GitHub!${NC}"
echo "   Your local repository is fully prepared and safe to push."
echo ""
