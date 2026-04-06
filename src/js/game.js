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
    donationsOpen: false,      // Whether donations are open for business
    nextDonationTime: 0,       // When next donation arrives
    donationInterval: 60000,   // 60 seconds between donations
    
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
    startDonationTimer();
    
    // Setup event listeners
    setupEventListeners();
    setupSimpleDonationListeners();
    
    // Initial UI update
    updateUI();
    updateDonationButton();
    
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

// Toggle donation system
function toggleDonations() {
    console.log('=== TOGGLING DONATIONS ===');
    
    if (gameState.donationsOpen) {
        // Close donations
        gameState.donationsOpen = false;
        gameState.nextDonationTime = 0;
        updateDonationButton();
        showNotification('📦 Donation flow closed.');
    } else {
        // Open donations
        gameState.donationsOpen = true;
        gameState.nextDonationTime = Date.now() + gameState.donationInterval;
        updateDonationButton();
        openDonations();
        showNotification('📥 Donations open! First container generated, more every 60 seconds.');
    }
}

// Generate donation containers
function openDonations() {
    console.log('=== GENERATING DONATION CONTAINERS ===');
    
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
    
    saveGameState();
}

function generateCommonItems(count) {
    const itemTypes = [
        // Clothing - with brand variations for different rarities
        { emoji: '👕', names: {
            common: ['T-Shirt', 'Basic Polo', 'Generic Sweater'],
            uncommon: ['Nike Shirt', 'Adidas Polo', 'Brand Name Hoodie'],
            rare: ['Vintage Band Shirt', '1990s Champion Hoodie', 'Designer Blouse']
        }, category: 'clothing' },
        
        { emoji: '👖', names: {
            common: ['Jeans', 'Khaki Pants', 'Basic Shorts'],
            uncommon: ['Levi\'s Jeans', 'Brand Name Pants', 'Designer Shorts'],
            rare: ['Vintage Levi\'s 501', 'Designer Jeans', 'Collectible Denim']
        }, category: 'clothing' },
        
        { emoji: '👟', names: {
            common: ['Generic Sneakers', 'Basic Sandals', 'Work Boots'],
            uncommon: ['Nike Sneakers', 'Adidas Shoes', 'Brand Boots'],
            rare: ['Vintage Jordans', 'Limited Edition Sneakers', 'Designer Shoes']
        }, category: 'clothing' },
        
        // Housewares
        { emoji: '🍽️', names: {
            common: ['Plate Set', 'Coffee Mug', 'Plastic Bowl'],
            uncommon: ['Ceramic Dinnerware', 'Branded Mug', 'Glass Bowl Set'],
            rare: ['Vintage China', 'Antique Dinnerware', 'Collector Plates']
        }, category: 'housewares' },
        
        { emoji: '🕯️', names: {
            common: ['Candle', 'Basic Frame', 'Simple Vase'],
            uncommon: ['Scented Candle', 'Nice Frame', 'Ceramic Vase'],
            rare: ['Antique Candlestick', 'Vintage Frame', 'Art Glass Vase']
        }, category: 'housewares' },
        
        // Media
        { emoji: '📚', names: {
            common: ['Paperback Book', 'Magazine', 'Cookbook'],
            uncommon: ['Hardcover Book', 'Collectible Magazine', 'Specialty Cookbook'],
            rare: ['First Edition Book', 'Vintage Magazine', 'Rare Cookbook']
        }, category: 'media' },
        
        { emoji: '💿', names: {
            common: ['CD Album', 'DVD Movie', 'Basic Game'],
            uncommon: ['Popular CD', 'Special Edition DVD', 'Brand Name Game'],
            rare: ['Rare CD', 'Collector DVD', 'Vintage Video Game']
        }, category: 'media' },
        
        // Electronics
        { emoji: '📻', names: {
            common: ['Old Radio', 'Calculator', 'Digital Clock'],
            uncommon: ['Vintage Radio', 'Scientific Calculator', 'Alarm Clock'],
            rare: ['Antique Radio', 'Rare Calculator', 'Vintage Electronics']
        }, category: 'electronics' },
        
        { emoji: '🔌', names: {
            common: ['Phone Charger', 'Extension Cord', 'Basic Cable'],
            uncommon: ['Fast Charger', 'Heavy Duty Cord', 'Premium Cable'],
            rare: ['Vintage Charger', 'Rare Cable', 'Collector Electronics']
        }, category: 'electronics' }
    ];
    
    // Rarity distribution for early game (weighted toward common)
    const rarityDistribution = [
        { rarity: 'common', weight: 70, baseMultiplier: [1, 8] },
        { rarity: 'uncommon', weight: 25, baseMultiplier: [8, 25] },
        { rarity: 'rare', weight: 5, baseMultiplier: [25, 75] }
    ];
    
    // Quality conditions with multipliers
    const qualityDistribution = [
        { quality: 'rough', weight: 15, multiplier: 0.3, color: '🔴' },
        { quality: 'poor', weight: 20, multiplier: 0.5, color: '🟠' },
        { quality: 'ok', weight: 30, multiplier: 0.7, color: '🟡' },
        { quality: 'good', weight: 25, multiplier: 1.0, color: '🟢' },
        { quality: 'excellent', weight: 8, multiplier: 1.3, color: '🔵' },
        { quality: 'mint', weight: 2, multiplier: 1.6, color: '🟣' }
    ];
    
    const items = [];
    for (let i = 0; i < count; i++) {
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        // Select rarity (weighted random)
        const rarity = selectWeightedRandom(rarityDistribution);
        
        // Select quality (weighted random)  
        const quality = selectWeightedRandom(qualityDistribution);
        
        // Get name based on rarity
        const namesByRarity = itemType.names[rarity.rarity] || itemType.names.common;
        const name = namesByRarity[Math.floor(Math.random() * namesByRarity.length)];
        
        // Calculate base value from rarity
        const rarityData = rarityDistribution.find(r => r.rarity === rarity.rarity);
        const baseValue = Math.floor(Math.random() * (rarityData.baseMultiplier[1] - rarityData.baseMultiplier[0] + 1)) + rarityData.baseMultiplier[0];
        
        items.push({
            id: Date.now() + i + Math.random(),
            name: name,
            emoji: itemType.emoji,
            category: itemType.category,
            rarity: rarity.rarity,
            quality: quality.quality,
            qualityColor: quality.color,
            qualityMultiplier: quality.multiplier,
            baseValue: baseValue,
            isAppraised: false // Hidden until appraised
        });
    }
    
    return items;
}

