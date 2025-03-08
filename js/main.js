/**
 * Main Application
 * Entry point for the Pokémon Adoption Program
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Pokémon Adoption Program...');
    
    // Initialize application
    initializeApp();
});

/**
 * Initialize the entire application
 */
function initializeApp() {
    // Get canvas for Mimikyu
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    try {
        // Initialize sprite animator and expose it globally for debug tools
        const spriteAnimator = new SpriteAnimator(canvas);
        window.spriteAnimator = spriteAnimator; // Make it accessible to debug tools
        
        // Register event listeners
        setupEventListeners();
        
        // Initialize sound system
        soundSystem.init();
        
        // Set references between systems
        uiController.setSpriteAnimator(spriteAnimator);
        uiController.setSoundSystem(soundSystem);
        
        // Register UI controller as observer of game state
        gameState.registerObserver(uiController);
        
        // Load sprites
        spriteAnimator.loadSprites()
            .then(() => {
                console.log('Sprites loaded successfully');
                
                // Log sprite information for debugging
                logSpriteInfo(spriteAnimator.sprites);
                
                // Initialize game state (after sprites are loaded)
                gameState.init();
                
                // Start with idle animation
                spriteAnimator.playAnimation(STATE_IDLE);
                
                // Play background music
                soundSystem.playBackgroundMusic();
                
                // Set up day/night cycle update
                setupDayNightCycle();
                
                console.log('Application initialized successfully');
            })
            .catch(error => {
                console.error('Failed to load sprites', error);
            });
        
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Handle visibility change (pause decay when tab is not visible)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden (user switched tabs, etc.)
            console.log('Game paused - tab inactive');
            // Save current state when the user leaves
            gameState.saveState();
        } else {
            // Page is visible again
            console.log('Game resumed - tab active');
            // Update the day/night cycle
            gameState.updateDayNightCycle();
        }
    });
    
    // Handle before unload to save state when the page is closed
    window.addEventListener('beforeunload', () => {
        gameState.saveState();
    });
    
    // Mobile-specific events
    if ('ontouchstart' in window) {
        // Prevent zooming and other default mobile behaviors
        document.addEventListener('touchmove', event => {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });
        
        // Handle touch start for button sounds
        document.addEventListener('touchstart', event => {
            if (event.target.closest('.action-button, .sound-toggle')) {
                // Touch started on a button, no need for additional handling here
                // The click event will handle the actual action
            }
        });
    }
}

/**
 * Set up day/night cycle updates
 */
function setupDayNightCycle() {
    // Update day/night cycle immediately
    gameState.updateDayNightCycle();
    
    // Check every minute for day/night changes
    setInterval(() => {
        gameState.updateDayNightCycle();
    }, 60000); // 60 seconds
}

/**
 * Helper function to create fallback icons if needed
 * Not used in initial implementation but helpful if icon images are missing
 */
function createFallbackIcons() {
    // Create fallback need icons if custom icons are not available
    const needIcons = document.querySelectorAll('.need-icon');
    
    needIcons.forEach(icon => {
        // Check if background image is loaded
        const img = new Image();
        img.src = window.getComputedStyle(icon).backgroundImage.replace(/url\(['"]?([^'"]*)['"]?\)/i, '$1');
        
        img.onerror = () => {
            console.warn(`Icon image failed to load for ${icon.className}, using fallback`);
            // The CSS already has fallback colors, no additional action needed
        };
    });
}
