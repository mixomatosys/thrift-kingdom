// Thrift Kingdom - Core Game Logic
// MVP v0.1

// Global Game State
let gameState = {
    // Player Resources
    cash: 0,
    
    // Skills (MVP focuses on Appraisal only)
    appraisalLevel: 1,
    appraisalXP: 0,
    
    // Items
    items: [],
    storageCapacity: 50,
    
    // Game Settings  
    itemGenerationRate: 30, // seconds between items
    lastItemGeneration: Date.now(),
    lastSave: Date.now(),
    
    // Upgrades
    upgrades: {
        speed: 0,        // Faster item generation
        storage: 0,      // More storage capacity
        autoCommon: false // Auto-appraise common items
    },
    
    // Game State
    isPlaying: true,
    currentAppraisalItem: null
};

// Game Configuration
const CONFIG = {
    // XP Requirements for leveling
    getXPRequired: (level) => {
        if (level <= 20) return level * 50;
        if (level <= 50) return 1000 + (level - 20) * 150;
        if (level <= 80) return 5500 + (level - 50) * 400;
        return 17500 + (level - 80) * 1000;
    },
    
    // Item generation timing
    baseItemRate: 30, // base seconds between items
    minItemRate: 5,   // minimum possible rate
    
    // Storage limits  
    baseStorage: 50,
    storagePerUpgrade: 10,
    
    // Upgrade costs
    upgradeCosts: {
        speed: (level) => 50 * Math.pow(1.5, level),
        storage: (level) => 100 * Math.pow(1.4, level),
        autoCommon: 200
    }
};

// Core Game Functions

function initializeGame() {
    console.log('🏪 Initializing Thrift Kingdom...');
    
    // Load saved game or start fresh
    loadGameState();
    
    // Check for offline progress
    checkOfflineProgress();
    
    // Start game loops
    startItemGeneration();
    startUIUpdate();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial UI update
    updateUI();
    
    console.log('🎮 Game initialized successfully!');
}

function checkOfflineProgress() {
    const now = Date.now();
    const timeAway = now - gameState.lastSave;
    const minutesAway = Math.floor(timeAway / 60000);
    
    // Only show offline progress if away for more than 2 minutes
    if (minutesAway >= 2) {
        calculateOfflineRewards(timeAway);
    }
}

function calculateOfflineRewards(timeAwayMs) {
    const timeAway = Math.floor(timeAwayMs / 1000); // Convert to seconds
    const itemGenerationRate = getCurrentItemRate();
    
    // Calculate items generated
    const itemsGenerated = Math.floor(timeAway / itemGenerationRate);
    const maxItems = Math.min(itemsGenerated, gameState.storageCapacity - gameState.items.length);
    
    if (maxItems <= 0) {
        return; // No rewards to give
    }
    
    // Generate offline items
    const offlineItems = [];
    let totalCashEarned = 0;
    
    for (let i = 0; i < maxItems; i++) {
        const item = generateRandomItem();
        
        // Auto-appraise and auto-sell based on upgrades
        if (gameState.upgrades.autoCommon && item.rarity === 'common') {
            const sellValue = item.baseValue * item.conditionMultiplier;
            totalCashEarned += sellValue;
        } else {
            offlineItems.push(item);
        }
    }
    
    // Update game state
    gameState.items = gameState.items.concat(offlineItems);
    gameState.cash += totalCashEarned;
    
    // Show offline progress modal
    showOfflineProgress(timeAwayMs, offlineItems.length, totalCashEarned);
}

function showOfflineProgress(timeAway, itemCount, cashEarned) {
    const modal = document.getElementById('offline-modal');
    const message = document.getElementById('offline-message');
    const itemsSpan = document.getElementById('offline-items');
    const cashSpan = document.getElementById('offline-cash');
    
    // Format time away
    const hours = Math.floor(timeAway / 3600000);
    const minutes = Math.floor((timeAway % 3600000) / 60000);
    let timeString = '';
    
    if (hours > 0) timeString += `${hours}h `;
    timeString += `${minutes}m`;
    
    message.textContent = `You were away for ${timeString}.`;
    itemsSpan.textContent = itemCount;
    cashSpan.textContent = `$${cashEarned}`;
    
    modal.classList.remove('hidden');
    
    // Auto-close after 5 seconds or on click
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 5000);
}

function startItemGeneration() {
    setInterval(() => {
        if (gameState.isPlaying && canGenerateItem()) {
            generateNewItem();
        }
    }, 1000); // Check every second
}

