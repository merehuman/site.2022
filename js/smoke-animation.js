/**
 * Smoke Animation
 * Makes smoke characters float to the top border and collect there,
 * moving around the top border like actual smoke
 */

class SmokeAnimation {
    constructor() {
        this.smokeElements = [];
        this.originalSmokePositions = []; // Store original positions for spawning
        this.topBorderY = null;
        this.borderLeft = null;
        this.borderRight = null;
        this.borderWidth = null;
        this.collectedSmoke = []; // Track smoke that has reached the top
        this.animationFrame = null;
        this.isRunning = false;
        this.spawnInterval = null;
        this.spawnDelay = 2000; // Spawn new smoke every 2 seconds
        this.maxStackHeight = 50; // Maximum vertical stacking height
        this.stackLayer = 0; // Track vertical layers for stacking
        this.clusters = []; // Track smoke clusters for clumping behavior
        this.clusterRadius = 20; // Distance for particles to form clusters
        // Clump-based spawning properties
        this.chimneySmokeId = 'smoke'; // Only smoke4 emits smoke
        this.clumpSize = 3 + Math.floor(Math.random() * 3); // 3-5 particles per clump
        this.clumpSpawnInterval = 100; // Time between particles in a clump (ms)
        this.clumpPauseDuration = 1000 + Math.random() * 1000; // 1-2 seconds pause between clumps
        this.isSpawningClump = false;
        this.clumpSpawnIndex = 0;
        
        // Wait for border to be drawn before initializing
        this.init();
    }

    init() {
        // Wait a bit for the border to be drawn
        setTimeout(() => {
            this.setupOriginalPositions();
            this.setupSmokeElements();
            this.calculateBorderPosition();
            this.startAnimation();
            this.startSpawning();
        }, 500);
    }

    /**
     * Store original smoke element positions for spawning new smoke
     * Only track the chimney smoke element
     */
    setupOriginalPositions() {
        const chimneySmoke = document.getElementById(this.chimneySmokeId);
        if (!chimneySmoke) {
            console.warn(`SmokeAnimation: Could not find chimney element with id "${this.chimneySmokeId}"`);
            // Try to find by class as fallback
            const smokeElements = document.querySelectorAll('.smoke');
            if (smokeElements.length > 0) {
                const firstSmoke = smokeElements[0];
                console.log(`SmokeAnimation: Using first smoke element found (id: ${firstSmoke.id || 'none'})`);
                const rect = firstSmoke.getBoundingClientRect();
                const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                
                this.originalSmokePositions.push({
                    element: firstSmoke,
                    originalChar: firstSmoke.textContent || ';',
                    startX: rect.left + scrollX,
                    startY: rect.top + scrollY,
                    parent: firstSmoke.parentElement
                });
            }
            return;
        }
        
        const rect = chimneySmoke.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        this.originalSmokePositions.push({
            element: chimneySmoke,
            originalChar: chimneySmoke.textContent || ';',
            startX: rect.left + scrollX,
            startY: rect.top + scrollY,
            parent: chimneySmoke.parentElement
        });
    }

    /**
     * Find all smoke elements and make them transparent to preserve layout
     * Only newly spawned particles will animate (not the original HTML elements)
     */
    setupSmokeElements() {
        const smokeSpans = document.querySelectorAll('.smoke');
        smokeSpans.forEach((span, index) => {
            // Make transparent but keep character to preserve ASCII art layout
            // This maintains spacing without affecting the visual layout
            span.style.color = 'transparent';
            span.style.visibility = 'visible'; // Keep visible for layout calculations
            // Keep the original character text to maintain spacing
        });
    }

