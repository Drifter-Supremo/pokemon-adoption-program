/**
 * Debug Helpers
 * Utility functions for debugging the game
 */

/**
 * Log sprite sheet information to help debug animation issues
 * @param {Object} sprites - Object containing loaded sprite images
 */
function logSpriteInfo(sprites) {
    console.log('------ Sprite Information ------');
    Object.entries(sprites).forEach(([name, sprite]) => {
        console.log(`Sprite: ${name}`);
        console.log(`Dimensions: ${sprite.width}x${sprite.height}`);
        console.log('----------------------------');
    });
}

/**
 * Create debug controls for testing animations
 */
function createDebugControls() {
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 5px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    // Add animation buttons
    const states = [STATE_IDLE, STATE_HUNGRY, STATE_SAD, STATE_SLEEP, STATE_HOP, STATE_CLEAN];
    
    // Create animations section
    const animationsHeader = document.createElement('div');
    animationsHeader.textContent = 'Animations:';
    animationsHeader.style.fontWeight = 'bold';
    debugPanel.appendChild(animationsHeader);
    
    states.forEach(state => {
        const button = document.createElement('button');
        button.textContent = `Play ${state}`;
        button.onclick = () => window.spriteAnimator.playAnimation(state);
        button.style.cssText = `
            padding: 5px;
            cursor: pointer;
            margin-bottom: 2px;
        `;
        debugPanel.appendChild(button);
    });
    
    // Add frame controls
    const frameControlsHeader = document.createElement('div');
    frameControlsHeader.textContent = 'Frame Controls:';
    frameControlsHeader.style.cssText = 'font-weight: bold; margin-top: 10px;';
    debugPanel.appendChild(frameControlsHeader);
    
    // Toggle for frame-by-frame mode
    const frameByFrameToggle = document.createElement('button');
    frameByFrameToggle.textContent = 'Enable Frame-by-Frame';
    frameByFrameToggle.onclick = () => {
        window.debugSettings = window.debugSettings || {};
        window.debugSettings.frameByFrame = !window.debugSettings.frameByFrame;
        
        if (window.debugSettings.frameByFrame) {
            window.spriteAnimator.stopAnimation();
            window.spriteAnimator.drawFrame();
            frameByFrameToggle.textContent = 'Disable Frame-by-Frame';
            nextFrameBtn.disabled = false;
            prevFrameBtn.disabled = false;
        } else {
            window.spriteAnimator.playAnimation(window.spriteAnimator.currentAnimation);
            frameByFrameToggle.textContent = 'Enable Frame-by-Frame';
            nextFrameBtn.disabled = true;
            prevFrameBtn.disabled = true;
        }
    };
    frameByFrameToggle.style.cssText = `
        padding: 5px;
        cursor: pointer;
        margin-bottom: 5px;
    `;
    debugPanel.appendChild(frameByFrameToggle);
    
    // Frame navigation
    const frameNavDiv = document.createElement('div');
    frameNavDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        gap: 5px;
    `;
    
    // Previous frame button
    const prevFrameBtn = document.createElement('button');
    prevFrameBtn.textContent = '< Prev Frame';
    prevFrameBtn.disabled = true;
    prevFrameBtn.onclick = () => {
        if (!window.debugSettings?.frameByFrame) return;
        
        const animator = window.spriteAnimator;
        const totalFrames = animator.animationData[animator.currentAnimation].frames;
        animator.currentFrame = (animator.currentFrame - 1 + totalFrames) % totalFrames;
        animator.drawFrame();
        
        // Update frame counter
        frameCounter.textContent = `Frame: ${animator.currentFrame + 1}/${totalFrames}`;
    };
    prevFrameBtn.style.cssText = `padding: 5px; flex: 1;`;
    frameNavDiv.appendChild(prevFrameBtn);
    
    // Next frame button
    const nextFrameBtn = document.createElement('button');
    nextFrameBtn.textContent = 'Next Frame >';
    nextFrameBtn.disabled = true;
    nextFrameBtn.onclick = () => {
        if (!window.debugSettings?.frameByFrame) return;
        
        const animator = window.spriteAnimator;
        const totalFrames = animator.animationData[animator.currentAnimation].frames;
        animator.currentFrame = (animator.currentFrame + 1) % totalFrames;
        animator.drawFrame();
        
        // Update frame counter
        frameCounter.textContent = `Frame: ${animator.currentFrame + 1}/${totalFrames}`;
    };
    nextFrameBtn.style.cssText = `padding: 5px; flex: 1;`;
    frameNavDiv.appendChild(nextFrameBtn);
    
    debugPanel.appendChild(frameNavDiv);
    
    // Frame counter
    const frameCounter = document.createElement('div');
    frameCounter.textContent = 'Frame: 0/0';
    frameCounter.style.cssText = `
        text-align: center;
        margin: 5px 0;
        font-size: 12px;
    `;
    debugPanel.appendChild(frameCounter);
    
    // Logging controls
    const loggingHeader = document.createElement('div');
    loggingHeader.textContent = 'Logging:';
    loggingHeader.style.cssText = 'font-weight: bold; margin-top: 10px;';
    debugPanel.appendChild(loggingHeader);
    
    // Add toggle button to show/hide frames
    const toggleLogging = document.createElement('button');
    toggleLogging.textContent = 'Enable Frame Logging';
    toggleLogging.onclick = () => {
        window.debugSettings = window.debugSettings || {};
        window.debugSettings.logFrames = !window.debugSettings.logFrames;
        toggleLogging.textContent = window.debugSettings.logFrames ? 
            'Disable Frame Logging' : 'Enable Frame Logging';
    };
    toggleLogging.style.cssText = `
        padding: 5px;
        cursor: pointer;
    `;
    debugPanel.appendChild(toggleLogging);
    
    // Speed controls
    const speedHeader = document.createElement('div');
    speedHeader.textContent = 'Animation Speed:';
    speedHeader.style.cssText = 'font-weight: bold; margin-top: 10px;';
    debugPanel.appendChild(speedHeader);
    
    // Speed controls
    const speedControls = document.createElement('div');
    speedControls.style.cssText = `
        display: flex;
        justify-content: space-between;
        gap: 5px;
    `;
    
    // Slower button
    const slowerBtn = document.createElement('button');
    slowerBtn.textContent = 'Slower';
    slowerBtn.onclick = () => {
        window.spriteAnimator.frameDelay = Math.min(200, window.spriteAnimator.frameDelay * 1.5);
        speedLabel.textContent = `Speed: ${Math.round(1000 / window.spriteAnimator.frameDelay)} FPS`;
    };
    slowerBtn.style.cssText = `padding: 5px; flex: 1;`;
    speedControls.appendChild(slowerBtn);
    
    // Reset button
    const resetSpeedBtn = document.createElement('button');
    resetSpeedBtn.textContent = 'Reset';
    resetSpeedBtn.onclick = () => {
        window.spriteAnimator.frameDelay = 1000 / ANIMATION_FPS;
        speedLabel.textContent = `Speed: ${ANIMATION_FPS} FPS`;
    };
    resetSpeedBtn.style.cssText = `padding: 5px; flex: 1;`;
    speedControls.appendChild(resetSpeedBtn);
    
    // Faster button
    const fasterBtn = document.createElement('button');
    fasterBtn.textContent = 'Faster';
    fasterBtn.onclick = () => {
        window.spriteAnimator.frameDelay = Math.max(10, window.spriteAnimator.frameDelay / 1.5);
        speedLabel.textContent = `Speed: ${Math.round(1000 / window.spriteAnimator.frameDelay)} FPS`;
    };
    fasterBtn.style.cssText = `padding: 5px; flex: 1;`;
    speedControls.appendChild(fasterBtn);
    
    debugPanel.appendChild(speedControls);
    
    // Speed label
    const speedLabel = document.createElement('div');
    speedLabel.textContent = `Speed: ${ANIMATION_FPS} FPS`;
    speedLabel.style.cssText = `
        text-align: center;
        margin: 5px 0;
        font-size: 12px;
    `;
    debugPanel.appendChild(speedLabel);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close Debug Panel';
    closeBtn.style.cssText = `
        padding: 5px;
        margin-top: 10px;
        cursor: pointer;
        background-color: #ff6b6b;
        border: none;
        color: white;
        border-radius: 3px;
    `;
    closeBtn.onclick = () => {
        debugPanel.style.display = 'none';
        
        // Add a small button to bring it back
        const showBtn = document.createElement('button');
        showBtn.textContent = 'Debug';
        showBtn.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            padding: 5px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            z-index: 1000;
        `;
        showBtn.onclick = () => {
            debugPanel.style.display = 'flex';
            showBtn.remove();
        };
        document.body.appendChild(showBtn);
    };
    debugPanel.appendChild(closeBtn);
    
    // Add to document
    document.body.appendChild(debugPanel);
}
