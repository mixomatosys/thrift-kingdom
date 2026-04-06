# Thrift Kingdom - Development Guide

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mixomatosys/thrift-kingdom.git
   cd thrift-kingdom
   ```

2. **Open the game:**
   - Simply open `index.html` in your web browser
   - No build process required for MVP
   - Works locally without any server

3. **Start developing:**
   - Edit files and refresh browser to see changes
   - Use browser dev tools for debugging
   - Game auto-saves to localStorage every 2 minutes

## 📁 File Structure

```
thrift-kingdom/
├── index.html              # Main game file
├── src/
│   ├── css/
│   │   └── styles.css      # All game styles
│   └── js/
│       ├── game.js         # Core game state and logic
│       ├── items.js        # Item generation and appraisal
│       ├── skills.js       # Progression and unlocks
│       ├── ui.js           # User interface updates
│       └── storage.js      # Save/load functionality
├── docs/
│   └── design-notes.md     # Detailed design documentation
└── README.md               # Project overview
```

## 🎮 Testing the MVP

### Core Loop Testing
1. **Item Generation:** Items should arrive every 30 seconds
2. **Appraisal:** Click mystery items to start mini-game
3. **Selling:** Click appraised items to sell them
4. **Progression:** XP should increase, levels should unlock features
5. **Upgrades:** Buy upgrades with earned cash

### Offline Testing
1. Close the browser/tab
2. Wait 2+ minutes
3. Reopen - should show "Welcome Back" modal
4. Verify offline progress feels rewarding

### Critical Paths to Verify
- [ ] Game loads without errors
- [ ] Items generate and can be appraised
- [ ] XP and leveling work correctly
- [ ] Save/load preserves progress
- [ ] Offline progress calculates properly
- [ ] Upgrades affect gameplay

## 🔧 Development Workflow

### Making Changes
1. Edit files in your preferred editor
2. Refresh browser to test changes
3. Use browser DevTools Console for debugging
4. Check for JavaScript errors

### Committing Changes
```bash
git add .
git commit -m "✨ Describe your changes"
git push origin main
```

### Debugging Tips
- **Console Logs:** Game logs important events to browser console
- **Save Data:** Inspect localStorage in DevTools → Application → Local Storage
- **Reset Game:** Use "Reset" button or clear localStorage manually
- **Performance:** Use DevTools → Performance to check for issues

## 🎯 MVP Success Criteria

### Engagement Test
- [ ] Game is engaging for 5+ minutes on first play
- [ ] Player wants to return after closing
- [ ] Progression feels rewarding and meaningful

### Technical Test  
- [ ] No JavaScript errors in console
- [ ] Saves and loads correctly
- [ ] Offline progress works as expected
- [ ] Mobile responsive design works

### Balance Test
- [ ] Items arrive at reasonable pace
- [ ] XP progression feels neither too fast nor slow
- [ ] Upgrades provide meaningful improvements
- [ ] Cash economy feels balanced

## 📝 Known Issues & TODOs

### Current Limitations
- No sound effects (add in Phase 2)
- Limited item variety (expand as needed)
- Simple graphics (placeholder emojis)
- No multiplayer features yet

### Phase 2 Planning
- [ ] Restoration mini-game
- [ ] Display system with set bonuses  
- [ ] Customer relationship mechanics
- [ ] Backend save system
- [ ] Enhanced animations and polish

## 🐛 Troubleshooting

### Game Won't Load
1. Check browser console for JavaScript errors
2. Ensure all files are in correct locations
3. Try clearing localStorage: `localStorage.clear()`
4. Disable browser extensions that might interfere

### Progress Lost
1. Check if `localStorage` is available in your browser
2. Private/incognito mode doesn't persist saves
3. Look for backup saves: DevTools → Application → Local Storage

### Poor Performance
1. Check if too many items in storage (>100)
2. Clear console logs if they're accumulating
3. Close other browser tabs to free memory

---

## 🚀 Ready to Code!

The MVP is fully functional and ready for testing and iteration. Focus on:
1. **Player feedback** - Is it fun?
2. **Balance tuning** - Does progression feel right?
3. **Bug fixes** - Address any issues found
4. **Feature polish** - Improve existing systems before adding new ones

Happy developing! 🎮