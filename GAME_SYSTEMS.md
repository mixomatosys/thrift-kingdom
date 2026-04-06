# 🎮 Thrift Kingdom - Game Systems Documentation

## Overview
This document provides a comprehensive breakdown of all game mechanics, systems, and design decisions implemented in Thrift Kingdom MVP.

---

## 🏪 Core Game Loop

### 1. Donation System
**Purpose**: Primary source of items for the shop  
**Player Agency**: Toggle on/off donation flow

#### Donation Sources (Early Game)
| Source | Icon | Items | Description | Quality Bias |
|--------|------|-------|-------------|--------------|
| **Garage Sale Box** | 🏠 | 3-5 | Weekend garage sale finds | Slightly lower |
| **Attic Cleanout** | 📦 | 2-5 | Old stored household items | Mixed |
| **Moving Sale** | 🎁 | 4-6 | Apartment moving items | Standard |
| **Spring Cleaning** | 📚 | 3-4 | Decluttering donations | Standard |

#### Donation Flow Mechanics
- **Toggle State**: Open/Closed with visual feedback
- **Timer System**: 60-second intervals when open
- **Auto-Generation**: 1-2 containers per cycle
- **Player Control**: Can generate containers manually when open

### 2. Item Sorting System
**Purpose**: Active decision-making and categorization
**Strategic Element**: Storage space management

#### Sorting Categories
| Category | Icon | Examples | Strategic Notes |
|----------|------|----------|----------------|
| **Media** | 💿 | Books, CDs, DVDs | Often overlooked valuables |
| **Electronics** | 📻 | Radios, cables, gadgets | High variance in value |
| **Clothing** | 👕 | Shirts, jeans, shoes | Brand recognition important |
| **Housewares** | 🏠 | Dishes, frames, décor | Condition critical |

#### Sorting Decisions
- **Keep**: Item goes to category organization area
- **Toss**: Item discarded, frees up space
- **Progress Tracking**: Visual feedback on sorting completion

### 3. Appraisal & Value System
**Purpose**: Reveal true item values and generate profit
**Mystery Element**: Values hidden until appraisal

#### Auto-Appraisal Trigger
- Occurs when clicking "Move to Stock"
- Reveals calculated final values
- Shows total batch value
- Transfers items to main inventory

---

## 💎 Dual-Factor Value System

### Rarity Factor
**Determines base value range and item naming**

| Rarity | Icon | Chance | Base Value | Example Items |
|---------|------|---------|------------|---------------|
| **Common** | 🟫 | 70% | $1-8 | "T-Shirt", "Coffee Mug", "Paperback Book" |
| **Uncommon** | 🟩 | 25% | $8-25 | "Nike Shirt", "Branded Mug", "Hardcover Book" |
| **Rare** | 🟦 | 5% | $25-75 | "Vintage Band Shirt", "Antique Mug", "First Edition" |
| **Epic** | 🟪 | <1% | $75-200 | "Designer Item", "Art Glass", "Rare Collectible" |
| **Legendary** | 🟨 | <0.1% | $200-500 | "Museum Piece", "Priceless Antique", "Ultra Rare" |

### Quality Factor
**Represents physical condition and affects final multiplier**

| Quality | Icon | Chance | Multiplier | Description |
|---------|------|--------|------------|-------------|
| **Rough** | 🔴 | 15% | ×0.3 | Damaged, stained, barely functional |
| **Poor** | 🟠 | 20% | ×0.5 | Heavy wear, significant damage |
| **OK** | 🟡 | 30% | ×0.7 | Used condition, visible wear |
| **Good** | 🟢 | 25% | ×1.0 | Light wear, clean and functional |
| **Excellent** | 🔵 | 8% | ×1.3 | Minimal wear, very good condition |
| **Mint** | 🟣 | 2% | ×1.6 | Perfect condition, like new |

### Value Calculation Matrix

#### Formula
```
Final Value = Base Rarity Value × Quality Multiplier
```

#### Example Calculations
| Item | Rarity | Quality | Base | Multiplier | Final Value |
|------|--------|---------|------|------------|-------------|
| Generic T-Shirt | Common | Good | $3 | ×1.0 | **$3** |
| Nike Shirt | Uncommon | Excellent | $15 | ×1.3 | **$19** |
| Vintage Band Shirt | Rare | Mint | $45 | ×1.6 | **$72** |
| Designer Handbag | Epic | Rough | $120 | ×0.3 | **$36** |
| Rare Vinyl Record | Legendary | Good | $300 | ×1.0 | **$300** |

