class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.timerId = null;
        this.isRunning = false;
        
        // Timer durations in minutes
        this.durations = {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15
        };

        // Audio setup
        this.audioContext = null;
        this.audioBuffer = null;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        this.initializeElements();
        this.initializeEventListeners();
        this.setupAudio();
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timer');
        this.startButton = document.getElementById('start');
        this.pauseButton = document.getElementById('pause');
        this.resetButton = document.getElementById('reset');
        this.pomodoroButton = document.getElementById('pomodoro');
        this.shortBreakButton = document.getElementById('shortBreak');
        this.longBreakButton = document.getElementById('longBreak');
    }

    async setupAudio() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Fetch the audio file
            const response = await fetch('countdown-sound.mp3');
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode the audio file
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Setup unlock function for iOS
            if (this.isIOS) {
                this.unlockAudioForIOS();
            }
        } catch (error) {
            console.log('Error setting up audio:', error);
        }
    }

    unlockAudioForIOS() {
        const unlockiOS = () => {
            // Create and start a silent buffer
            const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = silentBuffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            source.stop(0);

            // Remove the touch/click listeners
            document.removeEventListener('touchstart', unlockiOS);
            document.removeEventListener('touchend', unlockiOS);
            document.removeEventListener('click', unlockiOS);
        };

        // Add event listeners for user interaction
        document.addEventListener('touchstart', unlockiOS);
        document.addEventListener('touchend', unlockiOS);
        document.addEventListener('click', unlockiOS);
    }

    playSound() {
        if (this.audioContext && this.audioBuffer) {
            try {
                // Resume audio context if it's suspended (iOS requirement)
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                // Create a new buffer source for each play
                const source = this.audioContext.createBufferSource();
                source.buffer = this.audioBuffer;
                source.connect(this.audioContext.destination);
                source.start(0);

                // For iOS, also try to play a system sound
                if (this.isIOS) {
                    // Try to trigger system sound
                    const dummy = new Audio();
                    dummy.play().catch(() => {});
                }
            } catch (error) {
                console.log('Error playing sound:', error);
            }
        }
    }

    initializeEventListeners() {
        // Add touch event listeners for iOS
        if (this.isIOS) {
            const buttons = [this.startButton, this.pauseButton, this.resetButton,
                           this.pomodoroButton, this.shortBreakButton, this.longBreakButton];
            
            buttons.forEach(button => {
                button.addEventListener('touchend', (e) => {
                    e.preventDefault(); // Prevent double-firing on iOS
                    button.click();
                });
            });
        }

        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
        this.pomodoroButton.addEventListener('click', () => this.setTimer('pomodoro'));
        this.shortBreakButton.addEventListener('click', () => this.setTimer('shortBreak'));
        this.longBreakButton.addEventListener('click', () => this.setTimer('longBreak'));
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    start() {
        if (!this.isRunning) {
            // Try to resume audio context when starting timer
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            this.isRunning = true;
            this.timerId = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                // Play countdown sound every 60 seconds
                if (this.timeLeft > 0 && this.timeLeft % 60 === 0) {
                    this.playSound();
                }
                
                if (this.timeLeft === 0) {
                    this.pause();
                    this.playAlarm();
                }
            }, 1000);
        }
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timerId);
    }

    reset() {
        this.pause();
        this.timeLeft = this.durations.pomodoro * 60;
        this.updateDisplay();
    }

    setTimer(mode) {
        this.pause();
        this.timeLeft = this.durations[mode] * 60;
        this.updateDisplay();
        
        // Update active button
        [this.pomodoroButton, this.shortBreakButton, this.longBreakButton].forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(mode).classList.add('active');
    }

    playAlarm() {
        // Play sound
        this.playSound();
        
        // Use vibration API if available
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // Show alert after a small delay to allow sound to play
        setTimeout(() => {
            alert('Timer completed!');
        }, 100);
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
}); 