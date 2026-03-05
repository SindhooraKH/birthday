// Supabase Configuration
const SUPABASE_URL = 'https://fpjwkxwittescntrbrkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwandreHdpdHRlc2NudHJicmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjYzMDIsImV4cCI6MjA4ODMwMjMwMn0.IL6coWsngLBNzKMIvdjs1agLJ4RjeBLV2OflJW1KYVs';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // Load and Display Wishes from Supabase
    const loadWishes = async () => {
        const wall = document.getElementById('wish-wall');
        if (!wall) return;

        try {
            const { data, error } = await _supabase
                .from('wishes')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            wall.innerHTML = '';
            data.forEach(wish => {
                const card = document.createElement('div');
                card.className = 'wish-card reveal active';
                card.innerHTML = `<p>"${wish.message}" - ${wish.name}</p>`;
                wall.appendChild(card);
            });
        } catch (err) {
            console.error('Error loading wishes:', err);
        }
    };

    // Initial Load
    loadWishes();

    // Real-time listener for new wishes
    _supabase
        .channel('public:wishes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wishes' }, (payload) => {
            const wall = document.getElementById('wish-wall');
            if (!wall) return;

            const wish = payload.new;
            const card = document.createElement('div');
            card.className = 'wish-card reveal active';
            card.innerHTML = `<p>"${wish.message}" - ${wish.name}</p>`;
            wall.prepend(card); // Add to the top

            // Trigger confetti for real-time updates!
            confetti({
                particleCount: 30,
                spread: 30,
                origin: { y: 0.9 }
            });
        })
        .subscribe();

    // Handle Form Submission with Supabase
    if (wishForm) {
        wishForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
                alert('Please provide your Supabase URL and Anon Key in script.js!');
                return;
            }

            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const name = document.getElementById('user-name').value;
            const message = document.getElementById('user-message').value;

            try {
                const { error } = await _supabase
                    .from('wishes')
                    .insert([{ name, message }]);

                if (error) throw error;

                wishForm.reset();
                submitBtn.textContent = 'Sent! ✅';

                // Confetti burst
                confetti({
                    particleCount: 100,
                    spread: 100,
                    origin: { y: 0.8 }
                });

                // Show THANK U message and scroll to it
                if (finalMsg) {
                    finalMsg.classList.remove('hidden');
                    finalMsg.scrollIntoView({ behavior: 'smooth' });
                }

                // Reload wishes to be sure
                loadWishes();

            } catch (err) {
                console.error('Error:', err);
                alert('Oops! There was a problem saving your wish.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Wish 🚀';
            }
        });
    }
});
