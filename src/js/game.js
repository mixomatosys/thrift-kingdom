// Thrift Kingdom - Core Game Logic
// MVP v0.1

// Global Game State
let gameState = {
    // Player Resources
    cash: 0,
    
    // Skills (MVP focuses on Appraisal only)
    appraisalLevel: 1,
    appraisalXP: 0,
    
    // Items - now separated into different areas
    donationQueue: [],      // Items from donation sources
    mysteryItems: [],       // Items needing appraisal  
    stockItems: [],         // Appraised items in warehouse
    displayItems: [],       // Items in window display
    
    // New donation system
    donationContainers: [], // Available containers to sort
    currentContainer: null, // Container being sorted
    sortedItems: {          // Items sorted into categories
        media: [],
        electronics: [],
        clothing: [],
        housewares: []
    },
    
    // Donation flow management
    donationsOpen: false,      // Whether donations are flowing
    nextDonationTime: 0,       // When next donation arrives
    donationInterval: 45000,   // 45 seconds between donations
    
    storageCapacity: 50,
    
    // Game Settings  
    itemGenerationRate: 30, // seconds between items
    lastItemGeneration: Date.now(),
    lastSave: Date.now(),
    autoDonations: true,    // Auto-receive toggle
    
    // Upgrades
    upgrades: {
        speed: 0,        // Faster item generation
        storage: 0,      // More storage capacity
        autoCommon: false, // Auto-appraise common items
        autoDonations: false, // Auto-donation network
        appraisalTools: false // Professional tools
    },
    
    // Game State
    isPlaying: true,
    currentAppraisalItem: null,
    currentSection: 'donations' // Track current section
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
    setupSimpleDonationListeners();
    
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
    
    // Calculate total items across all areas
    const totalItems = gameState.donationQueue.length + 
                      gameState.mysteryItems.length + 
                      gameState.stockItems.length + 
                      gameState.displayItems.length;
    
    return timeSinceLastItem >= requiredTime && 
           totalItems < gameState.storageCapacity;
}

function getCurrentItemRate() {
    const speedUpgrades = gameState.upgrades.speed;
    const baseRate = CONFIG.baseItemRate;
    const reduction = speedUpgrades * 0.2; // 20% faster per upgrade
    return Math.max(CONFIG.minItemRate, baseRate * (1 - reduction));
}

function generateNewItem() {
    const newItem = generateRandomItem();
    gameState.donationQueue.push(newItem);
    gameState.lastItemGeneration = Date.now();
    
    // Update UI if we're on donations section
    if (gameState.currentSection === 'donations') {
        updateDonationsSection();
    }
    updateUI();
    
    showNotification(`📦 New donation: ${newItem.name}`);
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
    // Sidebar navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('.nav-btn').dataset.section;
            switchToSection(section);
        });
    });
    
    // Donation controls
    const autoToggle = document.getElementById('auto-donations');
    if (autoToggle) {
        autoToggle.addEventListener('change', (e) => {
            gameState.autoDonations = e.target.checked;
            if (gameState.autoDonations) {
                startItemGeneration();
                showNotification('🤖 Auto-donations enabled');
            } else {
                stopItemGeneration();
                showNotification('✋ Auto-donations disabled');
            }
            saveGameState();
        });
    }
    
    // Manual donation buttons
    document.getElementById('manual-search')?.addEventListener('click', () => {
        searchForItems();
    });
    
    document.getElementById('estate-sale')?.addEventListener('click', () => {
        checkEstateSale();
    });
    
    document.getElementById('garage-sale')?.addEventListener('click', () => {
        browseGarageSale();
    });
    
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
    document.querySelectorAll('.upgrade-card button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const upgradeType = e.target.closest('.upgrade-card').dataset.upgrade;
            purchaseUpgrade(upgradeType);
        });
    });
}

// Section switching functionality
function switchToSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active state from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Activate nav button
    const targetBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Update section-specific content
    updateSectionContent(sectionName);
    
    console.log(`📱 Switched to section: ${sectionName}`);
}

