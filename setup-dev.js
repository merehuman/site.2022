#!/usr/bin/env node

/**
 * Development setup script for the portfolio website
 * Installs dependencies and sets up development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Jessa Gillespie Portfolio Development Environment...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found. Please run this script from the project root.');
    process.exit(1);
}

// Create necessary directories
const dirs = ['js', 'images', 'css'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies already installed');
}

// Create .gitignore if it doesn't exist
const gitignoreContent = `
# Dependencies
node_modules/

# Development files
.DS_Store
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Build outputs
dist/
build/
`;

if (!fs.existsSync('.gitignore')) {
    fs.writeFileSync('.gitignore', gitignoreContent.trim());
    console.log('✅ Created .gitignore file');
}

// Validate HTML files
console.log('\n🔍 Validating HTML files...');
try {
    execSync('npm run validate', { stdio: 'inherit' });
    console.log('✅ HTML validation passed');
} catch (error) {
    console.warn('⚠️  HTML validation failed - this is normal if html-validate is not installed');
}

// Lint JavaScript files
console.log('\n🔍 Linting JavaScript files...');
try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ JavaScript linting passed');
} catch (error) {
    console.warn('⚠️  JavaScript linting failed - this is normal if eslint is not installed');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run "npm run dev" to start the development server');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Start coding! 🚀\n');

console.log('📚 Available commands:');
console.log('  npm run dev     - Start development server');
console.log('  npm run lint    - Check code quality');
console.log('  npm run format  - Format code');
console.log('  npm run validate - Validate HTML');
console.log('  npm start       - Start production server\n'); 