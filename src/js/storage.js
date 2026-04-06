// Thrift Kingdom - Save/Load System
// Handles local storage persistence and data management

const SAVE_KEY = 'thriftKingdomSave';
const SAVE_VERSION = '1.0';

// Helper functions for save/load
function cleanItem(item) {
    return {
        id: item.id,
        category: item.category,
        rarity: item.rarity,
        condition: item.condition,
        name: item.name,
        emoji: item.emoji,
        baseValue: item.baseValue,
        conditionMultiplier: item.conditionMultiplier,
        isAppraised: item.isAppraised,
        isMystery: item.isMystery
    };
}

function restoreItem(item) {
    // Ensure all required properties exist
    return {
        id: item.id || Date.now() + Math.random(),
        category: item.category || 'housewares',
        rarity: item.rarity || 'common',
        condition: item.condition || 'good',
        name: item.name || 'Unknown Item',
        emoji: item.emoji || '❓',
        baseValue: item.baseValue || 1,
        conditionMultiplier: item.conditionMultiplier || 1,
        isAppraised: item.isAppraised || false,
        isMystery: item.isMystery !== false // Default to true if not specified
    };
}

// Save game state to localStorage
function saveGameState() {
    try {
        const saveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            gameState: {
                // Core resources
                cash: gameState.cash,
                
                // Skills
                appraisalLevel: gameState.appraisalLevel,
                appraisalXP: gameState.appraisalXP,
                appraisalPrestige: gameState.appraisalPrestige || 0,
                appraisalXPMultiplier: gameState.appraisalXPMultiplier || 1,
                
                // Items - separated by area
                donationQueue: gameState.donationQueue.map(cleanItem),
                mysteryItems: gameState.mysteryItems.map(cleanItem),
                stockItems: gameState.stockItems.map(cleanItem),
                displayItems: gameState.displayItems.map(cleanItem),
                
                // Storage and generation
                storageCapacity: gameState.storageCapacity,
                itemGenerationRate: gameState.itemGenerationRate,
                lastItemGeneration: gameState.lastItemGeneration,
                
                // Game settings
                autoDonations: gameState.autoDonations,
                currentSection: gameState.currentSection,
                
                // Upgrades
                upgrades: {
                    speed: gameState.upgrades.speed,
                    storage: gameState.upgrades.storage,
                    autoCommon: gameState.upgrades.autoCommon,
                    autoDonations: gameState.upgrades.autoDonations,
                    appraisalTools: gameState.upgrades.appraisalTools
                },
                
                // Special unlocks
                autoUncommon: gameState.autoUncommon || false,
                rarityUpgradeChance: gameState.rarityUpgradeChance || 0,
                instantAppraisal: gameState.instantAppraisal || false,
                
                // Game state
                isPlaying: gameState.isPlaying,
                lastSave: Date.now(),
                
                // Achievements
                achievements: gameState.achievements || {}
            }
        };
        
        const saveString = JSON.stringify(saveData);
        localStorage.setItem(SAVE_KEY, saveString);
        
        console.log('💾 Game saved successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Save failed:', error);
        showNotification('❌ Save failed! Check browser storage.');
        return false;
    }
}

// Load game state from localStorage
function loadGameState() {
    try {
        const saveString = localStorage.getItem(SAVE_KEY);
        
        if (!saveString) {
            console.log('🆕 No save found, starting fresh');
            initializeFreshGame();
            return false;
        }
        
        const saveData = JSON.parse(saveString);
        
        // Version compatibility check
        if (saveData.version !== SAVE_VERSION) {
            console.log('🔄 Save version mismatch, attempting migration');
            migrateSaveData(saveData);
        }
        
        // Restore game state
        const saved = saveData.gameState;
        
        // Core resources
        gameState.cash = saved.cash || 0;
        
        // Skills
        gameState.appraisalLevel = saved.appraisalLevel || 1;
        gameState.appraisalXP = saved.appraisalXP || 0;
        gameState.appraisalPrestige = saved.appraisalPrestige || 0;
        gameState.appraisalXPMultiplier = saved.appraisalXPMultiplier || 1;
        
        // Items - separated by area
        gameState.donationQueue = (saved.donationQueue || []).map(restoreItem);
        gameState.mysteryItems = (saved.mysteryItems || []).map(restoreItem);
        gameState.stockItems = (saved.stockItems || []).map(restoreItem);
        gameState.displayItems = (saved.displayItems || []).map(restoreItem);
        
        // Migrate old save format if needed
        if (saved.items && saved.items.length > 0) {
            // Old format - migrate items to donation queue
            gameState.donationQueue = saved.items.map(restoreItem);
        }
        
        // Storage and generation
        gameState.storageCapacity = saved.storageCapacity || 50;
        gameState.itemGenerationRate = saved.itemGenerationRate || 30;
        gameState.lastItemGeneration = saved.lastItemGeneration || Date.now();
        
        // Game settings
        gameState.autoDonations = saved.autoDonations !== false; // Default to true
        gameState.currentSection = saved.currentSection || 'donations';
        
        // Upgrades
        gameState.upgrades = {
            speed: saved.upgrades?.speed || 0,
            storage: saved.upgrades?.storage || 0,
            autoCommon: saved.upgrades?.autoCommon || false,
            autoDonations: saved.upgrades?.autoDonations || false,
            appraisalTools: saved.upgrades?.appraisalTools || false
        };
        
        // Special unlocks
        gameState.autoUncommon = saved.autoUncommon || false;
        gameState.rarityUpgradeChance = saved.rarityUpgradeChance || 0;
        gameState.instantAppraisal = saved.instantAppraisal || false;
        
        // Game state
        gameState.isPlaying = saved.isPlaying !== false; // Default to true
        gameState.lastSave = saved.lastSave || Date.now();
        
        // Achievements
        gameState.achievements = saved.achievements || {};
        
        console.log('📂 Game loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Load failed:', error);
        showNotification('❌ Load failed! Starting fresh game.');
        initializeFreshGame();
        return false;
    }
}