// Update content when switching sections
function updateSectionContent(sectionName) {
    switch(sectionName) {
        case 'donations':
            updateDonationsSection();
            break;
        case 'appraisal':
            updateAppraisalSection();
            break;
        case 'stock':
            updateStockSection();
            break;
        case 'window-display':
            updateWindowDisplaySection();
            break;
        case 'upgrades':
            updateUpgradesSection();
            break;
    }
}

// Manual item sourcing functions
function searchForItems() {
    if (gameState.cash < 10) {
        showNotification('💸 Need $10 to search for items!');
        return;
    }
    
    gameState.cash -= 10;
    const itemsFound = Math.floor(Math.random() * 3) + 1; // 1-3 items
    
    for (let i = 0; i < itemsFound; i++) {
        const item = generateRandomItem();
        gameState.items.push(item);
    }
    
    showNotification(`🔍 Found ${itemsFound} items for $10!`);
    updateUI();
    saveGameState();
}

function checkEstateSale() {
    if (gameState.cash < 25) {
        showNotification('💸 Need $25 to access estate sales!');
        return;
    }
    
    gameState.cash -= 25;
    const premium = Math.random() < 0.7; // 70% chance of premium item
    const item = premium ? generatePremiumItem() : generateRandomItem();
    
    gameState.items.push(item);
    
    const type = premium ? 'premium' : 'regular';
    showNotification(`🏠 Found a ${type} item at the estate sale!`);
    updateUI();
    saveGameState();
}

function browseGarageSale() {
    if (gameState.cash < 5) {
        showNotification('💸 Need $5 to browse garage sales!');
        return;
    }
    
    gameState.cash -= 5;
    const itemsFound = Math.floor(Math.random() * 4) + 2; // 2-5 items
    
    for (let i = 0; i < itemsFound; i++) {
        const item = generateRandomItem();
        // Garage sale items are more likely to be rough condition
        if (Math.random() < 0.6) {
            item.condition = 'rough';
            item.conditionMultiplier = CONDITIONS['rough'].multiplier;
        }
        gameState.items.push(item);
    }
    
    showNotification(`🚗 Found ${itemsFound} items at garage sales!`);
    updateUI();
    saveGameState();
}

// Enhanced item generation control
let itemGenerationInterval = null;

function startItemGeneration() {
    if (itemGenerationInterval) return; // Already running
    
    itemGenerationInterval = setInterval(() => {
        if (gameState.autoDonations && canGenerateItem()) {
            generateNewItem();
        }
    }, 1000);
}

function stopItemGeneration() {
    if (itemGenerationInterval) {
        clearInterval(itemGenerationInterval);
        itemGenerationInterval = null;
    }
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

// Section update functions
function updateDonationsSection() {
    const container = document.getElementById('donation-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.donationQueue.forEach(item => {
        const itemElement = createDonationItemCard(item);
        container.appendChild(itemElement);
    });
    
    // Update auto-donations toggle
    const toggle = document.getElementById('auto-donations');
    if (toggle) {
        toggle.checked = gameState.autoDonations;
    }
}

function updateAppraisalSection() {
    const container = document.getElementById('mystery-queue');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.mysteryItems.forEach(item => {
        const itemElement = createMysteryItemCard(item);
        container.appendChild(itemElement);
    });
}

function updateStockSection() {
    // Update stats
    document.getElementById('stock-count').textContent = gameState.stockItems.length;
    document.getElementById('storage-capacity').textContent = gameState.storageCapacity;
    
    const totalValue = gameState.stockItems.reduce((sum, item) => sum + getItemValue(item), 0);
    document.getElementById('estimated-value').textContent = `$${formatNumber(totalValue)}`;
    
    // Update inventory display
    const container = document.getElementById('inventory-display');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.stockItems.forEach(item => {
        const itemElement = createStockItemCard(item);
        container.appendChild(itemElement);
    });
}

