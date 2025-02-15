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

        // Pre-load sounds for iOS
        this.sounds = {
            countdown: new Audio('countdown-sound.mp3'),
            alarm: new Audio('countdown-sound.mp3')
        };

        // Initialize sounds for iOS
        this.sounds.countdown.load();
        this.sounds.alarm.load();
        
        this.audioEnabled = false;
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeAudio();
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

    initializeAudio() {
        // Function to enable audio
        const enableAudio = () => {
            if (!this.audioEnabled) {
                // Play and immediately pause to enable audio on iOS
                this.sounds.countdown.play().then(() => {
                    this.sounds.countdown.pause();
                    this.sounds.countdown.currentTime = 0;
                    this.audioEnabled = true;
                }).catch(error => {
                    console.log('Error initializing audio:', error);
                });

                // Remove listeners once audio is enabled
                document.removeEventListener('touchstart', enableAudio);
                document.removeEventListener('click', enableAudio);
            }
        };

        // Add listeners for user interaction
        document.addEventListener('touchstart', enableAudio);
        document.addEventListener('click', enableAudio);
    }

    initializeEventListeners() {
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
            this.isRunning = true;
            this.timerId = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                // Play countdown sound every 60 seconds
                if (this.timeLeft > 0 && this.timeLeft % 60 === 0) {
                    this.playCountdownSound();
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

    playCountdownSound() {
        if (this.audioEnabled) {
            // Reset and play countdown sound
            this.sounds.countdown.currentTime = 0;
            const playPromise = this.sounds.countdown.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Error playing countdown sound:', error);
                });
            }
        }
    }

    playAlarm() {
        if (this.audioEnabled) {
            // Reset and play alarm sound
            this.sounds.alarm.currentTime = 0;
            const playPromise = this.sounds.alarm.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Error playing alarm sound:', error);
                });
            }
        }
        
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