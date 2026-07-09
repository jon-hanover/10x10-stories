const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'board.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

function loadBoard() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      labels: Array.isArray(parsed.labels) ? parsed.labels : [],
    };
  } catch (err) {
    // no file yet or corrupt — start fresh
  }
  return { pages: [], labels: [] };
}

let board = loadBoard();
let saveTimer = null;
function saveBoard() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(DATA_FILE, JSON.stringify(board, null, 2), () => {});
  }, 200);
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  socket.emit('board:init', board);

  socket.on('page:add', (page) => {
    if (!page || typeof page.id !== 'string') return;
    board.pages.push(page);
    saveBoard();
    socket.broadcast.emit('page:add', page);
  });

  socket.on('page:update', (page) => {
    if (!page || typeof page.id !== 'string') return;
    const idx = board.pages.findIndex((p) => p.id === page.id);
    if (idx === -1) return;
    board.pages[idx] = page;
    saveBoard();
    socket.broadcast.emit('page:update', page);
  });

  socket.on('page:move', ({ id, x, y, zIndex }) => {
    const p = board.pages.find((p) => p.id === id);
    if (!p) return;
    p.x = x;
    p.y = y;
    if (typeof zIndex === 'number') p.zIndex = zIndex;
    saveBoard();
    socket.broadcast.emit('page:move', { id, x, y, zIndex });
  });

  socket.on('page:delete', (id) => {
    board.pages = board.pages.filter((p) => p.id !== id);
    saveBoard();
    socket.broadcast.emit('page:delete', id);
  });

  socket.on('label:add', (label) => {
    if (!label || typeof label.id !== 'string') return;
    board.labels.push(label);
    saveBoard();
    socket.broadcast.emit('label:add', label);
  });

  socket.on('label:update', (partial) => {
    if (!partial || typeof partial.id !== 'string') return;
    const l = board.labels.find((x) => x.id === partial.id);
    if (!l) return;
    l.text = partial.text;
    saveBoard();
    socket.broadcast.emit('label:update', partial);
  });

  socket.on('label:move', ({ id, x, y, zIndex }) => {
    const l = board.labels.find((x) => x.id === id);
    if (!l) return;
    l.x = x;
    l.y = y;
    if (typeof zIndex === 'number') l.zIndex = zIndex;
    saveBoard();
    socket.broadcast.emit('label:move', { id, x, y, zIndex });
  });

  socket.on('label:delete', (id) => {
    board.labels = board.labels.filter((l) => l.id !== id);
    saveBoard();
    socket.broadcast.emit('label:delete', id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`10x10 Stories server running on http://localhost:${PORT}`);
});
