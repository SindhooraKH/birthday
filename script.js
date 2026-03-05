// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyASr_7Lbxn0VhR9Qw0g6-FY8fE1av1CpsM",
    authDomain: "utsav20-34641.firebaseapp.com",
    projectId: "utsav20-34641",
    storageBucket: "utsav20-34641.firebasestorage.app",
    messagingSenderId: "905987200650",
    appId: "1:905987200650:web:96b3f83abfb3db44a83f73",
    measurementId: "G-ZLZCDV39YM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enter-btn');
    const landing = document.getElementById('landing');
    const mainContent = document.getElementById('main-content');
    const bdayPopup = document.getElementById('bday-popup');
    const closePopup = document.querySelector('.close-popup');
    const bdayMusic = document.getElementById('bday-music');
    const landingMusic = document.getElementById('landing-music');
    const wishForm = document.getElementById('wish-form');
    const wishesDisplay = document.getElementById('wishes-display');

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
        bdayMusic.play().catch(e => console.log("Audio playback blocked: " + e));

        // Trigger reveal animations
        revealOnScroll();
    });

    // Close Popup
    closePopup.addEventListener('click', () => {
        bdayPopup.classList.add('hidden');
    });

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

    // Live Wishes Listener
    const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        wishesDisplay.innerHTML = '';
        snapshot.forEach((doc) => {
            const wish = doc.data();
            const card = document.createElement('div');
            card.className = 'wish-card reveal active';
            card.innerHTML = `<p>"${wish.message}" - ${wish.name}</p>`;
            wishesDisplay.appendChild(card);
        });
    });

    // Handle Form Submission
    wishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('user-name');
        const messageInput = document.getElementById('user-message');
        const name = nameInput.value;
        const message = messageInput.value;

        try {
            await addDoc(collection(db, "wishes"), {
                name: name,
                message: message,
                timestamp: serverTimestamp()
            });

            wishForm.reset();

            // Show THANK U text below button
            const finalMsg = document.getElementById('final-thank-you-msg');
            if (finalMsg) {
                finalMsg.classList.remove('hidden');
                finalMsg.scrollIntoView({ behavior: 'smooth' });
            }

            alert("Wish sent to Utsav!");

            // Throw some confetti on wish
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.8 }
            });
        } catch (err) {
            console.error("Error adding wish: ", err);
            alert("Oops! Something went wrong. Check the console for details.");
        }
    });
});
