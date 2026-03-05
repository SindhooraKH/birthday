document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enter-btn');
    const landing = document.getElementById('landing');
    const mainContent = document.getElementById('main-content');
    const bdayPopup = document.getElementById('bday-popup');
    const closePopup = document.querySelector('.close-popup');
    const bdayMusic = document.getElementById('bday-music');
    const landingMusic = document.getElementById('landing-music');
    const wishForm = document.getElementById('wish-form');
    const finalMsg = document.getElementById('final-thank-you-msg');

    // Create Balloons
    const balloonContainer = document.querySelector('.balloon-container');
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A29BFE'];

    for (let i = 0; i < 20; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = Math.random() * 100 + 'vw';
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.animationDelay = Math.random() * 10 + 's';
        balloon.style.width = (Math.random() * 30 + 20) + 'px';
        balloon.style.height = (parseFloat(balloon.style.width) * 1.4) + 'px';
        balloonContainer.appendChild(balloon);
    }

    // Force landing music (Try immediately + multiple events)
    const forceLandingPlay = () => {
        if (landingMusic && landingMusic.paused && !landing.classList.contains('hidden')) {
            landingMusic.play().then(() => {
                console.log("Landing music active");
                ['click', 'scroll', 'mousemove', 'touchstart', 'keydown'].forEach(ev =>
                    document.removeEventListener(ev, forceLandingPlay)
                );
            }).catch(() => {
                // Keep trying on next event
            });
        }
    };

    // Try immediately
    forceLandingPlay();

    // Also attach to everything
    ['click', 'scroll', 'mousemove', 'touchstart', 'keydown'].forEach(ev =>
        document.addEventListener(ev, forceLandingPlay)
    );

    // Enter Party Action
    enterBtn.addEventListener('click', () => {
        // Stop landing music
        if (landingMusic) {
            landingMusic.pause();
            landingMusic.currentTime = 0;
        }

        // Confetti Explosion
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
        });

        // Hide landing, show content
        landing.classList.add('hidden');
        mainContent.classList.remove('hidden');
        bdayPopup.classList.remove('hidden');

        // Play birthday wish music
        if (bdayMusic) {
            bdayMusic.play().catch(e => console.log("Audio playback blocked: " + e));
        }

        // Trigger reveal animations
        revealOnScroll();
    });

    // Close Popup
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            bdayPopup.classList.add('hidden');
        });
    }

    // Scroll Reveal Logic
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const revealTop = reveal.getBoundingClientRect().top;
            const revealPoint = 150;

            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);

    // Handle Form Submission via AJAX (FormSubmit.co)
    if (wishForm) {
        wishForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(this);

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    wishForm.reset();
                    submitBtn.textContent = 'Sent! ✅';

                    // Show THANK U message and scroll to it
                    if (finalMsg) {
                        finalMsg.classList.remove('hidden');
                        setTimeout(() => {
                            finalMsg.scrollIntoView({ behavior: 'smooth' });
                            // Final confetti burst
                            confetti({
                                particleCount: 100,
                                spread: 100,
                                origin: { y: 0.9 }
                            });
                        }, 500);
                    }
                } else {
                    alert('Oops! There was a problem. Please try again.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Wish 🚀';
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('Oops! Something went wrong.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Wish 🚀';
            });
        });
    }
});
