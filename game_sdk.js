function initGame(options) {
  const {
    containerId,
    containerEl,
    mapData,
    tileSkins = {},
    playerSkin = "blue"
  } = options;

  const size = mapData.size;
  const gridSize = mapData.gridSize;
  const player = { ...mapData.player };

  // 🧱 1. 自动创建挂载容器（若未传入）
  let container;
  if (containerEl instanceof HTMLElement) {
    container = containerEl;
  } else if (containerId) {
    container = document.getElementById(containerId);
  } else {
    const autoId = "game_" + Date.now();
    container = document.createElement("div");
    container.id = autoId;
    document.body.appendChild(container);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.height = size * gridSize;
  container.innerHTML = "";
  container.appendChild(canvas);

  const tileMap = new Map();
  mapData.tiles.forEach(t => {
    tileMap.set(`${t.x},${t.y}`, t.type);
  });

  const images = {};
  const loadImage = (src) =>
    new Promise(resolve => {
      if (!src) return resolve(null);
      if (images[src]) return resolve(images[src]);
      const img = new Image();
      img.src = src;
      img.onload = () => {
        images[src] = img;
        resolve(img);
      };
      img.onerror = () => resolve(null);
    });

  async function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const key = tileMap.get(`${x},${y}`);
        if (key) {
          const img = await loadImage(tileSkins[key]);
          if (img) {
            ctx.drawImage(img, x * gridSize, y * gridSize, gridSize, gridSize);
          } else {
            ctx.fillStyle = "#aaa";
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            ctx.fillStyle = "#000";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(key, x * gridSize + gridSize / 2, y * gridSize + gridSize / 2);
          }
        }
      }
    }

    const playerImg = await loadImage(playerSkin);
    if (playerImg) {
      ctx.drawImage(playerImg, player.x * gridSize, player.y * gridSize, gridSize, gridSize);
    } else {
      ctx.fillStyle = playerSkin;
      ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize);
    }
  }

  function isWall(x, y) {
    const key = tileMap.get(`${x},${y}`);
    return key && key.toUpperCase().startsWith("W");
  }

  window.addEventListener("keydown", (e) => {
    const moves = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    if (moves[e.key]) {
      const [dx, dy] = moves[e.key];
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (
        nx >= 0 && ny >= 0 &&
        nx < size && ny < size &&
        !isWall(nx, ny)
      ) {
        player.x = nx;
        player.y = ny;
        draw();
      }
    }
  });

  draw();
}
