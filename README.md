# Thrift Kingdom 🏪

An idle clicker game about building a thrift store empire. Discover treasures, curate displays, and expand your business across multiple cities.

## 🎯 Project Vision

**Core Experience:** Start with a single thrift store, find and appraise items through engaging mini-games, build beautiful displays, and gradually expand into a multi-city franchise empire.

**Target Audience:** Fans of idle games like Melvor Idle who enjoy progression, collection, and strategic decision-making.

**Platform Strategy:** Web-first for rapid development and testing, then mobile PWA.

## 🎮 Core Gameplay Loop

1. **Items arrive** automatically while away (true idle progression)
2. **Appraise mysteries** through engaging mini-games
3. **Restore items** to improve their value and condition  
4. **Curate displays** with set bonuses for matching themes
5. **Sell to customers** with different personalities and preferences
6. **Expand empire** by opening stores in new cities

## 📊 Progression Systems

### Skills (Level 1-99 + Prestige)
- **Sourcing:** Unlock better item sources (garage sales → estate sales → auctions)
- **Appraisal:** Faster/more accurate item identification mini-games
- **Restoration:** Improve item condition with timing-based mini-games
- **Curation:** Build better displays with set bonuses and themes
- **Sales:** Attract premium customers and build relationships

### Multi-Store Franchise
- Start with hometown shop
- Unlock new cities at prestige milestones
- Each location has unique customer types and item specialties
- Strategic resource allocation between stores

## 🛠️ Development Phases

### MVP Phase 1 (Week 1-2)
- [x] Repository and project setup
- [ ] Basic idle loop (items arrive, get appraised, auto-sell)
- [ ] Simple appraisal mini-game
- [ ] One skill progression (Appraisal levels 1-25)
- [ ] LocalStorage save/load system
- [ ] Offline progress calculation

### Phase 2 (Week 3-4)  
- [ ] Restoration mini-game
- [ ] Display system with set bonuses
- [ ] Multiple customer types
- [ ] Upgrade shop
- [ ] Visual polish and animations

### Phase 3 (Month 2)
- [ ] Backend save system
- [ ] Prestige system
- [ ] Multiple skills
- [ ] Leaderboards
- [ ] First store expansion

## 🔧 Tech Stack

**Frontend:** Vanilla HTML/CSS/JavaScript (for rapid prototyping)
**Backend:** Node.js + Express (when needed)
**Database:** Simple JSON files → SQLite → PostgreSQL (as we scale)
**Hosting:** Local development → Vercel/Netlify → Production hosting

## 📝 Development Guidelines

### Git Workflow
- `main` branch for stable releases
- `dev` branch for active development
- Feature branches for specific features
- Small, frequent commits with clear messages

### Code Style
- Clear, readable JavaScript (no minification until production)
- Modular architecture for easy testing
- Comments for complex game logic
- Consistent naming conventions

### Testing Strategy
- Manual testing during MVP
- Unit tests for core game logic
- Playtesting with friends/family
- Performance testing as we add features

## 🎯 Success Metrics

### MVP Success
- Core loop is engaging after 5+ minutes of play
- Offline progression feels rewarding
- Players want to show the game to others
- Clear progression goals motivate continued play

### Long-term Success  
- Daily active users and retention
- Organic sharing and word-of-mouth
- Positive player feedback on core mechanics
- Technical stability under load

## 📁 Project Structure

```
/src
  /js
    - game.js (core game state and logic)
    - items.js (item generation and properties) 
    - skills.js (progression and leveling)
    - ui.js (user interface updates)
    - storage.js (save/load functionality)
  /css
    - styles.css (main stylesheet)
  /assets
    - (images, sounds, icons)
/docs
  - design-notes.md (detailed design decisions)
  - balance-notes.md (tuning and balance changes)
index.html (main game file)
```

## 🚀 Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Start playing and testing!

No build process needed for MVP - just edit files and refresh the browser.

## 🤝 Contributing

This is a collaborative project between Mixy and MixyClaw. All major design decisions should be discussed before implementation.

Current development focus: **MVP Phase 1 - Core Idle Loop**

---

*Last updated: April 6, 2026*