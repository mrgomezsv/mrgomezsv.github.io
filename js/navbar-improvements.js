// Navbar Improvements - Enhanced functionality and accessibility

document.addEventListener('DOMContentLoaded', function() {
    // Navbar elements
    const navbar = document.querySelector('.navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Handle navbar toggler accessibility
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = navbarCollapse.classList.contains('show');
            navbarToggler.setAttribute('aria-expanded', !isExpanded);
            
            // Update title based on state
            if (isExpanded) {
                navbarToggler.setAttribute('title', 'Open navigation menu');
            } else {
                navbarToggler.setAttribute('title', 'Close navigation menu');
            }
        });
    }
    
    // Active link management based on scroll position
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id], div[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current section link
                const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    // Smooth scrolling for navbar links
    navLinks.forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    if (navbarCollapse.classList.contains('show')) {
                        navbarCollapse.classList.remove('show');
                        navbarToggler.setAttribute('aria-expanded', 'false');
                        navbarToggler.setAttribute('title', 'Open navigation menu');
                    }
                    
                    // Smooth scroll to target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active link
                    navLinks.forEach(navLink => {
                        navLink.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        }
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveLink);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const isNavbarElement = navbar.contains(e.target);
        const isNavbarOpen = navbarCollapse.classList.contains('show');
        
        if (!isNavbarElement && isNavbarOpen) {
            navbarCollapse.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
            navbarToggler.setAttribute('title', 'Open navigation menu');
        }
    });
    
    // Keyboard navigation support
    navLinks.forEach(link => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Handle navbar background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Language button functionality (placeholder)
    const langButton = document.querySelector('.btn-fab');
    if (langButton) {
        langButton.addEventListener('click', function() {
            // Placeholder for language switching functionality
            console.log('Language switch clicked');
            // You can implement language switching here
        });
    }
    
    // Initialize active link on page load
    updateActiveLink();
});

// Add CSS class for scrolled navbar
const scrolledNavbarStyles = `
    .navbar.scrolled {
        background-color: rgba(52, 58, 64, 0.95) !important;
        backdrop-filter: blur(10px);
    }
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.textContent = scrolledNavbarStyles;
document.head.appendChild(styleElement); 