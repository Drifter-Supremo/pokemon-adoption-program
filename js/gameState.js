/**
 * Game State System
 * Central state management for the entire game
 */

class GameState {
    constructor() {
        // Core state
        this.needs = {
            hunger: NEED_MAX,
            happiness: NEED_MAX,
            cleanliness: NEED_MAX,
            energy: NEED_MAX
        };
        
        // Calculated state
        this.mood = STATE_IDLE;
        this.trustLevel = 50; // Start with neutral trust
        
        // Timestamps
        this.lastUpdate = new Date();
        this.gameStarted = new Date();
        
        // Internal state
        this.decayIntervalId = null;
        this.isSleeping = false;
        
        // For observer pattern
        this.observers = [];
        
        // Initialize the day/night cycle
        this.updateDayNightCycle();
    }
    
    /**
     * Initialize the game state
     */
    init() {
        // Load saved state if it exists
        this.loadState();
        
        // Start the decay interval
        this.startDecayTimer();
        
        // Update the day/night cycle
        this.updateDayNightCycle();
        
        // Notify all observers of the initial state
        this.notifyObservers();
    }
    
    /**
     * Observer pattern: Register an observer to be notified of state changes
     * @param {Object} observer - Object with an update method
     */
    registerObserver(observer) {
        this.observers.push(observer);
    }
    
    /**
     * Observer pattern: Notify all observers of state changes
     */
    notifyObservers() {
        this.observers.forEach(observer => {
            if (observer && typeof observer.update === 'function') {
                observer.update(this);
            }
        });
    }
    
    /**
     * Start the decay timer to gradually decrease needs
     */
    startDecayTimer() {
        // Clear any existing timer
        if (this.decayIntervalId) {
            clearInterval(this.decayIntervalId);
        }
        
        // Set up new timer (every 10 seconds)
        this.decayIntervalId = setInterval(() => {
            this.applyDecay();
        }, 10000); // 10 seconds
    }
    
    /**
     * Apply decay to all needs based on elapsed time
     */
    applyDecay() {
        // Don't decay needs while sleeping
        if (this.isSleeping) return;
        
        const now = new Date();
        const secondsElapsed = (now - this.lastUpdate) / 1000;
        
        // Convert decay rates from per-minute to per-second
        const hungerDecay = (HUNGER_DECAY_RATE / 60) * secondsElapsed;
        const happinessDecay = (HAPPINESS_DECAY_RATE / 60) * secondsElapsed;
        const cleanlinessDecay = (CLEANLINESS_DECAY_RATE / 60) * secondsElapsed;
        const energyDecay = (ENERGY_DECAY_RATE / 60) * secondsElapsed;
        
        // Apply decay
        this.needs.hunger = Math.max(0, this.needs.hunger - hungerDecay);
        this.needs.happiness = Math.max(0, this.needs.happiness - happinessDecay);
        this.needs.cleanliness = Math.max(0, this.needs.cleanliness - cleanlinessDecay);
        this.needs.energy = Math.max(0, this.needs.energy - energyDecay);
        
        // Check if any need is critically low and update trust level
        this.updateTrustLevel();
        
        // Update the mood based on needs
        this.updateMood();
        
        // Update the timestamp
        this.lastUpdate = now;
        
        // Save state
        this.saveState();
        
        // Notify observers
        this.notifyObservers();
    }
    
    /**
     * Apply a large decay when returning after absence
     * @param {Date} lastSavedTime - The last time the game was saved
     */
    applyAbsenceDecay(lastSavedTime) {
        const now = new Date();
        const hoursElapsed = (now - lastSavedTime) / (1000 * 60 * 60);
        
        // Only apply decay if significant time has passed
        if (hoursElapsed < 0.25) return; // Less than 15 minutes
        
        // Calculate decay with limit to prevent excessive frustration
        const hungerDecay = Math.min(HUNGER_DECAY_RATE * hoursElapsed, MAX_ABSENCE_DECAY);
        const happinessDecay = Math.min(HAPPINESS_DECAY_RATE * hoursElapsed, MAX_ABSENCE_DECAY);
        const cleanlinessDecay = Math.min(CLEANLINESS_DECAY_RATE * hoursElapsed, MAX_ABSENCE_DECAY);
        const energyDecay = Math.min(ENERGY_DECAY_RATE * hoursElapsed, MAX_ABSENCE_DECAY);
        
        // Apply decay with minimum values (never below 30%)
        this.needs.hunger = Math.max(NEED_MAX - hungerDecay, NEED_MAX * 0.3);
        this.needs.happiness = Math.max(NEED_MAX - happinessDecay, NEED_MAX * 0.3);
        this.needs.cleanliness = Math.max(NEED_MAX - cleanlinessDecay, NEED_MAX * 0.3);
        this.needs.energy = Math.max(NEED_MAX - energyDecay, NEED_MAX * 0.3);
        
        // Update mood and trust
        this.updateMood();
        this.updateTrustLevel();
    }
    
