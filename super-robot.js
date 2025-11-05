const colorPalettes = {
    arms: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd3a5'],
    legs: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
};

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playBeep(frequency = 440, duration = 200) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    playSuccessSound() {
        this.playBeep(523, 150); 
        setTimeout(() => this.playBeep(659, 150), 100); 
        setTimeout(() => this.playBeep(784, 200), 200); 
    }

    playClickSound() {
        this.playBeep(800, 100);
    }
}


class RobotManager {
    constructor() {
        this.soundManager = new SoundManager();
        this.robots = new Map();
        this.init();
    }

    init() {
        this.setupRobots();
        this.bindEvents();
        this.startAmbientAnimation();
    }

    setupRobots() {
        const robotContainers = document.querySelectorAll('[class$="-robot"]');
        
        robotContainers.forEach(container => {
            const robotType = container.className.split('-')[0];
            const robot = {
                container: container,
                leftEye: container.querySelector('.left-eye'),
                rightEye: container.querySelector('.right-eye'),
                leftArm: container.querySelector('.left-arm'),
                rightArm: container.querySelector('.right-arm'),
                leftLeg: container.querySelector('.left-leg'),
                rightLeg: container.querySelector('.right-leg'),
                display: container.querySelector('.chest-display'),
                eyeBtn: container.querySelector('.eye-btn'),
                armBtn: container.querySelector('.arm-btn'),
                legBtn: container.querySelector('.leg-btn'),
                speakBtn: container.querySelector('.speak-btn'),
                isLeftEyeClosed: false,
                currentArmColor: '#c0c0c0',
                currentLegColor: '#b0b0b0'
            };
            
            this.robots.set(robotType, robot);
        });
    }

    bindEvents() {
        this.robots.forEach((robot, robotType) => {
            robot.eyeBtn.addEventListener('click', () => {
                this.toggleLeftEye(robotType);
                this.soundManager.playClickSound();
            });

            robot.armBtn.addEventListener('click', () => {
                this.changeArmColor(robotType);
                this.soundManager.playClickSound();
            });

            robot.legBtn.addEventListener('click', () => {
                this.changeLegColor(robotType);
                this.soundManager.playClickSound();
            });

            robot.speakBtn.addEventListener('click', () => {
                this.makeRobotSpeak(robotType);
                this.soundManager.playSuccessSound();
            });
        });
        this.robots.forEach((robot, robotType) => {
            robot.container.addEventListener('mouseenter', () => {
                this.addHoverEffect(robotType);
            });

            robot.container.addEventListener('mouseleave', () => {
                this.removeHoverEffect(robotType);
            });
        });
    }

    toggleLeftEye(robotType) {
        const robot = this.robots.get(robotType);
        if (!robot) return;

        robot.isLeftEyeClosed = !robot.isLeftEyeClosed;
        
        if (robot.isLeftEyeClosed) {
            robot.leftEye.classList.add('closed');
            robot.eyeBtn.textContent = 'Ouvrir œil gauche';
            robot.display.textContent = 'Eye Closed';
        } else {
            robot.leftEye.classList.remove('closed');
            robot.eyeBtn.textContent = 'Fermer œil gauche';
            robot.display.textContent = 'Ready';
        }
    }

    changeArmColor(robotType) {
        const robot = this.robots.get(robotType);
        if (!robot) return;

        const randomColor = colorPalettes.arms[Math.floor(Math.random() * colorPalettes.arms.length)];
        robot.currentArmColor = randomColor;

        robot.leftArm.style.background = `linear-gradient(145deg, ${randomColor}, ${this.darkenColor(randomColor, 20)})`;
        robot.rightArm.style.background = `linear-gradient(145deg, ${randomColor}, ${this.darkenColor(randomColor, 20)})`;

        robot.display.textContent = 'Arms Changed';
        setTimeout(() => {
            robot.display.textContent = 'Ready';
        }, 2000);
    }

    changeLegColor(robotType) {
        const robot = this.robots.get(robotType);
        if (!robot) return;

        const randomColor = colorPalettes.legs[Math.floor(Math.random() * colorPalettes.legs.length)];
        robot.currentLegColor = randomColor;

        robot.leftLeg.style.background = `linear-gradient(145deg, ${randomColor}, ${this.darkenColor(randomColor, 20)})`;
        robot.rightLeg.style.background = `linear-gradient(145deg, ${randomColor}, ${this.darkenColor(randomColor, 20)})`;

        robot.display.textContent = 'Legs Changed';
        setTimeout(() => {
            robot.display.textContent = 'Ready';
        }, 2000);
    }

    makeRobotSpeak(robotType) {
        const robot = this.robots.get(robotType);
        if (!robot) return;

        robot.speakBtn.classList.add('active');
        setTimeout(() => {
            robot.speakBtn.classList.remove('active');
        }, 500);

        robot.display.textContent = 'Hello World';
        
        this.animateEyes(robotType);
        
        setTimeout(() => {
            robot.display.textContent = 'Ready';
        }, 3000);
    }

    animateEyes(robotType) {
        const robot = this.robots.get(robotType);
        if (!robot) return;

        const originalLeftColor = robot.leftEye.style.background;
        const originalRightColor = robot.rightEye.style.background;

        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            if (blinkCount >= 6) {
                clearInterval(blinkInterval);
                robot.leftEye.style.background = originalLeftColor;
                robot.rightEye.style.background = originalRightColor;
                return;
            }

            if (blinkCount % 2 === 0) {
                robot.leftEye.style.background = '#ff0000';
                robot.rightEye.style.background = '#ff0000';
            } else {
                robot.leftEye.style.background = originalLeftColor;
                robot.rightEye.style.background = originalRightColor;
            }
            blinkCount++;
        }, 200);
    }

    addHoverEffect(robotType) {
        const robot = this.robots.get(robotType);
        if (!robot) return;

        robot.leftArm.style.animation = 'leftArmSwing 1s ease-in-out infinite';
        robot.rightArm.style.animation = 'rightArmSwing 1s ease-in-out infinite';
    }

    removeHoverEffect(robotType) {
        const robot = this.robots.get(robotType);
        if (!robot) return;

        robot.leftArm.style.animation = 'leftArmSwing 3s ease-in-out infinite';
        robot.rightArm.style.animation = 'rightArmSwing 3s ease-in-out infinite';
    }

    startAmbientAnimation() {
        setInterval(() => {
            this.robots.forEach((robot, robotType) => {
                if (!robot.isLeftEyeClosed) {
                    if (Math.random() < 0.1) {
                        robot.leftEye.style.boxShadow = '0 0 20px #00ff00';
                        robot.rightEye.style.boxShadow = '0 0 20px #00ff00';
                        setTimeout(() => {
                            robot.leftEye.style.boxShadow = '0 0 10px #00ff00';
                            robot.rightEye.style.boxShadow = '0 0 10px #00ff00';
                        }, 300);
                    }
                }
            });
        }, 2000);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.init();
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.animate();
        this.bindResize();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.3';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    createParticles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindResize() {
        window.addEventListener('resize', () => this.resize());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const robotManager = new RobotManager();
    
    const particleSystem = new ParticleSystem();
    
    console.log('🤖 Super Robot Team initialized successfully!');
    console.log('🎮 Use the control buttons to interact with the robots');
    console.log('🔊 Audio effects are enabled');
});

window.addEventListener('error', (e) => {
    console.error('Robot system error:', e.error);
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
    }
});
