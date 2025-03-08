/**
 * Sound System
 * Handles all audio playback in the game
 */

class SoundSystem {
    constructor() {
        // Sound effects
        this.sounds = {};
        
        // Background music
        this.backgroundMusic = null;
        
        // Mute state
        this.muted = false;
        
        // Currently playing sounds
        this.playingSounds = [];
        
        // Track interval for hungry sound
        this.hungryInterval = null;
    }
    
    /**
     * Initialize the sound system
     */
    init() {
        // Load all sounds
        this.loadSounds();
        
        // Restore mute setting if saved
        this.loadMuteSetting();
    }
    
    /**
     * Load all game sounds
     */
    loadSounds() {
        // Define sound mappings
        const soundFiles = {
            [SOUND_BUTTON_CLICK]: 'assets/sounds/button_click.wav',
            [SOUND_MIMIKYU_HAPPY]: 'assets/sounds/mimikyu_happy.mp3',
            [SOUND_MIMIKYU_HUNGRY]: 'assets/sounds/mimikyu_hungry.wav',
            [SOUND_MIMIKYU_SAD]: 'assets/sounds/mimikyu_sad.ogg',
            [SOUND_MIMIKYU_SLEEP]: 'assets/sounds/mimikyu_sleep.mp3',
            [SOUND_BACKGROUND_MUSIC]: 'assets/sounds/background_music.mp3'
        };
        
        // Create and load each sound
        Object.entries(soundFiles).forEach(([name, path]) => {
            // Create a new audio element
            const audio = new Audio();
            
            // Set the source
            audio.src = path;
            
            // Set attributes based on sound type
            if (name === SOUND_BACKGROUND_MUSIC) {
                audio.loop = true;
                audio.volume = 0.2; // Default background music volume
                this.backgroundMusic = audio;
            } else {
                audio.volume = 0.7;
            }
            
            // Store the audio element
            this.sounds[name] = audio;
            
            // Preload the sound
            audio.load();
        });
    }
    
    /**
     * Play a sound
     * @param {string} soundName - The name of the sound to play
     * @param {boolean} loop - Whether to loop the sound
     */
    play(soundName, loop = false) {
        // Don't play sounds if muted
        if (this.muted) return;
        
        const sound = this.sounds[soundName];
        
        if (sound) {
            // Reset the sound if it's already playing
            sound.currentTime = 0;
            
            // Set loop state
            sound.loop = loop;
            
            // Play the sound
            sound.play().catch(error => {
                console.error(`Error playing sound: ${soundName}`, error);
                // Many browsers require user interaction before playing audio
                // We'll catch the error and continue without playing
            });
            
            // Add to playing sounds list if looping
            if (loop && !this.playingSounds.includes(soundName)) {
                this.playingSounds.push(soundName);
            }
        } else {
            console.warn(`Sound not found: ${soundName}`);
        }
    }
    
