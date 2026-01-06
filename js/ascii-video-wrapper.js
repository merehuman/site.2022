/**
 * ASCII Video Wrapper
 * Automatically wraps YouTube videos with ASCII borders to make them look like screens
 */

class AsciiVideoWrapper {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.wrapVideos());
        } else {
            this.wrapVideos();
        }
    }

    wrapVideos() {
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
        
        iframes.forEach(iframe => {
            // Skip iframes that are inside youtube-video-container (they don't need ASCII borders)
            const container = iframe.closest('.youtube-video-container');
            if (container && (container.classList.contains('youtube-video-container') || container.dataset.skipAsciiWrapper === 'true')) {
                return;
            }
            
            // Skip iframes that are already wrapped
            if (!iframe.parentElement.classList.contains('ascii-video-wrapper')) {
                this.createAsciiWrapper(iframe);
            }
        });
    }

    createAsciiWrapper(iframe) {
        // Get iframe dimensions
        const originalWidth = iframe.offsetWidth || 600;
        const originalHeight = iframe.offsetHeight || 338;
        
        // Create wrapper container
        const wrapper = document.createElement('div');
        wrapper.className = 'ascii-video-wrapper';
        wrapper.style.position = 'absolute';
        wrapper.style.display = 'inline-block';
        wrapper.style.fontFamily = 'monospace';
        wrapper.style.fontSize = '12px';
        wrapper.style.lineHeight = '1';
        wrapper.style.whiteSpace = 'pre';
        wrapper.style.zIndex = '10';
        
        // Position the wrapper in the center of the ASCII monitor area
        this.positionInAsciiMonitor(wrapper);
        
        // Create a simple border that fits the video
        const borderWidth = Math.floor(originalWidth / 12); // 12px per character
        const borderHeight = Math.floor(originalHeight / 12);
        
        // Create ASCII border
        let asciiBorder = '';
        
        // Top border
        asciiBorder += '┌' + '─'.repeat(borderWidth - 2) + '┐\n';
        
        // Middle section with iframe
        for (let i = 0; i < borderHeight - 2; i++) {
            asciiBorder += '│' + ' '.repeat(borderWidth - 2) + '│\n';
        }
        
        // Bottom border
        asciiBorder += '└' + '─'.repeat(borderWidth - 2) + '┘';
        
        // Create border element
        const borderElement = document.createElement('div');
        borderElement.className = 'ascii-border';
        borderElement.textContent = asciiBorder;
        borderElement.style.position = 'absolute';
        borderElement.style.top = '0';
        borderElement.style.left = '0';
        borderElement.style.zIndex = '1';
        borderElement.style.pointerEvents = 'none';
        borderElement.style.color = 'var(--color-text)';
        
        // Position iframe within border
        iframe.style.position = 'absolute';
        iframe.style.top = '12px'; // Account for top border
        iframe.style.left = '12px'; // Account for left border
        iframe.style.zIndex = '2';
        iframe.style.width = (originalWidth - 24) + 'px';
        iframe.style.height = (originalHeight - 24) + 'px';
        
        // Insert wrapper before iframe
        iframe.parentNode.insertBefore(wrapper, iframe);
        
        // Move iframe into wrapper
        wrapper.appendChild(borderElement);
        wrapper.appendChild(iframe);
        
        // Adjust wrapper size
        wrapper.style.width = originalWidth + 'px';
        wrapper.style.height = originalHeight + 'px';
    }

    positionInAsciiMonitor(wrapper) {
        // Find the ASCII monitor area (the large rectangle in the ASCII art)
        const asciiElement = document.querySelector('.ascii');
        if (!asciiElement) return;
        
        // Get the ASCII element's position and size
        const asciiRect = asciiElement.getBoundingClientRect();
        
        // Calculate the center of the ASCII monitor area
        // The monitor is typically in the middle section of the ASCII art
        const monitorTop = asciiRect.top + (asciiRect.height * 0.2); // Adjust for monitor position
        const monitorLeft = asciiRect.left + (asciiRect.width * 0.15); // Adjust for monitor position
        const monitorWidth = asciiRect.width * 0.7; // Adjust for monitor width
        const monitorHeight = asciiRect.height * 0.4; // Adjust for monitor height
        
        // Position the wrapper in the center of the monitor area
        const wrapperWidth = wrapper.offsetWidth || 600;
        const wrapperHeight = wrapper.offsetHeight || 338;
        
        wrapper.style.position = 'fixed';
        wrapper.style.top = (monitorTop + (monitorHeight - wrapperHeight) / 2) + 'px';
        wrapper.style.left = (monitorLeft + (monitorWidth - wrapperWidth) / 2) + 'px';
        wrapper.style.zIndex = '5';
    }
}

// Initialize the wrapper
const asciiVideoWrapper = new AsciiVideoWrapper();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AsciiVideoWrapper;
} 