/**
 * Paint Border Generator
 * Creates a Windows Paint-style pixelated border around div elements
 * Focuses on shape generation and randomness for organic, hand-drawn appearance
 * 
 * Usage:
 *   const border = new PaintBorder(element, options);
 *   border.draw();
 */

class PaintBorder {
    constructor(element, options = {}) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        
        if (!this.element) {
            throw new Error('Element not found');
        }

        // Get border color from CSS variable if not explicitly provided
        const getBorderColor = () => {
            if (options.color) {
                return options.color; // Use explicitly provided color
            }
            // Try to get color from CSS variable
            const root = document.documentElement;
            const cssColor = getComputedStyle(root).getPropertyValue('--paint-border-color').trim();
            return cssColor || '#ffffff'; // Fallback to white if CSS variable not found
        };

        // Default options
        this.options = {
            pixelSize: options.pixelSize || 4,           // Size of each pixel in the border
            color: getBorderColor(),                      // Border color from CSS variable or option
            thickness: options.thickness || 1,          // Border thickness in pixels
            randomness: options.randomness || 0.3,      // How "hand-drawn" it looks (0-1)
            padding: options.padding || 0,              // Padding inside the border
            shapeVariation: options.shapeVariation || 0.2, // Variation in pixel shapes (0-1)
            clusterRandomness: options.clusterRandomness || false, // Cluster random pixels
            jitterAmount: options.jitterAmount || 0.15, // Amount of jitter per pixel (0-1)
            cornerRadius: options.cornerRadius || 15,   // Corner radius in pixels (0 = sharp corners)
            ...options
        };

        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        
        // Pre-generate random offsets for consistent but varied shapes
        this.randomOffsets = [];
        this.generateRandomOffsets();
    }

    /**
     * Generate random offsets for more organic pixel placement
     */
    generateRandomOffsets() {
        // Generate a pool of random offsets that will be reused for consistency
        const poolSize = 100;
        this.randomOffsets = [];
        for (let i = 0; i < poolSize; i++) {
            this.randomOffsets.push({
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            });
        }
    }

    /**
     * Get a random offset with optional clustering
     */
    getRandomOffset(index, useClustering = false) {
        const baseOffset = this.randomOffsets[index % this.randomOffsets.length];
        
        if (useClustering && this.options.clusterRandomness) {
            // Create clusters of similar offsets for more organic grouping
            const clusterSeed = Math.floor(index / 5);
            const clusterOffset = this.randomOffsets[clusterSeed % this.randomOffsets.length];
            
            // Interpolate between base and cluster for smoother waves
            const blend = 0.5;
            return {
                x: (baseOffset.x * blend + clusterOffset.x * (1 - blend)) * this.options.randomness,
                y: (baseOffset.y * blend + clusterOffset.y * (1 - blend)) * this.options.randomness
            };
        }
        
        return {
            x: baseOffset.x * this.options.randomness,
            y: baseOffset.y * this.options.randomness
        };
    }

    /**
     * Generate smooth wave offset for wavy border effects
     */
    getWaveOffset(index, length, direction) {
        const isHorizontal = direction === 'horizontal';
        const progress = index / Math.max(1, length - 1);
        
        // Use sine waves with varying frequencies for organic waviness
        const wave1 = Math.sin(progress * Math.PI * 4) * 0.4;
        const wave2 = Math.sin(progress * Math.PI * 7 + 1.5) * 0.3;
        const wave3 = Math.sin(progress * Math.PI * 11 + 2.8) * 0.2;
        
        // Combine waves and add random variation from pool
        const randomComponent = this.randomOffsets[index % this.randomOffsets.length];
        const combinedWave = (wave1 + wave2 + wave3) * this.options.randomness;
        const randomVariation = randomComponent.x * this.options.randomness * 0.3;
        
        if (isHorizontal) {
            return {
                x: 0, // No horizontal offset for horizontal lines
                y: (combinedWave + randomVariation)
            };
        } else {
            return {
                x: (combinedWave + randomVariation),
                y: 0 // No vertical offset for vertical lines
            };
        }
    }

    /**
     * Initialize and draw the border
     */
    draw() {
        if (!this.element) return;

        // Remove existing border if present
        this.remove();

        // Create canvas overlay
        this.createCanvas();
        
        // Draw the pixelated border
        this.drawBorder();
    }

    /**
     * Create a canvas overlay positioned over the element
     */
    createCanvas() {
        const rect = this.element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Calculate element position relative to document
        const elementX = rect.left + scrollX;
        const elementY = rect.top + scrollY;
        const elementWidth = rect.width;
        const elementHeight = rect.height;

        // Calculate canvas size to cover entire element plus border padding
        const borderPadding = Math.max(
            this.options.pixelSize * this.options.thickness,
            this.options.cornerRadius || 0
        ) + 10; // Extra padding for safety

        // Calculate required canvas dimensions
        // Ensure canvas covers full viewport and element, including margins
        // Use the maximum of viewport width and element's right edge position
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const elementRight = elementX + elementWidth;
        const elementBottom = elementY + elementHeight;
        
        // Canvas must be at least as wide as viewport to show margins
        // Also account for element position if it extends beyond viewport
        const documentWidth = Math.max(
            viewportWidth,
            elementRight + borderPadding,
            document.documentElement.scrollWidth || viewportWidth
        );
        const documentHeight = Math.max(
            viewportHeight,
            elementBottom + borderPadding,
            document.documentElement.scrollHeight || viewportHeight
        );

        const canvasWidth = Math.ceil(documentWidth);
        const canvasHeight = Math.ceil(documentHeight);

        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'paint-border-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        // Get context
        // Note: Pixelated rendering is handled by CSS image-rendering property
        this.ctx = this.canvas.getContext('2d');

        // Append to body
        document.body.appendChild(this.canvas);

        // Store element position relative to document
        this.elementRect = {
            x: elementX,
            y: elementY,
            width: elementWidth,
            height: elementHeight
        };

        // Update on scroll/resize
        this.setupResizeHandler();
    }

    /**
     * Draw the pixelated border
     */
    drawBorder() {
        if (!this.ctx || !this.elementRect) return;

        const { x, y, width, height } = this.elementRect;
        const pixelSize = this.options.pixelSize;
        const color = this.options.color;
        const thickness = this.options.thickness;
        const randomness = this.options.randomness;
        const cornerRadius = Math.max(0, this.options.cornerRadius || 0);

        // Check if ascii-container exists and get its bottom position for alignment
        let bottomY = y + height;
        const asciiContainer = document.querySelector('.ascii-container');
        if (asciiContainer) {
            const asciiRect = asciiContainer.getBoundingClientRect();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const asciiBottom = asciiRect.bottom + scrollY;
            // Align bottom border to ascii-container bottom with minimal spacing (1-2px)
            bottomY = asciiBottom + 2;
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Set fill color
        this.ctx.fillStyle = color;

        if (cornerRadius > 0) {
            // Draw borders with rounded corners
            const r = Math.min(cornerRadius, Math.min(width, height) / 2);
            const adjustedHeight = bottomY - y; // Calculate adjusted height once

            // Draw top border (excluding corners)
            if (width > r * 2) {
                this.drawPixelatedLine(
                    x + r, y,
                    x + width - r, y,
                    pixelSize, thickness, randomness, 'horizontal'
                );
            }

            // Draw bottom border (excluding corners) - aligned to ascii-container
            if (width > r * 2) {
                this.drawPixelatedLine(
                    x + r, bottomY,
                    x + width - r, bottomY,
                    pixelSize, thickness, randomness, 'horizontal'
                );
            }

            // Draw left border (excluding corners) - adjust for bottom alignment
            if (adjustedHeight > r * 2) {
                this.drawPixelatedLine(
                    x, y + r,
                    x, bottomY - r,
                    pixelSize, thickness, randomness, 'vertical'
                );
            }

            // Draw right border (excluding corners) - adjust for bottom alignment
            if (adjustedHeight > r * 2) {
                this.drawPixelatedLine(
                    x + width, y + r,
                    x + width, bottomY - r,
                    pixelSize, thickness, randomness, 'vertical'
                );
            }

            // Draw rounded corners - adjust bottom corners for ascii-container alignment
            this.drawRoundedCorner(x + r, y + r, r, 'top-left', pixelSize, thickness, randomness);
            this.drawRoundedCorner(x + width - r, y + r, r, 'top-right', pixelSize, thickness, randomness);
            this.drawRoundedCorner(x + r, bottomY - r, r, 'bottom-left', pixelSize, thickness, randomness);
            this.drawRoundedCorner(x + width - r, bottomY - r, r, 'bottom-right', pixelSize, thickness, randomness);
        } else {
            // Draw straight borders (original behavior)
            // Draw top border
            this.drawPixelatedLine(
                x, y,
                x + width, y,
                pixelSize, thickness, randomness, 'horizontal'
            );

            // Draw bottom border - aligned to ascii-container
            this.drawPixelatedLine(
                x, bottomY,
                x + width, bottomY,
                pixelSize, thickness, randomness, 'horizontal'
            );

            // Draw left border - adjust for bottom alignment
            const adjustedHeight = bottomY - y;
            this.drawPixelatedLine(
                x, y,
                x, bottomY,
                pixelSize, thickness, randomness, 'vertical'
            );

            // Draw right border - adjust for bottom alignment
            this.drawPixelatedLine(
                x + width, y,
                x + width, bottomY,
                pixelSize, thickness, randomness, 'vertical'
            );
        }
    }

    /**
     * Draw a pixelated rounded corner
     */
    drawRoundedCorner(centerX, centerY, radius, position, pixelSize, thickness, randomness) {
        // Determine corner quadrant angles based on position
        let startAngle, endAngle;
        
        switch (position) {
            case 'top-left':
                startAngle = Math.PI;           // 180 degrees
                endAngle = Math.PI * 1.5;       // 270 degrees
                break;
            case 'top-right':
                startAngle = Math.PI * 1.5;     // 270 degrees
                endAngle = Math.PI * 2;         // 360/0 degrees
                break;
            case 'bottom-left':
                startAngle = Math.PI * 0.5;     // 90 degrees
                endAngle = Math.PI;             // 180 degrees
                break;
            case 'bottom-right':
                startAngle = 0;                 // 0 degrees
                endAngle = Math.PI * 0.5;       // 90 degrees
                break;
            default:
                return;
        }

        // Calculate number of steps around the arc
        const circumference = Math.PI * radius * 0.5; // quarter circle
        const numSteps = Math.max(8, Math.ceil(circumference / pixelSize));
        const angleStep = (endAngle - startAngle) / numSteps;

        // Use wave mode if enabled
        const useWaveMode = this.options.clusterRandomness && thickness <= 1 && this.options.randomness > 0.3;

        for (let i = 0; i <= numSteps; i++) {
            const angle = startAngle + (angleStep * i);
            
            // Calculate arc position relative to corner center
            const baseX = centerX + Math.cos(angle) * radius;
            const baseY = centerY + Math.sin(angle) * radius;

            // Add randomness/wave effect
            let offsetX_pixel, offsetY_pixel;
            
            if (useWaveMode) {
                // Use smooth wave for wavy borders
                const waveOffset = this.getWaveOffset(i, numSteps, 'horizontal');
                offsetX_pixel = waveOffset.x * pixelSize * 0.5;
                offsetY_pixel = waveOffset.y * pixelSize * 0.5;
            } else {
                // Use random offset
                const randomOffset = this.getRandomOffset(i, this.options.clusterRandomness);
                const jitterX = (Math.random() - 0.5) * pixelSize * this.options.jitterAmount;
                const jitterY = (Math.random() - 0.5) * pixelSize * this.options.jitterAmount;
                offsetX_pixel = (randomOffset.x * pixelSize) + jitterX;
                offsetY_pixel = (randomOffset.y * pixelSize) + jitterY;
            }

            const pixelX = Math.floor(baseX + offsetX_pixel);
            const pixelY = Math.floor(baseY + offsetY_pixel);

            // Draw pixel(s) for thickness
            for (let t = 0; t < Math.ceil(thickness); t++) {
                const drawX = pixelX;
                const drawY = pixelY;

                // Snap to pixel grid
                const snappedX = Math.floor(drawX / pixelSize) * pixelSize;
                const snappedY = Math.floor(drawY / pixelSize) * pixelSize;

                // Size variation for texture - adjust for fractional thickness
                const sizeVariation = thickness <= 1
                    ? (Math.random() < (this.options.shapeVariation * 0.5)
                        ? (Math.random() < 0.5 ? pixelSize * 0.9 : pixelSize * 1.1)
                        : pixelSize * thickness) // Scale pixel size by thickness for fractional values
                    : (Math.random() < this.options.shapeVariation 
                        ? (Math.random() < 0.5 ? pixelSize * 0.75 : pixelSize * 1.25)
                        : pixelSize);

                this.ctx.fillRect(
                    snappedX,
                    snappedY,
                    Math.max(1, Math.floor(sizeVariation)),
                    Math.max(1, Math.floor(sizeVariation))
                );
            }
        }
    }

    /**
     * Draw a pixelated line with hand-drawn randomness and shape variation
     */
    drawPixelatedLine(x1, y1, x2, y2, pixelSize, thickness, randomness, direction) {
        const isHorizontal = direction === 'horizontal';
        const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
        const numPixels = Math.ceil(length / pixelSize);

        // Use wave generation for wavy borders when clusterRandomness is enabled and thickness <= 1
        const useWaveMode = this.options.clusterRandomness && thickness <= 1 && this.options.randomness > 0.3;

        for (let i = 0; i < numPixels; i++) {
            const progress = i / numPixels;
            const baseX = isHorizontal ? x1 + (x2 - x1) * progress : x1;
            const baseY = isHorizontal ? y1 : y1 + (y2 - y1) * progress;

            let offsetX, offsetY;

            if (useWaveMode) {
                // Use smooth wave generation for wavy single-pixel lines
                const waveOffset = this.getWaveOffset(i, numPixels, direction);
                
                // Add subtle jitter for organic feel
                const jitterX = (Math.random() - 0.5) * pixelSize * this.options.jitterAmount * 0.5;
                const jitterY = (Math.random() - 0.5) * pixelSize * this.options.jitterAmount * 0.5;

                offsetX = (waveOffset.x * pixelSize) + jitterX;
                offsetY = (waveOffset.y * pixelSize) + jitterY;
            } else {
                // Use random offset with optional clustering for other styles
                const randomOffset = this.getRandomOffset(
                    Math.floor(i + (isHorizontal ? baseX : baseY) / pixelSize),
                    this.options.clusterRandomness
                );

                // Add jitter for more variation
                const jitterX = (Math.random() - 0.5) * pixelSize * this.options.jitterAmount;
                const jitterY = (Math.random() - 0.5) * pixelSize * this.options.jitterAmount;

                offsetX = (randomOffset.x * pixelSize) + jitterX;
                offsetY = (randomOffset.y * pixelSize) + jitterY;
            }

            const pixelX = Math.floor(baseX + offsetX);
            const pixelY = Math.floor(baseY + offsetY);

            // Draw pixel(s) based on thickness with shape variation
            for (let t = 0; t < Math.ceil(thickness); t++) {
                // For single pixel thickness, skip shape variation within thickness
                if (thickness <= 1) {
                    const drawX = pixelX;
                    const drawY = pixelY;

                    // Snap to pixel grid
                    const snappedX = Math.floor(drawX / pixelSize) * pixelSize;
                    const snappedY = Math.floor(drawY / pixelSize) * pixelSize;

                    // Subtle size variation for texture (less for single pixel lines)
                    // Scale pixel size by thickness for fractional values
                    const baseSize = thickness < 1 ? pixelSize * thickness : pixelSize;
                    const sizeVariation = Math.random() < (this.options.shapeVariation * 0.5)
                        ? (Math.random() < 0.5 ? baseSize * 0.9 : baseSize * 1.1)
                        : baseSize;

                    this.ctx.fillRect(
                        snappedX,
                        snappedY,
                        Math.max(1, Math.floor(sizeVariation)),
                        Math.max(1, Math.floor(sizeVariation))
                    );
                } else {
                    // Original multi-pixel thickness behavior
                    const shapeOffsetX = isHorizontal 
                        ? 0 
                        : (Math.random() - 0.5) * pixelSize * this.options.shapeVariation;
                    const shapeOffsetY = isHorizontal
                        ? (Math.random() - 0.5) * pixelSize * this.options.shapeVariation
                        : 0;

                    const drawX = isHorizontal 
                        ? pixelX 
                        : pixelX + (t - thickness / 2) * pixelSize + shapeOffsetX;
                    const drawY = isHorizontal
                        ? pixelY + (t - thickness / 2) * pixelSize + shapeOffsetY
                        : pixelY;

                    // Snap to pixel grid
                    const snappedX = Math.floor(drawX / pixelSize) * pixelSize;
                    const snappedY = Math.floor(drawY / pixelSize) * pixelSize;

                    // Occasionally draw slightly larger or smaller pixels for texture
                    const sizeVariation = Math.random() < this.options.shapeVariation 
                        ? (Math.random() < 0.5 ? pixelSize * 0.75 : pixelSize * 1.25)
                        : pixelSize;

                    this.ctx.fillRect(
                        snappedX,
                        snappedY,
                        Math.max(1, Math.floor(sizeVariation)),
                        Math.max(1, Math.floor(sizeVariation))
                    );
                }
            }
        }
    }

    /**
     * Setup resize and scroll handlers to update border position
     */
    setupResizeHandler() {
        const updateBorder = () => {
            if (!this.element || !this.canvas) return;
            
            const rect = this.element.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;

            // Calculate element position relative to document
            const elementX = rect.left + scrollX;
            const elementY = rect.top + scrollY;
            const elementWidth = rect.width;
            const elementHeight = rect.height;

            this.elementRect = {
                x: elementX,
                y: elementY,
                width: elementWidth,
                height: elementHeight
            };

            // Calculate required canvas dimensions to cover entire element
            // Ensure canvas covers full viewport and element, including margins
            const borderPadding = Math.max(
                this.options.pixelSize * this.options.thickness,
                this.options.cornerRadius || 0
            ) + 10; // Extra padding for safety

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const elementRight = elementX + elementWidth;
            const elementBottom = elementY + elementHeight;
            
            // Canvas must be at least as wide as viewport to show margins
            // Also account for element position if it extends beyond viewport
            const documentWidth = Math.max(
                viewportWidth,
                elementRight + borderPadding,
                document.documentElement.scrollWidth || viewportWidth
            );
            const documentHeight = Math.max(
                viewportHeight,
                elementBottom + borderPadding,
                document.documentElement.scrollHeight || viewportHeight
            );

            const canvasWidth = Math.ceil(documentWidth);
            const canvasHeight = Math.ceil(documentHeight);

            // Resize canvas if needed (only if it needs to be larger)
            if (canvasWidth > this.canvas.width || canvasHeight > this.canvas.height) {
                this.canvas.width = canvasWidth;
                this.canvas.height = canvasHeight;
            }

            this.drawBorder();
        };

        // Throttle resize/scroll events
        let ticking = false;
        const throttledUpdate = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateBorder();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('resize', throttledUpdate);
        window.addEventListener('scroll', throttledUpdate, { passive: true });

        // Store handlers for cleanup
        this.resizeHandler = throttledUpdate;
    }

    /**
     * Remove the border
     */
    remove() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            window.removeEventListener('scroll', this.resizeHandler);
        }
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Redraw the border (useful after element size changes)
     */
    redraw() {
        this.remove();
        this.draw();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaintBorder;
}

