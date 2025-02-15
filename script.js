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

        // Create a pool of audio elements for Safari
        this.audioPool = Array.from({ length: 3 }, () => {
            const audio = new Audio();
            audio.src = 'countdown-sound.mp3';
            return audio;
        });
        
        this.currentAudioIndex = 0;
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
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
        // Pre-load all audio elements
        this.audioPool.forEach(audio => {
            audio.load();
            // Set audio to low volume to enable playback on Safari
            audio.volume = 0.1;
        });

        // Function to enable audio on user interaction
        const enableAudio = () => {
            // Try to play all audio elements
            this.audioPool.forEach(audio => {
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    // Reset volume to full after enabling
                    audio.volume = 1;
                }).catch(error => {
                    console.log('Error enabling audio:', error);
                });
            });

            // Remove listeners after first interaction
            document.removeEventListener('touchstart', enableAudio);
            document.removeEventListener('click', enableAudio);
        };

        // Add listeners for user interaction
        document.addEventListener('touchstart', enableAudio);
        document.addEventListener('click', enableAudio);
    }

    playSound() {
        // Get the next audio element from the pool
        const audio = this.audioPool[this.currentAudioIndex];
        
        // Reset the audio element
        audio.currentTime = 0;
        audio.volume = 1;

        // Play the sound
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Error playing sound:', error);
                // If play fails, try to re-enable audio
                if (this.isSafari) {
                    audio.load();
                    audio.play().catch(() => {});
                }
            });
        }

        // Move to the next audio element in the pool
        this.currentAudioIndex = (this.currentAudioIndex + 1) % this.audioPool.length;
    }

    initializeEventListeners() {
        // Add touch event listeners for Safari
        if (this.isSafari) {
            const buttons = [this.startButton, this.pauseButton, this.resetButton,
                           this.pomodoroButton, this.shortBreakButton, this.longBreakButton];
            
            buttons.forEach(button => {
                button.addEventListener('touchend', (e) => {
                    e.preventDefault(); // Prevent double-firing
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