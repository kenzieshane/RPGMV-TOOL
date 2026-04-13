# RPG Maker MV Sprite Suite

## 🎮 Live Demo

**Access the tool at:** [https://rpg.toolken.my.id](https://rpg.toolken.my.id)

---

## 📋 Overview

RPG Maker MV Sprite Suite is a complete web-based toolkit designed specifically for RPG Maker MV/MZ developers. It provides three essential sprite editing tools in one clean interface:

1. **Sprite Grid Arranger** - Arrange sprites into 9x6 grids for character sheets
2. **Sprite Cropper & Positioner** - Crop and reposition transparent sprites within original bounds
3. **Layout Import/Export** - Save and restore complex sprite arrangements

---

## 🛠️ Tools Included

### 1. Sprite Grid Arranger (9x6)
- Drag & drop sprites from your library onto a 9x6 grid
- Perfect for creating character sprite sheets, battler formations, or icon layouts
- Each cell has 8px spacing for visual clarity
- Export the entire grid as a single PNG with transparent background (no grid lines, no UI)

### 2. Sprite Cropper & Positioner
- Load individual sprites and adjust their position within the original frame
- Slider controls for X/Y offset (crop/move)
- Real-time preview with checkerboard transparency background
- Pan & zoom canvas for precise adjustments
- Export cropped sprites individually or batch export all

### 3. Layout Manager
- Export your grid arrangement as JSON
- Import previously saved layouts
- Matches sprites by filename (00.png, 01.png, etc.)
- Persists settings in browser local storage

---

## 🚀 Quick Start

### For Grid Arranger:
1. Upload sprites using the "ADD SPRITES" button
2. Drag thumbnails from the left panel to grid cells
3. Click the red ✖ on any cell to remove a sprite
4. Click "EXPORT SPRITE SHEET (PNG)" to download your grid as a clean PNG

### For Sprite Cropper:
1. Load a sprite image (PNG with transparency recommended)
2. Use X/Y sliders to adjust sprite position within frame
3. Pan the canvas by dragging, zoom with buttons or mouse wheel
4. Click "EXPORT AS PNG" to save the repositioned sprite

### For Layout Management:
1. Arrange your grid however you like
2. Click "EXPORT JSON" to save the layout
3. Later, upload the same sprites and click "IMPORT JSON" to restore the arrangement

---

## 📁 Supported File Formats

| Format | Grid Arranger | Cropper |
|--------|---------------|---------|
| PNG    | ✓ (best)      | ✓ (best) |
| JPEG   | ✓             | ✓       |
| WebP   | ✓             | ✓       |
| GIF    | ✓             | ✓       |

> 💡 **Tip:** PNG format is highly recommended for RPG Maker sprites as it preserves transparency.

---

## 🎯 Use Cases

| Use Case | Recommended Tool |
|----------|------------------|
| Creating character sprite sheets | Grid Arranger (9x6) |
| Adjusting sprite alignment/trimming | Sprite Cropper |
| Icon arrangement for menus | Grid Arranger |
| Batch repositioning multiple sprites | Cropper → Export All |
| Saving/loading complex layouts | Layout Import/Export |

---

## ⌨️ Controls

### Grid Arranger
| Action | Method |
|--------|--------|
| Add sprite to grid | Drag from pool → drop on cell |
| Remove sprite | Hover cell → click ✖ |
| Clear entire grid | "CLEAR GRID" button |
| Export as PNG | "EXPORT SPRITE SHEET" button |

### Sprite Cropper
| Action | Method |
|--------|--------|
| Adjust X offset | Slider or number input |
| Adjust Y offset | Slider or number input |
| Pan view | Drag on canvas |
| Zoom | Buttons or mouse wheel |
| Reset view | "RESET VIEW" button |

---

## 💾 File Naming Convention

For best JSON import compatibility, name your sprite files like:

```
00.png    01.png    02.png
10.png    11.png    12.png
20.png    21.png    22.png
...etc.
```

The layout system matches by filename, so consistent naming ensures reliable imports.

---

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Edge    | 90+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Opera   | 76+     | ✅ Full |

---

## 🔧 Technical Details

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Canvas API:** For image rendering and export
- **Local Storage:** Saves your sprite library and grid layouts
- **No Dependencies:** Zero external libraries or frameworks
- **File Size:** ~150KB (minified)

---

## 📦 Installation (Self-Hosted)

If you want to run this locally:

```bash
# Clone or download the HTML file
# No build process needed - it's plain HTML/CSS/JS

# Simply open the HTML file in any modern browser
# Or serve with any static server:
python -m http.server 8080
# Then visit http://localhost:8080
```

---

## ❓ FAQ

### Q: Why is my exported PNG showing a black background?
**A:** Make sure you're using PNG format with transparency. The tool preserves transparency, but some image viewers show black for transparent areas.

### Q: My JSON import isn't restoring the layout correctly?
**A:** Ensure you've uploaded the EXACT SAME sprite files (same filenames) before importing. The tool matches by filename.

### Q: Can I change the grid size?
**A:** Currently fixed at 9x6 for RPG Maker MV compatibility. Future versions may support custom dimensions.

### Q: Does it work offline?
**A:** Yes! Once loaded, the tool works completely offline. All processing happens in your browser.

### Q: Are my images uploaded to any server?
**A:** No. Everything stays in your browser. The tool uses FileReader API and never sends data to any server.

---

## 📝 Version History

- v1.0.2: Added sheet8 top-row negative offset and increased sheet8 spacing between cells.
- v1.0.1: Added a visible footer version indicator and bumped exported layout metadata.

---

## 🤝 Contributing

Found a bug or have a feature request? The tool is open source. Feel free to:
1. Fork the repository
2. Make your changes
3. Submit a pull request

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## 🔗 Links

- **Live Demo:** [https://rpg.toolken.my.id](https://rpg.toolken.my.id)
- **RPG Maker Web:** [https://www.rpgmakerweb.com](https://www.rpgmakerweb.com)

---

## 🙏 Credits

Created for the RPG Maker community.

---

**Happy Game Making! 🎮**
