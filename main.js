document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Load Navbar
    fetch("components-navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;
            
            // Re-attach Hamburger Listener
            const hamburger = document.getElementById('hamburger');
            const mobileMenu = document.getElementById('mobile-menu');
            if(hamburger) {
                hamburger.addEventListener('click', () => {
                    mobileMenu.classList.toggle('open');
                });
            }

            // Trigger cart update (in case items are already in local storage)
            if(window.updateCart) window.updateCart();
        });

    // 2. Load Footer
    fetch("components-footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });
});

// =========================================
// GLOBAL EVENT LISTENER (THE FIX)
// =========================================
document.addEventListener('click', function(e) {
    
    // 1. OPEN CART (Clicking the cart icon or wrapper)
    if (e.target.closest('#open-cart-btn') || e.target.closest('.cart-icon-wrapper')) {
        toggleCart(true);
    }

    // 2. CLOSE CART (Clicking the X or the Overlay)
    if (e.target.closest('#close-cart-btn') || e.target.id === 'cart-overlay') {
        toggleCart(false);
    }

    // 3. MOBILE MENU TOGGLE
    if (e.target.closest('#hamburger')) {
        const menu = document.getElementById('mobile-menu');
        const icon = document.querySelector('#hamburger i');
        menu.classList.toggle('open');
        
        if (menu.classList.contains('open')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    }

    // 4. CHECKOUT BUTTON (Inside the cart)
    if (e.target.closest('#checkout-btn')) {
         // Calls the function in script.js
         if(window.openCheckout) window.openCheckout();
    }
});

// Helper Function
function toggleCart(show) {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        if(show) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        }
    }
}

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
    if (links[page]) {
        const link = document.getElementById(links[page]);
        if(link) link.classList.add("active");
    }
}

