// Thrift Kingdom - UI Management
// Handles all user interface updates and interactions

// UI Update Functions

function updateUI() {
    updateStats();
    updateItemsDisplay();
    updateUpgrades();
    updateGenerationStatus();
}

function updateStats() {
    // Update cash display
    const cashElement = document.getElementById('cash');
    if (cashElement) {
        cashElement.textContent = formatNumber(gameState.cash);
    }
    
    // Update level display  
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.textContent = gameState.appraisalLevel;
    }
    
    // Update XP display
    const xpElement = document.getElementById('xp');
    const xpNeededElement = document.getElementById('xp-needed');
    
    if (xpElement && xpNeededElement) {
        xpElement.textContent = formatNumber(gameState.appraisalXP);
        xpNeededElement.textContent = formatNumber(CONFIG.getXPRequired(gameState.appraisalLevel));
    }
}

function updateItemsDisplay() {
    // Update item count
    const itemCountElement = document.getElementById('item-count');
    if (itemCountElement) {
        itemCountElement.textContent = `${gameState.items.length}/${gameState.storageCapacity}`;
    }
    
    // Clear and rebuild items container
    const container = document.getElementById('items-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.items.forEach(item => {
        addItemToUI(item, false); // false = don't animate since we're rebuilding
    });
}

function addItemToUI(item, animate = true) {
    const container = document.getElementById('items-container');
    if (!container) return;
    
    const itemCard = createItemCard(item);
    
    if (animate) {
        itemCard.classList.add('bounce-in');
    }
    
    container.appendChild(itemCard);
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = `item-card ${item.isAppraised ? 'appraised' : 'mystery'}`;
    card.dataset.itemId = item.id;
    
    const isAutoAppraised = gameState.upgrades.autoCommon && item.rarity === 'common' && !item.isAppraised;
    
    if (isAutoAppraised) {
        item.isAppraised = true; // Auto-appraise on display
    }
    
    card.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.isAppraised ? item.name : 'Mystery Item'}</div>
        <div class="item-rarity" style="color: ${getRarityColor(item.rarity)}">
            ${item.isAppraised ? item.rarity.toUpperCase() : '???'}
        </div>
        <div class="item-value">${getItemDisplayValue(item)}</div>
        ${item.isAppraised ? 
            `<div class="item-condition">${CONDITIONS[item.condition].name} ${CONDITIONS[item.condition].emoji}</div>` : 
            ''
        }
    `;
    
    // Add click handler
    card.addEventListener('click', () => handleItemClick(item));
    
    return card;
}

function handleItemClick(item) {
    if (item.isAppraised) {
        // Show sell confirmation
        showSellConfirmation(item);
    } else {
        // Start appraisal mini-game
        startAppraisalMiniGame(item);
    }
}

function showSellConfirmation(item) {
    const value = getItemValue(item);
    const confirmed = confirm(`Sell ${item.name} for $${value}?`);
    
    if (confirmed) {
        sellItem(item);
    }
}

function updateItemInUI(item) {
    const card = document.querySelector(`[data-item-id="${item.id}"]`);
    if (!card) return;
    
    // Remove old card and add updated one
    const container = card.parentNode;
    const newCard = createItemCard(item);
    
    // Add fade-in animation
    newCard.classList.add('fade-in');
    
    container.replaceChild(newCard, card);
}

function removeItemFromUI(item) {
    const card = document.querySelector(`[data-item-id="${item.id}"]`);
    if (card) {
        // Add fade-out animation
        card.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            card.remove();
        }, 300);
    }
}

function updateUpgrades() {
    document.querySelectorAll('.upgrade').forEach(upgradeElement => {
        const upgradeType = upgradeElement.dataset.upgrade;
        const costElement = upgradeElement.querySelector('.upgrade-cost span');
        const button = upgradeElement.querySelector('button');
        
        const cost = getUpgradeCost(upgradeType);
        const canAfford = gameState.cash >= cost;
        const isMaxed = cost === Infinity;
        
        if (costElement) {
            costElement.textContent = isMaxed ? 'OWNED' : formatNumber(cost);
        }
        
        if (button) {
            button.disabled = !canAfford || isMaxed;
            button.textContent = isMaxed ? 'Owned' : (canAfford ? 'Buy' : 'Buy');
        }
        
        // Update upgrade info based on current level
        updateUpgradeInfo(upgradeElement, upgradeType);
    });
}

function updateUpgradeInfo(element, upgradeType) {
    const infoElement = element.querySelector('.upgrade-info p');
    if (!infoElement) return;
    
    switch (upgradeType) {
        case 'speed':
            const speedLevel = gameState.upgrades.speed;
            const currentRate = getCurrentItemRate();
            infoElement.textContent = `Items arrive 20% faster (Level ${speedLevel}, current: ${currentRate}s)`;
            break;
            
        case 'storage':
            const storageLevel = gameState.upgrades.storage;
            infoElement.textContent = `+10 item storage capacity (Level ${storageLevel}, current: ${gameState.storageCapacity})`;
            break;
            
        case 'autoCommon':
            if (gameState.upgrades.autoCommon) {
                infoElement.textContent = 'Common items are automatically appraised ✅';
            } else {
                infoElement.textContent = 'Automatically identify common items';
            }
            break;
    }
}

function updateGenerationStatus() {
    // Update generation rate display
    const rateElement = document.getElementById('item-rate');
    if (rateElement) {
        rateElement.textContent = getCurrentItemRate();
    }
    
    // Update storage warning
    const container = document.getElementById('items-container');
    if (container && gameState.items.length >= gameState.storageCapacity) {
        if (!container.querySelector('.storage-warning')) {
            const warning = document.createElement('div');
            warning.className = 'storage-warning';
            warning.innerHTML = `
                <div style="
                    background: #FFE4B5;
                    border: 2px solid #FF8C00;
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                    margin: 1rem 0;
                    font-weight: bold;
                    color: #8B4513;
                ">
                    📦 Storage Full! Appraise and sell items to make space.
                </div>
            `;
            container.parentNode.insertBefore(warning, container);
        }
    } else {
        // Remove warning if storage is not full
        const warning = document.querySelector('.storage-warning');
        if (warning) warning.remove();
    }
}

// Utility Functions

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function createProgressBar(current, max, label = '') {
    const percentage = Math.min((current / max) * 100, 100);
    
    return `
        <div class="progress-bar">
            <div class="progress-label">${label}</div>
            <div class="progress-track">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-text">${formatNumber(current)} / ${formatNumber(max)}</div>
        </div>
    `;
}

// Animation helpers
function animateValue(element, startValue, endValue, duration = 1000) {
    const start = Date.now();
    const difference = endValue - startValue;
    
    function updateValue() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.floor(startValue + (difference * easedProgress));
        element.textContent = formatNumber(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    updateValue();
}

// Special UI effects
function showLevelUpEffect() {
    const effect = document.createElement('div');
    effect.innerHTML = '🎉 LEVEL UP! 🎉';
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        z-index: 2000;
        animation: levelUpAnimation 2s ease-out;
        pointer-events: none;
    `;
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 2000);
}