    /**
     * Update the mood based on needs following the updated behavior logic:
     * - Only hunger triggers automatic animation change
     * - Other states only affect UI indicators until button press
     */
    updateMood() {
        // Store the previous mood to detect changes
        const previousMood = this.mood;
        
        // Special case: When sleeping, show sleep animation
        if (this.isSleeping) {
            this.mood = STATE_SLEEP;
        }
        // Only hunger automatically changes the animation
        else if (this.needs.hunger < NEED_CRITICAL_THRESHOLD) {
            this.mood = STATE_HUNGRY;
        } 
        // All other states remain in idle animation (UI will show indicators)
        else {
            this.mood = STATE_IDLE;
        }
        
        // If mood has changed, log it for debugging
        if (previousMood !== this.mood) {
            console.log(`Mood changed from ${previousMood} to ${this.mood}`);
        }
    }
    
    /**
     * Update the trust level based on needs
     */
    updateTrustLevel() {
        // Check if any need is critically low
        const anyCritical = Object.values(this.needs).some(need => need < NEED_CRITICAL_THRESHOLD);
        
        if (anyCritical) {
            // Decrease trust when needs are critically low
            this.trustLevel = Math.max(0, this.trustLevel - TRUST_LOSS_RATE);
        } else {
            // Slowly increase trust when all needs are satisfied
            const allSatisfied = Object.values(this.needs).every(need => need > NEED_MAX * 0.7);
            
            if (allSatisfied) {
                this.trustLevel = Math.min(MAX_TRUST_LEVEL, this.trustLevel + TRUST_GAIN_RATE);
            }
        }
    }
    
    /**
     * Update the day/night cycle based on current time
     */
    updateDayNightCycle() {
        const now = new Date();
        const hour = now.getHours();
        const isDay = hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR;
        
        // Set appropriate background class
        const background = document.getElementById('background');
        if (background) {
            if (isDay) {
                background.classList.remove('night-background');
                background.classList.add('day-background');
            } else {
                background.classList.remove('day-background');
                background.classList.add('night-background');
            }
        }
    }
    
    /**
     * Action: Feed Mimikyu
     * @returns {boolean} True if the action was successful
     */
    feed() {
        if (this.isSleeping) return false;
        
        // Increase hunger value
        this.needs.hunger = Math.min(NEED_MAX, this.needs.hunger + FEEDING_AMOUNT);
        
        // Feeding also gives a small happiness boost
        this.needs.happiness = Math.min(NEED_MAX, this.needs.happiness + FEEDING_HAPPINESS_BOOST);
        
        // If the sound system exists, stop the hungry sound interval
        if (window.soundSystem) {
            soundSystem.stopHungrySoundInterval();
        }
        
        // Update state
        this.updateMood();
        this.saveState();
        this.notifyObservers();
        
        return true;
    }
    
    /**
     * Action: Play with Mimikyu
     * @returns {boolean} True if the action was successful
     */
    play() {
        if (this.isSleeping) return false;
        
        // Playing costs energy
        if (this.needs.energy < PLAYING_ENERGY_COST) {
            // Too tired to play
            return false;
        }
        
        // Increase happiness
        this.needs.happiness = Math.min(NEED_MAX, this.needs.happiness + PLAYING_AMOUNT);
        
        // Decrease energy
        this.needs.energy = Math.max(0, this.needs.energy - PLAYING_ENERGY_COST);
        
        // Update state
        this.updateMood();
        this.saveState();
        this.notifyObservers();
        
        return true;
    }
    