function updateWindowDisplaySection() {
    // Update display slots
    gameState.displayItems.forEach((item, index) => {
        const slot = document.querySelector(`[data-slot="${index + 1}"] .slot-content`);
        if (slot && item) {
            slot.innerHTML = `
                <div class="display-item">
                    <div class="item-emoji">${item.emoji}</div>
                    <div class="item-name">${item.name}</div>
                </div>
            `;
        }
    });
    
    // Update bonuses (placeholder for now)
    const bonusList = document.querySelector('.bonus-list');
    if (bonusList) {
        if (gameState.displayItems.length === 0) {
            bonusList.innerHTML = '<div class="bonus-item">No bonuses active</div>';
        } else {
            bonusList.innerHTML = `
                <div class="bonus-item">Display Bonus: +${gameState.displayItems.length * 5}% customer attraction</div>
            `;
        }
    }
}

function updateUpgradesSection() {
    // Update upgrade costs and availability
    document.querySelectorAll('.upgrade-card').forEach(card => {
        const upgradeType = card.dataset.upgrade;
        const costElement = card.querySelector('.upgrade-cost span');
        const button = card.querySelector('button');
        
        if (costElement && button) {
            const cost = getUpgradeCost(upgradeType);
            const canAfford = gameState.cash >= cost;
            const isOwned = gameState.upgrades[upgradeType];
            
            costElement.textContent = isOwned ? 'OWNED' : formatNumber(cost);
            button.textContent = isOwned ? 'Owned' : 'Upgrade';
            button.disabled = !canAfford || isOwned;
        }
    });
}

// Item card creation functions
function createDonationItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card donation-item';
    card.dataset.itemId = item.id;
    
    card.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-actions">
            <button class="btn small" onclick="moveToAppraisal('${item.id}')">
                🔍 Appraise
            </button>
        </div>
    `;
    
    return card;
}

function createMysteryItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card mystery-item';
    card.dataset.itemId = item.id;
    
    card.innerHTML = `
        <div class="item-emoji">❓</div>
        <div class="item-name">Mystery ${item.category}</div>
        <div class="item-actions">
            <button class="btn small" onclick="startAppraisalMiniGame('${item.id}')">
                🔍 Examine
            </button>
        </div>
    `;
    
    return card;
}

function createStockItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card stock-item';
    card.dataset.itemId = item.id;
    
    card.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-value">$${getItemValue(item)}</div>
        <div class="item-rarity" style="color: ${getRarityColor(item.rarity)}">
            ${item.rarity.toUpperCase()}
        </div>
        <div class="item-actions">
            <button class="btn small" onclick="moveToDisplay('${item.id}')">
                🪟 Display
            </button>
            <button class="btn small" onclick="sellDirectly('${item.id}')">
                💰 Sell
            </button>
        </div>
    `;
    
    return card;
}

// Item movement functions
function moveToAppraisal(itemId) {
    const itemIndex = gameState.donationQueue.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    const item = gameState.donationQueue.splice(itemIndex, 1)[0];
    gameState.mysteryItems.push(item);
    
    updateUI();
    showNotification(`📦 Moved ${item.name} to appraisal queue`);
    saveGameState();
}

function moveToStock(item) {
    // Remove from mystery items
    const mysteryIndex = gameState.mysteryItems.findIndex(i => i.id === item.id);
    if (mysteryIndex !== -1) {
        gameState.mysteryItems.splice(mysteryIndex, 1);
    }
    
    // Add to stock
    gameState.stockItems.push(item);
    
    updateUI();
    showNotification(`📋 ${item.name} moved to stock`);
    saveGameState();
}

function moveToDisplay(itemId) {
    const itemIndex = gameState.stockItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    if (gameState.displayItems.length >= 3) {
        showNotification('🪟 Display is full! Remove an item first.');
        return;
    }
    
    const item = gameState.stockItems.splice(itemIndex, 1)[0];
    gameState.displayItems.push(item);
    
    updateUI();
    showNotification(`🪟 ${item.name} added to window display`);
    saveGameState();
}

function sellDirectly(itemId) {
    const itemIndex = gameState.stockItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    const item = gameState.stockItems.splice(itemIndex, 1)[0];
    const value = getItemValue(item);
    gameState.cash += value;
    
    updateUI();
    showNotification(`💰 Sold ${item.name} for $${value}!`);
    saveGameState();
}

function resetGame() {
    localStorage.removeItem('thriftKingdomSave');
    location.reload();
}

// Donation System Functions