// Initialize a completely fresh game state
function initializeFreshGame() {
    gameState.cash = 0;
    gameState.appraisalLevel = 1;
    gameState.appraisalXP = 0;
    
    // Initialize separated item arrays
    gameState.donationQueue = [];
    gameState.mysteryItems = [];
    gameState.stockItems = [];
    gameState.displayItems = [];
    
    gameState.storageCapacity = 50;
    gameState.itemGenerationRate = 30;
    gameState.lastItemGeneration = Date.now();
    gameState.autoDonations = true;
    gameState.currentSection = 'donations';
    
    gameState.upgrades = {
        speed: 0,
        storage: 0,
        autoCommon: false,
        autoDonations: false,
        appraisalTools: false
    };
    
    gameState.isPlaying = true;
    gameState.lastSave = Date.now();
    gameState.achievements = {};
    
    console.log('🆕 Fresh game initialized');
}

// Migrate old save data to new format
function migrateSaveData(saveData) {
    console.log(`🔄 Migrating save from version ${saveData.version} to ${SAVE_VERSION}`);
    
    // Add migration logic here as the game evolves
    // For now, we'll just update the version
    saveData.version = SAVE_VERSION;
    
    // Example migration logic:
    // if (saveData.version === '0.9') {
    //     // Migrate specific changes from v0.9 to v1.0
    //     if (!saveData.gameState.achievements) {
    //         saveData.gameState.achievements = {};
    //     }
    // }
    
    console.log('✅ Migration completed');
}

// Export save data for backup/sharing
function exportSaveData() {
    try {
        const saveString = localStorage.getItem(SAVE_KEY);
        if (!saveString) {
            showNotification('❌ No save data to export');
            return null;
        }
        
        // Create downloadable file
        const blob = new Blob([saveString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `thrift-kingdom-save-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('💾 Save data exported successfully!');
        return saveString;
        
    } catch (error) {
        console.error('❌ Export failed:', error);
        showNotification('❌ Export failed!');
        return null;
    }
}

// Import save data from file
function importSaveData(fileContent) {
    try {
        const saveData = JSON.parse(fileContent);
        
        // Basic validation
        if (!saveData.gameState || !saveData.version) {
            throw new Error('Invalid save file format');
        }
        
        // Backup current save
        const currentSave = localStorage.getItem(SAVE_KEY);
        if (currentSave) {
            localStorage.setItem(SAVE_KEY + '_backup', currentSave);
        }
        
        // Import new save
        localStorage.setItem(SAVE_KEY, fileContent);
        
        // Reload game
        location.reload();
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        showNotification('❌ Import failed! Invalid save file.');
    }
}

// Auto-save functionality
let autoSaveInterval = null;

function startAutoSave(intervalMinutes = 2) {
    stopAutoSave(); // Clear any existing interval
    
    autoSaveInterval = setInterval(() => {
        if (gameState.isPlaying) {
            saveGameState();
        }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`🔄 Auto-save started (every ${intervalMinutes} minutes)`);
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Cloud save preparation (for future implementation)
function prepareSaveForCloud() {
    const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState: gameState,
        metadata: {
            playtime: calculatePlaytime(),
            itemsFound: gameState.achievements?.itemsFound || 0,
            totalCashEarned: gameState.achievements?.totalCashEarned || 0
        }
    };
    
    return saveData;
}

function calculatePlaytime() {
    // Simple playtime calculation based on saves
    // In a real implementation, you'd track this more accurately
    return gameState.achievements?.playtimeMinutes || 0;
}

// Backup management
function createBackup(label = '') {
    try {
        const saveString = localStorage.getItem(SAVE_KEY);
        if (!saveString) return false;
        
        const backupKey = `${SAVE_KEY}_backup_${Date.now()}_${label}`;
        localStorage.setItem(backupKey, saveString);
        
        // Clean old backups (keep only last 5)
        cleanOldBackups();
        
        console.log('💾 Backup created:', backupKey);
        return true;
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        return false;
    }
}

function cleanOldBackups() {
    try {
        const backupKeys = [];
        
        // Find all backup keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(SAVE_KEY + '_backup_')) {
                backupKeys.push(key);
            }
        }
        
        // Sort by timestamp (newest first)
        backupKeys.sort().reverse();
        
        // Remove old backups (keep only last 5)
        for (let i = 5; i < backupKeys.length; i++) {
            localStorage.removeItem(backupKeys[i]);
        }
        
    } catch (error) {
        console.error('❌ Backup cleanup failed:', error);
    }
}

// Save validation
function validateSaveData(saveData) {
    const required = [
        'version',
        'timestamp', 
        'gameState'
    ];
    
    for (const field of required) {
        if (!(field in saveData)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    // Validate game state fields
    const gameStateRequired = [
        'cash',
        'appraisalLevel', 
        'appraisalXP',
        'items',
        'upgrades'
    ];
    
    for (const field of gameStateRequired) {
        if (!(field in saveData.gameState)) {
            throw new Error(`Missing required game state field: ${field}`);
        }
    }
    
    return true;
}

// Initialize storage system
function initializeStorage() {
    // Start auto-save
    startAutoSave(2); // Every 2 minutes
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        saveGameState();
    });
    
    // Save on visibility change (mobile background)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            saveGameState();
        }
    });
    
    console.log('💾 Storage system initialized');
}

// Export functions for global use
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.exportSaveData = exportSaveData;
window.importSaveData = importSaveData;
window.createBackup = createBackup;
window.initializeStorage = initializeStorage;