#### Strategic Implications
- **High rarity + poor condition** can still be valuable
- **Low rarity + perfect condition** creates surprising finds  
- **Storage decisions** require risk assessment
- **Learning curve** rewards pattern recognition

---

## 🎲 Item Generation System

### Smart Item Naming
**Items get different names based on their rarity tier**

#### Clothing Examples
| Rarity | T-Shirt | Jeans | Sneakers |
|---------|---------|-------|----------|
| **Common** | "T-Shirt" | "Jeans" | "Sneakers" |
| **Uncommon** | "Nike Shirt" | "Levi's Jeans" | "Brand Sneakers" |
| **Rare** | "Vintage Band Shirt" | "Vintage Levi's 501" | "Limited Edition Shoes" |

#### Electronics Examples
| Rarity | Radio | Calculator | Clock |
|---------|-------|------------|-------|
| **Common** | "Old Radio" | "Calculator" | "Digital Clock" |
| **Uncommon** | "Vintage Radio" | "Scientific Calculator" | "Alarm Clock" |
| **Rare** | "Antique Radio" | "Rare Calculator" | "Vintage Electronics" |

### Weighted Distribution System
**Probability weights ensure realistic item flow**

```javascript
rarityDistribution = [
    { rarity: 'common', weight: 70 },      // 70% chance
    { rarity: 'uncommon', weight: 25 },    // 25% chance  
    { rarity: 'rare', weight: 5 }          // 5% chance
]
```

**Note**: Epic and Legendary items not yet in early-game distribution but system ready for expansion.

### Category-Specific Generation
**Each category has appropriate item types**

#### Item Categories
- **Clothing**: Shirts, pants, shoes, accessories
- **Housewares**: Dishes, frames, candles, décor
- **Media**: Books, CDs, DVDs, magazines
- **Electronics**: Radios, chargers, cables, gadgets

---

## 🎯 Player Decision Systems

### Storage Management
**Limited space creates meaningful trade-offs**

#### Space Constraints
- **Container Capacity**: Each container holds 2-6 items
- **Category Areas**: Unlimited sorting space (temporary)
- **Stock Inventory**: Limited by storage upgrades
- **Decision Pressure**: Keep valuable or make space?

#### Strategic Considerations
- **Immediate vs Future Value**: Hold space for better items?
- **Rarity vs Quality**: Epic rough vs Common mint?
- **Category Balance**: Diversify or specialize?

### Risk Assessment Skills
**Learning to evaluate item potential**

#### Pattern Recognition
- **Brand Identification**: Learning valuable brands
- **Condition Assessment**: Spotting quality markers
- **Rarity Indicators**: Recognizing special items
- **Value Estimation**: Predicting appraisal results

#### Skill Development Curve
- **Beginner**: Focus on obvious quality markers
- **Intermediate**: Learn brand and rarity recognition
- **Advanced**: Master condition vs rarity trade-offs
- **Expert**: Optimize for maximum profit per space

---

## 💾 Save & Progress System

### LocalStorage Implementation
**Client-side persistence for seamless experience**

#### Saved Data Structure
```javascript
gameState = {
    // Resources
    cash: number,
    
    // Items in various states
    donationContainers: [],
    currentContainer: object,
    sortedItems: { media: [], electronics: [], ... },
    stockItems: [],
    
    // Donation flow state
    donationsOpen: boolean,
    nextDonationTime: timestamp,
    
    // Game progression
    appraisalLevel: number,
    appraisalXP: number
}
```

#### Auto-Save Triggers
- **Periodic**: Every 2 minutes during play
- **Action-Based**: After major decisions
- **Session End**: On page close/background
- **Manual**: Player can force save

### Offline Progress
**System ready for idle gameplay features**

#### Current Implementation
- **State preservation** during browser close
- **Timer continuation** when reopening
- **Progress calculation** for time away

#### Future Expansion Ready
- **Offline item generation** based on automation level
- **Staff productivity** during absence
- **Customer visits** and automatic sales

---

## 🎨 User Interface Systems

### Responsive Design
**Mobile-first approach for universal access**

