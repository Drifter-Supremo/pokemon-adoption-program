/**
 * Sprite Animator System
 * Handles loading sprite sheets and animating them on the canvas
 */

class SpriteAnimator {
    /**
     * Initialize the sprite animator
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Sprite sheets for each state
        this.sprites = {};
        
        // Animation state
        this.currentAnimation = STATE_IDLE;
        this.currentFrame = 0;
        this.isAnimating = false;
        this.animationTimer = null;
        this.currentFrameIndex = 0;  // Index within the duration array
        this.lastFrameTime = 0;
        this.frameDurationRemaining = 0;
        
        // State management
        this.baseState = STATE_IDLE;
        this.temporaryAnimation = false;
        this.onAnimationComplete = null;
        
        // Frame durations for each animation
        this.frameDurations = {
            [STATE_IDLE]: IDLE_FRAME_DURATIONS,
            [STATE_SAD]: SAD_FRAME_DURATIONS,
            [STATE_SLEEP]: SLEEP_FRAME_DURATIONS,
            [STATE_HOP]: HOP_FRAME_DURATIONS,
            [STATE_HUNGRY]: HUNGRY_FRAME_DURATIONS,
            [STATE_CLEAN]: CLEAN_FRAME_DURATIONS
        };
        
        // Grid layout data for each sprite sheet
        this.gridLayouts = {
            [STATE_IDLE]: { columns: 4, rows: 8 },
            [STATE_HUNGRY]: { columns: 10, rows: 8 },
            [STATE_SAD]: { columns: 2, rows: 8 },
            [STATE_SLEEP]: { columns: 2, rows: 1 },
            [STATE_HOP]: { columns: 10, rows: 8 },
            [STATE_CLEAN]: { columns: 9, rows: 8 } // Added for cleanliness animation
        };
        
        // Frame data for each animation
        this.animationData = {
            [STATE_IDLE]: { frames: 32, loop: true },      // 4×8 grid
            [STATE_HUNGRY]: { frames: 80, loop: true },    // 10×8 grid
            [STATE_SAD]: { frames: 16, loop: true },       // 2×8 grid
            [STATE_SLEEP]: { frames: 2, loop: true },      // 2×1 grid
            [STATE_HOP]: { frames: 80, loop: false },      // 10×8 grid
            [STATE_CLEAN]: { frames: 72, loop: false }     // 9×8 grid
        };
        
        // Set up canvas sizing (we'll adjust this later based on actual sprite sizes)
        this.setupCanvas();
    }
    
    /**
     * Set up the canvas size and position
     */
    setupCanvas() {
        // Make sure canvas is properly sized based on the container
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * Resize the canvas to fit the container while maintaining aspect ratio
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        
        // For now, make canvas size relative to viewport
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Set canvas size to fit container while maintaining reasonable proportions
        const canvasWidth = Math.min(containerWidth, 500);
        const canvasHeight = Math.min(containerHeight * 0.6, 300);
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // Redraw the current frame after resize
        if (this.sprites[this.currentAnimation]) {
            this.drawFrame();
        }
    }
    
    /**
     * Load all sprite sheets
     * @returns {Promise} - A promise that resolves when all sprites are loaded
     */
    loadSprites() {
        const spritePromises = [];
        
        // List of sprite states to load
        const states = [STATE_IDLE, STATE_HUNGRY, STATE_SAD, STATE_SLEEP, STATE_HOP, STATE_CLEAN];
        
        // Load each sprite
        states.forEach(state => {
            const sprite = new Image();
            const promise = new Promise((resolve, reject) => {
                sprite.onload = () => {
                    // Once loaded, save the sprite and resolve the promise
                    this.sprites[state] = sprite;
                    
                    // Update animation data with actual frame count if needed
                    // We'll need to examine the sprite sheets to set accurate frame counts
                    
                    resolve();
                };
                sprite.onerror = () => {
                    console.error(`Failed to load sprite: ${state}`);
                    reject();
                };
            });
            
            sprite.src = `assets/sprites/mimikyu_${state}.png`;
            spritePromises.push(promise);
        });
        
        return Promise.all(spritePromises);
    }
    
