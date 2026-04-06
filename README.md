# 🏪 Thrift Kingdom

**A strategic thrift shop management game with meaningful decision-making and realistic progression.**

## 🎮 Live Demo
**Play Now**: http://192.168.1.173:8080  
**Status**: ✅ Fully functional MVP ready for testing

---

## 🎯 Game Overview

Transform donated items into profit through strategic sorting, appraisal, and shop management. Master the art of identifying valuable finds in a sea of common items.

### 💎 Core Gameplay Loop
1. **Open Donations** - Toggle donation flow and receive containers  
2. **Sort Items** - Examine each item and categorize by type
3. **Strategic Decisions** - Keep valuable items, toss junk
4. **Appraise & Stock** - Reveal true values and add to inventory
5. **Manage & Expand** - Grow your thrift shop empire

### 🎮 Key Features

#### ✅ **Dual-Factor Value System**
- **Rarity**: Common → Uncommon → Rare → Epic → Legendary
- **Quality**: Rough → Poor → OK → Good → Excellent → Mint  
- **Strategic Depth**: Rare items in poor condition vs common items in mint condition?

#### ✅ **Meaningful Appraisal**
- Values hidden until appraised (no more obvious pricing!)
- Items show rarity and quality, but value remains mystery
- Auto-appraisal reveals final calculations when moving to stock

#### ✅ **Interactive Donation System**
- Toggle-based donation flow with visual feedback
- 60-second timer with automatic container generation
- Realistic donation sources: garage sales, attic cleanouts, moving sales

#### ✅ **Strategic Sorting**
- Category-based organization (Media, Electronics, Clothing, Housewares)
- Item-by-item examination and decision-making
- Storage space management creates meaningful trade-offs

---

## 🏗️ Technical Implementation

### **Architecture**
- **Pure Web Technologies**: Vanilla JavaScript, CSS, HTML
- **No Dependencies**: No frameworks, libraries, or build process
- **Client-Side Storage**: localStorage for game saves
- **Mobile Responsive**: Works on all screen sizes

### **File Structure**
```
├── index.html              # Main game interface
├── src/
│   ├── css/styles.css      # Complete styling system
│   └── js/
│       ├── game.js         # Core game logic & state management
│       ├── ui.js           # User interface updates
│       ├── items.js        # Item generation systems
│       ├── skills.js       # Progression mechanics
│       └── storage.js      # Save/load functionality
├── docs/
│   ├── design-notes.md     # Detailed game design
│   └── DEVELOPMENT_LOG.md  # Complete development history
└── README.md              # This file
```

### **Development Approach**
- **Iterative Design**: Real-time testing and user feedback
- **Simplicity First**: Working solutions over architectural elegance  
- **Mobile-First**: Responsive design for all devices
- **Git Workflow**: Complete version control with meaningful commits

---

## 🎯 Game Systems

### **Item Generation**
- **Smart Naming**: Item names change by rarity ("T-Shirt" → "Nike Shirt" → "Vintage Band Shirt")
- **Weighted Distribution**: 70% common, 25% uncommon, 5% rare items  
- **Realistic Categories**: Clothing, housewares, media, electronics
- **Quality Variation**: Condition affects final value significantly

### **Value Calculation**
```
Final Value = Base Rarity Value × Quality Condition Multiplier

Examples:
• Generic T-Shirt (Common + Good) = $3 × 1.0 = $3
• Nike Shirt (Uncommon + Excellent) = $15 × 1.3 = $19  
• Vintage Band Shirt (Rare + Mint) = $45 × 1.6 = $72
• Designer Bag (Epic + Rough) = $120 × 0.3 = $36
```

### **Progression Systems**
- **Early Game**: Mostly common items, learning basic systems
- **Mid Game**: More uncommon items, first rare discoveries
- **Late Game**: Epic finds, legendary treasures
- **Skill Development**: Learning to identify valuable combinations

---

## 📊 Development Status

### ✅ **Completed (April 6, 2026)**
- **Complete MVP**: Fully functional game loop
- **Dual-Factor System**: Rarity + Quality value calculation
- **Interactive UI**: Sidebar navigation, responsive design
- **Donation Flow**: Toggle system with progress timer
- **Appraisal Mechanics**: Hidden values until assessment
- **Save System**: Persistent progress via localStorage
- **Mobile Support**: Works on all device sizes

### 🎯 **Next Phase** (Upcoming)
- **Restoration Mini-Game**: Improve item condition through skill
- **Customer Interactions**: Selling mechanics and relationships
- **Staff Management**: Hire specialists to automate processes
- **Store Upgrades**: Physical space and equipment improvements

### 🚀 **Future Expansion**
- **Multiple Locations**: Different markets and specializations
- **Seasonal Events**: Limited-time content and challenges
- **Achievement System**: Goals and milestone rewards  
- **Professional Art**: Replace emoji placeholders

---

## 🛠️ Getting Started

### **Play Immediately**
No installation required! Visit: **http://192.168.1.173:8080**

### **Local Development**
```bash
# Clone repository
git clone https://github.com/mixomatosys/thrift-kingdom.git
cd thrift-kingdom

# Start local server
python3 -m http.server 8080

# Open browser
open http://localhost:8080
```

### **How to Play**
1. Click **"Open Donations"** to start receiving containers
2. **Click containers** to begin sorting items individually  
3. **Categorize items** using the sorting buttons or toss unwanted items
4. **Move to Stock** when finished to appraise and store items
5. **Check Stock section** to see final appraised values

---

## 🎮 Design Philosophy

### **Meaningful Choices**
Every decision should matter. Rarity vs quality trade-offs create strategic depth beyond simple clicking.

### **Realistic Simulation** 
Based on actual thrift store dynamics. Finding treasures among common items mirrors real treasure hunting.

### **Progressive Complexity**
Start with simple decisions, gradually introduce sophisticated systems as players master basics.

### **Player Agency**
Control over pacing and strategy. Toggle systems on/off, prioritize different approaches.

---

## 📈 Success Metrics

### **Technical Achievement**
- ✅ Zero critical bugs in core gameplay
- ✅ Smooth performance on all tested devices  
- ✅ Clean, maintainable codebase
- ✅ Complete version control history

### **Gameplay Achievement**
- ✅ Engaging decision-making at every step
- ✅ Strategic depth through dual-factor system
- ✅ Meaningful progression and advancement
- ✅ Intuitive UI with clear feedback

### **Development Achievement**  
- ✅ Complete MVP in single intensive session
- ✅ User-driven iterative design process
- ✅ Comprehensive documentation
- ✅ Ready for extensive playtesting

---

## 📄 Documentation

- **[Development Log](DEVELOPMENT_LOG.md)**: Complete development history  
- **[Design Notes](docs/design-notes.md)**: Detailed system specifications
- **[Game Systems](GAME_SYSTEMS.md)**: Mechanics documentation *(coming soon)*

---

## 👥 Development Team

**MixyClaw**: Lead Developer & Designer  
**Repository**: https://github.com/mixomatosys/thrift-kingdom  
**Contact**: Available via GitHub issues

---

*"From concept to playable MVP in one intensive development session. Thrift Kingdom proves that meaningful gameplay emerges from thoughtful design choices, not complex technology."*

**Last Updated**: April 6, 2026  
**Version**: MVP 1.0  
**License**: TBD