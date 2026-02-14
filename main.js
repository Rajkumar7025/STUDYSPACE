document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Load Navbar
    fetch("components-navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;
            initializeNavbar(); // Set up buttons
        });

    // 2. Load Footer
    fetch("components-footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });

    // 3. INJECT CHECKOUT MODAL (The Fix)
    // Checks if modal exists; if not, adds it to the page.
    if (!document.getElementById('checkout-modal')) {
        const modalHTML = `
        <div class="modal-overlay" id="checkout-overlay"></div>
        <div class="checkout-modal" id="checkout-modal">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>Confirm Order</h2>
                <button id="close-checkout-x" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>
            
            <div id="checkout-summary" style="margin-bottom:20px;"></div>

            <form onsubmit="window.processPayment(event)">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Card Details</label>
                <input type="text" placeholder="0000 0000 0000 0000" class="form-input" required maxlength="19">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                    <input type="text" placeholder="MM/YY" class="form-input" required maxlength="5">
                    <input type="text" placeholder="CVC" class="form-input" required maxlength="3">
                </div>
                <button type="submit" class="btn btn-primary full-width" style="margin-top:15px;">Pay Now</button>
            </form>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
});

// =========================================
// UNIVERSAL EVENT LISTENER
// =========================================
function initializeNavbar() {
    // We use a "Global Listener" so it catches clicks 
    // even if the button loaded a millisecond later.
    document.body.addEventListener('click', function(e) {
        
        // A. OPEN CART
        if (e.target.closest('#open-cart-btn')) {
            toggleCart(true);
        }

        // B. CLOSE CART
        if (e.target.closest('#close-cart-btn') || e.target.id === 'cart-overlay') {
            toggleCart(false);
        }

        // C. CHECKOUT BUTTON CLICKED
        if (e.target.id === 'checkout-btn') {
            if (typeof window.openCheckout === "function") {
                window.openCheckout();
            } else {
                alert("System is loading... please try again in 2 seconds.");
            }
        }

        // D. CLOSE CHECKOUT MODAL (X Button or Overlay)
        if (e.target.id === 'close-checkout-x' || e.target.id === 'checkout-overlay') {
            if (typeof window.closeCheckout === "function") {
                window.closeCheckout();
            }
        }

        // E. MOBILE MENU
        if (e.target.closest('#hamburger')) {
            document.getElementById('mobile-menu').classList.toggle('open');
        }
    });

    // Update cart count immediately
    if(localStorage.getItem('studySpaceCart')) {
        const cart = JSON.parse(localStorage.getItem('studySpaceCart'));
        const count = document.getElementById('cart-count');
        if(count) count.innerText = cart.length;
    }
}

function toggleCart(open) {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if(sidebar && overlay) {
        if(open) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        }
    }
}