function setupSimpleDonationListeners() {
    console.log('Setting up simplified donation event listeners...');
    
    // Category sorting buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            console.log('Category button clicked:', category);
            window.sortItemToCategory(category);
        });
    });
    
    // Toss item button
    const tossBtn = document.getElementById('toss-item');
    if (tossBtn) {
        tossBtn.addEventListener('click', () => {
            console.log('Toss button clicked');
            window.tossCurrentItem();
        });
    }
    
    // Move to stock button
    const moveToStockBtn = document.getElementById('move-to-stock');
    if (moveToStockBtn) {
        moveToStockBtn.addEventListener('click', () => {
            console.log('Move to stock clicked');
            window.moveAllToStock();
        });
    }
    
    console.log('✅ Event listeners set up successfully');
}

// These complex functions removed - using simplified approach above

// Simplified donation system that actually works
function openDonations() {
    console.log('=== OPENING DONATIONS ===');
    
    // Clear existing containers
    gameState.donationContainers = [];
    
    // Early level donation sources (common items only)
    const earlyDonationSources = [
        {
            icon: '🏠',
            title: 'Garage Sale Box',
            description: 'Mixed household items from weekend garage sale',
            itemCount: Math.floor(Math.random() * 3) + 3, // 3-5 items
        },
        {
            icon: '📦',
            title: 'Attic Cleanout',
            description: 'Old items cleared from family attic',
            itemCount: Math.floor(Math.random() * 4) + 2, // 2-5 items
        },
        {
            icon: '🎁',
            title: 'Moving Sale Donation',
            description: 'Items from someone moving apartments',
            itemCount: Math.floor(Math.random() * 3) + 4, // 4-6 items
        },
        {
            icon: '📚',
            title: 'Spring Cleaning Box',
            description: 'Household decluttering donation',
            itemCount: Math.floor(Math.random() * 2) + 3, // 3-4 items
        }
    ];
    
    // Generate 1-2 containers (keep it manageable)
    const numContainers = Math.floor(Math.random() * 2) + 1;
    console.log(`Generating ${numContainers} donation containers...`);
    
    for (let i = 0; i < numContainers; i++) {
        const source = earlyDonationSources[Math.floor(Math.random() * earlyDonationSources.length)];
        const container = {
            id: Date.now() + i,
            icon: source.icon,
            title: source.title,
            description: source.description,
            itemCount: source.itemCount,
            items: generateCommonItems(source.itemCount)
        };
        
        gameState.donationContainers.push(container);
        console.log('Created container:', container.title, `(${container.itemCount} items)`);
    }
    
    // Update the display using working method
    updateDonationContainers();
    
    const statusEl = document.getElementById('donation-status');
    if (statusEl) statusEl.textContent = `📦 ${numContainers} donation container${numContainers > 1 ? 's' : ''} arrived! Click to sort.`;
    
    showNotification(`📥 ${numContainers} new donation container${numContainers > 1 ? 's' : ''} arrived!`);
    saveGameState();
}