function showCashGainEffect(amount, x = null, y = null) {
    const effect = document.createElement('div');
    effect.innerHTML = `+$${formatNumber(amount)}`;
    effect.style.cssText = `
        position: fixed;
        left: ${x || '50%'};
        top: ${y || '30%'};
        transform: translateX(-50%);
        font-size: 1.5rem;
        font-weight: bold;
        color: #228B22;
        z-index: 1500;
        animation: cashGainAnimation 1.5s ease-out;
        pointer-events: none;
    `;
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 1500);
}

// Add CSS animations dynamically
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.8); }
        }
        
        @keyframes levelUpAnimation {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            40% { transform: translate(-50%, -50%) scale(1); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        
        @keyframes cashGainAnimation {
            0% { transform: translateX(-50%) translateY(0); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateX(-50%) translateY(-50px); opacity: 0; }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .progress-bar {
            margin: 0.5rem 0;
        }
        
        .progress-track {
            background: #E0E0E0;
            border-radius: 10px;
            height: 20px;
            position: relative;
            overflow: hidden;
        }
        
        .progress-fill {
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            text-align: center;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            color: #666;
        }
        
        .progress-label {
            font-size: 0.9rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
            color: #8B4513;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize UI enhancements
function initializeUI() {
    addCustomAnimations();
    
    // Add touch feedback for mobile
    document.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('btn') || e.target.classList.contains('item-card')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (e.target.classList.contains('btn') || e.target.classList.contains('item-card')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 's':
            case 'S':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    saveGameState();
                    showNotification('💾 Game saved!');
                }
                break;
        }
    });
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
} else {
    initializeUI();
}

// Export functions for global use
window.updateUI = updateUI;
window.addItemToUI = addItemToUI;
window.updateItemInUI = updateItemInUI;
window.removeItemFromUI = removeItemFromUI;
window.showLevelUpEffect = showLevelUpEffect;
window.showCashGainEffect = showCashGainEffect;
window.formatNumber = formatNumber;