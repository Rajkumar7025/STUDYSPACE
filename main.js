document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Load Navbar
    fetch("components-navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;
            setActiveLink(); 
            initializeMobileMenu(); 
            initializeCartUI(); // <--- NEW: Initialize Cart AFTER loading navbar
            
            // Dispatch event to tell script.js that navbar is ready
            document.dispatchEvent(new Event('navbarLoaded'));
        });

    // 2. Load Footer
    fetch("components-footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });
});

function setActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); 
    const links = {
        "index.html": "link-home",
        "": "link-home",
        "products.html": "link-products",
        "about.html": "link-about",
        "contact.html": "link-contact"
    };
    const activeId = links[page];
    if (activeId) {
        const link = document.getElementById(activeId);
        if(link) link.classList.add("active");
    }
}

function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    if(hamburger) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            const icon = hamburger.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// NEW: Explicitly handles opening/closing the cart visual
function initializeCartUI() {
    const openBtn = document.getElementById('open-cart-btn');
    const closeBtn = document.getElementById('close-cart-btn');
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    function toggleCart(show) {
        if(show) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        }
    }

    if(openBtn) openBtn.addEventListener('click', () => toggleCart(true));
    if(closeBtn) closeBtn.addEventListener('click', () => toggleCart(false));
    if(overlay) overlay.addEventListener('click', () => toggleCart(false));

    // Listen for custom event from other scripts to open cart
    document.addEventListener('openCart', () => toggleCart(true));
}
