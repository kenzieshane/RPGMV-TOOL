const COLS = 9;
const ROWS = 6;
let gridData = Array(ROWS)
  .fill()
  .map(() => Array(COLS).fill(null));
let spritePool = [];

function genId() {
  return "rpg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 8);
}

function getBaseFilename(filename) {
  if (!filename) return "";
  let base = filename.split("/").pop();
  base = base.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "");
  return base;
}

function renderGrid() {
  const container = document.getElementById("rpgGridContainer");
  if (!container) return;
  container.innerHTML = "";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cellData = gridData[row][col];
      const cell = document.createElement("div");
      cell.className = "rpg-grid-cell";
      cell.setAttribute("data-row", row);
      cell.setAttribute("data-col", col);

      cell.addEventListener("dragover", (e) => {
        e.preventDefault();
        cell.classList.add("drag-over");
      });
      cell.addEventListener("dragleave", () => {
        cell.classList.remove("drag-over");
      });
      cell.addEventListener("drop", handleGridDrop);

      if (cellData && cellData.src) {
        const img = document.createElement("img");
        img.src = cellData.src;
        const removeBtn = document.createElement("div");
        removeBtn.className = "cell-remove";
        removeBtn.innerHTML = "x";
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          gridData[row][col] = null;
          renderGrid();
          saveToLocal();
        });
        cell.appendChild(img);
        cell.appendChild(removeBtn);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "empty-sprite";
        placeholder.innerText = `CELL ${col + 1},${row + 1}`;
        cell.appendChild(placeholder);
      }
      container.appendChild(cell);
    }
  }
}

function handleGridDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  target.classList.remove("drag-over");
  const row = parseInt(target.getAttribute("data-row"), 10);
  const col = parseInt(target.getAttribute("data-col"), 10);
  const draggedId = e.dataTransfer.getData("text/plain");
  if (!draggedId) return;
  const sourceSprite = spritePool.find((s) => s.id === draggedId);
  if (!sourceSprite) return;
  gridData[row][col] = { id: sourceSprite.id, src: sourceSprite.src };
  renderGrid();
  saveToLocal();
}

function renderPool() {
  const poolContainer = document.getElementById("spritePoolContainer");
  const countSpan = document.getElementById("poolCount");
  if (!poolContainer) return;
  if (spritePool.length === 0) {
    poolContainer.innerHTML =
      '<div style="color:#68818d; text-align:center; width:100%; padding:20px;">No sprites loaded yet.</div>';
    if (countSpan) countSpan.innerText = "0 items";
    return;
  }
  poolContainer.innerHTML = "";
  spritePool.forEach((spr) => {
    const tile = document.createElement("div");
    tile.className = "sprite-tile";
    tile.setAttribute("draggable", "true");
    tile.setAttribute("data-id", spr.id);
    tile.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", spr.id);
      e.dataTransfer.effectAllowed = "copy";
      tile.classList.add("dragging");
    });
    tile.addEventListener("dragend", () => tile.classList.remove("dragging"));
    const img = document.createElement("img");
    img.src = spr.src;
    const del = document.createElement("div");
    del.className = "sprite-delete";
    del.innerHTML = "x";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSpriteFromPool(spr.id);
    });
    tile.appendChild(img);
    tile.appendChild(del);
    poolContainer.appendChild(tile);
  });
  if (countSpan) countSpan.innerText = `${spritePool.length} items`;
}

function removeSpriteFromPool(spriteId) {
  const idx = spritePool.findIndex((s) => s.id === spriteId);
  if (idx !== -1) spritePool.splice(idx, 1);
  let changed = false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (gridData[r][c] && gridData[r][c].id === spriteId) {
        gridData[r][c] = null;
        changed = true;
      }
    }
  }
  if (changed) renderGrid();
  renderPool();
  saveToLocal();
}

function addSpritesFromFiles(files) {
  if (!files.length) return;
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newId = genId();
      spritePool.push({
        id: newId,
        src: ev.target.result,
        name: file.name,
        originalName: file.name,
        baseName: getBaseFilename(file.name)
      });
      renderPool();
      saveToLocal();
      showToast(`Added: ${file.name}`, "#2f8a68");
    };
    reader.readAsDataURL(file);
  });
}

function importLayoutJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const layout = JSON.parse(e.target.result);
      if (!layout.assignments || !Array.isArray(layout.assignments)) {
        throw new Error("Invalid format");
      }

      const newGrid = Array(ROWS)
        .fill()
        .map(() => Array(COLS).fill(null));
      let matched = 0;
      const unmatched = [];

      for (const assign of layout.assignments) {
        const { row, col, imageIdentifier, imageId } = assign;
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
          let foundSprite = null;

          if (imageIdentifier && !foundSprite) {
            foundSprite = spritePool.find((s) => s.originalName === imageIdentifier);
            if (!foundSprite) {
              const identifierBase = imageIdentifier.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "");
              foundSprite = spritePool.find((s) => s.baseName === identifierBase);
            }
            if (!foundSprite) {
              foundSprite = spritePool.find(
                (s) => s.originalName && s.originalName.includes(imageIdentifier)
              );
            }
          }

          if (!foundSprite && imageId) {
            foundSprite = spritePool.find((s) => s.id === imageId);
          }

          if (foundSprite) {
            newGrid[row][col] = { id: foundSprite.id, src: foundSprite.src };
            matched++;
          } else {
            unmatched.push(imageIdentifier || imageId || "unknown");
          }
        }
      }

      if (matched > 0) {
        gridData = newGrid;
        renderGrid();
        saveToLocal();
      }

      if (unmatched.length === 0) {
        showToast(`Layout restored: ${matched} sprites`, "#2f8a68");
      } else {
        showToast(
          `${matched} placed, ${unmatched.length} missing`,
          "#b57c35"
        );
        console.log("Missing sprites:", unmatched);
      }
    } catch (err) {
      console.error(err);
      showToast("Invalid layout file", "#b54848");
    }
  };
  reader.readAsText(file);
}

