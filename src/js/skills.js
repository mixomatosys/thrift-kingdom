// Thrift Kingdom - Skills System  
// Handles skill progression, unlocks, and bonuses

// Skill definitions and progression
const SKILLS = {
    appraisal: {
        name: "Appraisal",
        description: "Identify and evaluate items more effectively",
        icon: "🔍",
        maxLevel: 99,
        unlocks: {
            10: { 
                name: "Auto-Appraise Commons",
                description: "Common items are automatically identified",
                effect: "autoCommon"
            },
            25: {
                name: "Expert Eye", 
                description: "See estimated value ranges on mystery items",
                effect: "valueHints"
            },
            40: {
                name: "Auto-Appraise Uncommons",
                description: "Uncommon items are automatically identified", 
                effect: "autoUncommon"
            },
            60: {
                name: "Master Appraiser",
                description: "+50% XP from appraisal activities",
                effect: "appraisalXPBonus"
            },
            80: {
                name: "Legendary Detector",
                description: "5% chance to upgrade any item rarity by one tier",
                effect: "rarityUpgrade"
            },
            99: {
                name: "Appraisal Grandmaster", 
                description: "Instantly identify any item + 100% appraisal XP",
                effect: "instantAppraisal"
            }
        }
    }
};

// Skill progression functions
function getSkillLevel(skillName) {
    switch(skillName) {
        case 'appraisal':
            return gameState.appraisalLevel;
        default:
            return 1;
    }
}

function getSkillXP(skillName) {
    switch(skillName) {
        case 'appraisal':
            return gameState.appraisalXP;
        default:
            return 0;
    }
}

function getXPToNextLevel(skillName) {
    const currentLevel = getSkillLevel(skillName);
    const currentXP = getSkillXP(skillName);
    const requiredXP = CONFIG.getXPRequired(currentLevel);
    
    return Math.max(0, requiredXP - currentXP);
}

function getSkillProgress(skillName) {
    const currentLevel = getSkillLevel(skillName);
    const currentXP = getSkillXP(skillName);
    const requiredXP = CONFIG.getXPRequired(currentLevel);
    const previousXP = currentLevel > 1 ? CONFIG.getXPRequired(currentLevel - 1) : 0;
    
    const progressXP = currentXP - previousXP;
    const levelXP = requiredXP - previousXP;
    
    return Math.max(0, Math.min(100, (progressXP / levelXP) * 100));
}

function checkSkillUnlocks(skillName, newLevel) {
    const skill = SKILLS[skillName];
    if (!skill || !skill.unlocks) return;
    
    const unlock = skill.unlocks[newLevel];
    if (unlock) {
        showSkillUnlock(skillName, unlock);
        applySkillEffect(unlock.effect);
    }
}

function showSkillUnlock(skillName, unlock) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #8B4513;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 2000;
            text-align: center;
            max-width: 400px;
            animation: unlockAnimation 3s ease-out;
        ">
            <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem;">
                🎉 ${SKILLS[skillName].icon} Skill Unlock! 🎉
            </h2>
            <h3 style="margin: 0 0 0.5rem 0; color: #8B4513;">
                ${unlock.name}
            </h3>
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
                ${unlock.description}
            </p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function applySkillEffect(effect) {
    switch(effect) {
        case 'autoCommon':
            // Effect already handled in item generation
            break;
            
        case 'valueHints':
            // Add value hint system to mystery items
            addValueHintSystem();
            break;
            
        case 'autoUncommon':
            gameState.autoUncommon = true;
            break;
            
        case 'appraisalXPBonus':
            gameState.appraisalXPMultiplier = (gameState.appraisalXPMultiplier || 1) * 1.5;
            break;
            
        case 'rarityUpgrade':
            gameState.rarityUpgradeChance = 0.05;
            break;
            
        case 'instantAppraisal':
            gameState.instantAppraisal = true;
            gameState.appraisalXPMultiplier = (gameState.appraisalXPMultiplier || 1) * 2;
            break;
    }
}

function addValueHintSystem() {
    // Modify item cards to show value hints for mystery items
    const originalCreateItemCard = window.createItemCard;
    
    window.createItemCard = function(item) {
        const card = originalCreateItemCard(item);
        
        if (!item.isAppraised && gameState.appraisalLevel >= 25) {
            const valueHint = getValueHint(item);
            const hintElement = document.createElement('div');
            hintElement.className = 'value-hint';
            hintElement.style.cssText = `
                font-size: 0.8rem;
                color: #666;
                margin-top: 0.25rem;
                font-style: italic;
            `;
            hintElement.textContent = valueHint;
            card.appendChild(hintElement);
        }
        
        return card;
    };
}

function getValueHint(item) {
    const actualValue = getItemValue(item);
    
    // Add some randomness to make it not too precise
    const variance = 0.3; // ±30% variance
    const minValue = Math.floor(actualValue * (1 - variance));
    const maxValue = Math.ceil(actualValue * (1 + variance));
    
    return `~$${minValue}-${maxValue}`;
}

// Prestige system (for future implementation)
function canPrestige(skillName) {
    const level = getSkillLevel(skillName);
    return level >= 99;
}

