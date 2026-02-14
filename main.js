document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Load Navbar
    fetch("components-navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;
            
            // INITIALIZE LISTENERS AFTER LOADING HTML
            initializeNavbarEvents();
            
            // Highlight active link
            setActiveLink();
        });

    // 2. Load Footer
    fetch("components-footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });
});

function initializeNavbarEvents() {
    // A. Cart Sidebar Toggles
    const openBtn = document.getElementById('open-cart-btn');
    const closeBtn = document.getElementById('close-cart-btn');
    const overlay = document.getElementById('cart-overlay');
    const sidebar = document.getElementById('cart-sidebar');

    function toggleCart(open) {
        if(open) {
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

    // B. Checkout Button Listener (THE FIX)
    const checkoutBtn = document.getElementById('checkout-btn');
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Check if window.openCheckout exists (it's in script.js)
            if (typeof window.openCheckout === "function") {
                window.openCheckout();
            } else {
                console.error("Checkout function not found! Make sure script.js is loaded.");
                alert("Checkout system is loading... please wait a moment.");
            }
        });
    }

    // C. Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });
    }
    
    // D. Update Cart Count (if data exists)
    if(localStorage.getItem('studySpaceCart')) {
        const cart = JSON.parse(localStorage.getItem('studySpaceCart'));
        const count = document.getElementById('cart-count');
        if(count) count.innerText = cart.length;
    }
}

function setActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    const links = {
        "index.html": "link-home",
        "products.html": "link-products",
        "about.html": "link-about",
        "contact.html": "link-contact"
    };
    if (links[page]) {
        const link = document.getElementById(links[page]);
        if(link) link.classList.add("active");
    }
}