function generateCommonItems(count) {
    const commonItemTypes = [
        // Clothing (common, low value)
        { emoji: '👕', names: ['T-Shirt', 'Polo Shirt', 'Sweater', 'Blouse'], category: 'clothing', baseValue: [2, 8] },
        { emoji: '👖', names: ['Jeans', 'Pants', 'Shorts', 'Skirt'], category: 'clothing', baseValue: [3, 12] },
        { emoji: '👟', names: ['Sneakers', 'Sandals', 'Boots', 'Slippers'], category: 'clothing', baseValue: [5, 15] },
        
        // Housewares (common, low value)
        { emoji: '🍽️', names: ['Plate Set', 'Coffee Mug', 'Bowl', 'Silverware'], category: 'housewares', baseValue: [1, 6] },
        { emoji: '🕯️', names: ['Candle', 'Picture Frame', 'Vase', 'Decorative Bowl'], category: 'housewares', baseValue: [2, 8] },
        { emoji: '🧺', names: ['Basket', 'Storage Box', 'Lamp', 'Clock'], category: 'housewares', baseValue: [3, 10] },
        
        // Media (common, low value)
        { emoji: '📚', names: ['Paperback Book', 'Magazine', 'Cookbook', 'Novel'], category: 'media', baseValue: [1, 4] },
        { emoji: '💿', names: ['CD Album', 'DVD Movie', 'Audio Book', 'Game'], category: 'media', baseValue: [2, 8] },
        
        // Electronics (common, older items)
        { emoji: '📻', names: ['Old Radio', 'Calculator', 'Digital Clock', 'Flashlight'], category: 'electronics', baseValue: [3, 12] },
        { emoji: '🔌', names: ['Phone Charger', 'Extension Cord', 'Power Strip', 'Cable'], category: 'electronics', baseValue: [2, 6] }
    ];
    
    const items = [];
    for (let i = 0; i < count; i++) {
        const itemType = commonItemTypes[Math.floor(Math.random() * commonItemTypes.length)];
        const name = itemType.names[Math.floor(Math.random() * itemType.names.length)];
        const baseValue = Math.floor(Math.random() * (itemType.baseValue[1] - itemType.baseValue[0] + 1)) + itemType.baseValue[0];
        
        // Only common condition and rarity for early game
        const conditions = ['rough', 'fair', 'good'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        const conditionMultipliers = { rough: 0.5, fair: 0.8, good: 1.0 };
        const finalValue = Math.max(1, Math.floor(baseValue * conditionMultipliers[condition]));
        
        items.push({
            id: Date.now() + i + Math.random(),
            name: name,
            emoji: itemType.emoji,
            category: itemType.category,
            value: finalValue,
            rarity: 'common',
            condition: condition
        });
    }
    
    return items;
}

function updateDonationContainers() {
    const container = document.getElementById('donation-containers');
    if (!container) {
        console.error('❌ Could not find donation-containers element');
        return;
    }
    
    if (gameState.donationContainers.length === 0) {
        container.innerHTML = `
            <div class="no-donations">
                <p>No donation containers yet. Click "Open Donations" to start!</p>
            </div>
        `;
        return;
    }
    
    console.log(`Displaying ${gameState.donationContainers.length} containers`);
    
    let containerHTML = '';
    gameState.donationContainers.forEach((donationContainer) => {
        containerHTML += `
            <div class="donation-container" onclick="window.openContainer(${donationContainer.id})">
                <span class="container-icon">${donationContainer.icon}</span>
                <div class="container-title">${donationContainer.title}</div>
                <div class="container-desc">${donationContainer.description}</div>
                <div class="container-items">${donationContainer.itemCount} items</div>
            </div>
        `;
    });
    
    container.innerHTML = containerHTML;
    console.log('✅ Containers displayed successfully');
}

function openContainer(containerId) {
    console.log('Opening container:', containerId);
    const container = gameState.donationContainers.find(c => c.id == containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    // Start sorting process
    startSorting(container);
    
    // Remove from available containers
    gameState.donationContainers = gameState.donationContainers.filter(c => c.id != containerId);
    updateDonationContainers();
}

function startSorting(container) {
    console.log('Starting sorting for:', container.title);
    
    gameState.currentContainer = container;
    gameState.currentSortingItems = [...container.items];
    gameState.currentSortingIndex = 0;
    
    // Show sorting interface
    const sortingContent = document.querySelector('.sorting-content');
    if (sortingContent) {
        sortingContent.style.display = 'block';
    }
    
    // Update container info
    const titleEl = document.getElementById('current-container-title');
    const descEl = document.getElementById('current-container-desc');
    if (titleEl) titleEl.textContent = `${container.icon} ${container.title}`;
    if (descEl) descEl.textContent = container.description;
    
    // Show first item
    showNextItem();
    
    showNotification(`📦 Started sorting ${container.title} - ${container.itemCount} items to sort!`);
}

function showNextItem() {
    if (!gameState.currentSortingItems || gameState.currentSortingIndex >= gameState.currentSortingItems.length) {
        finishSorting();
        return;
    }
    
    const item = gameState.currentSortingItems[gameState.currentSortingIndex];
    gameState.currentSortingItem = item;
    
    // Update item display
    const itemDisplay = document.getElementById('current-item');
    if (itemDisplay) {
        itemDisplay.innerHTML = `
            <span class="item-emoji">${item.emoji}</span>
            <div class="item-name">${item.name}</div>
            <div class="item-value">$${item.value}</div>
            <div class="item-details">${item.rarity} • ${item.condition}</div>
        `;
    }
    
    // Update progress
    const progressFill = document.getElementById('sorting-progress-fill');
    const progressText = document.getElementById('sorting-progress-text');
    
    const progress = ((gameState.currentSortingIndex + 1) / gameState.currentSortingItems.length) * 100;
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `Item ${gameState.currentSortingIndex + 1} of ${gameState.currentSortingItems.length}`;
}

function finishSorting() {
    console.log('Finished sorting container');
    
    gameState.currentContainer = null;
    gameState.currentSortingItems = null;
    gameState.currentSortingIndex = 0;
    gameState.currentSortingItem = null;
    
    // Hide sorting interface
    const sortingContent = document.querySelector('.sorting-content');
    if (sortingContent) {
        sortingContent.style.display = 'none';
    }
    
    // Reset item display
    const itemDisplay = document.getElementById('current-item');
    if (itemDisplay) {
        itemDisplay.innerHTML = `
            <div class="placeholder-content">
                <span class="placeholder-icon">📦</span>
                <div class="placeholder-text">Open a donation container to start sorting</div>
            </div>
        `;
    }
    
    showNotification('✅ Finished sorting! Items organized by category.');
}

// Category sorting functions (simplified)
window.sortItemToCategory = function(category) {
    if (!gameState.currentSortingItem) return;
    
    console.log(`Sorting ${gameState.currentSortingItem.name} to ${category}`);
    
    if (!gameState.sortedItems[category]) {
        gameState.sortedItems[category] = [];
    }
    
    gameState.sortedItems[category].push(gameState.currentSortingItem);
    gameState.currentSortingIndex++;
    showNextItem();
    updateCategoryDisplay();
    showNotification(`✅ Sorted ${gameState.currentSortingItem.name} to ${category}`);
};

window.tossCurrentItem = function() {
    if (!gameState.currentSortingItem) return;
    
    console.log(`Tossing ${gameState.currentSortingItem.name}`);
    gameState.currentSortingIndex++;
    showNextItem();
    showNotification('🗑️ Item discarded');
};

window.moveAllToStock = function() {
    let totalMoved = 0;
    Object.values(gameState.sortedItems).forEach(categoryItems => {
        totalMoved += categoryItems.length;
        gameState.stockItems.push(...categoryItems);
    });
    
    // Clear sorted items
    gameState.sortedItems = {
        media: [],
        electronics: [],
        clothing: [],
        housewares: []
    };
    
    updateCategoryDisplay();
    showNotification(`📦 Moved ${totalMoved} items to stock!`);
    saveGameState();
};

function updateCategoryDisplay() {
    ['media', 'electronics', 'clothing', 'housewares'].forEach(category => {
        const countElement = document.getElementById(`${category}-count`);
        const itemsElement = document.getElementById(`${category}-items`);
        
        if (countElement && itemsElement) {
            const categoryItems = gameState.sortedItems[category] || [];
            countElement.textContent = categoryItems.length;
            
            itemsElement.innerHTML = '';
            categoryItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'sorted-item';
                itemElement.innerHTML = `
                    <span class="item-emoji">${item.emoji}</span>
                    <span class="item-name">${item.name}</span>
                `;
                itemsElement.appendChild(itemElement);
            });
        }
    });
}

// Export functions for use in other modules
window.gameState = gameState;
window.CONFIG = CONFIG;
window.addXP = addXP;
window.showNotification = showNotification;
window.switchToSection = switchToSection;
window.moveToAppraisal = moveToAppraisal;
window.moveToStock = moveToStock;
window.moveToDisplay = moveToDisplay;
window.sellDirectly = sellDirectly;
window.openDonations = openDonations;
window.openContainer = openContainer;
window.sortItemToCategory = sortItemToCategory;
window.tossCurrentItem = tossCurrentItem;
window.moveAllToStock = moveAllToStock;