function prestigeSkill(skillName) {
    if (!canPrestige(skillName)) {
        showNotification('❌ Must reach level 99 to prestige!');
        return false;
    }
    
    // Reset skill level but keep bonuses
    switch(skillName) {
        case 'appraisal':
            gameState.appraisalPrestige = (gameState.appraisalPrestige || 0) + 1;
            gameState.appraisalLevel = 1;
            gameState.appraisalXP = 0;
            break;
    }
    
    showNotification(`⭐ Prestiged ${SKILLS[skillName].name}! You now have ${gameState.appraisalPrestige} prestige stars.`);
    updateUI();
    saveGameState();
    
    return true;
}

function getPrestigeBonus(skillName) {
    const prestigeLevel = gameState.appraisalPrestige || 0;
    return 1 + (prestigeLevel * 0.05); // 5% bonus per prestige level
}

// Skill tree display (for future expanded UI)
function createSkillTree() {
    const skillTreeHTML = `
        <div class="skill-tree">
            <h2>📊 Skills</h2>
            ${Object.entries(SKILLS).map(([skillName, skill]) => `
                <div class="skill-panel">
                    <div class="skill-header">
                        <span class="skill-icon">${skill.icon}</span>
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">Level ${getSkillLevel(skillName)}</span>
                    </div>
                    <div class="skill-progress">
                        ${createProgressBar(
                            getSkillXP(skillName), 
                            CONFIG.getXPRequired(getSkillLevel(skillName)),
                            `${formatNumber(getSkillXP(skillName))} / ${formatNumber(CONFIG.getXPRequired(getSkillLevel(skillName)))} XP`
                        )}
                    </div>
                    <div class="skill-unlocks">
                        ${Object.entries(skill.unlocks).map(([level, unlock]) => `
                            <div class="unlock ${getSkillLevel(skillName) >= parseInt(level) ? 'unlocked' : 'locked'}">
                                <span class="unlock-level">Level ${level}</span>
                                <span class="unlock-name">${unlock.name}</span>
                                <span class="unlock-desc">${unlock.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    return skillTreeHTML;
}

// Enhanced XP gain with skill bonuses
function addSkillXP(skillName, baseAmount) {
    let amount = baseAmount;
    
    // Apply prestige bonuses
    amount *= getPrestigeBonus(skillName);
    
    // Apply skill-specific multipliers
    if (skillName === 'appraisal' && gameState.appraisalXPMultiplier) {
        amount *= gameState.appraisalXPMultiplier;
    }
    
    amount = Math.floor(amount);
    
    switch(skillName) {
        case 'appraisal':
            const oldLevel = gameState.appraisalLevel;
            addXP(amount);
            const newLevel = gameState.appraisalLevel;
            
            // Check for unlocks
            if (newLevel > oldLevel) {
                for (let level = oldLevel + 1; level <= newLevel; level++) {
                    checkSkillUnlocks(skillName, level);
                }
            }
            break;
    }
}

// Skill milestone achievements
function checkSkillMilestones() {
    const appraisalLevel = gameState.appraisalLevel;
    const milestones = [10, 25, 50, 75, 99];
    
    milestones.forEach(milestone => {
        const achievementKey = `milestone_appraisal_${milestone}`;
        
        if (appraisalLevel >= milestone && !gameState.achievements?.[achievementKey]) {
            if (!gameState.achievements) gameState.achievements = {};
            gameState.achievements[achievementKey] = true;
            
            showAchievement(`Appraisal Master ${milestone}`, `Reached level ${milestone} in Appraisal!`);
        }
    });
}

function showAchievement(name, description) {
    showNotification(`🏆 Achievement: ${name} - ${description}`);
}

// Add CSS for skill tree (call once)
function addSkillTreeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .skill-tree {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1rem 0;
        }
        
        .skill-panel {
            border: 2px solid #D2691E;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            background: #FFF8DC;
        }
        
        .skill-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .skill-icon {
            font-size: 1.5rem;
        }
        
        .skill-name {
            font-weight: bold;
            flex: 1;
            color: #8B4513;
        }
        
        .skill-level {
            background: #F4A460;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-weight: bold;
            font-size: 0.9rem;
        }
        
        .skill-unlocks {
            margin-top: 1rem;
        }
        
        .unlock {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 0.5rem;
            padding: 0.5rem;
            margin: 0.25rem 0;
            border-radius: 5px;
            font-size: 0.9rem;
        }
        
        .unlock.unlocked {
            background: #E8F5E8;
            border-left: 4px solid #4CAF50;
        }
        
        .unlock.locked {
            background: #F5F5F5;
            border-left: 4px solid #CCC;
            opacity: 0.6;
        }
        
        .unlock-level {
            font-weight: bold;
            color: #8B4513;
        }
        
        .unlock-name {
            font-weight: bold;
            grid-column: 2;
        }
        
        .unlock-desc {
            grid-column: 2;
            color: #666;
            font-size: 0.8rem;
        }
        
        @keyframes unlockAnimation {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize skills system
function initializeSkills() {
    addSkillTreeStyles();
    
    // Check for any missed unlocks (in case of save/load issues)
    const appraisalLevel = gameState.appraisalLevel;
    for (let level = 1; level <= appraisalLevel; level++) {
        const unlock = SKILLS.appraisal.unlocks[level];
        if (unlock) {
            applySkillEffect(unlock.effect);
        }
    }
}

// Export functions for global use
window.getSkillLevel = getSkillLevel;
window.getSkillXP = getSkillXP; 
window.addSkillXP = addSkillXP;
window.prestigeSkill = prestigeSkill;
window.createSkillTree = createSkillTree;
window.checkSkillMilestones = checkSkillMilestones;
window.initializeSkills = initializeSkills;