function canGenerateItem() {
    const now = Date.now();
    const timeSinceLastItem = (now - gameState.lastItemGeneration) / 1000;
    const requiredTime = getCurrentItemRate();
    
    return timeSinceLastItem >= requiredTime && 
           gameState.items.length < gameState.storageCapacity;
}

function getCurrentItemRate() {
    const speedUpgrades = gameState.upgrades.speed;
    const baseRate = CONFIG.baseItemRate;
    const reduction = speedUpgrades * 0.2; // 20% faster per upgrade
    return Math.max(CONFIG.minItemRate, baseRate * (1 - reduction));
}

function generateNewItem() {
    const newItem = generateRandomItem();
    gameState.items.push(newItem);
    gameState.lastItemGeneration = Date.now();
    
    // Update UI
    addItemToUI(newItem);
    updateUI();
    
    console.log(`📦 New item generated: ${newItem.name} (${newItem.rarity})`);
}

function startUIUpdate() {
    setInterval(() => {
        updateNextItemTimer();
    }, 1000);
}

function updateNextItemTimer() {
    const timerElement = document.getElementById('next-item-timer');
    if (!timerElement) return;
    
    if (!canGenerateItem() && gameState.items.length < gameState.storageCapacity) {
        const now = Date.now();
        const timeSinceLastItem = (now - gameState.lastItemGeneration) / 1000;
        const requiredTime = getCurrentItemRate();
        const timeRemaining = Math.max(0, Math.ceil(requiredTime - timeSinceLastItem));
        
        timerElement.textContent = timeRemaining;
    } else {
        timerElement.textContent = '--';
    }
}

function setupEventListeners() {
    // Offline modal
    document.getElementById('collect-offline')?.addEventListener('click', () => {
        document.getElementById('offline-modal').classList.add('hidden');
    });
    
    // Save/Reset buttons  
    document.getElementById('save-btn')?.addEventListener('click', () => {
        saveGameState();
        showNotification('💾 Game saved!');
    });
    
    document.getElementById('reset-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset? This will delete all progress!')) {
            resetGame();
        }
    });
    
    // Upgrade buttons
    document.querySelectorAll('.upgrade button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const upgradeType = e.target.closest('.upgrade').dataset.upgrade;
            purchaseUpgrade(upgradeType);
        });
    });
}

function purchaseUpgrade(upgradeType) {
    const cost = getUpgradeCost(upgradeType);
    
    if (gameState.cash < cost) {
        showNotification('💸 Not enough cash!');
        return;
    }
    
    // Spend cash
    gameState.cash -= cost;
    
    // Apply upgrade
    switch (upgradeType) {
        case 'speed':
            gameState.upgrades.speed++;
            break;
        case 'storage':
            gameState.upgrades.storage++;
            gameState.storageCapacity += CONFIG.storagePerUpgrade;
            break;
        case 'autoCommon':
            gameState.upgrades.autoCommon = true;
            break;
    }
    
    updateUI();
    saveGameState();
    showNotification(`✅ Upgrade purchased: ${upgradeType}!`);
}

function getUpgradeCost(upgradeType) {
    const costFunction = CONFIG.upgradeCosts[upgradeType];
    
    if (upgradeType === 'autoCommon') {
        return gameState.upgrades.autoCommon ? Infinity : costFunction;
    }
    
    return Math.floor(costFunction(gameState.upgrades[upgradeType]));
}

function addXP(amount) {
    gameState.appraisalXP += amount;
    
    // Check for level up
    while (gameState.appraisalXP >= CONFIG.getXPRequired(gameState.appraisalLevel)) {
        levelUp();
    }
    
    // Show XP gain animation
    const xpElement = document.getElementById('xp');
    xpElement?.classList.add('xp-gain');
    setTimeout(() => {
        xpElement?.classList.remove('xp-gain');
    }, 500);
    
    updateUI();
}

function levelUp() {
    gameState.appraisalLevel++;
    showNotification(`🎉 Level up! You are now level ${gameState.appraisalLevel}!`);
    
    // Level up animation
    const levelElement = document.getElementById('level');
    levelElement?.classList.add('level-up');
    setTimeout(() => {
        levelElement?.classList.remove('level-up');
    }, 1000);
    
    console.log(`📊 Level up! New level: ${gameState.appraisalLevel}`);
}

function showNotification(message) {
    // Simple notification system - could be enhanced later
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #228B22;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function resetGame() {
    localStorage.removeItem('thriftKingdomSave');
    location.reload();
}

// Export functions for use in other modules
window.gameState = gameState;
window.CONFIG = CONFIG;
window.addXP = addXP;
window.showNotification = showNotification;