    /**
     * Stop a specific sound
     * @param {string} soundName - The name of the sound to stop
     */
    stop(soundName) {
        const sound = this.sounds[soundName];
        
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            
            // Remove from playing sounds list
            const index = this.playingSounds.indexOf(soundName);
            if (index !== -1) {
                this.playingSounds.splice(index, 1);
            }
        }
    }
    
    /**
     * Stop all currently playing sounds
     */
    stopAll() {
        // Create a copy of the playing sounds array
        const currentlyPlaying = [...this.playingSounds];
        
        // Stop each sound
        currentlyPlaying.forEach(soundName => {
            this.stop(soundName);
        });
        
        // Also stop background music if it's playing
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    /**
     * Start playing background music
     */
    playBackgroundMusic() {
        if (this.muted) return;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.play().catch(error => {
                console.warn('Could not autoplay background music. User interaction required.', error);
                // This is expected in many browsers
            });
        }
    }
    
    /**
     * Toggle mute state and save the setting
     * @returns {boolean} The new mute state
     */
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            // Stop all sounds
            this.stopAll();
        } else {
            // Resume background music
            this.playBackgroundMusic();
        }
        
        // Save the mute setting
        this.saveMuteSetting();
        
        return this.muted;
    }
    
    /**
     * Play a sound and pause background music temporarily
     * @param {string} soundName - The name of the sound to play
     * @param {boolean} loop - Whether to loop the sound
     */
    playWithBackgroundPause(soundName, loop = false) {
        if (this.muted) return;
        
        const sound = this.sounds[soundName];
        if (!sound) return;
        
        // Store background music state
        let bgWasPlaying = false;
        let bgPosition = 0;
        
        // If background music is playing, pause it
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            bgWasPlaying = true;
            bgPosition = this.backgroundMusic.currentTime;
            this.backgroundMusic.pause();
        }
        
        // Set loop state
        sound.loop = loop;
        
        // Play the sound effect
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error(`Error playing sound: ${soundName}`, error);
            // Resume background music if there was an error
            if (bgWasPlaying && !loop) {
                this.resumeBackgroundMusic(bgPosition);
            }
        });
        
        // Only add the ended event listener if we're not looping
        if (!loop) {
            // When sound effect ends, resume background music if it was playing
            sound.addEventListener('ended', () => {
                if (bgWasPlaying) {
                    this.resumeBackgroundMusic(bgPosition);
                }
            }, { once: true });
        }
    }
    
    /**
     * Resume background music from a specific position
     * @param {number} position - Position to resume from
     */
    resumeBackgroundMusic(position) {
        if (this.muted) return;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.currentTime = position;
            this.backgroundMusic.play().catch(error => {
                console.warn('Could not resume background music.', error);
            });
        }
    }
    
    /**
     * Start playing the hungry sound at regular intervals
     */
    startHungrySoundInterval() {
        // Clear any existing interval first
        this.stopHungrySoundInterval();
        
        // Play it immediately once
        this.playWithBackgroundPause(SOUND_MIMIKYU_HUNGRY);
        
        // Then set up interval to play it every 5 seconds
        this.hungryInterval = setInterval(() => {
            // Only play if not muted
            if (!this.muted) {
                this.playWithBackgroundPause(SOUND_MIMIKYU_HUNGRY);
            }
        }, 5000); // 5 seconds
    }
    
    /**
     * Stop the hungry sound interval
     */
    stopHungrySoundInterval() {
        if (this.hungryInterval) {
            clearInterval(this.hungryInterval);
            this.hungryInterval = null;
        }
    }
    
    /**
     * Play a sound based on Mimikyu's mood
     * @param {string} mood - The current mood
     */
    playMoodSound(mood) {
        if (this.muted) return;
        
        // Stop any existing hungry sound interval
        this.stopHungrySoundInterval();
        
        // Handle each mood type
        switch (mood) {
            case STATE_HUNGRY:
                // Start playing hungry sound at intervals
                this.startHungrySoundInterval();
                break;
                
            case STATE_SAD:
                // Play sad sound once
                this.playWithBackgroundPause(SOUND_MIMIKYU_SAD);
                break;
                
            case STATE_SLEEP:
                // Play sleep sound once (the handler will set it to loop if needed)
                this.playWithBackgroundPause(SOUND_MIMIKYU_SLEEP);
                break;
                
            default:
                // Default to happy sound for idle and other states
                this.playWithBackgroundPause(SOUND_MIMIKYU_HAPPY);
                break;
        }
    }
    
    /**
     * Save the mute setting to localStorage
     */
    saveMuteSetting() {
        const settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || '{}');
        settings.muted = this.muted;
        localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
    }
    
    /**
     * Load the mute setting from localStorage
     */
    loadMuteSetting() {
        const settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || '{}');
        
        // Set mute state based on saved setting
        this.muted = settings.muted || false;
        
        // Update sound toggle button if it exists
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.textContent = this.muted ? '🔇' : '🔊';
        }
    }
}

// Create a global instance of the sound system
const soundSystem = new SoundSystem();
