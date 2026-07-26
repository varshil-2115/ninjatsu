// Ninja Bubbly Audio & Interactive Effects Engine
document.addEventListener("DOMContentLoaded", () => {
    // 1. Audio Feedbacks Context (Cute Game Synth Sounds)
    const playPopSound = (frequency = 400, type = 'sine') => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        // Bubble-like frequency pitch up sweep
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
    };

    // 2. Add bouncy sound effect to all clickable interface nodes
    const interactiveElements = document.querySelectorAll('.btn, .letter-btn, .game-card, .card, nav a');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            // Soft high pitch tick on hover
            playPopSound(600, 'triangle');
        });
        
        element.addEventListener('click', () => {
            // Strong juicy jump pop sound on click
            playPopSound(300, 'sine');
            
            // Visual Juice Squish animation effect
            element.style.transform = "scale(0.9) translateY(4px)";
            setTimeout(() => {
                element.style.transform = "";
            }, 100);
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
  const lessonButtons = document.querySelectorAll('.scroll-btn');

  lessonButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // If you want to show a quick reading alert or custom modal for lessons
      const lessonTitle = btn.parentElement.querySelector('h2').textContent;
     // alert(`Unrolling scroll for: ${lessonTitle}\n\nGreat ninjas read daily to sharpen their minds! 📜✨`);
    });
  });
});