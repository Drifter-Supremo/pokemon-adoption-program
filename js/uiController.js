/**
 * UI Controller System
 * Handles all UI updates and user interactions
 */

class UIController {
    constructor() {
        // UI elements
        this.hungerBar = document.getElementById('hunger-bar');
        this.happinessBar = document.getElementById('happiness-bar');
        this.cleanlinessBar = document.getElementById('cleanliness-bar');
        this.energyBar = document.getElementById('energy-bar');
        
        // Buttons
        this.feedButton = document.getElementById('feed-btn');
        this.playButton = document.getElementById('play-btn');
        this.cleanButton = document.getElementById('clean-btn');
        this.sleepButton = document.getElementById('sleep-btn');
        this.soundToggle = document.getElementById('sound-toggle');
        
        // Sprite animator reference (will be set later)
        this.spriteAnimator = null;
        
        // Sound system reference (will be set later)
        this.soundSystem = null;
        
        // Set up button event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set the sprite animator reference
     * @param {SpriteAnimator} animator - The sprite animator instance
     */
    setSpriteAnimator(animator) {
        this.spriteAnimator = animator;
    }
    
    /**
     * Set the sound system reference
     * @param {SoundSystem} soundSys - The sound system instance
     */
    setSoundSystem(soundSys) {
        this.soundSystem = soundSys;
    }
    
    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Feed button
        if (this.feedButton) {
            this.feedButton.addEventListener('click', () => {
                this.handleFeedClick();
            });
        }
        
        // Play button
        if (this.playButton) {
            this.playButton.addEventListener('click', () => {
                this.handlePlayClick();
            });
        }
        
        // Clean button
        if (this.cleanButton) {
            this.cleanButton.addEventListener('click', () => {
                this.handleCleanClick();
            });
        }
        
        // Sleep button
        if (this.sleepButton) {
            this.sleepButton.addEventListener('click', () => {
                this.handleSleepClick();
            });
        }
        
        // Sound toggle button
        if (this.soundToggle) {
            this.soundToggle.addEventListener('click', () => {
                this.handleSoundToggle();
            });
        }
    }
    
    /**
     * Update method called by the game state (Observer pattern)
     * @param {GameState} state - The current game state
     */
    update(state) {
        // Update need bars
        this.updateNeedBars(state.getNeedLevels());
        
        // Update appearance based on mood
        this.updateAppearance(state.mood);
        
        // Update button states based on game state
        this.updateButtonStates(state);
    }
    
    /**
     * Update the need bars based on current levels
     * @param {Object} needs - The current need levels
     */
    updateNeedBars(needs) {
        // Update hunger bar
        if (this.hungerBar) {
            this.hungerBar.style.width = `${needs.hunger}%`;
            this.updateBarWarning(this.hungerBar, needs.hunger);
        }
        
        // Update happiness bar
        if (this.happinessBar) {
            this.happinessBar.style.width = `${needs.happiness}%`;
            this.updateBarWarning(this.happinessBar, needs.happiness);
        }
        
        // Update cleanliness bar
        if (this.cleanlinessBar) {
            this.cleanlinessBar.style.width = `${needs.cleanliness}%`;
            this.updateBarWarning(this.cleanlinessBar, needs.cleanliness);
        }
        
        // Update energy bar
        if (this.energyBar) {
            this.energyBar.style.width = `${needs.energy}%`;
            this.updateBarWarning(this.energyBar, needs.energy);
        }
    }
    
    /**
     * Update warning animation for need bars
     * @param {HTMLElement} bar - The need bar element
     * @param {number} value - The current need value
     */
    updateBarWarning(bar, value) {
        if (value < NEED_CRITICAL_THRESHOLD) {
            bar.classList.add('need-warning');
        } else if (value < NEED_WARNING_THRESHOLD) {
            bar.classList.add('need-warning');
            bar.classList.remove('need-critical');
        } else {
            bar.classList.remove('need-warning', 'need-critical');
        }
    }
    
    /**
     * Update Mimikyu's appearance based on mood
     * @param {string} mood - The current mood
     */
    updateAppearance(mood) {
        if (!this.spriteAnimator) return;
        
        // Don't interrupt temporary animations like hop or clean
        if (this.spriteAnimator.temporaryAnimation) {
            // Just update the base state, but don't switch animations yet
            this.spriteAnimator.baseState = mood;
            return;
        }
        
        // Don't restart the same animation if it's already playing
        if (this.spriteAnimator.currentAnimation === mood && this.spriteAnimator.isAnimating) {
            return;
        }
        
        // Play the appropriate animation based on mood
        this.spriteAnimator.playAnimation(mood);
        
        // Play the corresponding mood sound when animation changes
        if (this.soundSystem) {
            this.soundSystem.playMoodSound(mood);
        }
    }
    