async function exportCleanSpriteSheet() {
  const gridElem = document.getElementById("rpgGridContainer");
  if (!gridElem) return;
  const firstCell = gridElem.querySelector(".rpg-grid-cell");
  if (!firstCell) {
    showToast("Grid not ready", "#b54848");
    return;
  }

  const cellRect = firstCell.getBoundingClientRect();
  const cellWidth = cellRect.width;
  const cellHeight = cellRect.height;
  const gridStyle = window.getComputedStyle(gridElem);
  const gap = parseInt(gridStyle.gap, 10) || 8;

  const totalW = COLS * cellWidth + (COLS - 1) * gap;
  const totalH = ROWS * cellHeight + (ROWS - 1) * gap;

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, totalW, totalH);

  const drawPromises = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cellEntry = gridData[row][col];
      if (cellEntry && cellEntry.src) {
        const x = col * (cellWidth + gap);
        const y = row * (cellHeight + gap);
        const promise = new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const imgRatio = img.width / img.height;
            const targetRatio = cellWidth / cellHeight;
            let drawW;
            let drawH;
            let offX;
            let offY;
            if (imgRatio > targetRatio) {
              drawH = cellHeight;
              drawW = img.width * (cellHeight / img.height);
              offX = x + (cellWidth - drawW) / 2;
              offY = y;
            } else {
              drawW = cellWidth;
              drawH = img.height * (cellWidth / img.width);
              offX = x;
              offY = y + (cellHeight - drawH) / 2;
            }
            ctx.drawImage(img, offX, offY, drawW, drawH);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = cellEntry.src;
        });
        drawPromises.push(promise);
      }
    }
  }
  await Promise.all(drawPromises);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const link = document.createElement("a");
  link.download = `rpg_sprite_sheet_${timestamp}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("Sprite sheet exported", "#2f8a68");
}

function exportLayoutJSON() {
  const exportObj = {
    version: "1.0",
    theme: "RPG Maker MV Sprite Forge",
    dimensions: { rows: ROWS, cols: COLS },
    createdAt: new Date().toISOString(),
    assignments: []
  };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = gridData[r][c];
      if (cell && cell.src) {
        const match = spritePool.find((s) => s.id === cell.id);
        exportObj.assignments.push({
          row: r,
          col: c,
          imageIdentifier:
            match?.originalName || match?.baseName || `sprite_${cell.id.substring(0, 6)}`,
          imageId: cell.id
        });
      }
    }
  }
  const jsonStr = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "rpg_sprite_layout.json";
  a.click();
  URL.revokeObjectURL(blob);
  showToast("Layout exported", "#0f7b9f");
}

function loadDemoSprites() {
  const demoList = [];
  const demoFiles = [
    "00.png",
    "01.png",
    "02.png",
    "10.png",
    "11.png",
    "20.png",
    "21.png",
    "30.png",
    "31.png",
    "40.png",
    "41.png",
    "50.png",
    "51.png",
    "60.png",
    "61.png",
    "70.png",
    "71.png"
  ];
  const colors = ["#4d8fa8", "#57a177", "#8679b3", "#c29d4b", "#cd7f63", "#6f9eb8"];

  demoFiles.forEach((filename, idx) => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px ui-monospace";
    ctx.textAlign = "center";
    ctx.fillText(filename.replace(".png", ""), 64, 72);
    const src = canvas.toDataURL("image/png");
    demoList.push({
      id: genId(),
      src,
      name: filename,
      originalName: filename,
      baseName: filename.replace(".png", "")
    });
  });
  spritePool.push(...demoList);
  renderPool();
  saveToLocal();
  showToast(`${demoList.length} demo sprites added`, "#0f7b9f");
}

function clearGrid() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      gridData[r][c] = null;
    }
  }
  renderGrid();
  saveToLocal();
  showToast("Grid cleared", "#8f3a3a");
}

function resetGridOnly() {
  clearGrid();
}

function clearPoolAndGrid() {
  spritePool = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      gridData[r][c] = null;
    }
  }
  renderGrid();
  renderPool();
  saveToLocal();
  showToast("All sprites removed", "#8f3a3a");
}

function saveToLocal() {
  try {
    const data = {
      grid: gridData.map((row) => row.map((cell) => (cell ? { id: cell.id, src: cell.src } : null))),
      pool: spritePool.map((p) => ({
        id: p.id,
        src: p.src,
        name: p.name,
        originalName: p.originalName,
        baseName: p.baseName
      }))
    };
    localStorage.setItem("rpg_sprite_forge_v2", JSON.stringify(data));
  } catch (e) {
    console.warn("Save skipped", e);
  }
}

function loadFromLocal() {
  const raw = localStorage.getItem("rpg_sprite_forge_v2");
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    if (saved.grid && saved.grid.length === ROWS) {
      const newGrid = [];
      for (let r = 0; r < ROWS; r++) {
        const rowData = saved.grid[r];
        if (rowData && rowData.length === COLS) {
          newGrid.push(
            rowData.map((cell) =>
              cell && cell.src ? { id: cell.id || genId(), src: cell.src } : null
            )
          );
        } else {
          newGrid.push(Array(COLS).fill(null));
        }
      }
      gridData = newGrid;
    }
    if (saved.pool && Array.isArray(saved.pool)) {
      spritePool = saved.pool
        .filter((p) => p && p.src)
        .map((p) => ({
          id: p.id || genId(),
          src: p.src,
          name: p.name || "sprite",
          originalName: p.originalName || p.name,
          baseName: p.baseName || getBaseFilename(p.originalName || p.name)
        }));
    }
    renderGrid();
    renderPool();
    return true;
  } catch (e) {
    return false;
  }
}

function showToast(msg, bg) {
  const old = document.querySelector(".toast-notify");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.className = "toast-notify";
  toast.textContent = msg;
  toast.style.background = bg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function init() {
  loadFromLocal();
  renderGrid();
  renderPool();

  document.getElementById("spriteUpload").addEventListener("change", (e) => {
    if (e.target.files.length) addSpritesFromFiles(e.target.files);
    e.target.value = "";
  });
  document.getElementById("clearGridBtn").addEventListener("click", clearGrid);
  document.getElementById("resetGridOnlyBtn").addEventListener("click", resetGridOnly);
  document.getElementById("clearPoolBtn").addEventListener("click", clearPoolAndGrid);
  document.getElementById("exportCleanPngBtn").addEventListener("click", exportCleanSpriteSheet);
  document.getElementById("exportLayoutBtn").addEventListener("click", exportLayoutJSON);
  document.getElementById("demoSpritesBtn").addEventListener("click", loadDemoSprites);

  const jsonImport = document.getElementById("importLayoutJson");
  jsonImport.addEventListener("change", (e) => {
    if (e.target.files.length) importLayoutJSON(e.target.files[0]);
    jsonImport.value = "";
  });
}

init();
