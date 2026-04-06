// Thrift Kingdom - Item System
// Handles item generation, properties, and appraisal mini-game

// Item Database
const ITEM_DATABASE = {
    clothing: {
        common: [
            { name: "Vintage T-Shirt", emoji: "👕", baseValue: 2 },
            { name: "Denim Jacket", emoji: "🧥", baseValue: 8 },
            { name: "Cotton Sweater", emoji: "👔", baseValue: 5 },
            { name: "Plain Jeans", emoji: "👖", baseValue: 6 }
        ],
        uncommon: [
            { name: "Designer Blouse", emoji: "👚", baseValue: 18 },
            { name: "Leather Boots", emoji: "👢", baseValue: 25 },
            { name: "Wool Coat", emoji: "🧥", baseValue: 35 }
        ],
        rare: [
            { name: "Vintage Band Tee", emoji: "👕", baseValue: 75 },
            { name: "Designer Dress", emoji: "👗", baseValue: 120 }
        ]
    },
    
    electronics: {
        common: [
            { name: "Old Radio", emoji: "📻", baseValue: 3 },
            { name: "Calculator", emoji: "🔢", baseValue: 4 },
            { name: "Digital Clock", emoji: "⏰", baseValue: 6 }
        ],
        uncommon: [
            { name: "Vintage Camera", emoji: "📷", baseValue: 45 },
            { name: "Record Player", emoji: "🎵", baseValue: 65 },
            { name: "Game Console", emoji: "🎮", baseValue: 85 }
        ],
        rare: [
            { name: "Tube Amplifier", emoji: "📡", baseValue: 350 },
            { name: "Vintage Synthesizer", emoji: "🎹", baseValue: 850 }
        ]
    },
    
    media: {
        common: [
            { name: "Paperback Novel", emoji: "📖", baseValue: 1 },
            { name: "CD Album", emoji: "💿", baseValue: 3 },
            { name: "VHS Movie", emoji: "📼", baseValue: 2 }
        ],
        uncommon: [
            { name: "Vinyl Record", emoji: "💽", baseValue: 15 },
            { name: "First Edition Book", emoji: "📚", baseValue: 40 },
            { name: "Rare DVD", emoji: "📀", baseValue: 25 }
        ],
        rare: [
            { name: "Signed Album", emoji: "💽", baseValue: 200 },
            { name: "Original Manuscript", emoji: "📜", baseValue: 500 }
        ]
    },
    
    housewares: {
        common: [
            { name: "Coffee Mug", emoji: "☕", baseValue: 2 },
            { name: "Picture Frame", emoji: "🖼️", baseValue: 4 },
            { name: "Kitchen Scale", emoji: "⚖️", baseValue: 8 }
        ],
        uncommon: [
            { name: "Ceramic Vase", emoji: "🏺", baseValue: 30 },
            { name: "Silver Cutlery", emoji: "🍴", baseValue: 55 },
            { name: "Antique Lamp", emoji: "💡", baseValue: 45 }
        ],
        rare: [
            { name: "Crystal Chandelier", emoji: "✨", baseValue: 400 },
            { name: "Grandfather Clock", emoji: "🕰️", baseValue: 800 }
        ]
    }
};

// Rarity Distribution
const RARITY_WEIGHTS = {
    common: 55,    // 55%
    uncommon: 28,  // 28%  
    rare: 17       // 17%
};

// Condition levels and multipliers
const CONDITIONS = {
    rough: { name: "Rough", multiplier: 0.3, emoji: "😞" },
    good: { name: "Good", multiplier: 0.7, emoji: "🙂" },
    excellent: { name: "Excellent", multiplier: 1.0, emoji: "😊" },
    mint: { name: "Mint", multiplier: 1.4, emoji: "🤩" }
};

// Item generation functions
function generateRandomItem() {
    const category = getRandomCategory();
    const rarity = getRandomRarity();
    const condition = getRandomCondition();
    const template = getRandomItemTemplate(category, rarity);
    
    const item = {
        id: Date.now() + Math.random(), // Simple unique ID
        category: category,
        rarity: rarity,
        condition: condition,
        name: template.name,
        emoji: template.emoji,
        baseValue: template.baseValue,
        conditionMultiplier: CONDITIONS[condition].multiplier,
        isAppraised: false,
        isMystery: Math.random() < 0.3 // 30% chance to be mystery
    };
    
    return item;
}

function getRandomCategory() {
    const categories = Object.keys(ITEM_DATABASE);
    return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomRarity() {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        random -= weight;
        if (random <= 0) return rarity;
    }
    
    return 'common'; // fallback
}

function getRandomCondition() {
    const conditions = Object.keys(CONDITIONS);
    const weights = [40, 35, 20, 5]; // Rough, Good, Excellent, Mint percentages
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < conditions.length; i++) {
        random -= weights[i];
        if (random <= 0) return conditions[i];
    }
    
    return 'good'; // fallback
}

function getRandomItemTemplate(category, rarity) {
    const items = ITEM_DATABASE[category][rarity];
    return items[Math.floor(Math.random() * items.length)];
}

