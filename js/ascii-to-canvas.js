/**
 * ASCII to Canvas Converter
 * Converts ASCII art drawings into pixelated canvas images displayed on the webpage
 */

class AsciiToCanvas {
    constructor(options = {}) {
        this.pixelSize = options.pixelSize || 2.5; // Size of each pixel block
        this.scale = options.scale || 1; // Overall scale multiplier
        this.replaceOriginal = options.replaceOriginal !== false; // Replace ASCII or overlay
        this.charWidth = options.charWidth || 5; // Width of character grid
        this.charHeight = options.charHeight || 7; // Height of character grid
        
        // Get primary color from CSS variable
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary').trim() || '#ff0000';
        this.lineColor = options.lineColor || primaryColor;
        
        // Build pixel font patterns
        this.pixelFont = this.buildPixelFont();
    }

    /**
     * Build pixel font patterns (5x7 grid)
     * Each character is represented as a binary pattern
     * 1 = pixel on, 0 = pixel off
     */
    buildPixelFont() {
        const font = {};
        
        // Helper to create pattern from string (easier to read)
        const pattern = (str) => {
            const lines = str.trim().split('\n');
            const grid = [];
            for (let y = 0; y < this.charHeight; y++) {
                const row = [];
                const line = lines[y] || '';
                for (let x = 0; x < this.charWidth; x++) {
                    row.push(line[x] === '#' || line[x] === 'X' || line[x] === '*');
                }
                grid.push(row);
            }
            return grid;
        };
        
        // Space and whitespace characters - all empty
        font[' '] = Array(this.charHeight).fill(null).map(() => Array(this.charWidth).fill(false));
        font['\t'] = Array(this.charHeight).fill(null).map(() => Array(this.charWidth).fill(false));
        font['\n'] = Array(this.charHeight).fill(null).map(() => Array(this.charWidth).fill(false));
        font['\r'] = Array(this.charHeight).fill(null).map(() => Array(this.charWidth).fill(false));
        
        // Letters
        font['A'] = pattern(`
.##..
#..#.
#..#.
####.
#..#.
#..#.
#..#.
`);
        font['B'] = pattern(`
###..
#..#.
#..#.
###..
#..#.
#..#.
###..
`);
        font['C'] = pattern(`
.##..
#..#.
#....
#....
#....
#..#.
.##..
`);
        font['D'] = pattern(`
###..
#..#.
#..#.
#..#.
#..#.
#..#.
###..
`);
        font['E'] = pattern(`
####.
#....
#....
###..
#....
#....
####.
`);
        font['F'] = pattern(`
####.
#....
#....
###..
#....
#....
#....
`);
        font['G'] = pattern(`
.##..
#..#.
#....
#.##.
#..#.
#..#.
.##..
`);
        font['H'] = pattern(`
#..#.
#..#.
#..#.
####.
#..#.
#..#.
#..#.
`);
        font['I'] = pattern(`
###..
..#..
..#..
..#..
..#..
..#..
###..
`);
        font['J'] = pattern(`
..##.
...#.
...#.
...#.
...#.
#..#.
.##..
`);
        font['K'] = pattern(`
#..#.
#.#..
##...
#....
##...
#.#..
#..#.
`);
        font['L'] = pattern(`
#....
#....
#....
#....
#....
#....
####.
`);
        font['M'] = pattern(`
#..#.
##.##
#.#.#
#...#
#...#
#...#
#...#
`);
        font['N'] = pattern(`
#..#.
##..#.
#.#..
#..#.
#..#.
#..#.
#..#.
`);
        font['O'] = pattern(`
.##..
#..#.
#..#.
#..#.
#..#.
#..#.
.##..
`);
        font['P'] = pattern(`
###..
#..#.
#..#.
###..
#....
#....
#....
`);
        font['Q'] = pattern(`
.##..
#..#.
#..#.
#..#.
#.#..
#..#.
.##.#
`);
        font['R'] = pattern(`
###..
#..#.
#..#.
###..
#.#..
#..#.
#..#.
`);
        font['S'] = pattern(`
.##..
#..#.
#....
.##..
..#..
#..#.
.##..
`);
        font['T'] = pattern(`
###..
..#..
..#..
..#..
..#..
..#..
..#..
`);
        font['U'] = pattern(`
#..#.
#..#.
#..#.
#..#.
#..#.
#..#.
.##..
`);
        font['V'] = pattern(`
#..#.
#..#.
#..#.
#..#.
#..#.
.##..
..#..
`);
        font['W'] = pattern(`
#...#
#...#
#...#
#.#.#
##.##
#..#.
#..#.
`);
        font['X'] = pattern(`
#..#.
#..#.
.##..
..#..
.##..
#..#.
#..#.
`);
        font['Y'] = pattern(`
#..#.
#..#.
#..#.
.##..
..#..
..#..
..#..
`);
        font['Z'] = pattern(`
####.
...#.
..#..
.#...
#....
#....
####.
`);
        
        // Numbers
        font['0'] = pattern(`
.##..
#..#.
#.##.
#.##.
##.#.
#..#.
.##..
`);
        font['1'] = pattern(`
..#..
.##..
..#..
..#..
..#..
..#..
###..
`);
        font['2'] = pattern(`
.##..
#..#.
...#.
..#..
.#...
#....
####.
`);
        font['3'] = pattern(`
.##..
#..#.
...#.
.##..
...#.
#..#.
.##..
`);
        font['4'] = pattern(`
...#..
..#.#.
.#..#.
#...#
####.
....#
....#
`);
        font['5'] = pattern(`
####.
#....
#....
###..
...#.
...#.
###..
`);
        font['6'] = pattern(`
.##..
#....
#....
###..
#..#.
#..#.
.##..
`);
        font['7'] = pattern(`
####.
...#.
...#.
..#..
.#...
#....
#....
`);
        font['8'] = pattern(`
.##..
#..#.
#..#.
.##..
#..#.
#..#.
.##..
`);
        font['9'] = pattern(`
.##..
#..#.
#..#.
.###.
...#.
..#..
.##..
`);
        
        // Common symbols
        font['.'] = pattern(`
.....
.....
.....
.....
.....
..#..
..#..
`);
        font[','] = pattern(`
.....
.....
.....
.....
.....
..#..
.#...
`);
        font[':'] = pattern(`
.....
.....
..#..
.....
.....
..#..
.....
`);
        font[';'] = pattern(`
.....
.....
..#..
.....
.....
..#..
.#...
`);
        font["'"] = pattern(`
..#..
.#...
.....
.....
.....
.....
.....
`);
        font['"'] = pattern(`
.#.#.
.#.#.
.....
.....
.....
.....
.....
`);
        font['`'] = pattern(`
.#...
..#..
.....
.....
.....
.....
.....
`);
        font['!'] = pattern(`
..#..
..#..
..#..
..#..
..#..
.....
..#..
`);
        font['?'] = pattern(`
.##..
#..#.
...#.
..#..
..#..
.....
..#..
`);
        font['-'] = pattern(`
.....
.....
.....
####.
.....
.....
.....
`);
        font['_'] = pattern(`
.....
.....
.....
.....
.....
.....
####.
`);
        font['='] = pattern(`
.....
.....
####.
.....
####.
.....
.....
`);
        font['+'] = pattern(`
.....
..#..
..#..
####.
..#..
..#..
.....
`);
        font['*'] = pattern(`
..#..
#.#.#
.##..
####.
.##..
#.#.#
..#..
`);
        font['/'] = pattern(`
....#
....#
...#.
..#..
.#...
#....
#....
`);
        font['\\'] = pattern(`
#....
#....
.#...
..#..
...#.
....#
....#
`);
        font['|'] = pattern(`
..#..
..#..
..#..
..#..
..#..
..#..
..#..
`);
        font['('] = pattern(`
...#.
..#..
.#...
.#...
.#...
..#..
...#.
`);
        font[')'] = pattern(`
#....
.#...
..#..
..#..
..#..
.#...
#....
`);
        font['['] = pattern(`
###..
#....
#....
#....
#....
#....
###..
`);
        font[']'] = pattern(`
###..
..#..
..#..
..#..
..#..
..#..
###..
`);
        font['{'] = pattern(`
..##.
..#..
..#..
#....
..#..
..#..
..##.
`);
        font['}'] = pattern(`
##...
.#...
.#...
....#
.#...
.#...
##...
`);
        font['<'] = pattern(`
....#
...#.
..#..
.#...
..#..
...#.
....#
`);
        font['>'] = pattern(`
#....
.#...
..#..
...#.
..#..
.#...
#....
`);
        font['@'] = pattern(`
.##..
#..#.
#.##.
#.##.
#.#..
#....
.##..
`);
        font['#'] = pattern(`
.#.#.
.#.#.
####.
.#.#.
####.
.#.#.
.#.#.
`);
        font['$'] = pattern(`
.####
.#.#.
.#...
.####
....#
.#.#.
.####
`);
        font['%'] = pattern(`
#...#
#..#.
..#..
.#...
#..#.
#...#
.....
`);
        font['&'] = pattern(`
.##..
#..#.
#....
.##..
#..#.
#..#.
.##.#
`);
        font['^'] = pattern(`
..#..
.#.#.
#...#
.....
.....
.....
.....
`);
        font['~'] = pattern(`
.....
.....
.##.#
#.##.
.....
.....
.....
`);
        font['o'] = pattern(`
.....
.....
.##..
#..#.
#..#.
.##..
.....
`);
        font['O'] = font['o'];
        font['x'] = pattern(`
.....
.....
#...#
.#.#.
..#..
.#.#.
#...#
`);
        font['X'] = font['x'];
        
        // Box drawing characters
        font['─'] = pattern(`
.....
.....
.....
####.
.....
.....
.....
`);
        font['│'] = pattern(`
..#..
..#..
..#..
..#..
..#..
..#..
..#..
`);
        font['┌'] = pattern(`
.....
.....
.....
####.
#....
#....
#....
`);
        font['┐'] = pattern(`
.....
.....
.....
####.
....#
....#
....#
`);
        font['└'] = pattern(`
#....
#....
#....
####.
.....
.....
.....
`);
        font['┘'] = pattern(`
....#
....#
....#
####.
.....
.....
.....
`);
        font['├'] = pattern(`
..#..
..#..
..#..
####.
#....
#....
#....
`);
        font['┤'] = pattern(`
..#..
..#..
..#..
####.
....#
....#
....#
`);
        font['┬'] = pattern(`
.....
.....
.....
####.
..#..
..#..
..#..
`);
        font['┴'] = pattern(`
..#..
..#..
..#..
####.
.....
.....
.....
`);
        font['┼'] = pattern(`
..#..
..#..
..#..
####.
..#..
..#..
..#..
`);
        font['═'] = pattern(`
.....
.....
####.
.....
####.
.....
.....
`);
        font['║'] = pattern(`
..#..
..#..
..#..
..#..
..#..
..#..
..#..
`);
        font['╔'] = pattern(`
.....
.....
.....
####.
#..#.
#..#.
#..#.
`);
        font['╗'] = pattern(`
.....
.....
.....
####.
#..#.
#..#.
#..#.
`);
        font['╚'] = pattern(`
#..#.
#..#.
#..#.
####.
.....
.....
.....
`);
        font['╝'] = pattern(`
#..#.
#..#.
#..#.
####.
.....
.....
.....
`);
        font['╠'] = pattern(`
..#..
..#..
..#..
####.
#..#.
#..#.
#..#.
`);
        font['╣'] = pattern(`
..#..
..#..
..#..
####.
#..#.
#..#.
#..#.
`);
        font['╦'] = pattern(`
.....
.....
.....
####.
#..#.
#..#.
#..#.
`);
        font['╩'] = pattern(`
#..#.
#..#.
#..#.
####.
.....
.....
.....
`);
        font['╬'] = pattern(`
#..#.
#..#.
#..#.
####.
#..#.
#..#.
#..#.
`);
        
        // Default pattern for unmapped characters (empty - don't render)
        const emptyPattern = Array(this.charHeight).fill(null).map(() => Array(this.charWidth).fill(false));
        
        return new Proxy(font, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                }
                // For unknown characters, return empty pattern (don't render)
                if (typeof prop === 'string' && prop.length === 1) {
                    return emptyPattern;
                }
                return Array(this.charHeight).fill(null).map(() => Array(this.charWidth).fill(false));
            }
        });
    }

    /**
     * Extract text content from element
     */
    extractText(element) {
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Remove script and style elements
        const scripts = clone.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        
        // Get plain text for rendering (this includes link text too)
        let text = clone.textContent || clone.innerText || '';
        
        // Decode HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        text = textarea.value;
        
        return text;
    }

    /**
     * Convert ASCII text to canvas
     * Renders each character as an exact pixel replica
     * Matches original line height and dimensions
     */
    createCanvas(asciiText, originalElement = null) {
        // Split into lines and normalize
        const lines = asciiText.split('\n').map(line => line.replace(/\r$/, ''));
        
        // Find dimensions
        const maxWidth = Math.max(...lines.map(line => line.length));
        const height = lines.length;
        
        if (maxWidth === 0 || height === 0) {
            return null;
        }
        
        // Get original element's computed style to match dimensions
        let charPixelWidth = this.charWidth * this.pixelSize * this.scale;
        let charPixelHeight = this.charHeight * this.pixelSize * this.scale;
        let lineHeight = charPixelHeight;
        
        if (originalElement) {
            const computedStyle = window.getComputedStyle(originalElement);
            const fontSize = parseFloat(computedStyle.fontSize) || 16;
            const lineHeightValue = parseFloat(computedStyle.lineHeight) || fontSize * 1.2;
            
            // Match the line height from the original element
            lineHeight = lineHeightValue;
            
            // Calculate character width to match monospace font
            // Approximate: monospace characters are typically about 0.6 * font-size wide
            const charWidth = fontSize * 0.6;
            charPixelWidth = charWidth;
        }
        
        // Calculate canvas size
        const canvasWidth = Math.ceil(maxWidth * charPixelWidth);
        const canvasHeight = Math.ceil((height - 1) * lineHeight + charPixelHeight);
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        // Disable smoothing for crisp pixels
        ctx.imageSmoothingEnabled = false;
        
        // Set fill color
        ctx.fillStyle = this.lineColor;
        
        // Render each character as its pixel pattern
        for (let y = 0; y < height; y++) {
            const line = lines[y] || '';
            // Calculate Y position based on line height
            const lineY = y * lineHeight;
            
            for (let x = 0; x < maxWidth; x++) {
                const char = line[x] || ' ';
                
                // Skip whitespace characters - don't render anything
                if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                    continue;
                }
                
                // Get pixel pattern for this character
                const pattern = this.pixelFont[char];
                if (!pattern) continue;
                
                // Check if pattern is empty (all false) - skip rendering
                let hasPixels = false;
                for (let py = 0; py < this.charHeight; py++) {
                    for (let px = 0; px < this.charWidth; px++) {
                        if (pattern[py] && pattern[py][px]) {
                            hasPixels = true;
                            break;
                        }
                    }
                    if (hasPixels) break;
                }
                if (!hasPixels) continue;
                
                // Calculate character position
                const charX = x * charPixelWidth;
                const charY = lineY;
                
                // Draw each pixel in the character pattern
                for (let py = 0; py < this.charHeight; py++) {
                    for (let px = 0; px < this.charWidth; px++) {
                        // If this pixel should be drawn
                        if (pattern[py] && pattern[py][px]) {
                            // Calculate pixel position
                            const pixelX = charX + (px * this.pixelSize * this.scale);
                            const pixelY = charY + (py * this.pixelSize * this.scale);
                            const pixelW = this.pixelSize * this.scale;
                            const pixelH = this.pixelSize * this.scale;
                            
                            // Draw the pixel
                            ctx.fillRect(pixelX, pixelY, pixelW, pixelH);
                        }
                    }
                }
            }
        }
        
        return canvas;
    }

    /**
     * Convert a single ASCII element to canvas
     */
    convertElement(asciiElement) {
        // Extract text from element
        const asciiText = this.extractText(asciiElement);
        
        // Create canvas (renders everything, links will overlay on top)
        // Pass original element to match dimensions
        const canvas = this.createCanvas(asciiText, asciiElement);
        if (!canvas) {
            return null;
        }
        
        // Style the canvas to match original
        canvas.style.display = 'block';
        canvas.style.margin = '0';
        canvas.style.padding = '0';
        canvas.style.fontFamily = 'monospace';
        canvas.style.imageRendering = 'pixelated'; // CSS property for pixelated look
        canvas.style.imageRendering = '-moz-crisp-edges';
        canvas.style.imageRendering = 'crisp-edges';
        
        // Copy relevant styles from original element to match dimensions exactly
        const computedStyle = window.getComputedStyle(asciiElement);
        canvas.style.fontSize = computedStyle.fontSize;
        canvas.style.lineHeight = computedStyle.lineHeight;
        canvas.style.letterSpacing = computedStyle.letterSpacing;
        
        if (computedStyle.maxWidth) {
            canvas.style.maxWidth = computedStyle.maxWidth;
        }
        if (computedStyle.width && computedStyle.width !== 'auto') {
            canvas.style.width = computedStyle.width;
        }
        
        // Check if ASCII contains links
        const hasLinks = asciiElement.querySelectorAll('a').length > 0;
        
        if (hasLinks && this.replaceOriginal) {
            // Create wrapper to position canvas and preserve links
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.width = '100%';
            wrapper.style.minHeight = canvas.height + 'px';
            
            // Position canvas behind the ASCII
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none'; // Allow clicks to pass through to links
            canvas.style.zIndex = '0';
            
            // Keep ASCII visible - links will show on top, other text will be transparent
            asciiElement.style.position = 'relative';
            asciiElement.style.zIndex = '1';
            asciiElement.style.pointerEvents = 'auto'; // Keep links clickable
            asciiElement.style.margin = '0';
            asciiElement.style.padding = computedStyle.padding;
            asciiElement.style.backgroundColor = 'transparent';
            
            // Make non-link text transparent so pixelated canvas shows through
            const makeNonLinkTextTransparent = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    // Check if this text node is inside a link
                    let parent = node.parentElement;
                    let isInLink = false;
                    while (parent && parent !== asciiElement) {
                        if (parent.tagName === 'A') {
                            isInLink = true;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                    // If not in a link, make it transparent
                    if (!isInLink && node.textContent.trim()) {
                        const span = document.createElement('span');
                        span.style.color = 'transparent';
                        span.style.backgroundColor = 'transparent';
                        span.textContent = node.textContent;
                        node.parentNode.replaceChild(span, node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Skip links and spans we already created
                    if (node.tagName === 'A' || node.tagName === 'SPAN') {
                        return;
                    }
                    // Recursively process child nodes
                    const children = Array.from(node.childNodes);
                    children.forEach(child => makeNonLinkTextTransparent(child));
                }
            };
            
            // Process all child nodes to make non-link text transparent
            const children = Array.from(asciiElement.childNodes);
            children.forEach(child => makeNonLinkTextTransparent(child));
            
            // Replace with wrapper containing both
            asciiElement.parentNode.replaceChild(wrapper, asciiElement);
            wrapper.appendChild(canvas);
            wrapper.appendChild(asciiElement);
        } else {
            // No links or replaceOriginal is false - simple replacement
            if (this.replaceOriginal) {
                asciiElement.parentNode.replaceChild(canvas, asciiElement);
            } else {
                // Insert canvas before ASCII (overlay)
                asciiElement.style.display = 'none';
                asciiElement.parentNode.insertBefore(canvas, asciiElement);
            }
        }
        
        return canvas;
    }

    /**
     * Convert all ASCII elements on the page
     */
    convertAll(selector = '.ascii') {
        const elements = document.querySelectorAll(selector);
        const canvases = [];
        
        elements.forEach(element => {
            const canvas = this.convertElement(element);
            if (canvas) {
                canvases.push(canvas);
            }
        });
        
        return canvases;
    }

    /**
     * Initialize and convert on page load
     */
    init(selector = '.ascii') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.convertAll(selector));
        } else {
            this.convertAll(selector);
        }
    }
}

// Auto-initialize if script is loaded
if (typeof window !== 'undefined') {
    // Create default instance - renders each ASCII character as exact pixel replica
    const asciiConverter = new AsciiToCanvas({
        pixelSize: 2.5, // Pixel thickness
        scale: 1,
        charWidth: 5,   // Character grid width
        charHeight: 7,  // Character grid height
        replaceOriginal: true
    });
    
    // Initialize on page load
    asciiConverter.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AsciiToCanvas;
}

