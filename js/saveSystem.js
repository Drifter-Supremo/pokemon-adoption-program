/**
 * Save System
 * Utilities for saving and loading game state
 */

class SaveSystem {
    /**
     * Save the current game state to localStorage
     * @param {Object} state - The game state to save
     */
    static saveGameState(state) {
        // Create a serializable version of the game state
        const saveData = {
            needs: state.needs,
            trustLevel: state.trustLevel,
            lastUpdate: new Date().toISOString(),
            gameStarted: state.gameStarted.toISOString()
        };
        
        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_GAME_STATE, JSON.stringify(saveData));
            console.log('Game state saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game state', error);
            return false;
        }
    }
    
    /**
     * Load game state from localStorage
     * @returns {Object|null} The loaded game state or null if not found
     */
    static loadGameState() {
        try {
            const savedData = localStorage.getItem(STORAGE_GAME_STATE);
            
            if (!savedData) {
                console.log('No saved game state found');
                return null;
            }
            
            // Parse the saved data
            const parsedData = JSON.parse(savedData);
            
            // Convert date strings back to Date objects
            if (parsedData.lastUpdate) {
                parsedData.lastUpdate = new Date(parsedData.lastUpdate);
            }
            
            if (parsedData.gameStarted) {
                parsedData.gameStarted = new Date(parsedData.gameStarted);
            }
            
            console.log('Game state loaded successfully');
            return parsedData;
        } catch (error) {
            console.error('Failed to load game state', error);
            return null;
        }
    }
    
    /**
     * Save user settings to localStorage
     * @param {Object} settings - The settings to save
     */
    static saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
            console.log('Settings saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save settings', error);
            return false;
        }
    }
    
    /**
     * Load user settings from localStorage
     * @returns {Object} The loaded settings or an empty object if not found
     */
    static loadSettings() {
        try {
            const savedSettings = localStorage.getItem(STORAGE_SETTINGS);
            
            if (!savedSettings) {
                console.log('No saved settings found');
                return {};
            }
            
            return JSON.parse(savedSettings);
        } catch (error) {
            console.error('Failed to load settings', error);
            return {};
        }
    }
    
    /**
     * Reset all game data (for debugging or starting fresh)
     */
    static resetAllData() {
        try {
            localStorage.removeItem(STORAGE_GAME_STATE);
            localStorage.removeItem(STORAGE_SETTINGS);
            console.log('All game data reset successfully');
            return true;
        } catch (error) {
            console.error('Failed to reset game data', error);
            return false;
        }
    }
}