    /**
     * Get the duration value for the current frame
     * @returns {number} The duration in milliseconds
     */
    getCurrentFrameDuration() {
        // Get the durations array for this animation
        const durations = this.frameDurations[this.currentAnimation];
        
        if (!durations || durations.length === 0) {
            // Default duration if no specific durations exist
            return 100;
        }
        
        // Get the duration for the current frame index (circular for looping animations)
        const index = this.currentFrameIndex % durations.length;
        
        // Convert from game ticks to milliseconds
        return durations[index] * MS_PER_GAME_TICK;
    }
    
    /**
     * Start an animation sequence
     * @param {string} animationName - Name of the animation to play
     * @param {Function} onComplete - Optional callback when non-looping animation completes
     */
    playAnimation(animationName, onComplete = null) {
        // Special handling for hop and clean animations
        if (animationName === STATE_HOP) {
            this.playHopAnimation(onComplete);
            return;
        } else if (animationName === STATE_CLEAN) {
            this.playCleanAnimation(onComplete);
            return;
        }
        
        // Check if this is a temporary animation
        const isTemporaryAnim = false; // Hop and clean now have special handling
        
        // If this is a state animation (not temporary), update the base state
        if (!isTemporaryAnim) {
            this.baseState = animationName;
            this.temporaryAnimation = false;
        } else {
            // This is a temporary animation, store the callback
            this.temporaryAnimation = true;
            this.onAnimationComplete = onComplete;
        }
        
        // Stop current animation if one is playing
        this.stopAnimation();
        
        // Set current animation
        this.currentAnimation = animationName;
        this.currentFrame = 0;
        this.currentFrameIndex = 0;
        this.lastFrameTime = 0;
        
        // Get the animation data
        const animData = this.animationData[animationName];
        
        if (!animData) {
            console.error(`Animation data not found for: ${animationName}`);
            return;
        }
        
        // Set the initial frame duration (in milliseconds)
        this.frameDurationRemaining = this.getCurrentFrameDuration();
        
        // Start the animation loop
        this.isAnimating = true;
        
        const animate = (timestamp) => {
            if (!this.isAnimating) return;
            
            // Initialize timestamp if first frame
            if (this.lastFrameTime === 0) {
                this.lastFrameTime = timestamp;
                this.animationTimer = requestAnimationFrame(animate);
                return;
            }
            
            // Calculate elapsed time since last frame
            const elapsed = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;
            
            // Update frame duration remaining
            this.frameDurationRemaining -= elapsed;
            
            // Draw the current frame
            this.drawFrame();
            
            // Check if it's time for the next frame
            if (this.frameDurationRemaining <= 0) {
                // Time to move to the next frame
                
                // Update frame indices
                this.currentFrameIndex++;
                const durations = this.frameDurations[this.currentAnimation];
                
                // Handle frame looping for animations
                if (this.currentFrameIndex >= durations.length) {
                    this.currentFrameIndex = 0;
                }
                
                // Map the animation frame index to the sprite sheet frame
                this.currentFrame = this.mapFrameIndex(this.currentFrameIndex, this.currentAnimation);
                
                // Get the new frame duration
                this.frameDurationRemaining = this.getCurrentFrameDuration();
            }
            
            // Continue animation loop
            this.animationTimer = requestAnimationFrame(animate);
        };
        
        // Start animation loop with timestamp
        this.animationTimer = requestAnimationFrame(animate);
    }
    