function selectWeightedRandom(options) {
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const option of options) {
        if (random < option.weight) {
            return option;
        }
        random -= option.weight;
    }
    
    return options[0]; // fallback
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
    
    // Update item display - NO VALUE shown until appraised
    const itemDisplay = document.getElementById('current-item');
    if (itemDisplay) {
        const rarityColors = {
            'common': '🟫',
            'uncommon': '🟩', 
            'rare': '🟦',
            'epic': '🟪',
            'legendary': '🟨'
        };
        
        itemDisplay.innerHTML = `
            <span class="item-emoji">${item.emoji}</span>
            <div class="item-name">${item.name}</div>
            <div class="item-rarity">${rarityColors[item.rarity]} ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
            <div class="item-quality">${item.qualityColor} ${item.quality.charAt(0).toUpperCase() + item.quality.slice(1)} condition</div>
            <div class="item-value-hint">Value: ❓ (Requires appraisal)</div>
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
    
    // Hide only the sorting interface part, keep category areas visible
    const sortingInterface = document.querySelector('.sorting-interface');
    if (sortingInterface) {
        sortingInterface.style.display = 'none';
    }
    
    // Hide container info
    const containerInfo = document.querySelector('.container-info');
    if (containerInfo) {
        containerInfo.style.display = 'none';
    }
    
    // Update workspace header
    const workspaceHeader = document.querySelector('.workspace-header h3');
    const workspaceDesc = document.querySelector('.workspace-header p');
    if (workspaceHeader) workspaceHeader.textContent = '✅ Sorting Complete';
    if (workspaceDesc) workspaceDesc.textContent = 'Items sorted into categories. Click "Move to Stock" when ready.';
    
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
    let totalValue = 0;
    
    Object.values(gameState.sortedItems).forEach(categoryItems => {
        categoryItems.forEach(item => {
            // Auto-appraise when moving to stock
            const value = appraiseItem(item);
            totalValue += value;
            gameState.stockItems.push(item);
            totalMoved++;
        });
    });
    
    // Clear sorted items
    gameState.sortedItems = {
        media: [],
        electronics: [],
        clothing: [],
        housewares: []
    };
    
    updateCategoryDisplay();
    showNotification(`📦 Moved ${totalMoved} items to stock! Total appraised value: $${totalValue}`);
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
                const rarityColors = {
                    'common': '🟫',
                    'uncommon': '🟩', 
                    'rare': '🟦',
                    'epic': '🟪',
                    'legendary': '🟨'
                };
                
                const itemElement = document.createElement('div');
                itemElement.className = 'sorted-item';
                itemElement.innerHTML = `
                    <span class="item-emoji">${item.emoji}</span>
                    <div class="sorted-item-info">
                        <span class="item-name">${item.name}</span>
                        <div class="item-details">${rarityColors[item.rarity]} ${item.rarity} • ${item.qualityColor} ${item.quality}</div>
                    </div>
                `;
                itemsElement.appendChild(itemElement);
            });
        }
    });
}

function calculateItemValue(item) {
    // Calculate final value = base value × quality multiplier
    return Math.max(1, Math.floor(item.baseValue * item.qualityMultiplier));
}

function appraiseItem(item) {
    // Mark as appraised and calculate final value
    item.isAppraised = true;
    item.finalValue = calculateItemValue(item);
    return item.finalValue;
}

function updateDonationButton() {
    const button = document.getElementById('toggle-donations');
    const status = document.getElementById('donation-status');
    const timer = document.getElementById('donation-timer');
    
    if (!button) return;
    
    if (gameState.donationsOpen) {
        button.textContent = '📦 Close Donations';
        button.classList.add('donations-open');
        if (timer) timer.style.display = 'block';
        if (status) status.textContent = '🟢 Donations flowing! New containers arrive automatically every 60 seconds.';
    } else {
        button.textContent = '📥 Open Donations';
        button.classList.remove('donations-open');
        if (timer) timer.style.display = 'none';
        if (status) status.textContent = 'Click to start receiving donation containers';
    }
}

function updateDonationTimer() {
    if (!gameState.donationsOpen) return;
    
    const now = Date.now();
    const timeLeft = Math.max(0, gameState.nextDonationTime - now);
    const progress = Math.max(0, (gameState.donationInterval - timeLeft) / gameState.donationInterval * 100);
    
    // Update timer display
    const timerProgress = document.getElementById('timer-progress');
    const timerText = document.getElementById('timer-text');
    
    if (timerProgress) {
        timerProgress.style.width = `${progress}%`;
    }
    
    if (timerText) {
        const seconds = Math.ceil(timeLeft / 1000);
        timerText.textContent = `${seconds}s`;
    }
    
    // Generate new container when timer expires
    if (timeLeft <= 0 && gameState.donationsOpen) {
        console.log('Timer expired, generating new container...');
        openDonations(); // Generate new containers
        gameState.nextDonationTime = now + gameState.donationInterval; // Reset timer
        showNotification('📦 New donation container arrived!');
        saveGameState();
    }
}

function startDonationTimer() {
    setInterval(() => {
        updateDonationTimer();
    }, 100); // Update every 100ms for smooth progress bar
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
window.toggleDonations = toggleDonations;
window.openContainer = openContainer;
window.sortItemToCategory = sortItemToCategory;
window.tossCurrentItem = tossCurrentItem;
window.moveAllToStock = moveAllToStock;