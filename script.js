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

        this.audioContext = null;
        this.audioInitialized = false;

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
        this.countdownSound = document.getElementById('countdownSound');
    }

    initializeAudio() {
        // Create audio context on first user interaction
        const initAudioContext = () => {
            if (!this.audioInitialized) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioInitialized = true;
                // Remove the initialization listeners once audio is set up
                document.removeEventListener('click', initAudioContext);
                document.removeEventListener('touchstart', initAudioContext);
            }
        };

        // Initialize audio on user interaction
        document.addEventListener('click', initAudioContext);
        document.addEventListener('touchstart', initAudioContext);
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
        if (this.countdownSound && this.audioInitialized) {
            // Create a new audio element for each play to handle rapid sound triggers
            const sound = new Audio(this.countdownSound.src);
            sound.play().catch(error => {
                console.log('Error playing sound:', error);
                // Attempt to resume audio context if suspended
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            });
        }
    }

    playAlarm() {
        if (this.countdownSound && this.audioInitialized) {
            const sound = new Audio(this.countdownSound.src);
            sound.play().catch(error => {
                console.log('Error playing sound:', error);
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            });
        }
        // Use vibration API if available (mobile devices)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        alert('Timer completed!');
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
}); 