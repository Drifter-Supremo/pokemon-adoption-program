## **📜 Updated State Logic for Mimikyu's Behavior**

Mimikyu will **default to an idle animation** unless a need arises. The **only exception** is hunger, where it will actively change to the hungry animation until fed.

----------

### **🟢 Core State Behaviors**

1.  **Idle State (Default)**
    
    -   **Mimikyu stays idle** unless prompted by a need.
    -   **Looping idle animation** plays.
    -   **No sound plays** unless a need arises.

2.  **Hunger State (Active Alert)**
    
    -   **Triggered when hunger meter drops below a threshold.**
    -   **Plays a hungry sound effect.**
    -   **Mimikyu's animation changes to "hungry" and loops indefinitely.**
    -   **Stops when the player presses the "Feed" button.**
        -   **When fed:**
            -   **Plays eating animation.**
            -   **Hunger meter refills.**
            -   **Plays happy sound.**
            -   **Returns to idle state.**

3.  **Play State (Passive Alert)**
    
    -   **Meter and UI indicator show Mimikyu is bored,** but animation does NOT change yet.
    -   **No automatic sound or animation change.**
    -   **When "Play" button is pressed:**
        -   **Mimikyu plays the "hop" animation** (looped for a short duration).
        -   **Plays play sound.**
        -   **Happiness meter refills.**
        -   **Returns to idle state.**

4.  **Sleep State (Passive Alert)**
    
    -   **Meter and UI indicate Mimikyu is tired,** but animation does NOT change yet.
    -   **No automatic sound or animation change.**
    -   **When "Sleep" button is pressed:**
        -   **Mimikyu plays the "sleeping" animation** for a set time.
        -   **Plays sleep sound effect.**
        -   **Energy meter refills.**
        -   **Returns to idle state.**

5.  **Cleanliness State (Passive Alert)**
    
    -   **Meter and UI indicate Mimikyu needs cleaning,** but animation does NOT change yet.
    -   **No automatic sound or animation change.**
    -   **When "Clean" button is pressed:**
        -   **Mimikyu plays "clean" animation.**
        -   **Plays cleaning sound effect.**
        -   **Cleanliness meter refills.**
        -   **Returns to idle state.**



## **📌 Final Notes**

-   **Only hunger will trigger an automatic animation.**
-   **All other needs rely on the UI meter to alert the player.**
-   **The action animations should play for a set duration and then transition back to idle.**
-   **Ensure the need meters actually refill after actions are performed.**
