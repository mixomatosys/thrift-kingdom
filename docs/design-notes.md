# Thrift Kingdom - Design Notes

## 🎮 Core Design Philosophy

**Inspired by:** Melvor Idle progression system + Cookie Clicker accessibility  
**Target Complexity:** Catan-level - teachable in 10 minutes, deep gameplay for months  
**Platform Strategy:** Web MVP → Mobile PWA → Native app if successful

## 📊 Detailed Progression Systems

### Skill Leveling Math

**XP Requirements Formula:**
```javascript
function getXPRequired(level) {
    if (level <= 20) return level * 50;        // Fast early: 50-1000 XP
    if (level <= 50) return 1000 + (level - 20) * 150; // Mid: 1150-5500 XP  
    if (level <= 80) return 5500 + (level - 50) * 400; // Late: 5900-17500 XP
    return 17500 + (level - 80) * 1000;       // End: 18500-36500 XP
}
```

**Target Progression Speed:**
- Level 10: ~1 hour (first major unlock)
- Level 25: ~1 day (hook established)  
- Level 50: ~1 week (deep engagement)
- Level 99: ~1 month (ready for prestige)

### Skill Synergy Bonuses
```
Appraisal 50 + Sourcing 50 = "Expert Buyer" (+20% legendary find rate)
Restoration 75 + Curation 75 = "Master Craftsman" (+50% set bonus)
Sales 99 + Any other 99 = "Business Savant" (+25% all income)
```

## 🏪 Store Expansion System

### Store Unlock Progression
1. **Hometown Shop** (Start) - Balanced tutorial location
2. **Big City Boutique** (1st Prestige) - Fashion focus, celebrity customers  
3. **College Town Vinyl** (2nd Prestige) - Music/books, student customers
4. **Coastal Antiques** (5th Prestige) - Maritime theme, tourist waves
5. **Silicon Valley Finds** (10th Prestige) - Tech focus, premium customers

### Cross-Store Mechanics
- **Shared cash pool** but individual store performance tracking
- **Transfer inventory** between stores (shipping costs vs profit optimization)  
- **Staff allocation** - send specialists to events (fashion expert to Fashion Week)
- **Reputation network** - customers refer between locations

## 🎯 Mini-Game Design Specifications

### Appraisal Mini-Game
```
Type: Visual puzzle + knowledge test
Mechanics:
- Item appears with partial details
- Click areas to "examine closer" 
- Reveal maker marks, condition, age indicators
- Multiple choice questions about era/style/value
- Time bonus + accuracy bonus
- Auto-appraise unlocks for lower tiers as you level
```

### Restoration Mini-Game
```
Type: Timing + precision hybrid  
Mechanics:
- Different tools for different item types
- Rhythm-based cleaning (tap to beat)
- Precision repair (trace lines carefully)
- Risk/reward: Push for better condition vs damage risk
- Unlock batch restoration as you level
```

### Display Curation  
```
Type: Spatial puzzle + aesthetic optimization
Mechanics:
- Drag items into limited display slots
- Real-time set bonus feedback
- Customer preference tooltips 
- Lighting/background effects boost certain types
- Weekly themed challenges
```

## 💰 Economic Balance Framework

### Item Value Tiers
- **Common (55%):** $0.50-$3 - Volume/learning items
- **Uncommon (28%):** $3-$25 - Solid progression items  
- **Rare (17%):** $25-$150 - Display anchors
- **Epic (Premium only):** $150-$800 - Major finds
- **Legendary (2 total):** $800+ - Endgame treasures

### Offline Progression Balance
- **Storage Cap:** Forces periodic check-ins
- **Diminishing Returns:** Prevents infinite offline farming
- **Time Gates:** Some events require active participation

## 🎪 Customer System Design

### Customer Types & Behavior
- **Collectors:** Specific wants, premium prices, refer others
- **Regulars:** Build relationships over time, loyalty bonuses
- **Tourists:** Seasonal waves, impulse buyers
- **Browsers:** Price-sensitive, good for moving inventory  
- **Flippers:** Test your appraisal skills, buy underpriced items

### Relationship Progression
```
Stranger → Regular → Friend → Loyal → VIP → Business Partner
Each tier: Better prices, exclusive access, referrals
Unlocks: Memory preferences, negotiate fairly, special requests
```

## ⚡ Technical Architecture Notes

### MVP Implementation Strategy
```
Phase 1: Client-side only (localStorage, no backend)
- Fastest development and testing
- Easy to iterate game balance
- Perfect for proving core loop is fun

Phase 2: Hybrid approach  
- Client calculates for immediate feedback
- Server validates and persists authoritative state
- Anti-cheat without complexity

Phase 3: True server-authoritative
- Scale for multiplayer features
- Real-time events and leaderboards
- Advanced analytics and optimization
```

### Offline Progress Implementation
```javascript
// Save on close
window.addEventListener('beforeunload', saveGameState);

// Calculate on return
function calculateOfflineProgress(lastPlayed, now) {
  const timeAway = now - lastPlayed;
  const secondsAway = Math.floor(timeAway / 1000);
  const itemsGenerated = Math.min(
    secondsAway * itemGenerationRate, 
    storageCapacity
  );
  return { itemsGenerated, timeAway };
}
```

## 🎨 Visual Design Direction

### Art Style
- **Clean 2.5D isometric** perspective
- **Warm color palette** - browns, golds, vintage teal
- **Detailed item sprites** with satisfying zoom-in views
- **Cozy shop atmosphere** with personality

### UI/UX Principles
- **Portrait-friendly** for mobile
- **Big, satisfying buttons** with haptic feedback
- **Clear progress visualization** - bars, numbers, celebrations
- **Minimal cognitive load** - obvious what to do next

## 📈 Monetization Strategy (Post-MVP)

### Ethical F2P Approach
- **NO pay-to-win** mechanics
- **Time savers only** - extend offline hours, instant appraisal tokens
- **Cosmetics** - shop themes, display cases, character customization
- **Battle pass style** seasonal content with free + premium tracks

### Revenue Streams (If Successful)
1. **Premium subscriptions** - QoL improvements, extended offline time
2. **Cosmetic purchases** - shop customization, item skins  
3. **Seasonal content** - themed events with optional premium benefits

## 🔄 Post-Launch Content Strategy

### Seasonal Events
- **Fashion Week** (Big City store focus)
- **Back to School** (College Town rush) 
- **Summer Tourist Season** (Coastal store bonus)
- **Vintage Electronics Expo** (Silicon Valley event)

### Endgame Content Ideas
- **International expansion** - European antique markets, Asian collectibles
- **Museum partnerships** - contribute to exhibitions, prestige rewards
- **Reality integration** - scan real thrift finds with phone camera
- **Social features** - visit friends' stores, trading post, guilds

## 🤔 Open Design Questions

### For MVP Testing
1. **Offline progression rate** - How many items per minute feels right?
2. **Storage pressure** - When should inventory cap become limiting?
3. **Appraisal frequency** - What % of items should need active attention?
4. **Level progression speed** - Too fast feels cheap, too slow loses players

### For Future Phases  
1. **Social features** - Competitive or cooperative focus?
2. **Real money integration** - How to avoid P2W while remaining sustainable?
3. **Platform expansion** - Native mobile apps or PWA sufficient?
4. **Content creation** - User-generated items/shops/events?

---

*This document should be updated as we learn from playtesting and development.*