function getItemValue(item) {
    return Math.floor(item.baseValue * item.conditionMultiplier);
}

function getItemDisplayValue(item) {
    if (!item.isAppraised) {
        return "???";
    }
    return `$${getItemValue(item)}`;
}

function getRarityColor(rarity) {
    switch (rarity) {
        case 'common': return '#888';
        case 'uncommon': return '#4CAF50';
        case 'rare': return '#2196F3';
        case 'epic': return '#9C27B0';
        case 'legendary': return '#FF9800';
        default: return '#888';
    }
}

// Appraisal Mini-Game System
let currentAppraisal = null;

function startAppraisalMiniGame(itemId) {
    // Find item in mystery queue
    let item = gameState.mysteryItems.find(i => i.id === itemId);
    if (!item) {
        showNotification('❌ Item not found in appraisal queue');
        return;
    }
    
    if (item.isAppraised) {
        // Already appraised, move to stock
        moveToStock(item);
        return;
    }
    
    // Auto-appraise commons if upgrade is owned
    if (gameState.upgrades.autoCommon && item.rarity === 'common') {
        appriseItemAutomatically(item);
        return;
    }
    
    // Start mini-game
    currentAppraisal = {
        item: item,
        startTime: Date.now(),
        spotsExamined: [],
        timeLimit: 30000, // 30 seconds
        cluesFound: []
    };
    
    showAppraisalGame(item);
}

function showAppraisalGame(item) {
    const gameModal = document.getElementById('appraisal-game');
    const itemImage = document.getElementById('mystery-item-image');
    const timer = document.getElementById('appraisal-timer');
    
    // Setup item display
    itemImage.src = `data:image/svg+xml,${encodeURIComponent(createItemSVG(item))}`;
    itemImage.alt = "Mystery Item";
    
    // Reset examination spots
    document.querySelectorAll('.examine-spot').forEach(spot => {
        spot.classList.remove('examined');
        spot.addEventListener('click', handleSpotClick);
    });
    
    // Reset clues
    document.querySelectorAll('.clue').forEach(clue => {
        clue.classList.add('hidden');
        clue.classList.remove('revealed');
    });
    
    // Reset value buttons
    document.querySelectorAll('.value-btn').forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.addEventListener('click', handleValueGuess);
    });
    
    gameModal.classList.remove('hidden');
    
    // Start timer
    startAppraisalTimer();
}

function createItemSVG(item) {
    // Simple SVG placeholder - in a real game, you'd have actual images
    return `
        <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">
            <rect width="160" height="160" fill="#f0f0f0" stroke="#ccc" stroke-width="2" rx="10"/>
            <text x="80" y="90" text-anchor="middle" font-size="48" fill="#333">${item.emoji}</text>
            <text x="80" y="130" text-anchor="middle" font-size="12" fill="#666">Tap spots to examine</text>
        </svg>
    `;
}

function handleSpotClick(event) {
    const spot = event.target;
    const spotType = spot.dataset.spot;
    
    if (spot.classList.contains('examined')) return;
    
    spot.classList.add('examined');
    currentAppraisal.spotsExamined.push(spotType);
    
    // Reveal corresponding clue
    revealClue(spotType);
    
    // Check if all spots examined
    if (currentAppraisal.spotsExamined.length >= 3) {
        // All clues revealed, enable value guessing
        document.querySelector('.appraisal-question').style.opacity = '1';
    }
}

function revealClue(spotType) {
    const item = currentAppraisal.item;
    const clueElement = document.getElementById(`clue-${spotType}`);
    
    if (!clueElement) return;
    
    let clueText = '';
    switch (spotType) {
        case 'maker':
            clueText = `Maker: ${getItemMaker(item)}`;
            break;
        case 'condition': 
            clueText = `Condition: ${CONDITIONS[item.condition].name} ${CONDITIONS[item.condition].emoji}`;
            break;
        case 'age':
            clueText = `Era: ${getItemEra(item)}`;
            break;
    }
    
    clueElement.textContent = clueText;
    clueElement.classList.remove('hidden');
    clueElement.classList.add('revealed');
    
    currentAppraisal.cluesFound.push(spotType);
}

function getItemMaker(item) {
    // Simple maker generation based on category
    const makers = {
        clothing: ['Vintage Co.', 'Fashion Inc.', 'Style Corp.', 'Retro Wear'],
        electronics: ['TechCorp', 'ElectroInc', 'RetroTech', 'VintageElec'],
        media: ['RecordCo', 'BookInc', 'MediaCorp', 'ClassicArt'],
        housewares: ['HomeInc', 'KitchenCorp', 'DecorCo', 'VintageHome']
    };
    
    const categoryMakers = makers[item.category] || ['Unknown Co.'];
    return categoryMakers[Math.floor(Math.random() * categoryMakers.length)];
}

function getItemEra(item) {
    const eras = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];
    return eras[Math.floor(Math.random() * eras.length)];
}

