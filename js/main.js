/**
 * Main JavaScript file for Jessa Gillespie's portfolio website
 * Handles menu functionality and interactive elements
 */

// Use strict mode for better error catching and performance
'use strict';

// Import configuration and utilities
// Note: In a real module system, these would be proper imports
// For now, we'll assume they're loaded before this script

// Main application class
class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        try {
            // Menu functionality
            const showMenuButton = document.getElementById('showMenu');
            const hideMenuButton = document.getElementById('hideContent');
            const popupMenu = document.getElementById('popUpMenu');

            if (showMenuButton && hideMenuButton && popupMenu) {
                this.setupMenu(showMenuButton, hideMenuButton, popupMenu);
            }

            // Add keyboard navigation
            this.setupKeyboardNavigation();

            // Add performance monitoring
            this.setupPerformanceMonitoring();

            // Add smoke animation
            this.setupSmokeAnimation();

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupMenu(showButton, hideButton, menu) {
        // Show menu - position below button
        showButton.addEventListener('click', function() {

            menu.classList.remove('hidden');
            hideButton.style.display = 'inline';
        });

        // Hide menu - original behavior
        hideButton.addEventListener('click', function() {
            menu.classList.add('hidden');
            showButton.style.display = 'inline';
        });


    }



    setupKeyboardNavigation() {
        // Add keyboard navigation for links
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('blinking-link')) {
                e.target.click();
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }
        });
    }

    setupSmokeAnimation() {
        // Only run on index page
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            const smoke1 = document.getElementById('smoke1');
            const smoke2 = document.getElementById('smoke2');
            const smoke3 = document.getElementById('smoke3');
            const smoke4 = document.getElementById('smoke4');
            const smoke5 = document.getElementById('smoke5');
            
            if (smoke1 && smoke2 && smoke3 && smoke4 && smoke5) {
                const smokeChars1 = ['.', "'"]; // For smoke1 and smoke3
                const smokeChars2 = [':', '.']; // For smoke2, smoke4, and smoke5
                let currentFrame = 0;
                
                setInterval(() => {
                    const currentChar1 = smokeChars1[currentFrame];
                    const currentChar2 = smokeChars2[currentFrame];
                    const oppositeChar1 = smokeChars1[(currentFrame + 1) % smokeChars1.length];
                    
                    smoke1.textContent = currentChar1;
                    smoke2.textContent = currentChar2;
                    smoke3.textContent = oppositeChar1;
                    smoke4.textContent = currentChar2;
                    smoke5.textContent = currentChar2;
                    
                    currentFrame = (currentFrame + 1) % smokeChars1.length;
                }, 2000); // Change every 2000ms
            }
        }
    }
}

// Initialize the application
const app = new PortfolioApp();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
} 