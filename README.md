﻿# Pokémon Adoption Program 🛡️

## **🐾 Overview**
Pokémon Adoption Program is a **Tamagotchi-style virtual pet game** featuring **Mimikyu**, where players care for and interact with their Pokémon to keep it happy. The game includes **classic virtual pet mechanics** like feeding, playing, cleaning, and resting, with Mimikyu responding to care (or neglect) over time.

## **🎮 Features**
- **Needs System** – Track **Hunger, Happiness, Cleanliness, and Energy** levels.
- **Real-Time Decay** – Needs decrease over time, requiring regular care.
- **Interactive Actions** – Players can **Feed, Play, Clean, and Put Mimikyu to Sleep**.
- **Sprite Sheet Animations** – Mimikyu **reacts with fluid animations** based on its needs.
- **Sound Effects** – Each interaction has appropriate sound feedback.
- **Happiness & Affection System** – Taking care of Mimikyu builds trust; neglecting it can make it sad.
- **Save System** – The game remembers Mimikyu's state between sessions using LocalStorage.
- **Day/Night Cycle** – Background changes based on the player's local time.

## **🛠️ Tech Stack**
- **HTML, CSS, JavaScript** – Frontend development
- **Canvas API** – For sprite sheet animations and rendering
- **Web Audio API** – For sound management
- **LocalStorage API** – For persistent game state
- **CSS Grid/Flexbox** – For responsive layout

## **📱 Mobile Support**
- Touch-friendly controls
- Responsive design fits any screen size
- Works across modern browsers

## **🎮 How to Play**
1. Open index.html in any modern browser
2. Take care of Mimikyu by monitoring need indicators at the top
3. Use the bottom buttons to interact with Mimikyu:
   - 🍎 Feed Mimikyu when hungry
   - 🎮 Play with Mimikyu to increase happiness
   - 🧼 Clean Mimikyu to maintain cleanliness
   - 💤 Let Mimikyu sleep to restore energy
4. Watch Mimikyu animate in response to your care
5. Toggle sound with the button in the top-right corner

## **👨‍💻 Development**
The game is built with a modular JavaScript architecture:
- Sprite animator system with grid-based animation support
- State management using the observer pattern
- Sound system with preloaded assets
- Save system for persistent gameplay

Built with ❤️ and the assistance of Cline AI
