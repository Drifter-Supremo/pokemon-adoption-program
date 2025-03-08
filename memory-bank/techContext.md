# **🔧 techContext.md**

## **💻 Technology Stack**

The Pokémon Adoption Program is built using modern web technologies:

### **Frontend Technologies**
- **HTML5**: Providing the structural foundation
- **CSS3**: Styling and basic animations
- **JavaScript (ES6+)**: Core game logic and interactions

### **Key Libraries & APIs**
- **No external frameworks** to keep the application lightweight
- **Canvas API**: For grid-based sprite sheet animations
- **Web Audio API**: For sound management
- **LocalStorage API**: For persistent game state

## **🛠️ Development Environment**

### **Tools**
- **VS Code**: Primary code editor
- **Git**: Version control
- **Cline AI**: Development assistant for implementation

### **Browser Compatibility**
- **Primary Target**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Support**: Responsive design for touch interfaces
- **No IE11 Support**: Using modern JavaScript features without polyfills

## **🏗️ Implementation Approach**

### **Modular JavaScript**
```
project/
├── js/
│   ├── main.js            # Application entry point
│   ├── gameState.js       # Core state management
│   ├── uiController.js    # UI updates and interactions
│   ├── spriteAnimator.js  # Grid-based animation system
│   ├── soundSystem.js     # Audio playback
│   ├── saveSystem.js      # LocalStorage interaction
│   ├── pokedexSystem.js   # Pokédex data and display functionality
│   ├── debugHelpers.js    # Development assistance tools
│   └── constants.js       # Game configuration
```

### **Grid-Based Animation System**
The project implements a sophisticated grid-based animation system that supports various sprite sheet layouts:

```javascript
class SpriteAnimator {
    constructor(canvas) {
        // Grid layout configuration for different sprite sheets
        this.gridLayouts = {
            [STATE_IDLE]: { columns: 4, rows: 8 },      // 4×8 grid (32 frames)
            [STATE_HUNGRY]: { columns: 10, rows: 8 },   // 10×8 grid (80 frames)
            [STATE_SAD]: { columns: 2, rows: 8 },       // 2×8 grid (16 frames)
            [STATE_SLEEP]: { columns: 2, rows: 1 },     // 2×1 grid (2 frames)
            [STATE_HOP]: { columns: 10, rows: 8 },      // 10×8 grid (80 frames)
            [STATE_CLEAN]: { columns: 9, rows: 8 }      // 9×8 grid (72 frames)
        };
    }
    
    drawFrame() {
        // Convert the 1D frame index to 2D coordinates in the grid
        const column = this.currentFrame % gridLayout.columns;
        const row = Math.floor(this.currentFrame / gridLayout.columns);
        
        // Calculate the source position in the sprite sheet
        const sourceX = column * frameWidth;
        const sourceY = row * frameHeight;
        
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
```

### **Responsive Design Strategy**
- Mobile-first approach
- Flexible layout using CSS Grid/Flexbox
- Touch-friendly UI elements
- Viewport meta tag for proper scaling

## **🔊 Sound Implementation**

### **Audio Categories**
1. **Background Music**: Ambient loop that changes based on time of day
2. **Interaction Sounds**: Response to player actions (button clicks)
3. **Mimikyu Sounds**: Emotional responses to care actions
4. **Ambient Sounds**: Environmental effects based on game state

### **Audio Management**
```javascript
// Sound system with preloaded assets
const soundSystem = {
  sounds: {},
  muted: false,
  
  loadSounds() {
    const soundFiles = {
      'background': 'assets/sounds/background_music.mp3',
      'button': 'assets/sounds/button_click.wav',
      'happy': 'assets/sounds/mimikyu_happy.mp3',
      'hungry': 'assets/sounds/mimikyu_hungry.wav',
      'sad': 'assets/sounds/mimikyu_sad.ogg',
      'sleep': 'assets/sounds/mimikyu_sleep.mp3'
    };
    
    Object.entries(soundFiles).forEach(([name, path]) => {
      const audio = new Audio();
      audio.src = path;
      
      // Set volume based on sound type
      if (name === 'background') {
        audio.volume = 0.2; // Reduced from 0.5 to 0.2 for better balance
      } else {
        audio.volume = 0.7;
      }
      
      this.sounds[name] = audio;
    });
  },
  
  play(soundName, loop = false) {
    if (this.muted) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      sound.loop = loop;
      sound.currentTime = 0;
      sound.play();
    }
  }
};
```

