// static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sahara Mental Health App Loaded');
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add fade-in animation to elements as they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all feature cards and resource cards
    document.querySelectorAll('.feature-card, .resource-card, .quick-help-card').forEach(card => {
        observer.observe(card);
    });
});

// Utility function to show toast notifications
function showToast(message, type = 'info') {
    // Create toast element
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // Add to toast container (create if doesn't exist)
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show the toast
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// static/js/chat.js
class SaharaChat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.isTyping = false;
        
        this.initializeChat();
        this.bindEvents();
        this.checkQuickMessage();
    }

    initializeChat() {
        // Auto-focus on input
        if (this.messageInput) {
            this.messageInput.focus();
        }
        
        // Scroll to bottom of chat
        this.scrollToBottom();
    }

    bindEvents() {
        // Send message on Enter key
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea based on content
            this.messageInput.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            });
        }
    }

    checkQuickMessage() {
        // Check if there's a quick message from the home page
        const quickMessage = localStorage.getItem('quickMessage');
        if (quickMessage) {
            localStorage.removeItem('quickMessage');
            this.messageInput.value = quickMessage;
            setTimeout(() => {
                this.sendMessage();
            }, 1000); // Small delay for better UX
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Add user message to chat
        this.addMessage('user', message);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();

            // Add bot response to chat
            this.addMessage('bot', data.response, data.timestamp);

            // Handle special intents
            if (data.intent === 'crisis') {
                this.handleCrisisResponse();
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('bot', "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.");
            showToast('Connection error. Please try again.', 'warning');
        }
    }

    addMessage(type, content, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message slide-up`;
        
        const currentTime = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p class="mb-0">${this.formatMessage(content)}</p>
                <small class="message-time">${currentTime}</small>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(message) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        message = message.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Convert phone numbers to clickable links
        const phoneRegex = /(\+?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4})/g;
        message = message.replace(phoneRegex, '<a href="tel:$1">$1</a>');
        
        // Convert line breaks to <br> tags
        message = message.replace(/\n/g, '<br>');
        
        return message;
    }

    showTypingIndicator() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.typingIndicator.style.display = 'block';
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }

    handleCrisisResponse() {
        // Add special styling or actions for crisis situations
        const lastMessage = this.chatMessages.lastElementChild;
        lastMessage.querySelector('.message-content').classList.add('border', 'border-danger');
        
        // Show additional help options
        setTimeout(() => {
            this.addMessage('bot', "Would you like me to provide some immediate coping strategies while you reach out for help?");
        }, 2000);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat? This cannot be undone.')) {
            this.chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <p>Chat cleared. How can I help you today?</p>
                        <small class="message-time">Just now</small>
                    </div>
                </div>
            `;
            showToast('Chat cleared successfully', 'success');
        }
    }
}

// Global functions for HTML onclick events
function sendMessage() {
    if (window.saharaChat) {
        window.saharaChat.sendMessage();
    }
}

function clearChat() {
    if (window.saharaChat) {
        window.saharaChat.clearChat();
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatMessages')) {
        window.saharaChat = new SaharaChat();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SaharaChat, showToast };
}
