// Footer Interactions - Enhanced User Experience

document.addEventListener('DOMContentLoaded', function() {
    
    // Update copyright year automatically
    function updateCopyrightYear() {
        const currentYear = new Date().getFullYear();
        const copyrightElement = document.querySelector('.copyright');
        
        if (copyrightElement) {
            copyrightElement.textContent = `© ${currentYear} - Mario Roberto Dev. All rights reserved.`;
        }
    }
    
    // Call the function to update the year
    updateCopyrightYear();
    
    // Add smooth scrolling to all footer links
    const footerLinks = document.querySelectorAll('.vg-footer a[href^="#"]');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover sound effect (optional - for better UX)
    const interactiveElements = document.querySelectorAll('.contact-item, .social-link, .username-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            // Add a subtle scale effect
            this.style.transform = 'translateX(5px) scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            // Reset transform
            this.style.transform = 'translateX(0) scale(1)';
        });
    });

    // Add click feedback for social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add a ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(239, 55, 36, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.closest('.vg-footer')) {
                focusedElement.style.outline = '2px solid #ef3724';
                focusedElement.style.outlineOffset = '2px';
            }
        }
    });

    // Add intersection observer for footer animations
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe footer sections
    const footerSections = document.querySelectorAll('.footer-info, .float-lg-right');
    footerSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        footerObserver.observe(section);
    });

    // Add copy email functionality
    const emailLink = document.querySelector('.contact-link');
    if (emailLink) {
        emailLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(email).then(() => {
                // Show success message
                showNotification('Email copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Email copied to clipboard!', 'success');
            });
        });
    }

    // Add tooltip functionality for usernames
    const usernameItems = document.querySelectorAll('.username-item');
    usernameItems.forEach(item => {
        const username = item.querySelector('span').textContent;
        item.setAttribute('title', `Username: ${username}`);
        
        item.addEventListener('click', function() {
            // Copy username to clipboard
            navigator.clipboard.writeText(username).then(() => {
                showNotification(`Username "${username}" copied!`, 'info');
            }).catch(() => {
                showNotification(`Username: ${username}`, 'info');
            });
        });
    });

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `footer-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .footer-notification {
            font-family: 'Quicksand', sans-serif;
        }
    `;
    document.head.appendChild(style);

    // Add accessibility improvements
    const footer = document.querySelector('.vg-footer');
    if (footer) {
        footer.setAttribute('role', 'contentinfo');
        footer.setAttribute('aria-label', 'Footer with contact information and social media links');
    }

    // Add ARIA labels to interactive elements
    const contactItem = document.querySelector('.contact-item');
    if (contactItem) {
        contactItem.setAttribute('role', 'button');
        contactItem.setAttribute('tabindex', '0');
        contactItem.setAttribute('aria-label', 'Click to copy email address');
    }

    usernameItems.forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        const username = item.querySelector('span').textContent;
        item.setAttribute('aria-label', `Click to copy username: ${username}`);
    });

    // Add keyboard support for clickable elements
    [contactItem, ...usernameItems].forEach(element => {
        if (element) {
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    });

    console.log('Footer interactions loaded successfully!');
    console.log(`Copyright year updated to: ${new Date().getFullYear()}`);
}); 