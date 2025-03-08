/**
 * Pokédex System
 * Displays Pokédex information about Mimikyu
 */

class PokedexSystem {
    constructor() {
        // Initialize the Pokédex data
        this.pokedexData = {
            basic: {
                nationalNumber: "778",
                types: ["GHOST", "FAIRY"],
                species: "Disguise Pokémon",
                height: "0.2 m (0'08\")",
                weight: "0.7 kg (1.5 lbs)",
                abilities: ["Disguise"]
            },
            baseStats: {
                hp: { value: 55, min: 220, max: 314 },
                attack: { value: 90, min: 166, max: 306 },
                defense: { value: 80, min: 148, max: 284 },
                spAtk: { value: 50, min: 94, max: 218 },
                spDef: { value: 105, min: 193, max: 339 },
                speed: { value: 96, min: 177, max: 320 },
                total: 476
            },
            training: {
                evYield: "2 Sp. Def",
                catchRate: "45 (5.9% with PokéBall, full HP)",
                baseFriendship: "50 (normal)",
                baseExp: "167",
                growthRate: "Medium Fast"
            },
            breeding: {
                eggGroups: ["Amorphous"],
                gender: "50% male, 50% female",
                eggCycles: "20 (4,884–5,140 steps)"
            },
            evolution: "Mimikyu does not evolve.",
            description: "This Pokémon lives in dark places untouched by sunlight. When it appears before humans, it hides itself under a cloth that resembles a Pikachu."
        };

        // Initialize event listeners after the DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initEventListeners();
            this.createStatBars();
        });
    }

    /**
     * Initialize event listeners for the Pokédex button and modal
     */
    initEventListeners() {
        // Get the Pokédex button and modal elements
        const pokedexButton = document.getElementById('pokedex-btn');
        const pokedexModal = document.getElementById('pokedex-modal');
        const pokedexCloseButton = document.getElementById('pokedex-close');
        
        if (!pokedexButton || !pokedexModal || !pokedexCloseButton) {
            console.error('Pokédex elements not found in the DOM');
            return;
        }
        
        // Add click event listener to the Pokédex button
        pokedexButton.addEventListener('click', () => {
            this.showPokedex();
            
            // Play button click sound if sound system is available
            if (window.soundSystem) {
                soundSystem.play(SOUND_BUTTON_CLICK);
            }
        });
        
        // Add click event listener to the close button
        pokedexCloseButton.addEventListener('click', () => {
            this.hidePokedex();
            
            // Play button click sound if sound system is available
            if (window.soundSystem) {
                soundSystem.play(SOUND_BUTTON_CLICK);
            }
        });
        
        // Close the modal when clicking outside the content
        pokedexModal.addEventListener('click', (event) => {
            if (event.target === pokedexModal) {
                this.hidePokedex();
            }
        });
    }
    
    /**
     * Show the Pokédex modal
     */
    showPokedex() {
        const pokedexModal = document.getElementById('pokedex-modal');
        if (pokedexModal) {
            pokedexModal.classList.add('show');
            // Prevent scrolling on the background
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Hide the Pokédex modal
     */
    hidePokedex() {
        const pokedexModal = document.getElementById('pokedex-modal');
        if (pokedexModal) {
            pokedexModal.classList.remove('show');
            // Restore scrolling
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Create stat bars for the base stats
     */
    createStatBars() {
        const stats = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];
        const statColors = {
            hp: '#FF5959',
            attack: '#F5AC78',
            defense: '#FAE078',
            spAtk: '#9DB7F5',
            spDef: '#A7DB8D',
            speed: '#FA92B2'
        };
        
        stats.forEach(stat => {
            const statBar = document.getElementById(`${stat}-bar`);
            const statValue = this.pokedexData.baseStats[stat].value;
            
            if (statBar) {
                // Max base stat is around 255, so calculate percentage
                const percentage = (statValue / 255) * 100;
                statBar.style.width = `${percentage}%`;
                statBar.style.backgroundColor = statColors[stat];
            }
        });
    }
}

// Create a global instance of the Pokédex system
const pokedexSystem = new PokedexSystem();
