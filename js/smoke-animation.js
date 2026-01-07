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
        // Performance optimizations
        this.clusterRadiusSquared = this.clusterRadius * this.clusterRadius; // Cache squared radius to avoid sqrt
        this.scrollX = 0;
        this.scrollY = 0;
        this.borderNeedsUpdate = true; // Flag to only recalculate border when needed
        this.frameCount = 0; // For throttling expensive operations
        this.borderStart = 0;
        this.borderEnd = 0;
        // Wind effect
        this.windSpeed = -0.02; // Slight leftward drift
        this.shouldRestart = false; // Flag to restart when particle reaches right border
        this.spawnTimeouts = []; // Track timeouts for cleanup
        // Clump-based spawning properties
        this.chimneySmokeId = 'smoke'; // Only smoke4 emits smoke
        this.clumpSize = 10 + Math.floor(Math.random() * 3); // 3-5 particles per clump
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
                
                // Cache styles for reuse
                const originalStyle = getComputedStyle(firstSmoke);
                const parentStyle = getComputedStyle(firstSmoke.parentElement || document.body);
                
                this.originalSmokePositions.push({
                    element: firstSmoke,
                    originalChar: firstSmoke.textContent || ';',
                    startX: rect.left + scrollX,
                    startY: rect.top + scrollY,
                    parent: firstSmoke.parentElement,
                    // Cache styles for performance
                    cachedColor: parentStyle.color || originalStyle.color || '#ff0000',
                    cachedFontFamily: originalStyle.fontFamily,
                    cachedFontSize: originalStyle.fontSize
                });
            }
            return;
        }
        
        const rect = chimneySmoke.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Cache styles for reuse (all particles use same styling)
        const originalStyle = getComputedStyle(chimneySmoke);
        const parentStyle = getComputedStyle(chimneySmoke.parentElement || document.body);
        
        this.originalSmokePositions.push({
            element: chimneySmoke,
            originalChar: chimneySmoke.textContent || ';',
            startX: rect.left + scrollX,
            startY: rect.top + scrollY,
            parent: chimneySmoke.parentElement,
            // Cache styles for performance
            cachedColor: '#7b7b7b',
            cachedFontFamily: originalStyle.fontFamily,
            cachedFontSize: originalStyle.fontSize
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
        floatingSmoke.id = `floating-smoke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Set styles once (don't change these later)
        floatingSmoke.style.position = 'fixed';
        floatingSmoke.style.pointerEvents = 'none';
        floatingSmoke.style.zIndex = '1001';
        
        // Use cached styles (much faster than getComputedStyle on every spawn)
        floatingSmoke.style.color = originalPos.cachedColor || '#ff0000';
        floatingSmoke.style.fontFamily = originalPos.cachedFontFamily || 'monospace';
        floatingSmoke.style.fontSize = originalPos.cachedFontSize || '16px';
        
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
            floatSpeed: 0.05 + Math.random() * 0.05, // Very slow particle speed
            moveSpeed: 0.05 + Math.random() * 0.05, // Very slow movement along border
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
            swirlRadius: 1 + Math.random() * 2,
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
        const timeout = setTimeout(() => {
            if (!this.shouldRestart) {
                this.spawnClump();
            }
        }, 1000);
        this.spawnTimeouts.push(timeout);
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
            // Check if restart was triggered
            if (this.shouldRestart) return;
            
            if (this.clumpSpawnIndex < this.clumpSize) {
                this.spawnNewSmoke();
                this.clumpSpawnIndex++;
                
                // Spawn next particle in clump after short delay
                const timeout = setTimeout(spawnNextInClump, this.clumpSpawnInterval);
                this.spawnTimeouts.push(timeout);
            } else {
                // Clump complete, pause before next clump
                this.isSpawningClump = false;
                this.clumpPauseDuration = 1000 + Math.random() * 1000; // 1-2 seconds (reduced spacing)
                
                const timeout = setTimeout(() => {
                    if (!this.shouldRestart) {
                        this.spawnClump();
                    }
                }, this.clumpPauseDuration);
                this.spawnTimeouts.push(timeout);
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
        
        // Cache border edges for moveAlongBorder
        this.borderStart = this.borderLeft + 20;
        this.borderEnd = this.borderRight - 20;
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

        this.frameCount++;
        
        // Cache scroll position (only update every frame, but cache it)
        this.scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        this.scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Only recalculate border position when needed (not every frame)
        if (this.borderNeedsUpdate || this.frameCount % 60 === 0) {
            this.calculateBorderPosition();
            this.borderNeedsUpdate = false;
        }

        // Process particles - separate arrays for better cache performance
        const floatingParticles = [];
        const topParticles = [];
        
        for (let i = 0; i < this.smokeElements.length; i++) {
            const smoke = this.smokeElements[i];
            if (!smoke.hasReachedTop) {
                floatingParticles.push(smoke);
            } else {
                topParticles.push(smoke);
            }
        }

        // Process floating particles
        for (let i = 0; i < floatingParticles.length; i++) {
            this.floatUpward(floatingParticles[i]);
        }

        // Process top particles
        for (let i = 0; i < topParticles.length; i++) {
            this.moveAlongBorder(topParticles[i]);
        }

        // Check if we should restart (first particle reached right border)
        if (this.shouldRestart) {
            this.restart();
            return;
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    /**
     * Float a smoke character upward with complex clumping movement
     */
    floatUpward(smoke) {
        if (!this.topBorderY) return;

        smoke.age += 1;

        // Find nearby smoke particles for clumping (only check every few frames for performance)
        let nearbySmoke = [];
        let clumpForceX = 0;
        let clumpForceY = 0;
        let clumpCount = 0;
        
        // Only check for nearby particles every 3 frames to reduce computation
        if (smoke.age % 3 === 0) {
            nearbySmoke = this.findNearbySmoke(smoke, this.clusterRadiusSquared);
        }
        
        // Calculate clumping force - move toward center of nearby particles
        if (nearbySmoke.length > 0) {
            const smokeX = smoke.currentX;
            const smokeY = smoke.currentY;
            const invRadius = 1 / this.clusterRadius;
            
            for (let i = 0; i < nearbySmoke.length; i++) {
                const other = nearbySmoke[i];
                const dx = other.currentX - smokeX;
                const dy = other.currentY - smokeY;
                const distanceSquared = dx * dx + dy * dy;
                
                if (distanceSquared > 0) {
                    const distance = Math.sqrt(distanceSquared);
                    // Attraction force (reduced for less clumping)
                    const force = (1 - distance * invRadius) * 0.03;
                    const invDistance = 1 / distance;
                    clumpForceX += dx * invDistance * force;
                    clumpForceY += dy * invDistance * force;
                    clumpCount++;
                }
            }
        }

        // Apply clumping force (limit vertical to prevent downward drift)
        if (clumpCount > 0) {
            smoke.currentX += clumpForceX;
            // Only apply upward clumping force (prevent downward drift)
            if (clumpForceY < 0) {
                smoke.currentY += clumpForceY; // Only if force is upward (negative Y)
            }
        }

        // Complex upward movement with swirling and drifting
        // Update swirl phase
        smoke.swirlPhase += smoke.swirlSpeed;
        
        // Add swirling horizontal movement
        const swirlX = Math.cos(smoke.swirlPhase) * smoke.swirlRadius * 0.1;
        // Only allow upward swirl (negative Y values, clamp to 0 or negative)
        const swirlY = Math.min(0, Math.sin(smoke.swirlPhase * 0.5) * smoke.swirlRadius * 0.05);
        
        // Horizontal drift - significantly reduced for first half of upward movement
        // Calculate progress toward top border (0 = start, 1 = reached top)
        const totalDistance = smoke.startY - this.topBorderY;
        const distanceTraveled = smoke.startY - smoke.currentY;
        const progress = Math.min(1, Math.max(0, distanceTraveled / totalDistance));
        
        // Reduce drift significantly in first half (0-50% of journey)
        let driftMultiplier;
        if (progress < 0.5) {
            // First half: very minimal drift (5% of normal)
            driftMultiplier = 0.05;
        } else {
            // Second half: gradually increase from 5% to 100%
            const secondHalfProgress = (progress - 0.5) * 2; // 0 to 1 in second half
            driftMultiplier = 0.05 + (secondHalfProgress * 0.95); // 5% to 100%
        }
        
        const ageMultiplier = 1 + (smoke.age * 0.0001); // Very slow growth rate
        const driftAmount = smoke.horizontalDrift * ageMultiplier * driftMultiplier;
        
        // Vertical movement with variation (faster in clumps, slower when alone)
        const verticalSpeed = smoke.floatSpeed * (clumpCount > 0 ? 1.1 : 0.9);
        
        // Apply movements (including wind drift to the right)
        smoke.currentX += swirlX + driftAmount + this.windSpeed;
        const previousY = smoke.currentY;
        // Ensure particles always move upward (currentY decreases, swirlY is clamped to <= 0)
        smoke.currentY -= verticalSpeed + Math.abs(swirlY);
        
        // Track distance traveled for character transition
        smoke.distanceTraveled += Math.abs(previousY - smoke.currentY);

        // Add some random turbulence (only horizontal and upward)
        if (Math.random() < 0.1) { // 10% chance per frame
            smoke.currentX += (Math.random() - 0.5) * 0.5;
            // Only allow upward turbulence (always subtract, never add)
            smoke.currentY -= Math.random() * 0.2; // Always upward movement
        }
        
        // Handle character transition based on starting character (optimized - only update when needed)
        if (!smoke.transitionComplete) {
            let newChar = smoke.element.textContent;
            
            if (smoke.startsAsSemicolon) {
                // Transition: ; → : → .
                const transitionProgress = Math.min(smoke.distanceTraveled / smoke.transitionDistance, 1);
                if (transitionProgress < 0.33) {
                    newChar = ';';
                } else if (transitionProgress < 0.66) {
                    newChar = ':';
                } else {
                    newChar = '.';
                    smoke.transitionComplete = true;
                }
            } else if (smoke.startsAsColon) {
                // Transition: : → .
                const transitionProgress = Math.min(smoke.distanceTraveled / smoke.transitionDistance, 1);
                if (transitionProgress < 0.5) {
                    newChar = ':';
                } else {
                    newChar = '.';
                    smoke.transitionComplete = true;
                }
            } else if (smoke.startsAsDot) {
                // Already a dot, no transition needed
                newChar = '.';
                smoke.transitionComplete = true;
            }
            
            // Only update DOM if character changed
            if (newChar !== smoke.element.textContent) {
                smoke.element.textContent = newChar;
            }
        }

        // Check if particle has drifted too far left (shouldn't happen while floating, but safety check)
        if (smoke.currentX <= this.borderLeft + 20) {
            this.shouldRestart = true;
            return;
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
                
                // Use current position where it reached the top (no jumping)
                // Then disperse left or right from this position
                smoke.targetPosition = smoke.currentX;
                
                // Randomly choose left (-1) or right (1) direction for dispersion
                smoke.direction = Math.random() > 0.5 ? 1 : -1;
                
                // Add to collected smoke (no need to check - hasReachedTop flag prevents duplicates)
                this.collectedSmoke.push(smoke);
            }
        }

        // Update element position
        this.updateElementPosition(smoke);
    }

    /**
     * Find nearby smoke particles for clumping (optimized - uses squared distance)
     */
    findNearbySmoke(smoke, radiusSquared) {
        const nearby = [];
        const smokeX = smoke.currentX;
        const smokeY = smoke.currentY;
        
        // Only check floating particles (not ones at top)
        for (let i = 0; i < this.smokeElements.length; i++) {
            const other = this.smokeElements[i];
            if (other === smoke || other.hasReachedTop) continue;
            
            const dx = other.currentX - smokeX;
            const dy = other.currentY - smokeY;
            const distanceSquared = dx * dx + dy * dy;
            
            if (distanceSquared < radiusSquared && distanceSquared > 0) {
                nearby.push(other);
            }
        }
        
        return nearby;
    }

    /**
     * Find nearby particles at the top border for clumping
     */
    findNearbyTopParticles(smoke, radiusSquared) {
        const nearby = [];
        const smokeX = smoke.targetPosition;
        
        // Only check particles at top
        for (let i = 0; i < this.smokeElements.length; i++) {
            const other = this.smokeElements[i];
            if (other === smoke || !other.hasReachedTop || !other.targetPosition) continue;
            
            const dx = other.targetPosition - smokeX;
            const distanceSquared = dx * dx;
            
            if (distanceSquared < radiusSquared && distanceSquared > 0) {
                nearby.push(other);
            }
        }
        
        return nearby;
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
     * Move smoke along the top border (with stacking and clumping)
     */
    moveAlongBorder(smoke) {
        if (!smoke.targetPosition) return;

        // Find nearby particles at top for clumping (only check every few frames for performance)
        let clumpForceX = 0;
        let clumpCount = 0;
        const clumpRadius = 20; // Reduced distance for particles to form clumps at top
        const clumpRadiusSquared = clumpRadius * clumpRadius;
        
        // Only check for nearby particles every 10 frames to reduce computation and clumping
        if (this.frameCount % 10 === 0) {
            const nearbyTopParticles = this.findNearbyTopParticles(smoke, clumpRadiusSquared);
            
            if (nearbyTopParticles.length > 0) {
                const smokeX = smoke.targetPosition;
                const invRadius = 1 / clumpRadius;
                
                for (let i = 0; i < nearbyTopParticles.length; i++) {
                    const other = nearbyTopParticles[i];
                    const dx = other.targetPosition - smokeX;
                    const distanceSquared = dx * dx;
                    
                    if (distanceSquared > 0 && distanceSquared < clumpRadiusSquared) {
                        const distance = Math.sqrt(distanceSquared);
                        // Much weaker attraction force to prevent giant ball formation
                        const force = (1 - distance * invRadius) * 0.01; // Reduced from 0.05 to 0.01
                        const invDistance = 1 / distance;
                        clumpForceX += dx * invDistance * force;
                        clumpCount++;
                    }
                }
            }
        }

        // Update oscillation for subtle vertical movement
        smoke.oscillation += smoke.oscillationSpeed;
        
        // Move along border with some randomness (slower when stacked)
        // Increase movement speed at top for more horizontal dispersion
        const speedMultiplier = 1 - (smoke.stackLayer || 0) * 0.1; // Slower when higher in stack
        const topMovementSpeed = smoke.moveSpeed * 2; // Double the speed for more horizontal movement at top
        const moveAmount = topMovementSpeed * smoke.direction * speedMultiplier;
        
        // Apply clumping force to keep particles together
        const finalMoveAmount = moveAmount + (clumpCount > 0 ? clumpForceX : 0);
        
        // Add wind drift to the left (stronger effect at top - 3x multiplier)
        const topWindSpeed = this.windSpeed * 3;
        smoke.targetPosition += finalMoveAmount + topWindSpeed;

        // Check if particle reaches left border - trigger restart
        if (smoke.targetPosition <= this.borderLeft + 20) {
            this.shouldRestart = true;
            return; // Stop processing this particle
        }

        // Bounce off right edge only (left edge triggers restart)
        if (smoke.targetPosition >= this.borderEnd) {
            smoke.direction *= -1; // Reverse direction
            smoke.targetPosition = this.borderEnd;
        }

        // Apply subtle horizontal jitter for organic movement (reduced)
        const jitter = (Math.random() - 0.5) * 0.3; // Reduced jitter for smoother movement
        smoke.currentX = smoke.targetPosition + jitter;
        
        // Vertical position with oscillation and stacking
        // Stack upward from the border (negative offset = above border line)
        const stackOffset = (smoke.stackLayer || 0) * 3; // 3px per layer
        smoke.currentY = this.topBorderY - stackOffset + Math.sin(smoke.oscillation) * smoke.oscillationAmplitude;

        // Occasionally change direction for more natural movement and dispersion
        if (Math.random() < 0.01) { // 1% chance per frame - more frequent direction changes
            smoke.direction *= -1;
        }

        this.updateElementPosition(smoke);
    }

    /**
     * Update the DOM element position (optimized - uses cached scroll values)
     */
    updateElementPosition(smoke) {
        const element = smoke.element;
        
        // Use cached scroll values (updated in animate loop)
        // Use fixed positioning relative to viewport (doesn't affect layout)
        element.style.left = `${smoke.currentX - this.scrollX}px`;
        element.style.top = `${smoke.currentY - this.scrollY}px`;
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
        this.borderNeedsUpdate = true;
        this.calculateBorderPosition();
    }

    /**
     * Restart the animation - clear all particles and start fresh
     */
    restart() {
        // Stop current animation and spawning
        this.isSpawningClump = false;
        this.shouldRestart = true; // Set flag to stop spawning
        this.stop();
        
        // Clear all pending spawn timeouts
        if (this.spawnTimeouts) {
            for (let i = 0; i < this.spawnTimeouts.length; i++) {
                clearTimeout(this.spawnTimeouts[i]);
            }
            this.spawnTimeouts = [];
        }
        
        // Clear all particles from DOM
        for (let i = 0; i < this.smokeElements.length; i++) {
            const smoke = this.smokeElements[i];
            if (smoke.element && smoke.element.parentNode) {
                smoke.element.parentNode.removeChild(smoke.element);
            }
        }
        
        // Clear arrays
        this.smokeElements = [];
        this.collectedSmoke = [];
        this.shouldRestart = false;
        
        // Reset frame counter
        this.frameCount = 0;
        
        // Restart after a brief pause
        setTimeout(() => {
            this.startAnimation();
            this.startSpawning();
        }, 500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for border to be drawn
    setTimeout(() => {
        const smokeAnimation = new SmokeAnimation();
        
        // Handle resize and scroll (throttled)
        let resizeTimeout;
        let scrollTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                smokeAnimation.handleResize();
            }, 100);
        });
        
        window.addEventListener('scroll', () => {
            smokeAnimation.borderNeedsUpdate = true;
        }, { passive: true });
    }, 1000); // Give border time to draw
});