function handleValueGuess(event) {
    const button = event.target;
    const guessValue = button.dataset.value;
    const actualValue = getItemValue(currentAppraisal.item);
    const isCorrect = checkValueGuess(guessValue, actualValue);
    
    // Show correct/incorrect
    button.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Disable all buttons
    document.querySelectorAll('.value-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Calculate XP reward
    const xpReward = calculateAppraisalXP(currentAppraisal, isCorrect);
    addXP(xpReward);
    
    // Mark item as appraised
    currentAppraisal.item.isAppraised = true;
    
    setTimeout(() => {
        finishAppraisal(isCorrect);
    }, 2000);
}

function checkValueGuess(guess, actualValue) {
    switch (guess) {
        case 'low': return actualValue <= 15;
        case 'medium': return actualValue > 15 && actualValue <= 75;
        case 'high': return actualValue > 75;
        default: return false;
    }
}

function calculateAppraisalXP(appraisal, wasCorrect) {
    let baseXP = 10;
    
    // Rarity bonus
    switch (appraisal.item.rarity) {
        case 'uncommon': baseXP *= 2; break;
        case 'rare': baseXP *= 4; break;
    }
    
    // Accuracy bonus
    if (wasCorrect) baseXP *= 1.5;
    
    // Speed bonus (if completed quickly)
    const timeElapsed = Date.now() - appraisal.startTime;
    if (timeElapsed < 15000) baseXP *= 1.25; // Under 15 seconds
    
    // Thoroughness bonus (examined all spots)
    if (appraisal.spotsExamined.length >= 3) baseXP *= 1.2;
    
    return Math.floor(baseXP);
}

function startAppraisalTimer() {
    const timerElement = document.getElementById('appraisal-timer');
    const timeLimit = currentAppraisal.timeLimit;
    
    const timerInterval = setInterval(() => {
        const elapsed = Date.now() - currentAppraisal.startTime;
        const remaining = Math.max(0, Math.ceil((timeLimit - elapsed) / 1000));
        
        timerElement.textContent = remaining;
        
        if (remaining <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
    
    // Store interval for cleanup
    currentAppraisal.timerInterval = timerInterval;
}

function handleTimeOut() {
    // Auto-fail if time runs out
    showNotification('⏰ Time\'s up! Item appraised automatically.');
    
    // Give minimal XP for time out
    addXP(5);
    
    // Mark as appraised
    currentAppraisal.item.isAppraised = true;
    
    finishAppraisal(false);
}

function finishAppraisal(wasSuccessful) {
    // Clean up
    if (currentAppraisal.timerInterval) {
        clearInterval(currentAppraisal.timerInterval);
    }
    
    // Hide game modal
    document.getElementById('appraisal-game').classList.add('hidden');
    
    // Move appraised item to stock
    const item = currentAppraisal.item;
    moveToStock(item);
    
    // Show success message
    const value = getItemValue(item);
    
    if (wasSuccessful) {
        showNotification(`✅ Correctly appraised ${item.name} for $${value}! Moved to stock.`);
    } else {
        showNotification(`🔍 ${item.name} appraised for $${value}. Moved to stock.`);
    }
    
    // Reset appraisal state
    currentAppraisal = null;
}

function appriseItemAutomatically(item) {
    item.isAppraised = true;
    addXP(5); // Small XP for auto-appraise
    updateItemInUI(item);
    showNotification(`🤖 Auto-appraised ${item.name}`);
}

function sellItem(item) {
    if (!item.isAppraised) {
        showNotification('❓ Appraise this item first!');
        return;
    }
    
    const value = getItemValue(item);
    gameState.cash += value;
    
    // Remove from items array
    gameState.items = gameState.items.filter(i => i.id !== item.id);
    
    // Remove from UI
    removeItemFromUI(item);
    
    showNotification(`💰 Sold ${item.name} for $${value}!`);
    updateUI();
    saveGameState();
}

// Generate premium item (higher chance of rare/epic)
function generatePremiumItem() {
    const category = getRandomCategory();
    const rarity = getPremiumRarity(); // Different rarity distribution
    const condition = getRandomCondition();
    const template = getRandomItemTemplate(category, rarity);
    
    const item = {
        id: Date.now() + Math.random(),
        category: category,
        rarity: rarity,
        condition: condition,
        name: template.name,
        emoji: template.emoji,
        baseValue: template.baseValue,
        conditionMultiplier: CONDITIONS[condition].multiplier,
        isAppraised: false,
        isMystery: true // Premium items always need appraisal
    };
    
    return item;
}

function getPremiumRarity() {
    // Premium sources have better rarity distribution
    const weights = { rare: 60, uncommon: 30, common: 10 }; // Much better odds
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) return rarity;
    }
    
    return 'rare'; // fallback
}

// Export functions for global use
window.generateRandomItem = generateRandomItem;
window.generatePremiumItem = generatePremiumItem;
window.startAppraisalMiniGame = startAppraisalMiniGame;
window.sellItem = sellItem;
window.getItemValue = getItemValue;
window.getItemDisplayValue = getItemDisplayValue;
window.getRarityColor = getRarityColor;