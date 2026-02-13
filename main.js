document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Load Navbar
    fetch("components-navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;
            setActiveLink(); // Highlight current page
            initializeMobileMenu(); // Re-attach mobile menu logic
        });

    // 2. Load Footer
    fetch("components-footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });
});

// Function to set the 'active' class on the current link
function setActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); // Get filename (e.g., 'about.html')

    // Map filenames to IDs
    const links = {
        "index.html": "link-home",
        "": "link-home", // For root url
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

// Function to make the mobile menu work after it's loaded
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