let sprites = [];
let currentSpriteIndex = -1;
let currentOffsetX = 0;
let currentOffsetY = 0;

let scale = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

function disableSmoothing(context) {
  if (!context) return;
  context.imageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
}

function genId() {
  return "sprite_" + Date.now() + "_" + Math.random().toString(36).substr(2, 8);
}

function loadSprite(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const newSprite = {
        id: genId(),
        name: file.name,
        originalImg: img,
        originalWidth: img.width,
        originalHeight: img.height,
        src: e.target.result,
        offsetX: 0,
        offsetY: 0
      };
      sprites.push(newSprite);
      renderSpriteList();

      if (currentSpriteIndex === -1) {
        currentSpriteIndex = 0;
        currentOffsetX = 0;
        currentOffsetY = 0;
        updateSliders();
        updateInfo();
        drawCanvas();
      }
      showToast(`Loaded: ${file.name} (${img.width}x${img.height})`, "#2f8a68");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addSpritesFromFiles(files) {
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    loadSprite(file);
  });
}

function renderSpriteList() {
  const container = document.getElementById("spriteListContainer");
  if (!container) return;

  if (sprites.length === 0) {
    container.innerHTML = '<div style="color:#698490; text-align:center; padding:20px;">No sprites loaded.</div>';
    return;
  }

  container.innerHTML = "";
  sprites.forEach((sprite, idx) => {
    const item = document.createElement("div");
    item.className = `sprite-item ${currentSpriteIndex === idx ? "active" : ""}`;
    item.onclick = () => selectSprite(idx);

    const thumb = document.createElement("div");
    thumb.className = "sprite-thumb";
    const thumbImg = document.createElement("img");
    thumbImg.src = sprite.src;
    thumb.appendChild(thumbImg);

    const info = document.createElement("div");
    info.className = "sprite-info";
    info.innerHTML = `
      <div class="sprite-name">${
        sprite.name.length > 20 ? sprite.name.substring(0, 17) + "..." : sprite.name
      }</div>
      <div class="sprite-dims">${sprite.originalWidth}x${sprite.originalHeight}</div>
    `;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-sprite";
    delBtn.innerHTML = "x";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteSprite(idx);
    };

    item.appendChild(thumb);
    item.appendChild(info);
    item.appendChild(delBtn);
    container.appendChild(item);
  });
}

function selectSprite(index) {
  if (index < 0 || index >= sprites.length) return;
  currentSpriteIndex = index;
  currentOffsetX = sprites[index].offsetX || 0;
  currentOffsetY = sprites[index].offsetY || 0;
  updateSliders();
  updateInfo();
  drawCanvas();
  renderSpriteList();
}

function deleteSprite(index) {
  if (index < 0 || index >= sprites.length) return;
  sprites.splice(index, 1);
  if (sprites.length === 0) {
    currentSpriteIndex = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCheckerboard();
  } else if (currentSpriteIndex >= sprites.length) {
    currentSpriteIndex = sprites.length - 1;
    if (currentSpriteIndex >= 0) {
      currentOffsetX = sprites[currentSpriteIndex].offsetX || 0;
      currentOffsetY = sprites[currentSpriteIndex].offsetY || 0;
      updateSliders();
      updateInfo();
      drawCanvas();
    }
  } else if (currentSpriteIndex === index && currentSpriteIndex < sprites.length) {
    currentOffsetX = sprites[currentSpriteIndex].offsetX || 0;
    currentOffsetY = sprites[currentSpriteIndex].offsetY || 0;
    updateSliders();
    updateInfo();
    drawCanvas();
  }
  renderSpriteList();
  if (sprites.length === 0) {
    document.getElementById("currentSpriteName").innerText = "-";
    document.getElementById("origSize").innerText = "-";
    document.getElementById("outputSize").innerText = "-";
  }
  showToast("Sprite removed", "#8f3a3a");
}