    /**
     * Special animation handler for hop with fixed duration
     * @param {Function} onComplete - Optional callback when animation completes
     */
    playHopAnimation(onComplete = null) {
        // Stop current animation if one is playing
        this.stopAnimation();
        
        // Set animation properties
        this.currentAnimation = STATE_HOP;
        this.baseState = STATE_IDLE; // Will return to idle after completion
        this.temporaryAnimation = true;
        this.onAnimationComplete = onComplete;
        
        // Animation data
        const totalFrames = this.animationData[STATE_HOP].frames;
        const totalDuration = 8000; // 8 seconds total duration
        const frameInterval = totalDuration / totalFrames;
        
        console.log(`Starting hop animation: ${totalFrames} frames over ${totalDuration}ms (${frameInterval}ms per frame)`);
        
        // Start with first frame
        this.currentFrame = 0;
        this.isAnimating = true;
        
        // Draw first frame immediately
        this.drawFrame();
        
        // Set up animation with fixed timing
        let frameCount = 0;
        
        const hopAnimate = () => {
            if (!this.isAnimating) return;
            
            frameCount++;
            
            // Calculate which frame to show based on progress through the animation
            this.currentFrame = Math.min(Math.floor(frameCount * totalFrames / (totalDuration / frameInterval)), totalFrames - 1);
            
            // Draw the current frame
            this.drawFrame();
            
            // Check if animation is complete
            if (frameCount * frameInterval >= totalDuration) {
                this.stopAnimation();
                
                // Return to idle state
                setTimeout(() => {
                    this.playAnimation(STATE_IDLE);
                    
                    // Call completion callback if provided
                    if (this.onAnimationComplete) {
                        this.onAnimationComplete();
                        this.onAnimationComplete = null;
                    }
                }, 50);
                
                return;
            }
            
            // Continue animation loop
            this.animationTimer = setTimeout(() => {
                requestAnimationFrame(hopAnimate);
            }, frameInterval);
        };
        
        // Start animation loop
        this.animationTimer = setTimeout(() => {
            requestAnimationFrame(hopAnimate);
        }, frameInterval);
    }
    
    /**
     * Special animation handler for clean with fixed duration
     * @param {Function} onComplete - Optional callback when animation completes
     */
    playCleanAnimation(onComplete = null) {
        // Stop current animation if one is playing
        this.stopAnimation();
        
        // Set animation properties
        this.currentAnimation = STATE_CLEAN;
        this.baseState = STATE_IDLE; // Will return to idle after completion
        this.temporaryAnimation = true;
        this.onAnimationComplete = onComplete;
        
        // Animation data
        const totalFrames = this.animationData[STATE_CLEAN].frames;
        const totalDuration = 7000; // 7 seconds total duration
        const frameInterval = totalDuration / totalFrames;
        
        console.log(`Starting clean animation: ${totalFrames} frames over ${totalDuration}ms (${frameInterval}ms per frame)`);
        
        // Start with first frame
        this.currentFrame = 0;
        this.isAnimating = true;
        
        // Draw first frame immediately
        this.drawFrame();
        
        // Set up animation with fixed timing
        let frameCount = 0;
        
        const cleanAnimate = () => {
            if (!this.isAnimating) return;
            
            frameCount++;
            
            // Calculate which frame to show based on progress through the animation
            this.currentFrame = Math.min(Math.floor(frameCount * totalFrames / (totalDuration / frameInterval)), totalFrames - 1);
            
            // Draw the current frame
            this.drawFrame();
            
            // Check if animation is complete
            if (frameCount * frameInterval >= totalDuration) {
                this.stopAnimation();
                
                // Return to idle state
                setTimeout(() => {
                    this.playAnimation(STATE_IDLE);
                    
                    // Call completion callback if provided
                    if (this.onAnimationComplete) {
                        this.onAnimationComplete();
                        this.onAnimationComplete = null;
                    }
                }, 50);
                
                return;
            }
            
            // Continue animation loop
            this.animationTimer = setTimeout(() => {
                requestAnimationFrame(cleanAnimate);
            }, frameInterval);
        };
        
        // Start animation loop
        this.animationTimer = setTimeout(() => {
            requestAnimationFrame(cleanAnimate);
        }, frameInterval);
    }
    
