/**
 * Configuration file for the portfolio website
 * Centralizes all configurable settings
 */

const CONFIG = {
    // Animation settings
    animations: {
        blinkDuration: 2000,
        transitionDuration: 300,
        menuTransitionDuration: 300
    },
    
    // Performance settings
    performance: {
        enableMonitoring: true,
        logLoadTimes: true
    },
    
    // Accessibility settings
    accessibility: {
        enableKeyboardNavigation: true,
        enableFocusManagement: true,
        enableScreenReaderSupport: true
    },
    
    // Menu settings
    menu: {
        closeOnEscape: true,
        closeOnOutsideClick: true,
        autoFocusFirstItem: true
    },
    
    // External links
    externalLinks: {
        resume: 'https://docs.google.com/document/d/1BfO-WC4rHDQVzDeM3lUc8UpPWYbTF5OtAjGh4M7GQTg/edit?usp=sharing',
        github: 'https://github.com/merehuman',
        carbonCheck: 'https://www.websitecarbon.com/website/merehuman-live/'
    },
    
    // Page routes
    routes: {
        home: 'index.html',
        info: 'info.html',
        desktop: 'desktop.html',
        storage: 'storage.html',
        enter: 'enter.html',
        notFound: '404.html'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 