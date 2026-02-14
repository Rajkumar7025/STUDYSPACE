document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Load Navbar
    fetch("components-navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;
            updateCartBadge(); // Update badge number immediately
        });

    // 2. Load Footer
    fetch("components-footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });

    // 3. INJECT CHECKOUT MODAL (The Universal Fix)
    // This ensures the popup exists on Home, About, and Product pages
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
// UNIVERSAL CLICK LISTENER
// =========================================
document.body.addEventListener('click', function(e) {
    
    // A. OPEN CART
    if (e.target.closest('#open-cart-btn')) {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if(sidebar) sidebar.classList.add('open');
        if(overlay) overlay.classList.add('open');
        renderCartItems(); // Refresh items when opening
    }

    // B. CLOSE CART (X Button or Overlay)
    if (e.target.closest('#close-cart-btn') || e.target.id === 'cart-overlay') {
        document.getElementById('cart-sidebar').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('open');
    }

    // C. CHECKOUT BUTTON CLICKED
    if (e.target.id === 'checkout-btn') {
        if (typeof window.openCheckout === "function") {
            window.openCheckout();
        } else {
            alert("Checkout is loading... if this fails, make sure script.js is linked in this HTML file.");
        }
    }

    // D. CLOSE CHECKOUT MODAL
    if (e.target.id === 'close-checkout-x' || e.target.id === 'checkout-overlay') {
        if (typeof window.closeCheckout === "function") window.closeCheckout();
    }

    // E. MOBILE MENU
    if (e.target.closest('#hamburger')) {
        document.getElementById('mobile-menu').classList.toggle('open');
    }
});

// Helper: Update Badge
function updateCartBadge() {
    if(localStorage.getItem('studySpaceCart')) {
        const cart = JSON.parse(localStorage.getItem('studySpaceCart'));
        const count = document.getElementById('cart-count');
        if(count) count.innerText = cart.length;
    }
}

// Helper: Render Cart Items in Sidebar
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];
    
    if(container) {
        container.innerHTML = '';
        let total = 0;
        if(cart.length === 0) container.innerHTML = "<p style='text-align:center; color:#888;'>Cart is empty</p>";
        
        cart.forEach((item, index) => {
            total += Number(item.price);
            container.innerHTML += `
            <div style="display:flex; gap:10px; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                <div style="flex:1;">
                    <div style="font-weight:bold; font-size:0.9rem;">${item.name}</div>
                    <div style="font-size:0.8rem; color:#666;">$${Number(item.price).toFixed(2)}</div>
                </div>
                <button onclick="window.removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        });
        if(totalEl) totalEl.innerText = '$' + total.toFixed(2);
    }
}