    /**
     * Map a frame index from the XML animation data to the sprite sheet frame
     * @param {number} frameIndex - The index in the XML duration array
     * @param {string} animation - The animation name
     * @returns {number} The corresponding sprite sheet frame
     */
    mapFrameIndex(frameIndex, animation) {
        // Get the duration array and animation data
        const durations = this.frameDurations[animation];
        const animData = this.animationData[animation];
        
        if (!durations || !animData) {
            return frameIndex;
        }
        
        // Handle special case for animations like hop (10 XML frames mapping to 80 sprite frames)
        // and clean (9 XML frames mapping to 72 sprite frames)
        if (animation === STATE_HOP) {
            // For hop: 10 frames in XML, 80 frames in sprite sheet = 8x multiplier
            // This means each duration frame maps to 8 sprite frames
            const framesPerDuration = Math.floor(animData.frames / durations.length);
            return (frameIndex % durations.length) * framesPerDuration;
        } 
        else if (animation === STATE_CLEAN) {
            // For clean: 9 frames in XML, 72 frames in sprite sheet = 8x multiplier
            const framesPerDuration = Math.floor(animData.frames / durations.length);
            return (frameIndex % durations.length) * framesPerDuration;
        }
        
        // For animations where the number of XML frames matches the sprite sheet frames
        if (durations.length === animData.frames) {
            return frameIndex % animData.frames;
        }
        
        // Default case: simple modulo for repeating frames
        return frameIndex % durations.length;
    }
    
    /**
     * Stop the current animation
     */
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationTimer) {
            // Clear both timeout and animation frame to handle both types of animations
            clearTimeout(this.animationTimer);
            cancelAnimationFrame(this.animationTimer);
            this.animationTimer = null;
        }
    }
    
    /**
     * Draw the current animation frame to the canvas
     */
    drawFrame() {
        const sprite = this.sprites[this.currentAnimation];
        if (!sprite) return;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get frame count and grid layout for this animation
        const framesCount = this.animationData[this.currentAnimation].frames;
        const gridLayout = this.gridLayouts[this.currentAnimation];
        
        if (!gridLayout) {
            console.error(`No grid layout found for animation: ${this.currentAnimation}`);
            return;
        }
        
        // Calculate the source coordinates from the sprite sheet grid
        const frameWidth = Math.floor(sprite.width / gridLayout.columns);
        const frameHeight = Math.floor(sprite.height / gridLayout.rows);
        
        // Convert the 1D frame index to 2D coordinates in the grid
        const column = this.currentFrame % gridLayout.columns;
        const row = Math.floor(this.currentFrame / gridLayout.columns);
        
        // Calculate the source position
        const sourceX = column * frameWidth;
        const sourceY = row * frameHeight;
        
        // Only log this information when debug logging is enabled
        if (window.debugSettings && window.debugSettings.logFrames) {
            console.log(`Animation: ${this.currentAnimation}, Frame: ${this.currentFrame}, Grid: ${column}x${row}`);
            console.log(`Sprite dimensions: ${sprite.width}x${sprite.height}, Frame size: ${frameWidth}x${frameHeight}`);
        }
        
        // Calculate the destination dimensions to fit the canvas while maintaining aspect ratio
        // Important: we want to scale a single frame, not the entire sprite sheet
        const aspectRatio = frameWidth / frameHeight;
        let destWidth, destHeight;
        
        if (this.canvas.width / this.canvas.height > aspectRatio) {
            // Canvas is wider than the sprite frame
            destHeight = this.canvas.height * 0.8; // 80% of canvas height
            destWidth = destHeight * aspectRatio;
        } else {
            // Canvas is taller than the sprite frame
            destWidth = this.canvas.width * 0.8; // 80% of canvas width
            destHeight = destWidth / aspectRatio;
        }
        
        // Calculate the destination coordinates to center the sprite
        const destX = (this.canvas.width - destWidth) / 2;
        const destY = (this.canvas.height - destHeight) / 2;
        
        // Draw only the current frame from the sprite sheet to the canvas
        this.ctx.drawImage(
            sprite,
            sourceX, sourceY,
            frameWidth, frameHeight,
            destX, destY,
            destWidth, destHeight
        );
    }
}