    /**
     * Update button states based on game state
     * @param {GameState} state - The current game state
     */
    updateButtonStates(state) {
        // Disable all buttons while sleeping
        const isSleeping = state.isSleeping;
        
        // Feed button - highlight if hunger is low
        if (this.feedButton) {
            this.feedButton.disabled = isSleeping;
            this.updateButtonNotification(
                this.feedButton, 
                state.isNeedAtWarning('hunger')
            );
        }
        
        // Play button - highlight if happiness is low, disable if energy too low
        if (this.playButton) {
            const canPlay = !isSleeping && state.needs.energy >= PLAYING_ENERGY_COST;
            this.playButton.disabled = !canPlay;
            this.updateButtonNotification(
                this.playButton, 
                state.isNeedAtWarning('happiness') && canPlay
            );
        }
        
        // Clean button - highlight if cleanliness is low
        if (this.cleanButton) {
            this.cleanButton.disabled = isSleeping;
            this.updateButtonNotification(
                this.cleanButton, 
                state.isNeedAtWarning('cleanliness')
            );
        }
        
        // Sleep button - highlight if energy is low
        if (this.sleepButton) {
            this.sleepButton.disabled = isSleeping;
            this.updateButtonNotification(
                this.sleepButton, 
                state.isNeedAtWarning('energy')
            );
        }
    }
    
    /**
     * Update button notification glow effect
     * @param {HTMLElement} button - The button element
     * @param {boolean} shouldNotify - Whether to show notification
     */
    updateButtonNotification(button, shouldNotify) {
        if (shouldNotify) {
            button.classList.add('button-notification');
        } else {
            button.classList.remove('button-notification');
        }
    }
    
    /**
     * Handle feed button click
     */
    handleFeedClick() {
        // Play button click sound
        if (this.soundSystem) {
            this.soundSystem.play(SOUND_BUTTON_CLICK);
        }
        
        // Add pressed animation to button
        this.addButtonPressAnimation(this.feedButton);
        
        // Execute the feed action in game state
        const success = gameState.feed();
        
        if (success) {
            // Play feeding animation
            if (this.spriteAnimator) {
                this.spriteAnimator.playAnimation(STATE_HOP, () => {
                // Play happy sound when animation completes with background pause
                if (this.soundSystem) {
                    this.soundSystem.playWithBackgroundPause(SOUND_MIMIKYU_HAPPY);
                }
                });
            }
        }
    }
    
    /**
     * Handle play button click
     */
    handlePlayClick() {
        // Play button click sound
        if (this.soundSystem) {
            this.soundSystem.play(SOUND_BUTTON_CLICK);
        }
        
        // Add pressed animation to button
        this.addButtonPressAnimation(this.playButton);
        
        // Execute the play action in game state
        const success = gameState.play();
        
        if (success) {
            // Play hop animation
            if (this.spriteAnimator) {
                this.spriteAnimator.playAnimation(STATE_HOP, () => {
                    // Play happy sound when animation completes with background pause
                    if (this.soundSystem) {
                        this.soundSystem.playWithBackgroundPause(SOUND_MIMIKYU_HAPPY);
                    }
                });
            }
        }
    }
    
    /**
     * Handle clean button click
     */
    handleCleanClick() {
        // Play button click sound
        if (this.soundSystem) {
            this.soundSystem.play(SOUND_BUTTON_CLICK);
        }
        
        // Add pressed animation to button
        this.addButtonPressAnimation(this.cleanButton);
        
        // Execute the clean action in game state
        const success = gameState.clean();
        
        if (success) {
            // Play cleaning animation (uses the dedicated cleanliness animation)
            if (this.spriteAnimator) {
                this.spriteAnimator.playAnimation(STATE_CLEAN, () => {
                    // Play happy sound when animation completes with background pause
                    if (this.soundSystem) {
                        this.soundSystem.playWithBackgroundPause(SOUND_MIMIKYU_HAPPY);
                    }
                });
            }
        }
    }
    
    /**
     * Handle sleep button click
     */
    handleSleepClick() {
        // Play button click sound
        if (this.soundSystem) {
            this.soundSystem.play(SOUND_BUTTON_CLICK);
        }
        
        // Add pressed animation to button
        this.addButtonPressAnimation(this.sleepButton);
        
        // Execute the sleep action in game state
        const success = gameState.sleep();
        
        if (success) {
            // Play sleeping sound with background pause - no looping
            // (Background music will resume when sleep ends)
            if (this.soundSystem) {
                this.soundSystem.playWithBackgroundPause(SOUND_MIMIKYU_SLEEP);
            }
        }
    }
    
    /**
     * Handle sound toggle button click
     */
    handleSoundToggle() {
        if (!this.soundSystem) return;
        
        // Toggle sound on/off
        const isMuted = this.soundSystem.toggleMute();
        
        // Update button text
        if (this.soundToggle) {
            this.soundToggle.textContent = isMuted ? '🔇' : '🔊';
        }
    }
    
    /**
     * Add temporary button press animation
     * @param {HTMLElement} button - The button element
     */
    addButtonPressAnimation(button) {
        if (!button) return;
        
        button.classList.add('button-pressed');
        
        // Remove the class after animation completes
        setTimeout(() => {
            button.classList.remove('button-pressed');
        }, 300);
    }
}

// Create a global instance of the UI controller
const uiController = new UIController();