#### Layout Breakpoints
- **Desktop**: Full sidebar + main content (>900px)
- **Tablet**: Horizontal scrolling sidebar (600-900px)  
- **Mobile**: Stacked layout with collapsible sidebar (<600px)

#### Touch Optimization
- **Large tap targets** for mobile interaction
- **Swipe gestures** for navigation
- **Haptic feedback** simulation
- **Keyboard shortcuts** for power users

### Visual Feedback Systems
**Clear communication of game state**

#### Color Coding
- **Rarity Colors**: Consistent across all UI elements
- **Quality Indicators**: Condition-based color schemes
- **Action Feedback**: Green success, red failure
- **Progress Visualization**: Smooth animations

#### Animation Framework
- **Fade-in**: New content appearance
- **Bounce**: Success feedback
- **Pulse**: XP gains and achievements
- **Slide**: Navigation transitions

---

## 🔧 Technical Architecture

### Modular JavaScript Structure
**Clean separation of concerns**

#### Core Modules
- **game.js**: State management, core logic
- **ui.js**: DOM manipulation, visual updates
- **items.js**: Generation algorithms, item data
- **skills.js**: Progression mechanics
- **storage.js**: Save/load functionality

#### Design Patterns
- **State Management**: Single source of truth (gameState)
- **Event Handling**: Direct DOM manipulation for reliability
- **Modular Functions**: Small, focused, testable functions
- **Global Exports**: Controlled exposure via window object

### Performance Considerations
**Optimized for smooth gameplay**

#### Efficient Updates
- **Selective DOM Updates**: Only change what's needed
- **Event Throttling**: Prevent excessive trigger rates
- **Memory Management**: Clean up unused objects
- **Asset Optimization**: Minimal resource loading

#### Scalability Preparation
- **Modular Architecture**: Easy to extend
- **Configuration Objects**: Centralized game tuning
- **Data Structures**: Optimized for growth
- **API Ready**: Backend integration points prepared

---

## 🎯 Balance & Progression Design

### Early Game Focus
**Establish core loop mastery before complexity**

#### Learning Curve
- **Session 1**: Basic sorting and appraisal
- **Session 2**: Pattern recognition begins
- **Session 3**: Strategic thinking develops
- **Session 4+**: Mastery and optimization

#### Difficulty Progression
- **Week 1**: Mostly common items, simple decisions
- **Week 2**: More uncommon items, brand recognition
- **Month 1**: Rare items appear, condition assessment
- **Month 2+**: Epic finds, complex trade-offs

### Value Distribution
**Realistic economic simulation**

#### Expected Value Ranges
- **Common items**: $0.30 - $13 (rough to mint)
- **Uncommon items**: $2.40 - $40 (rough to mint)
- **Rare items**: $7.50 - $120 (rough to mint)

#### Progression Incentives
- **Volume Strategy**: Process many common items quickly
- **Quality Strategy**: Focus on perfect condition items
- **Rarity Strategy**: Hunt for special finds
- **Balanced Strategy**: Optimize across all factors

---

## 🚀 Future Expansion Framework

### System Extensibility
**Current architecture supports planned features**

#### Ready for Implementation
- **Multiple Donation Sources**: Estate sales, auctions, collections
- **Restoration Mini-Game**: Improve item condition through skill
- **Customer System**: Selling mechanics with personality types
- **Staff Management**: Automation and specialization
- **Store Expansion**: Multiple locations and markets

#### Scalability Features
- **Backend Integration**: User accounts and cloud saves
- **Multiplayer Elements**: Leaderboards and competitions  
- **Seasonal Content**: Limited-time events and items
- **Achievement System**: Goals and milestone rewards

### Data-Driven Design
**Configuration-based for easy tuning**

#### Tunable Parameters
- **Rarity distributions** per donation source
- **Quality condition probabilities**
- **Base value ranges** by item type
- **Progression curves** for skills
- **Timer intervals** for game pacing

#### A/B Testing Ready
- **Feature flags** for experimental features
- **Metrics collection** points identified
- **User feedback** integration planned
- **Balance iteration** workflow established

---

*This document represents the current state of Thrift Kingdom MVP as of April 6, 2026. All systems are fully implemented and functional.*

**Repository**: https://github.com/mixomatosys/thrift-kingdom  
**Live Demo**: http://192.168.1.173:8080