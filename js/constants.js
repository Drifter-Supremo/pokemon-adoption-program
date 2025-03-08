/**
 * Game Constants
 * Defines all the constant values used throughout the game
 */

// Need Thresholds
const NEED_MAX = 100;
const NEED_WARNING_THRESHOLD = 30;
const NEED_CRITICAL_THRESHOLD = 15;

// Decay Rates (per minute)
const HUNGER_DECAY_RATE = 5;      // Decreases by 5 points per minute
const HAPPINESS_DECAY_RATE = 3;   // Decreases by 3 points per minute
const CLEANLINESS_DECAY_RATE = 2; // Decreases by 2 points per minute
const ENERGY_DECAY_RATE = 4;      // Decreases by 4 points per minute

// Maximum decay when returning after long absence (prevents frustration)
const MAX_ABSENCE_DECAY = 70;     // Will never go below 30 points

// Action Effects
const FEEDING_AMOUNT = 25;        // Increases hunger by 25 points
const PLAYING_AMOUNT = 20;        // Increases happiness by 20 points
const CLEANING_AMOUNT = 30;       // Increases cleanliness by 30 points
const SLEEPING_AMOUNT = 35;       // Increases energy by 35 points

// Special Effects
const FEEDING_HAPPINESS_BOOST = 5;  // Feeding also gives small happiness boost
const PLAYING_ENERGY_COST = 10;     // Playing costs some energy
const SLEEPING_DURATION = 5000;     // 5 seconds of sleep animation

// Trust System
const TRUST_GAIN_RATE = 0.5;        // Trust gained when fulfilling needs
const TRUST_LOSS_RATE = 1;          // Trust lost when needs are critically low
const MAX_TRUST_LEVEL = 100;        // Maximum trust value

// Animation Frame Data
const SPRITE_FRAME_WIDTH = 100;     // Width of a single animation frame (will update after examining sprites)
const SPRITE_FRAME_HEIGHT = 100;    // Height of a single animation frame

// Base timing - milliseconds per game tick
const MS_PER_GAME_TICK = 16; // Standard 60fps game timing (1000ms/60fps ≈ 16.67ms)

// Frame durations from XML (in game ticks)
const IDLE_FRAME_DURATIONS = [40, 6, 6, 6];  // 4 frames that repeat
const SAD_FRAME_DURATIONS = [2, 8];          // 2 frames that repeat
const SLEEP_FRAME_DURATIONS = [30, 35];      // 2 frames that repeat
const HOP_FRAME_DURATIONS = [2, 1, 2, 3, 4, 4, 3, 2, 1, 2];  // 10 frames, non-looping
const HUNGRY_FRAME_DURATIONS = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // 10 frames that repeat
const CLEAN_FRAME_DURATIONS = [2, 2, 2, 2, 2, 2, 2, 2, 2];   // 9 frames, non-looping

// Day/Night Cycle
const DAY_START_HOUR = 6;           // 6:00 AM
const NIGHT_START_HOUR = 18;        // 6:00 PM

// Sound Effects
const SOUND_BUTTON_CLICK = 'button_click';
const SOUND_MIMIKYU_HAPPY = 'mimikyu_happy';
const SOUND_MIMIKYU_HUNGRY = 'mimikyu_hungry'; 
const SOUND_MIMIKYU_SAD = 'mimikyu_sad';
const SOUND_MIMIKYU_SLEEP = 'mimikyu_sleep';
const SOUND_BACKGROUND_MUSIC = 'background_music';

// Local Storage Keys
const STORAGE_GAME_STATE = 'mimikyu-pet-state';
const STORAGE_SETTINGS = 'mimikyu-pet-settings';

// Sprite States
const STATE_IDLE = 'idle';
const STATE_HUNGRY = 'hungry';
const STATE_SAD = 'sad';
const STATE_SLEEP = 'sleep';
const STATE_HOP = 'hop';
const STATE_CLEAN = 'cleanliness'; // Added cleanliness state