    /**
     * Create a new smoke character from the chimney (smoke4)
     */
    spawnNewSmoke() {
        if (this.originalSmokePositions.length === 0) return;

        // Always use smoke4 (chimney) position
        const originalPos = this.originalSmokePositions[0];
        
        // Add slight horizontal variation within clump (so particles don't all start at exact same spot)
        const clumpOffsetX = (this.clumpSpawnIndex - this.clumpSize / 2) * 0.5; // Very tight spacing within clumps

        // Create a floating clone (not inserted into the layout)
        const floatingSmoke = document.createElement('span');
        floatingSmoke.className = 'smoke-floating';
        floatingSmoke.textContent = originalPos.originalChar;
        floatingSmoke.id = `floating-smoke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        floatingSmoke.style.position = 'fixed'; // Use fixed to avoid affecting layout
        floatingSmoke.style.pointerEvents = 'none';
        floatingSmoke.style.zIndex = '1001';
        
        // Match original element's styling (but use visible color, not transparent)
        if (originalPos.element) {
            const originalStyle = getComputedStyle(originalPos.element);
            // Get color from parent or use default text color (don't use transparent from smoke element)
            const parentStyle = getComputedStyle(originalPos.element.parentElement || document.body);
            floatingSmoke.style.color = parentStyle.color || originalStyle.color || '#ff0000'; // Use parent color or fallback
            floatingSmoke.style.fontFamily = originalStyle.fontFamily;
            floatingSmoke.style.fontSize = originalStyle.fontSize;
        } else {
            // Fallback styling
            floatingSmoke.style.color = '#ff0000'; // Default text color
        }
        
        document.body.appendChild(floatingSmoke);

        // Cycle through pattern: . → ; → : → . → ; → : ...
        const clumpPattern = ['.', ';', ':'];
        const patternIndex = this.clumpSpawnIndex % clumpPattern.length;
        const initialChar = clumpPattern[patternIndex];
        const startsAsSemicolon = initialChar === ';';
        const startsAsColon = initialChar === ':';
        const startsAsDot = initialChar === '.';
        
        floatingSmoke.textContent = initialChar;
        
        // Create smoke data object with clump offset
        const smokeData = {
            element: floatingSmoke,
            originalElement: originalPos.element,
            id: floatingSmoke.id,
            startX: originalPos.startX + clumpOffsetX,
            startY: originalPos.startY,
            currentX: originalPos.startX + clumpOffsetX,
            currentY: originalPos.startY,
            targetX: null,
            targetY: null,
            hasReachedTop: false,
            floatSpeed: 0.1 + Math.random() * 0.15, // Even slower particle speed
            moveSpeed: 0.1 + Math.random() * 0.1, // Slower
            targetPosition: null,
            stackLayer: 0,
            direction: Math.random() > 0.5 ? 1 : -1,
            oscillation: Math.random() * Math.PI * 2, // Random starting phase
            oscillationSpeed: 0.02 + Math.random() * 0.03,
            oscillationAmplitude: 1 + Math.random() * 2,
            // Clumping properties
            clusterId: null,
            horizontalDrift: (Math.random() - 0.5) * 0.01, // Very minimal drift at start, particles stay very close together
            swirlPhase: Math.random() * Math.PI * 2,
            swirlRadius: 2 + Math.random() * 4,
            swirlSpeed: 0.01 + Math.random() * 0.02,
            age: 0,
            // Character transition properties
            startsAsSemicolon: startsAsSemicolon,
            startsAsColon: startsAsColon,
            startsAsDot: startsAsDot,
            initialChar: initialChar,
            finalChar: '.',
            transitionDistance: 80 + Math.random() * 40, // Distance to travel before full transition
            distanceTraveled: 0
        };
        
        // Add to smoke elements array
        this.smokeElements.push(smokeData);
        
        // Set initial position immediately
        this.updateElementPosition(smokeData);
    }

    /**
     * Start spawning new smoke in clumps from the chimney
     */
    startSpawning() {
        // Start first clump after initial delay
        setTimeout(() => {
            this.spawnClump();
        }, 1000);
    }

    /**
     * Spawn a clump of smoke particles (simulating a cloud of smoke)
     */
    spawnClump() {
        if (this.originalSmokePositions.length === 0) return;

        this.isSpawningClump = true;
        this.clumpSpawnIndex = 0;
        this.clumpSize = 3 + Math.floor(Math.random() * 3); // 3-5 particles per clump

        // Spawn particles in quick succession to form a clump
        const spawnNextInClump = () => {
            if (this.clumpSpawnIndex < this.clumpSize) {
                this.spawnNewSmoke();
                this.clumpSpawnIndex++;
                
                // Spawn next particle in clump after short delay
                setTimeout(spawnNextInClump, this.clumpSpawnInterval);
            } else {
                // Clump complete, pause before next clump
                this.isSpawningClump = false;
                this.clumpPauseDuration = 1000 + Math.random() * 1000; // 1-2 seconds (reduced spacing)
                
                setTimeout(() => {
                    this.spawnClump();
                }, this.clumpPauseDuration);
            }
        };

        spawnNextInClump();
    }

    /**
     * Calculate the top border position from the main element
     */
    calculateBorderPosition() {
        const mainElement = document.querySelector('main');
        if (!mainElement) return;

        const rect = mainElement.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Top border Y position (accounting for border thickness)
        // The border is drawn at the element's top edge
        // Account for corner radius (20px) and pixel size (3px)
        const borderOffset = 1; // Small offset to align with border line
        this.topBorderY = rect.top + scrollY - borderOffset;
        this.borderLeft = rect.left + scrollX;
        this.borderRight = rect.right + scrollX;
        this.borderWidth = rect.width;
    }

    /**
     * Start the animation loop
     */
    startAnimation() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) return;

        // Recalculate border position on scroll/resize
        this.calculateBorderPosition();

        this.smokeElements.forEach((smoke, index) => {
            if (!smoke.hasReachedTop) {
                // Float upward
                this.floatUpward(smoke);
            } else {
                // Move along top border
                this.moveAlongBorder(smoke);
            }
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    /**
     * Float a smoke character upward with complex clumping movement
     */
    floatUpward(smoke) {
        if (!this.topBorderY) return;

        smoke.age += 1;

        // Find nearby smoke particles for clumping
        const nearbySmoke = this.findNearbySmoke(smoke, this.clusterRadius);
        
        // Calculate clumping force - move toward center of nearby particles
        let clumpForceX = 0;
        let clumpForceY = 0;
        let clumpCount = 0;

        if (nearbySmoke.length > 0) {
            nearbySmoke.forEach(other => {
                if (other !== smoke && !other.hasReachedTop) {
                    const dx = other.currentX - smoke.currentX;
                    const dy = other.currentY - smoke.currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0 && distance < this.clusterRadius) {
                        // Attraction force (stronger when closer)
                        const force = (1 - distance / this.clusterRadius) * 0.1;
                        clumpForceX += (dx / distance) * force;
                        clumpForceY += (dy / distance) * force;
                        clumpCount++;
                    }
                }
            });
        }

        // Apply clumping force
        if (clumpCount > 0) {
            smoke.currentX += clumpForceX;
            smoke.currentY += clumpForceY;
        }

        // Complex upward movement with swirling and drifting
        // Update swirl phase
        smoke.swirlPhase += smoke.swirlSpeed;
        
        // Add swirling horizontal movement
        const swirlX = Math.cos(smoke.swirlPhase) * smoke.swirlRadius * 0.1;
        const swirlY = Math.sin(smoke.swirlPhase * 0.5) * smoke.swirlRadius * 0.05;
        
        // Horizontal drift (starts extremely slow when newly spawned, very gradually increases)
        // Use a much smaller multiplier so particles stay very close together initially
        const ageMultiplier = 1 + (smoke.age * 0.0001); // Very slow growth rate - particles stay close longer
        const driftAmount = smoke.horizontalDrift * ageMultiplier;
        
        // Vertical movement with variation (faster in clumps, slower when alone)
        const verticalSpeed = smoke.floatSpeed * (clumpCount > 0 ? 1.1 : 0.9);
        
        // Apply movements
        smoke.currentX += swirlX + driftAmount;
        const previousY = smoke.currentY;
        smoke.currentY -= verticalSpeed + swirlY;
        
        // Track distance traveled for character transition
        smoke.distanceTraveled += Math.abs(previousY - smoke.currentY);

        // Add some random turbulence
        if (Math.random() < 0.1) { // 10% chance per frame
            smoke.currentX += (Math.random() - 0.5) * 0.5;
            smoke.currentY += (Math.random() - 0.5) * 0.3;
        }
        
        // Handle character transition based on starting character
        if (smoke.startsAsSemicolon) {
            // Transition: ; → : → .
            const transitionProgress = Math.min(smoke.distanceTraveled / smoke.transitionDistance, 1);
            if (transitionProgress < 0.33) {
                smoke.element.textContent = ';';
            } else if (transitionProgress < 0.66) {
                smoke.element.textContent = ':';
            } else {
                smoke.element.textContent = '.';
            }
        } else if (smoke.startsAsColon) {
            // Transition: : → .
            const transitionProgress = Math.min(smoke.distanceTraveled / smoke.transitionDistance, 1);
            if (transitionProgress < 0.5) {
                smoke.element.textContent = ':';
            } else {
                smoke.element.textContent = '.';
            }
        } else if (smoke.startsAsDot) {
            // Already a dot, no transition needed
            smoke.element.textContent = '.';
        }

        // Check if reached top border
        // Only allow reaching top if particle has actually moved upward from starting position
        // This prevents particles from appearing at top immediately after spawning
        // Also check that it hasn't already reached the top to prevent duplicate processing
        if (!smoke.hasReachedTop) {
            const hasMovedUpward = smoke.currentY < smoke.startY;
            if (hasMovedUpward && smoke.currentY <= this.topBorderY) {
                smoke.currentY = this.topBorderY;
                smoke.hasReachedTop = true;
                
                // Ensure smoke is fully transitioned to dot when it reaches the top
                smoke.element.textContent = '.';
                
                // Assign a position along the top border
                smoke.targetPosition = this.findAvailablePosition(smoke);
                smoke.currentX = smoke.targetPosition;
                
                // Add to collected smoke (with duplicate check)
                if (!this.collectedSmoke.includes(smoke)) {
                    this.collectedSmoke.push(smoke);
                }
            }
        }

        // Update element position
        this.updateElementPosition(smoke);
    }

    /**
     * Find nearby smoke particles for clumping
     */
    findNearbySmoke(smoke, radius) {
        return this.smokeElements.filter(other => {
            if (other === smoke || other.hasReachedTop) return false;
            const dx = other.currentX - smoke.currentX;
            const dy = other.currentY - smoke.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < radius;
        });
    }

    /**
     * Find an available position along the top border (with stacking support)
     */
    findAvailablePosition(newSmoke) {
        const minSpacing = 12; // Reduced spacing to allow more smoke
        const borderStart = this.borderLeft + 20;
        const borderEnd = this.borderRight - 20;
        const availableWidth = borderEnd - borderStart;

        // If no other smoke collected yet, place randomly
        if (this.collectedSmoke.length === 0) {
            newSmoke.stackLayer = 0;
            return borderStart + Math.random() * availableWidth;
        }

        // Try to find a spot with enough horizontal space
        let attempts = 0;
        let position;
        let found = false;
        let stackLayer = 0;

        while (attempts < 100 && !found) {
            position = borderStart + Math.random() * availableWidth;
            stackLayer = 0;
            found = true;

            // Check for nearby smoke and determine stacking layer
            const nearbySmoke = [];
            for (const otherSmoke of this.collectedSmoke) {
                if (otherSmoke.hasReachedTop && otherSmoke.targetPosition !== null) {
                    const distance = Math.abs(position - otherSmoke.targetPosition);
                    if (distance < minSpacing) {
                        // Found nearby smoke, check if we can stack on top
                        nearbySmoke.push(otherSmoke);
                    }
                }
            }

            if (nearbySmoke.length > 0) {
                // Find the highest stack layer at this position
                const maxLayer = Math.max(...nearbySmoke.map(s => s.stackLayer || 0));
                stackLayer = maxLayer + 1;
                
                // If we've exceeded max stack height, try a different position
                if (stackLayer * 3 > this.maxStackHeight) {
                    found = false;
                }
            }

            attempts++;
        }

        // If couldn't find a good spot, place it anyway and stack
        if (!found) {
            position = borderStart + Math.random() * availableWidth;
            // Find max layer at this position
            const nearbySmoke = this.collectedSmoke.filter(s => 
                s.hasReachedTop && 
                s.targetPosition !== null && 
                Math.abs(position - s.targetPosition) < minSpacing
            );
            if (nearbySmoke.length > 0) {
                stackLayer = Math.max(...nearbySmoke.map(s => s.stackLayer || 0)) + 1;
            }
        }

        newSmoke.stackLayer = Math.min(stackLayer, Math.floor(this.maxStackHeight / 3));
        return position;
    }

    /**
     * Move smoke along the top border (with stacking)
     */
    moveAlongBorder(smoke) {
        if (!smoke.targetPosition) return;

        // Update oscillation for subtle vertical movement
        smoke.oscillation += smoke.oscillationSpeed;
        
        // Move along border with some randomness (slower when stacked)
        const speedMultiplier = 1 - (smoke.stackLayer || 0) * 0.1; // Slower when higher in stack
        const moveAmount = smoke.moveSpeed * smoke.direction * speedMultiplier;
        smoke.targetPosition += moveAmount;

        // Bounce off edges
        const borderStart = this.borderLeft + 20;
        const borderEnd = this.borderRight - 20;

        if (smoke.targetPosition <= borderStart || smoke.targetPosition >= borderEnd) {
            smoke.direction *= -1; // Reverse direction
            smoke.targetPosition = Math.max(borderStart, Math.min(borderEnd, smoke.targetPosition));
        }

        // Apply subtle horizontal jitter for more organic movement
        const jitter = (Math.random() - 0.5) * 0.5;
        smoke.currentX = smoke.targetPosition + jitter;
        
        // Vertical position with oscillation and stacking
        // Stack upward from the border (negative offset = above border line)
        const stackOffset = (smoke.stackLayer || 0) * 3; // 3px per layer
        smoke.currentY = this.topBorderY - stackOffset + Math.sin(smoke.oscillation) * smoke.oscillationAmplitude;

        // Occasionally change direction for more natural movement
        if (Math.random() < 0.005) { // 0.5% chance per frame
            smoke.direction *= -1;
        }

        this.updateElementPosition(smoke);
    }

    /**
     * Update the DOM element position
     */
    updateElementPosition(smoke) {
        const element = smoke.element;
        
        // Convert document coordinates to viewport coordinates for fixed positioning
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Use fixed positioning relative to viewport (doesn't affect layout)
        element.style.position = 'fixed';
        element.style.left = `${smoke.currentX - scrollX}px`;
        element.style.top = `${smoke.currentY - scrollY}px`;
        element.style.transform = 'translate(0, 0)';
        element.style.zIndex = '1001'; // Above border canvas
        element.style.pointerEvents = 'none'; // Don't interfere with clicks
    }

    /**
     * Stop the animation
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.calculateBorderPosition();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for border to be drawn
    setTimeout(() => {
        const smokeAnimation = new SmokeAnimation();
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                smokeAnimation.handleResize();
            }, 100);
        });
    }, 1000); // Give border time to draw
});