    /**
     * Action: Clean Mimikyu
     * @returns {boolean} True if the action was successful
     */
    clean() {
        if (this.isSleeping) return false;
        
        // Increase cleanliness
        this.needs.cleanliness = Math.min(NEED_MAX, this.needs.cleanliness + CLEANING_AMOUNT);
        
        // Update state
        this.updateMood();
        this.saveState();
        this.notifyObservers();
        
        return true;
    }
    
    /**
     * Action: Put Mimikyu to sleep
     * @returns {boolean} True if the action was successful
     */
    sleep() {
        if (this.isSleeping) return false;
        
        // Start sleeping
        this.isSleeping = true;
        this.mood = STATE_SLEEP;
        
        // Notify observers of state change
        this.notifyObservers();
        
        // Set a timer to wake up after the sleep duration
        setTimeout(() => {
            // Increase energy
            this.needs.energy = Math.min(NEED_MAX, this.needs.energy + SLEEPING_AMOUNT);
            
            // Wake up
            this.isSleeping = false;
            
            // Stop any looping sleep sound
            if (window.soundSystem) {
                soundSystem.stop(SOUND_MIMIKYU_SLEEP);
                
                // Also stop any mood sound that might be playing
                soundSystem.stopCurrentMoodSound();
            }
            
            // Update mood
            this.updateMood();
            
            // Save state
            this.saveState();
            
            // Notify observers
            this.notifyObservers();
        }, SLEEPING_DURATION);
        
        return true;
    }
    
    /**
     * Save the current game state to LocalStorage
     */
    saveState() {
        const saveData = {
            needs: this.needs,
            trustLevel: this.trustLevel,
            lastUpdate: new Date().toISOString(),
            gameStarted: this.gameStarted.toISOString()
        };
        
        localStorage.setItem(STORAGE_GAME_STATE, JSON.stringify(saveData));
    }
    
    /**
     * Load the game state from LocalStorage
     */
    loadState() {
        const savedData = localStorage.getItem(STORAGE_GAME_STATE);
        
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                
                // Restore needs
                this.needs = parsedData.needs || this.needs;
                
                // Restore trust level
                this.trustLevel = parsedData.trustLevel || 50;
                
                // Restore timestamps
                const lastUpdate = new Date(parsedData.lastUpdate);
                this.gameStarted = parsedData.gameStarted ? new Date(parsedData.gameStarted) : new Date();
                
                // Apply decay for time away
                this.applyAbsenceDecay(lastUpdate);
                
                // Update timestamp
                this.lastUpdate = new Date();
                
                // Update mood based on restored state
                this.updateMood();
                
            } catch (error) {
                console.error('Error loading saved game state', error);
                // Use default values if loading fails
            }
        }
    }
    
    /**
     * Get the current need levels for UI display
     * @returns {Object} The current need levels
     */
    getNeedLevels() {
        return {
            hunger: this.needs.hunger,
            happiness: this.needs.happiness,
            cleanliness: this.needs.cleanliness,
            energy: this.needs.energy
        };
    }
    
    /**
     * Check if a specific need is at warning level
     * @param {string} needName - The name of the need to check
     * @returns {boolean} True if the need is at warning level
     */
    isNeedAtWarning(needName) {
        return this.needs[needName] < NEED_WARNING_THRESHOLD;
    }
    
    /**
     * Check if a specific need is at critical level
     * @param {string} needName - The name of the need to check
     * @returns {boolean} True if the need is at critical level
     */
    isNeedAtCritical(needName) {
        return this.needs[needName] < NEED_CRITICAL_THRESHOLD;
    }
    
    /**
     * DEBUG FUNCTION: Force Mimikyu into hungry state
     * This is temporary to help test the hungry animation
     */
    debugForceHungry() {
        console.log("DEBUG: Forcing Mimikyu into hungry state");
        this.needs.hunger = NEED_CRITICAL_THRESHOLD - 1;
        this.updateMood();
        this.notifyObservers();
    }
}

// Create a global instance of the game state
const gameState = new GameState();