## **💾 Data Management**

### **Save Data Structure**
```javascript
// Example save data structure
const saveData = {
  needs: {
    hunger: 85,
    happiness: 92,
    cleanliness: 76,
    energy: 50
  },
  stats: {
    totalFeedings: 27,
    totalPlaySessions: 18,
    totalCleanings: 15,
    totalNaps: 8
  },
  relationships: {
    trustLevel: 63,
    daysWithMimikyu: 5
  },
  timestamps: {
    lastSaved: "2023-11-14T12:30:45.123Z",
    gameStarted: "2023-11-10T09:15:22.987Z"
  },
  settings: {
    soundEnabled: true,
    notificationsEnabled: false
  }
};
```

### **Time Management**
- Timestamps used to calculate need decay between sessions
- Maximum decay cap to prevent frustration after long absences
- Day/night cycle based on player's local time

## **🐞 Debug Tools**

### **Animation Debugging**
- Frame-by-frame navigation controls for sprite animations
- Speed control for adjusting animation rate
- Animation state switcher for testing different states
- Console logging for frame coordinates and dimensions

### **Debug UI**
```javascript
function createDebugControls() {
    // Create debug panel with animation controls
    const debugPanel = document.createElement('div');
    
    // Add animation state buttons
    states.forEach(state => {
        const button = document.createElement('button');
        button.textContent = `Play ${state}`;
        button.onclick = () => window.spriteAnimator.playAnimation(state);
        debugPanel.appendChild(button);
    });
    
    // Add frame-by-frame controls
    const frameByFrameToggle = document.createElement('button');
    frameByFrameToggle.textContent = 'Enable Frame-by-Frame';
    frameByFrameToggle.onclick = () => {
        // Toggle frame-by-frame mode
    };
    
    // Add frame navigation controls
    const prevFrameBtn = document.createElement('button');
    prevFrameBtn.textContent = '< Prev Frame';
    
    const nextFrameBtn = document.createElement('button');
    nextFrameBtn.textContent = 'Next Frame >';
    
    // Add to document
    document.body.appendChild(debugPanel);
}
```

## **🔖 Pokédex Implementation**

### **Modal Design Pattern**
The Pokédex feature uses a modal dialog pattern to display detailed information without navigating away from the main game:

```javascript
class PokedexSystem {
    constructor() {
        // Structured data for Mimikyu's Pokédex information
        this.pokedexData = {
            basic: {
                nationalNumber: "778",
                types: ["GHOST", "FAIRY"],
                species: "Disguise Pokémon",
                // Additional data...
            },
            baseStats: {
                hp: { value: 55, min: 220, max: 314 },
                attack: { value: 90, min: 166, max: 306 },
                // Additional stats...
            },
            // Additional sections...
        };
    }
    
    // Show/hide modal with animation
    showPokedex() {
        const modal = document.getElementById('pokedex-modal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    hidePokedex() {
        const modal = document.getElementById('pokedex-modal');
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Generate dynamic stat bars
    createStatBars() {
        // Dynamic rendering of stat bars based on base stat values
        // Color coding different stats (HP, Attack, Defense, etc.)
    }
}
```

### **CSS Organization**
The Pokédex styling follows a component-based approach:
- Separate CSS file (`pokedex.css`) for all Pokédex-related styles
- Mobile-first responsive design
- Fixed-position button with absolute positioning
- Full-screen modal overlay with scrollable content
- Data tables with responsive layouts
- Color-coded type pills and stat bars

## **📱 Responsive Considerations**

- **Desktop**: Full layout with all UI elements visible simultaneously
- **Tablet**: Slightly condensed layout, potentially with collapsible panels
- **Mobile**: Focus on the pet with controls in a bottom toolbar
- **Touch vs Mouse**: Larger hit areas on touch devices
- **Modal Design**: Pokédex modal scales appropriately for all device sizes

## **🚫 Technical Constraints**

- **No backend requirement**: Keeping game entirely client-side
- **Offline functionality**: Game should work without internet connection
- **Size optimization**: Minimizing asset sizes for quick loading
- **Memory management**: Careful audio/image handling for mobile devices
