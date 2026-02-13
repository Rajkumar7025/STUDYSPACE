// --- DATA: The Inventory ---
const productsData = [
    // FURNITURE
    { id: 1, name: "Study Desk & Chair", category: "furniture", price: 149.99, image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80" },
    { id: 5, name: "Ergonomic Office Chair", category: "furniture", price: 120.00, image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80" },
    { id: 6, name: "LED Desk Lamp", category: "furniture", price: 25.00, image: "https://images.unsplash.com/photo-1534281303260-5920f0728475?w=500&q=80" },
    { id: 10, name: "Compact Bookshelf", category: "furniture", price: 65.00, image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=80" },
    { id: 18, name: "Bean Bag Chair", category: "furniture", price: 55.00, image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=500&q=80" },
    
    // BEDDING (Fixed Images)
    { id: 2, name: "Cozy Bedding Set", category: "bedding", price: 79.99, image: "https://images.unsplash.com/photo-1522771753035-1a5b65a9f176?w=500&q=80" },
    { id: 8, name: "Memory Foam Pillow", category: "bedding", price: 35.00, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=500&q=80" },
    { id: 12, name: "Duvet Insert (Queen)", category: "bedding", price: 45.00, image: "https://images.unsplash.com/photo-1616486701797-0f33f61038ec?w=500&q=80" },
    { id: 15, name: "Throw Blanket", category: "bedding", price: 24.99, image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80" },
    { id: 20, name: "Bedside Rug", category: "bedding", price: 35.00, image: "https://images.unsplash.com/photo-1575414723226-972a9e38d780?w=500&q=80" },

    // KITCHEN
    { id: 3, name: "Kitchen Starter Pack", category: "kitchen", price: 89.99, image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=500&q=80" },
    { id: 7, name: "Non-Stick Cookware Set", category: "kitchen", price: 55.00, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80" },
    { id: 11, name: "Electric Kettle", category: "kitchen", price: 22.50, image: "https://images.unsplash.com/photo-1594213114663-d94db9b17126?w=500&q=80" },
    { id: 13, name: "Cutlery Set (16pc)", category: "kitchen", price: 19.99, image: "https://images.unsplash.com/photo-1581643799863-12d42436f56b?w=500&q=80" },
    { id: 16, name: "Mini Fridge", category: "kitchen", price: 150.00, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80" },
    { id: 19, name: "Food Storage Containers", category: "kitchen", price: 28.00, image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80" },

    // STORAGE
    { id: 4, name: "Under-bed Storage", category: "storage", price: 29.99, image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=500&q=80" },
    { id: 9, name: "Laundry Basket", category: "storage", price: 15.99, image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80" },
    { id: 14, name: "Shoe Rack Organizer", category: "storage", price: 32.00, image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80" },
    { id: 17, name: "Closet Hangers (20pk)", category: "storage", price: 12.00, image: "https://images.unsplash.com/photo-1610336829705-18cb6641e469?w=500&q=80" }
];

// --- APP STATE ---
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];

// --- CORE INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Components (Wait for them to finish!)
    await loadComponent('navbar-placeholder', 'components-navbar.html');
    await loadComponent('footer-placeholder', 'components-footer.html');

    // 2. Initialize Logic (Now that HTML is ready)
    initializeNavigation();
    updateCartUI();
    initializeCartLogic();
    initializePageSpecifics();
    checkUserLogin();
    injectCheckoutModal();
});

// --- HELPER FUNCTIONS ---

// Load HTML Components
async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
        const response = await fetch(filePath);
        const data = await response.text();
        element.innerHTML = data;
    } catch (err) {
        console.error(`Error loading ${filePath}:`, err);
    }
}

// Active Link Highlighting & Mobile Menu
function initializeNavigation() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    const links = { "index.html": "link-home", "products.html": "link-products", "about.html": "link-about", "contact.html": "link-contact" };
    
    if (links[page]) {
        const activeLink = document.getElementById(links[page]);
        if(activeLink) activeLink.classList.add("active");
    }

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if(hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            hamburger.innerHTML = mobileMenu.classList.contains('open') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });
    }
}

// --- CART LOGIC ---
function initializeCartLogic() {
    // Sidebar Toggles
    const cartBtn = document.getElementById('open-cart-btn');
    const closeBtn = document.getElementById('close-cart-btn');
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    const mobileCartTrigger = document.querySelector('a[onclick*="openCart"]');

    function toggleCart(e) {
        if(e) e.preventDefault();
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    }

    if(cartBtn) cartBtn.addEventListener('click', toggleCart);
    if(closeBtn) closeBtn.addEventListener('click', toggleCart);
    if(overlay) overlay.addEventListener('click', toggleCart);
    if(mobileCartTrigger) mobileCartTrigger.addEventListener('click', toggleCart);
}

function addToCart(id) {
    const product = productsData.find(p => p.id === id);
    if (product) {
        cart.push(product);
        saveCart();
        showToast(`Added ${product.name}`);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function saveCart() {
    localStorage.setItem('studySpaceCart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const itemsEl = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');

    if(countEl) countEl.innerText = cart.length;

    if(itemsEl && totalEl) {
        itemsEl.innerHTML = '';
        let total = 0;
        if(cart.length === 0) {
            itemsEl.innerHTML = '<p class="empty-msg text-center" style="color:#999; margin-top:20px;">Cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price;
                itemsEl.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="price">$${item.price.toFixed(2)}</div>
                            <div class="cart-item-remove" onclick="removeFromCart(${index})">Remove</div>
                        </div>
                    </div>`;
            });
        }
        totalEl.innerText = '$' + total.toFixed(2);
    }
}

// --- PAGE SPECIFIC LOGIC ---
function initializePageSpecifics() {
    const path = window.location.pathname;

    // 1. PRODUCTS PAGE
    if (path.includes('products.html')) {
        renderProducts(productsData);
        
        // Filter Logic
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-filter');
                const filtered = category === 'all' ? productsData : productsData.filter(p => p.category === category);
                renderProducts(filtered);
            });
        });
    }

    // 2. HOME PAGE (Featured)
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
        const featuredGrid = document.querySelector('.product-grid'); // Reusing the class
        if (featuredGrid) {
            featuredGrid.innerHTML = '';
            productsData.slice(0, 4).forEach(product => {
                featuredGrid.appendChild(createProductCard(product));
            });
        }
    }

    // 3. CONTACT FORM
    const contactForm = document.querySelector('form');
    if(contactForm && path.includes('contact.html')) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            btn.innerText = 'Sending...';
            setTimeout(() => { showToast("Message Sent!"); contactForm.reset(); btn.innerText = 'Send'; }, 1500);
        });
    }

    // 4. AUTH PAGE
    if(path.includes('signin.html')) {
        window.switchAuth = function(mode) {
            const isReg = mode === 'register';
            document.querySelectorAll('.auth-toggle-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase() === mode));
            document.getElementById('field-name').classList.toggle('hidden', !isReg);
            document.getElementById('field-confirm-pass').classList.toggle('hidden', !isReg);
            document.getElementById('auth-submit-btn').textContent = isReg ? 'Create Account' : 'Sign In';
            document.getElementById('auth-subtitle').textContent = isReg ? 'Create an account' : 'Sign in to continue';
        };

        window.handleAuth = function() {
            const email = document.querySelector('input[type="email"]').value;
            const name = document.querySelector('#field-name input').value;
            if(!email) return alert("Please enter email");
            
            const isRegister = document.querySelector('.auth-toggle-btn.active').innerText === 'Register';
            const user = { name: (isRegister && name) ? name : "Student User", email: email };
            
            localStorage.setItem('studySpaceUser', JSON.stringify(user));
            window.location.href = "index.html";
        };
    }
}

// --- RENDERING HELPERS ---
function renderProducts(items) {
    const grid = document.querySelector('.product-grid');
    if(!grid) return;
    grid.innerHTML = '';
    items.forEach(product => grid.appendChild(createProductCard(product)));
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="tag" style="position:absolute; top:10px; right:10px; background:white; padding:4px 10px; border-radius:15px; font-size:0.7rem; font-weight:bold; color:var(--primary-color)">${product.category.toUpperCase()}</span>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="price-row">
                <span class="price">$${product.price.toFixed(2)}</span>
                <button class="btn btn-sm btn-primary" onclick="addToCart(${product.id})">Add</button>
            </div>
        </div>
    `;
    return div;
}

// --- USER & CHECKOUT ---
function checkUserLogin() {
    const user = JSON.parse(localStorage.getItem('studySpaceUser'));
    const btn = document.getElementById('nav-signin-btn');
    if (user && btn) {
        btn.innerHTML = `<i class="fa-regular fa-user"></i> Hi, ${user.name.split(' ')[0]}`;
        btn.href = "#";
        btn.classList.remove('btn-primary');
        btn.style.cssText = "background:transparent; color:var(--primary-color); border:1px solid var(--primary-color)";
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-check-circle" style="color:#22c55e"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

function injectCheckoutModal() {
    if(document.getElementById('checkout-modal')) return;
    const html = `
    <div class="checkout-modal" id="checkout-modal">
        <div class="text-center mb-8">
            <i class="fa-regular fa-credit-card" style="font-size:3rem; color:var(--text-green)"></i>
            <h2>Checkout</h2>
        </div>
        <div class="order-summary" id="order-summary" style="background:#f9fafb; padding:15px; border-radius:10px; margin-bottom:20px;"></div>
        <form onsubmit="processPayment(event)">
            <input type="text" class="form-input" placeholder="Card Number (Simulated)" required>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <input type="text" class="form-input" placeholder="MM/YY" required>
                <input type="text" class="form-input" placeholder="CVC" required>
            </div>
            <button type="submit" class="btn btn-primary full-width" id="pay-btn">Pay Now</button>
        </form>
        <button class="btn full-width" style="margin-top:10px" onclick="closeCheckout()">Cancel</button>
    </div>
    <div class="modal-overlay" id="checkout-overlay"></div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    // Attach listener to Checkout Button in Sidebar
    document.body.addEventListener('click', (e) => {
        if(e.target.innerText === 'Checkout' && e.target.closest('.cart-footer')) openCheckout();
    });
}

function openCheckout() {
    if(cart.length === 0) return showToast("Cart is empty!");
    const sub = cart.reduce((a,b)=>a+b.price,0);
    const tax = sub * 0.08;
    
    document.getElementById('order-summary').innerHTML = `
        <div class="summary-row" style="display:flex; justify-content:space-between"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
        <div class="summary-row" style="display:flex; justify-content:space-between; font-weight:bold; margin-top:10px; padding-top:10px; border-top:1px solid #ddd"><span>Total</span><span>$${(sub+tax).toFixed(2)}</span></div>
    `;
    document.getElementById('checkout-modal').classList.add('active');
    document.getElementById('checkout-overlay').classList.add('active');
    document.getElementById('cart-sidebar').classList.remove('open');
}

window.closeCheckout = function() {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

window.processPayment = function(e) {
    e.preventDefault();
    const btn = document.getElementById('pay-btn');
    btn.innerText = "Processing...";
    setTimeout(() => {
        cart = []; saveCart(); closeCheckout(); showToast("Order Successful!"); btn.innerText = "Pay Now";
    }, 2000);
}