function updateOffset(x, y) {
  if (currentSpriteIndex === -1) return;
  currentOffsetX = Math.max(
    -sprites[currentSpriteIndex].originalWidth + 1,
    Math.min(sprites[currentSpriteIndex].originalWidth - 1, x)
  );
  currentOffsetY = Math.max(
    -sprites[currentSpriteIndex].originalHeight + 1,
    Math.min(sprites[currentSpriteIndex].originalHeight - 1, y)
  );

  sprites[currentSpriteIndex].offsetX = currentOffsetX;
  sprites[currentSpriteIndex].offsetY = currentOffsetY;

  updateSliders();
  updateInfo();
  drawCanvas();
}

function updateSliders() {
  document.getElementById("offsetXSlider").value = currentOffsetX;
  document.getElementById("offsetXInput").value = currentOffsetX;
  document.getElementById("offsetYSlider").value = currentOffsetY;
  document.getElementById("offsetYInput").value = currentOffsetY;
}

function updateInfo() {
  if (currentSpriteIndex === -1) {
    document.getElementById("currentSpriteName").innerText = "-";
    document.getElementById("origSize").innerText = "-";
    document.getElementById("offsetDisplay").innerText = "X:0, Y:0";
    document.getElementById("outputSize").innerText = "-";
    return;
  }
  const sprite = sprites[currentSpriteIndex];
  document.getElementById("currentSpriteName").innerText = sprite.name;
  document.getElementById("origSize").innerText = `${sprite.originalWidth}x${sprite.originalHeight}`;
  document.getElementById("offsetDisplay").innerText = `X:${currentOffsetX}, Y:${currentOffsetY}`;
  document.getElementById("outputSize").innerText = `${sprite.originalWidth}x${sprite.originalHeight}`;
}

function drawCheckerboard() {
  const size = 20;
  for (let y = 0; y < canvas.height; y += size) {
    for (let x = 0; x < canvas.width; x += size) {
      ctx.fillStyle = (x + y) / size % 2 === 0 ? "#e7eff4" : "#dce8ef";
      ctx.fillRect(x, y, size, size);
    }
  }
}

function drawCanvas() {
  disableSmoothing(ctx);
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCheckerboard();

  if (currentSpriteIndex === -1) {
    ctx.restore();
    return;
  }

  const sprite = sprites[currentSpriteIndex];
  const img = sprite.originalImg;
  const origW = sprite.originalWidth;
  const origH = sprite.originalHeight;

  ctx.translate(panX, panY);
  ctx.scale(scale, scale);

  const centerX = canvas.width / 2 / scale - panX / scale;
  const centerY = canvas.height / 2 / scale - panY / scale;

  const drawX = centerX - origW / 2 + currentOffsetX;
  const drawY = centerY - origH / 2 + currentOffsetY;

  ctx.drawImage(img, drawX, drawY, origW, origH);

  ctx.strokeStyle = "#1f95b0";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2 / scale;
  ctx.strokeRect(centerX - origW / 2, centerY - origH / 2, origW, origH);

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.strokeStyle = "#1f95b099";
  ctx.lineWidth = 1 / scale;
  ctx.moveTo(centerX - 10, centerY);
  ctx.lineTo(centerX + 10, centerY);
  ctx.moveTo(centerX, centerY - 10);
  ctx.lineTo(centerX, centerY + 10);
  ctx.stroke();

  ctx.restore();
}

function exportCurrentSprite() {
  if (currentSpriteIndex === -1) {
    showToast("No sprite selected", "#b54848");
    return;
  }

  const sprite = sprites[currentSpriteIndex];
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sprite.originalWidth;
  outputCanvas.height = sprite.originalHeight;
  const outputCtx = outputCanvas.getContext("2d");
  disableSmoothing(outputCtx);

  outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputCtx.drawImage(
    sprite.originalImg,
    currentOffsetX,
    currentOffsetY,
    sprite.originalWidth,
    sprite.originalHeight,
    0,
    0,
    sprite.originalWidth,
    sprite.originalHeight
  );

  const link = document.createElement("a");
  const baseName = sprite.name.replace(/\.[^/.]+$/, "");
  link.download = `${baseName}_cropped.png`;
  link.href = outputCanvas.toDataURL("image/png");
  link.click();
  showToast(`Exported: ${baseName}_cropped.png`, "#2f8a68");
}

