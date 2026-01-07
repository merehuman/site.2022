/**
 * ASCII to Pixelated Image Converter
 * Converts ASCII art drawings into pixelated PNG images
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

class AsciiToImage {
    constructor(options = {}) {
        this.pixelSize = options.pixelSize || 8; // Size of each pixel block
        this.scale = options.scale || 1; // Overall scale multiplier
        this.backgroundColor = options.backgroundColor || '#000000';
        this.foregroundColor = options.foregroundColor || '#ffffff';
        this.colorMode = options.colorMode || 'grayscale'; // 'grayscale', 'color', 'monochrome'
        
        // Character to intensity mapping (0-255)
        // Higher values = brighter pixels
        this.charMap = this.buildCharMap();
    }

    /**
     * Build character intensity map
     * Maps ASCII characters to brightness values
     */
    buildCharMap() {
        const map = {};
        
        // Whitespace = black (0)
        map[' '] = 0;
        map['\t'] = 0;
        map['\n'] = 0;
        
        // Light characters = bright
        const lightChars = ['@', '#', '$', '%', '&', '*', '+', '=', '~', '█', '▓', '▒', '░'];
        lightChars.forEach((char, i) => {
            map[char] = 255 - (i * 10);
        });
        
        // Medium characters
        const mediumChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        mediumChars.forEach((char) => {
            map[char] = 180;
        });
        
        // Line drawing characters
        map['─'] = 200;
        map['│'] = 200;
        map['┌'] = 200;
        map['┐'] = 200;
        map['└'] = 200;
        map['┘'] = 200;
        map['├'] = 200;
        map['┤'] = 200;
        map['┬'] = 200;
        map['┴'] = 200;
        map['┼'] = 200;
        map['═'] = 200;
        map['║'] = 200;
        map['╔'] = 200;
        map['╗'] = 200;
        map['╚'] = 200;
        map['╝'] = 200;
        map['╠'] = 200;
        map['╣'] = 200;
        map['╦'] = 200;
        map['╩'] = 200;
        map['╬'] = 200;
        map['_'] = 150;
        map['|'] = 200;
        map['-'] = 150;
        map['='] = 200;
        map['\\'] = 180;
        map['/'] = 180;
        
        // Common ASCII art characters
        map['.'] = 100;
        map[','] = 80;
        map[':'] = 120;
        map[';'] = 100;
        map["'"] = 90;
        map['"'] = 100;
        map['`'] = 70;
        map['^'] = 140;
        map['~'] = 130;
        map['*'] = 220;
        map['+'] = 160;
        map['o'] = 140;
        map['O'] = 180;
        map['x'] = 150;
        map['X'] = 190;
        map['#'] = 240;
        map['@'] = 255;
        
        // Default for unmapped characters
        return new Proxy(map, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                }
                // For unknown characters, use character code as intensity
                if (typeof prop === 'string' && prop.length === 1) {
                    return Math.min(255, prop.charCodeAt(0) % 256);
                }
                return 128; // Default medium gray
            }
        });
    }

    /**
     * Strip HTML tags from ASCII art
     */
    stripHtml(html) {
        return html
            .replace(/<[^>]*>/g, ' ') // Replace HTML tags with spaces
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
    }

    /**
     * Extract ASCII art from HTML file
     */
    extractFromHtml(htmlPath) {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        
        // Try to find ASCII in <pre class="ascii"> tags
        const preMatch = html.match(/<pre[^>]*class=["']ascii["'][^>]*>([\s\S]*?)<\/pre>/i);
        if (preMatch) {
            return this.stripHtml(preMatch[1]);
        }
        
        // Fallback: try to find any <pre> tag
        const preMatch2 = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
        if (preMatch2) {
            return this.stripHtml(preMatch2[1]);
        }
        
        throw new Error('No ASCII art found in HTML file');
    }

    /**
     * Convert ASCII string to pixelated image
     */
    convert(asciiText, outputPath) {
        // Split into lines and normalize
        const lines = asciiText.split('\n').map(line => line.replace(/\r$/, ''));
        
        // Find dimensions
        const maxWidth = Math.max(...lines.map(line => line.length));
        const height = lines.length;
        
        // Calculate canvas size
        const canvasWidth = maxWidth * this.pixelSize * this.scale;
        const canvasHeight = height * this.pixelSize * this.scale;
        
        // Create canvas
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw pixels
        for (let y = 0; y < height; y++) {
            const line = lines[y] || '';
            for (let x = 0; x < maxWidth; x++) {
                const char = line[x] || ' ';
                const intensity = this.charMap[char];
                
                // Calculate pixel position
                const pixelX = x * this.pixelSize * this.scale;
                const pixelY = y * this.pixelSize * this.scale;
                const pixelW = this.pixelSize * this.scale;
                const pixelH = this.pixelSize * this.scale;
                
                // Set color based on mode
                if (this.colorMode === 'monochrome') {
                    ctx.fillStyle = intensity > 128 ? this.foregroundColor : this.backgroundColor;
                } else if (this.colorMode === 'grayscale') {
                    const gray = Math.floor(intensity);
                    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                } else if (this.colorMode === 'color') {
                    // Use character code to generate color
                    const hue = (char.charCodeAt(0) * 137.508) % 360;
                    const saturation = Math.min(100, intensity / 2.55);
                    const lightness = intensity / 2.55;
                    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                }
                
                // Draw pixel block
                ctx.fillRect(pixelX, pixelY, pixelW, pixelH);
            }
        }
        
        // Save image
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`✓ Converted ASCII to image: ${outputPath}`);
        console.log(`  Dimensions: ${maxWidth}x${height} characters → ${canvasWidth}x${canvasHeight} pixels`);
        
        return outputPath;
    }

    /**
     * Convert from HTML file
     */
    convertFromHtml(htmlPath, outputPath) {
        const asciiText = this.extractFromHtml(htmlPath);
        return this.convert(asciiText, outputPath);
    }

    /**
     * Convert from text file
     */
    convertFromText(textPath, outputPath) {
        const asciiText = fs.readFileSync(textPath, 'utf-8');
        return this.convert(asciiText, outputPath);
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node ascii-to-image.js <input-file> <output-file> [options]');
        console.log('');
        console.log('Options:');
        console.log('  --pixel-size <number>    Size of each pixel block (default: 8)');
        console.log('  --scale <number>         Overall scale multiplier (default: 1)');
        console.log('  --bg-color <color>      Background color (default: #000000)');
        console.log('  --fg-color <color>      Foreground color for monochrome (default: #ffffff)');
        console.log('  --mode <mode>           Color mode: grayscale, color, or monochrome (default: grayscale)');
        console.log('');
        console.log('Examples:');
        console.log('  node ascii-to-image.js index.html output.png');
        console.log('  node ascii-to-image.js ascii.txt output.png --pixel-size 4 --scale 2');
        console.log('  node ascii-to-image.js index.html output.png --mode color --bg-color #1a1a1a');
        process.exit(1);
    }
    
    const inputPath = args[0];
    const outputPath = args[1];
    
    // Parse options
    const options = {};
    for (let i = 2; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];
        
        switch (key) {
            case '--pixel-size':
                options.pixelSize = parseInt(value, 10);
                break;
            case '--scale':
                options.scale = parseFloat(value);
                break;
            case '--bg-color':
                options.backgroundColor = value;
                break;
            case '--fg-color':
                options.foregroundColor = value;
                break;
            case '--mode':
                options.colorMode = value;
                break;
        }
    }
    
    const converter = new AsciiToImage(options);
    
    try {
        if (inputPath.endsWith('.html')) {
            converter.convertFromHtml(inputPath, outputPath);
        } else {
            converter.convertFromText(inputPath, outputPath);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

module.exports = AsciiToImage;