function exportAllSprites() {
  if (sprites.length === 0) {
    showToast("No sprites to export", "#b54848");
    return;
  }

  let exported = 0;
  sprites.forEach((sprite) => {
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = sprite.originalWidth;
    outputCanvas.height = sprite.originalHeight;
    const outputCtx = outputCanvas.getContext("2d");
    disableSmoothing(outputCtx);

    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    outputCtx.drawImage(
      sprite.originalImg,
      sprite.offsetX || 0,
      sprite.offsetY || 0,
      sprite.originalWidth,
      sprite.originalHeight,
      0,
      0,
      sprite.originalWidth,
      sprite.originalHeight
    );

    const link = document.createElement("a");
    const baseName = sprite.name.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}_cropped.png`;
    link.href = outputCanvas.toDataURL("image/png");
    link.click();
    exported++;
  });

  setTimeout(() => {
    showToast(`Exported ${exported} sprites`, "#0f7b9f");
  }, 500);
}

function zoomIn() {
  scale = Math.min(scale * 1.2, 5);
  drawCanvas();
}

function zoomOut() {
  scale = Math.max(scale / 1.2, 0.2);
  drawCanvas();
}

function resetView() {
  scale = 1;
  panX = 0;
  panY = 0;
  drawCanvas();
}

function onMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  isDragging = true;
  dragStartX = mouseX - panX;
  dragStartY = mouseY - panY;
  canvas.style.cursor = "grabbing";
}

function onMouseMove(e) {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  panX = mouseX - dragStartX;
  panY = mouseY - dragStartY;
  drawCanvas();
}

function onMouseUp() {
  isDragging = false;
  canvas.style.cursor = "crosshair";
}

function onWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  scale = Math.min(Math.max(scale * delta, 0.2), 5);
  drawCanvas();
}

function showToast(msg, bgColor) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  toast.style.background = bgColor;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function init() {
  document.getElementById("spriteUpload").addEventListener("change", (e) => {
    if (e.target.files.length) addSpritesFromFiles(e.target.files);
    e.target.value = "";
  });

  const xSlider = document.getElementById("offsetXSlider");
  const xInput = document.getElementById("offsetXInput");
  const ySlider = document.getElementById("offsetYSlider");
  const yInput = document.getElementById("offsetYInput");

  xSlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    xInput.value = val;
    updateOffset(val, currentOffsetY);
  });
  xInput.addEventListener("change", (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    xSlider.value = val;
    updateOffset(val, currentOffsetY);
  });
  ySlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    yInput.value = val;
    updateOffset(currentOffsetX, val);
  });
  yInput.addEventListener("change", (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    ySlider.value = val;
    updateOffset(currentOffsetX, val);
  });

  document.getElementById("resetXBtn").addEventListener("click", () => updateOffset(0, currentOffsetY));
  document.getElementById("resetYBtn").addEventListener("click", () => updateOffset(currentOffsetX, 0));

  document.getElementById("exportBtn").addEventListener("click", exportCurrentSprite);
  document.getElementById("exportAllBtn").addEventListener("click", exportAllSprites);

  document.getElementById("zoomInBtn").addEventListener("click", zoomIn);
  document.getElementById("zoomOutBtn").addEventListener("click", zoomOut);
  document.getElementById("resetViewBtn").addEventListener("click", resetView);

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseleave", onMouseUp);
  canvas.addEventListener("wheel", onWheel);

  drawCanvas();

  function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(500, container.clientWidth - 20);
    canvas.width = maxWidth;
    canvas.height = maxWidth;
    drawCanvas();
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

init();
