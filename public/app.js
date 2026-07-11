(() => {
  const socket = io();
  const appScreen = document.getElementById('appScreen');
  const pagesLayer = document.getElementById('pagesLayer');
  const board = document.getElementById('board');
  const addPageBtn = document.getElementById('addPageBtn');
  const nameBtn = document.getElementById('nameBtn');
  const nameLabel = document.getElementById('nameLabel');
  const nameModal = document.getElementById('nameModal');
  const nameInput = document.getElementById('nameInput');
  const nameSaveBtn = document.getElementById('nameSaveBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const zoomLabel = document.getElementById('zoomLabel');

  const WORD_LIMIT = 10;
  const BULLET_LIMIT = 10;
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 2.5;

  const PALETTE = [
    '#fff6c8', '#ffd6d6', '#d6f0d6', '#d6e6ff',
    '#f3d6ff', '#ffe3bf', '#cdf5ec', '#e2d9ff',
    '#ffdcee', '#e4ffcf',
  ];

  const pages = new Map(); // id -> { data, el }
  const labels = new Map(); // id -> { data, el }
  let topZ = 1;
  const sendTimers = new Map(); // pageId -> timeout handle
  let zoom = 1;
  let blankClickTimer = null;
  // Tracks an in-progress shift+arrow selection that has crossed into another
  // bullet's contenteditable — DOM focus doesn't follow the extended
  // selection, so subsequent shift+arrow presses (still firing on the
  // original element) need this to know where the selection actually is now.
  let shiftNav = null; // { page, originEl, index, offset }
  // Native mouse-drag text selection is confined to whichever single
  // contenteditable "editing host" it started in — it won't cross into a
  // sibling bullet's contenteditable. This tracks a drag so we can manually
  // take over and extend the real Selection across bullets once it crosses.
  let mouseDrag = null; // { bulletTextEl, overridden }

  // ---------- identity ----------
  function getUserId() {
    let id = localStorage.getItem('10x10_userid');
    if (!id) {
      id = uuid();
      localStorage.setItem('10x10_userid', id);
    }
    return id;
  }
  function getUsername() {
    return localStorage.getItem('10x10_username') || '';
  }
  function setUsername(name) {
    localStorage.setItem('10x10_username', name);
    nameLabel.textContent = name || 'Anonymous';
  }
  function colorForUser(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    return PALETTE[hash % PALETTE.length];
  }

  // Each author's story numbers are assigned once at creation and never
  // renumbered — deleting an earlier page never shifts a later one's number.
  function nextStoryNumberForAuthor(authorId) {
    let maxNum = 0;
    pages.forEach(({ data }) => {
      if (data.authorId === authorId && typeof data.storyNumber === 'number') {
        maxNum = Math.max(maxNum, data.storyNumber);
      }
    });
    return maxNum + 1;
  }

  function formatPageAuthorLabel(page) {
    const name = page.author || 'Anonymous';
    if (typeof page.storyNumber === 'number') {
      return `${name}. Story ${page.storyNumber}.`;
    }
    return name;
  }

  function openNameModal() {
    nameInput.value = getUsername();
    nameModal.classList.remove('hidden');
    appScreen.classList.add('hidden');
    nameInput.focus();
  }
  function enterApp() {
    nameModal.classList.add('hidden');
    appScreen.classList.remove('hidden');
  }
  nameBtn.addEventListener('click', openNameModal);
  nameSaveBtn.addEventListener('click', () => {
    const val = nameInput.value.trim() || 'Anonymous';
    setUsername(val);
    enterApp();
  });
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') nameSaveBtn.click();
  });

  if (!getUsername()) {
    openNameModal();
  } else {
    nameLabel.textContent = getUsername();
    enterApp();
  }
  getUserId();

  // ---------- helpers ----------
  function uuid() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
  }

  function isOverBulletCountCap(page, bullet) {
    const idx = page.bullets.findIndex((b) => b.id === bullet.id);
    return idx >= BULLET_LIMIT;
  }

  function isCaretAtStart(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return false;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return false;
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length === 0;
  }

  function isCaretAtEnd(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return false;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return false;
    const post = range.cloneRange();
    post.selectNodeContents(el);
    post.setStart(range.endContainer, range.endOffset);
    return post.toString().length === 0;
  }

  // Like isCaretAtStart/End but based on the selection's focus point, so it
  // also works while shift-extending a selection (non-collapsed).
  function isFocusAtStart(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount || !sel.focusNode) return false;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.setEnd(sel.focusNode, sel.focusOffset);
    return range.toString().length === 0;
  }

  function isFocusAtEnd(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount || !sel.focusNode) return false;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.setStart(sel.focusNode, sel.focusOffset);
    return range.toString().length === 0;
  }

  function getFocusCharOffset(container) {
    const sel = window.getSelection();
    if (!sel.rangeCount || !sel.focusNode) return 0;
    const range = document.createRange();
    range.selectNodeContents(container);
    range.setEnd(sel.focusNode, sel.focusOffset);
    return range.toString().length;
  }

  // The on-screen rect of the caret (collapsed to the selection's focus
  // point), used to detect which visual line it's on and to preserve its
  // horizontal position when arrow-navigating across a bullet boundary.
  // Anchors via resolveNodeOffset (an actual text node + in-node offset)
  // rather than sel.focusNode/focusOffset directly — a collapsed range at a
  // container-boundary position (e.g. right after placeCaretAtEnd, or at the
  // very end of a bullet's text) can otherwise report a degenerate 0-rect,
  // which would make a bullet look like it has no last line at all.
  function getFocusClientRect(container) {
    const offset = getFocusCharOffset(container);
    const { node, offset: nodeOffset } = resolveNodeOffset(container, offset);
    const range = document.createRange();
    try {
      range.setStart(node, nodeOffset);
      range.collapse(true);
    } catch (err) {
      return null;
    }
    const rects = range.getClientRects();
    if (rects.length > 0) return rects[0];
    return range.getBoundingClientRect();
  }

  function isAtFirstLine(el) {
    if (!el.textContent) return true;
    const caretRect = getFocusClientRect(el);
    if (!caretRect) return true;
    const elRect = el.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || caretRect.height || 16;
    return (caretRect.top - elRect.top) < lineHeight * 0.5;
  }

  function isAtLastLine(el) {
    if (!el.textContent) return true;
    const caretRect = getFocusClientRect(el);
    if (!caretRect) return true;
    const elRect = el.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || caretRect.height || 16;
    return (elRect.bottom - caretRect.bottom) < lineHeight * 0.5;
  }

  function placeCaretAtNodeOffset(node, offset) {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function getOffsetWithin(container, node, nodeOffset) {
    const range = document.createRange();
    range.selectNodeContents(container);
    range.setEnd(node, nodeOffset);
    return range.toString().length;
  }

  function bulletIndexOfNode(page, node) {
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    const li = el ? el.closest('.bullet-item') : null;
    if (!li) return -1;
    const bulletId = li.dataset.bulletId;
    return page.bullets.findIndex((b) => b.id === bulletId);
  }

  function closestBulletText(node) {
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    return el ? el.closest('.bullet-text') : null;
  }

  function caretFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(x, y);
      return r ? { node: r.startContainer, offset: r.startOffset } : null;
    }
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      return p ? { node: p.offsetNode, offset: p.offset } : null;
    }
    return null;
  }

  // If the current selection spans more than one bullet, each bullet is a
  // separate contenteditable — the browser's own delete/typing commands only
  // touch whichever one still has DOM focus. Detect that case so it can be
  // handled manually across the data model instead.
  function getMultiBulletSelectionSpan(page) {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed || !sel.anchorNode || !sel.focusNode) return null;
    const anchorIdx = bulletIndexOfNode(page, sel.anchorNode);
    const focusIdx = bulletIndexOfNode(page, sel.focusNode);
    if (anchorIdx === -1 || focusIdx === -1 || anchorIdx === focusIdx) return null;
    const anchorEl = bulletTextElByIndex(page, anchorIdx);
    const focusEl = bulletTextElByIndex(page, focusIdx);
    if (!anchorEl || !focusEl) return null;
    const anchorOffset = getOffsetWithin(anchorEl, sel.anchorNode, sel.anchorOffset);
    const focusOffset = getOffsetWithin(focusEl, sel.focusNode, sel.focusOffset);
    if (anchorIdx < focusIdx) {
      return { startIdx: anchorIdx, startOffset: anchorOffset, endIdx: focusIdx, endOffset: focusOffset };
    }
    return { startIdx: focusIdx, startOffset: focusOffset, endIdx: anchorIdx, endOffset: anchorOffset };
  }

  function deleteMultiBulletSelection(page, span) {
    const startBullet = page.bullets[span.startIdx];
    const endBullet = page.bullets[span.endIdx];
    startBullet.text = startBullet.text.slice(0, span.startOffset) + endBullet.text.slice(span.endOffset);
    page.bullets.splice(span.startIdx + 1, span.endIdx - span.startIdx);
    rebuildBulletList(page);
    const startEl = bulletTextElByIndex(page, span.startIdx);
    if (startEl) setCaretCharOffset(startEl, span.startOffset);
    socket.emit('page:update', page);
    shiftNav = null;
  }

  function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function placeCaretAtStart(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function getCaretCharOffset(container) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return 0;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(container);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
  }

  function getCaretRange(container) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return { start: 0, end: 0 };
    const range = sel.getRangeAt(0);
    const preStart = range.cloneRange();
    preStart.selectNodeContents(container);
    preStart.setEnd(range.startContainer, range.startOffset);
    const start = preStart.toString().length;
    const preEnd = range.cloneRange();
    preEnd.selectNodeContents(container);
    preEnd.setEnd(range.endContainer, range.endOffset);
    const end = preEnd.toString().length;
    return { start: Math.min(start, end), end: Math.max(start, end) };
  }

  function resolveNodeOffset(container, offset) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let node;
    let count = 0;
    let lastNode = null;
    while ((node = walker.nextNode())) {
      lastNode = node;
      const len = node.textContent.length;
      if (count + len >= offset) {
        return { node, offset: Math.max(0, offset - count) };
      }
      count += len;
    }
    if (lastNode) return { node: lastNode, offset: lastNode.textContent.length };
    return { node: container, offset: 0 };
  }

  function setCaretCharOffset(container, offset) {
    container.focus();
    const { node, offset: nodeOffset } = resolveNodeOffset(container, offset);
    const range = document.createRange();
    range.setStart(node, nodeOffset);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function extendSelectionTo(container, offset) {
    const sel = window.getSelection();
    if (!sel.rangeCount) {
      setCaretCharOffset(container, offset);
      return;
    }
    const { node, offset: nodeOffset } = resolveNodeOffset(container, offset);
    sel.extend(node, nodeOffset);
  }

  function scheduleSend(page) {
    clearTimeout(sendTimers.get(page.id));
    sendTimers.set(page.id, setTimeout(() => {
      socket.emit('page:update', page);
    }, 300));
  }

  function renderBulletContent(container, text, wholeRed) {
    container.innerHTML = '';
    if (wholeRed) {
      container.classList.add('over-limit');
      container.appendChild(document.createTextNode(text));
      return;
    }
    container.classList.remove('over-limit');
    const tokens = text.split(/(\s+)/);
    let wordIndex = 0;
    tokens.forEach((tok) => {
      if (tok === '') return;
      const isWhitespace = /^\s+$/.test(tok);
      if (!isWhitespace) wordIndex++;
      if (!isWhitespace && wordIndex > WORD_LIMIT) {
        const span = document.createElement('span');
        span.className = 'over-word';
        span.textContent = tok;
        container.appendChild(span);
      } else {
        container.appendChild(document.createTextNode(tok));
      }
    });
  }

  // The star glyph and count are rendered via CSS generated content (see
  // .bullet-star::before/::after), not real DOM text — otherwise a text
  // selection that merely spans past a bullet's edge would capture the star
  // character as if it were part of the note's text.
  function renderStarButton(btn, starredBy) {
    const arr = starredBy || [];
    const mine = arr.includes(getUserId());
    btn.classList.toggle('starred', mine);
    if (arr.length > 0) {
      btn.classList.add('has-count');
      btn.dataset.count = String(arr.length);
    } else {
      btn.classList.remove('has-count');
      delete btn.dataset.count;
    }
  }

  function toggleStar(arrHolder) {
    const uid = getUserId();
    const idx = arrHolder.starredBy.indexOf(uid);
    if (idx === -1) arrHolder.starredBy.push(uid);
    else arrHolder.starredBy.splice(idx, 1);
  }

  // ---------- rendering ----------
  function buildBulletRow(page, bullet) {
    const li = document.createElement('li');
    li.className = 'bullet-item indent-' + bullet.indent;
    li.dataset.bulletId = bullet.id;
    li.style.marginLeft = (bullet.indent * 20) + 'px';

    const dot = document.createElement('span');
    dot.className = 'bullet-dot';

    const text = document.createElement('div');
    text.className = 'bullet-text';
    text.contentEditable = 'true';
    renderBulletContent(text, bullet.text, isOverBulletCountCap(page, bullet));

    const star = document.createElement('button');
    star.className = 'bullet-star';
    star.title = 'Star this bullet';
    renderStarButton(star, bullet.starredBy);
    star.addEventListener('click', () => {
      toggleStar(bullet);
      renderStarButton(star, bullet.starredBy);
      socket.emit('page:update', page);
    });

    text.addEventListener('input', () => {
      const offset = getCaretCharOffset(text);
      bullet.text = text.textContent;
      renderBulletContent(text, bullet.text, isOverBulletCountCap(page, bullet));
      setCaretCharOffset(text, offset);
      scheduleSend(page);
    });

    // Each bullet is its own contenteditable, so default paste has no way to
    // know about sibling bullets — a multi-line paste (or one replacing a
    // cross-bullet selection) would otherwise land as one run-on bullet.
    // Split it back out into one bullet per line, matching what was copied.
    text.addEventListener('paste', (e) => {
      const clip = e.clipboardData || window.clipboardData;
      const pasted = clip ? clip.getData('text/plain') : '';
      if (!pasted) return;
      const span = getMultiBulletSelectionSpan(page);
      if (!span && !pasted.includes('\n') && !pasted.includes('\r')) return; // plain single-line paste — let native handle it

      e.preventDefault();
      shiftNav = null;

      let targetIdx, start, end;
      if (span) {
        const startBullet = page.bullets[span.startIdx];
        const endBullet = page.bullets[span.endIdx];
        startBullet.text = startBullet.text.slice(0, span.startOffset) + endBullet.text.slice(span.endOffset);
        page.bullets.splice(span.startIdx + 1, span.endIdx - span.startIdx);
        targetIdx = span.startIdx;
        start = end = span.startOffset;
      } else {
        targetIdx = page.bullets.findIndex((b) => b.id === bullet.id);
        const range = getCaretRange(text);
        start = range.start;
        end = range.end;
      }

      const targetBullet = page.bullets[targetIdx];
      const before = targetBullet.text.slice(0, start);
      const after = targetBullet.text.slice(end);
      // Browsers commonly insert blank lines when serializing a copied
      // selection that spans block-level elements (each bullet's text lives
      // in its own <div>) — those are copy artifacts, not intentional empty
      // bullets, so drop them rather than pasting a run of blank bullets.
      const rawLines = pasted.split(/\r\n|\r|\n/);
      const nonBlankLines = rawLines.filter((l) => l.trim() !== '');
      const lines = nonBlankLines.length > 0 ? nonBlankLines : rawLines;

      let finalBulletId, finalOffset;
      if (lines.length === 1) {
        targetBullet.text = before + lines[0] + after;
        finalBulletId = targetBullet.id;
        finalOffset = (before + lines[0]).length;
      } else {
        targetBullet.text = before + lines[0];
        const newBullets = [];
        for (let i = 1; i < lines.length; i++) {
          const lineText = i === lines.length - 1 ? lines[i] + after : lines[i];
          newBullets.push({ id: uuid(), text: lineText, starredBy: [], indent: targetBullet.indent });
        }
        page.bullets.splice(targetIdx + 1, 0, ...newBullets);
        finalBulletId = newBullets[newBullets.length - 1].id;
        finalOffset = lines[lines.length - 1].length;
      }

      rebuildBulletList(page);
      const finalEl = pageEl(page.id).querySelector(`[data-bullet-id="${finalBulletId}"] .bullet-text`);
      if (finalEl) setCaretCharOffset(finalEl, finalOffset);
      socket.emit('page:update', page);
    });

    text.addEventListener('keydown', (e) => {
      const idx = page.bullets.findIndex((b) => b.id === bullet.id);
      const isShiftArrow = e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight');
      if (!isShiftArrow) shiftNav = null;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        const span = getMultiBulletSelectionSpan(page);
        if (span) {
          e.preventDefault();
          deleteMultiBulletSelection(page, span);
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const { start, end } = getCaretRange(text);
        const fullText = bullet.text;
        const before = fullText.slice(0, start);
        const after = fullText.slice(end);
        bullet.text = before;
        const newBullet = { id: uuid(), text: after, starredBy: [], indent: bullet.indent };
        page.bullets.splice(idx + 1, 0, newBullet);
        rebuildBulletList(page);
        const newEl = pageEl(page.id).querySelector(`[data-bullet-id="${newBullet.id}"] .bullet-text`);
        if (newEl) setCaretCharOffset(newEl, 0);
        socket.emit('page:update', page);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          if (bullet.indent > 0) bullet.indent--;
        } else if (idx > 0) {
          const prev = page.bullets[idx - 1];
          if (prev.indent >= bullet.indent) bullet.indent++;
        }
        rebuildBulletList(page);
        const el = pageEl(page.id).querySelector(`[data-bullet-id="${bullet.id}"] .bullet-text`);
        if (el) placeCaretAtEnd(el);
        socket.emit('page:update', page);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const direction = e.key === 'ArrowUp' ? -1 : 1;
        if (e.shiftKey) {
          let curIndex, curOffset;
          if (shiftNav && shiftNav.originEl === text && shiftNav.page === page) {
            curIndex = shiftNav.index;
            curOffset = shiftNav.offset;
          } else {
            curIndex = idx;
            curOffset = getFocusCharOffset(text);
          }
          const targetIdx = curIndex + direction;
          if (targetIdx < 0 || targetIdx >= page.bullets.length) return;
          e.preventDefault();
          const targetEl = bulletTextElByIndex(page, targetIdx);
          if (!targetEl) return;
          const targetOffset = Math.min(curOffset, targetEl.textContent.length);
          extendSelectionTo(targetEl, targetOffset);
          shiftNav = { page, originEl: text, index: targetIdx, offset: targetOffset };
        } else {
          const atBoundary = direction === -1 ? isAtFirstLine(text) : isAtLastLine(text);
          if (!atBoundary) return; // another visual line within this bullet — let native handle it
          const targetIdx = idx + direction;
          if (targetIdx < 0 || targetIdx >= page.bullets.length) return;
          e.preventDefault();
          const targetEl = bulletTextElByIndex(page, targetIdx);
          if (!targetEl) return;

          let landed = false;
          const caretRect = getFocusClientRect(text);
          if (caretRect) {
            const targetRect = targetEl.getBoundingClientRect();
            const targetLineHeight = parseFloat(getComputedStyle(targetEl).lineHeight) || caretRect.height || 16;
            const targetY = direction === -1 ? (targetRect.bottom - targetLineHeight / 2) : (targetRect.top + targetLineHeight / 2);
            const point = caretFromPoint(caretRect.left, targetY);
            if (point) {
              targetEl.focus();
              placeCaretAtNodeOffset(point.node, point.offset);
              landed = true;
            }
          }
          if (!landed) {
            const offset = getCaretCharOffset(text);
            setCaretCharOffset(targetEl, Math.min(offset, targetEl.textContent.length));
          }
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        if (e.shiftKey) {
          if (shiftNav && shiftNav.originEl === text && shiftNav.page === page) {
            e.preventDefault();
            let newIndex = shiftNav.index;
            let newOffset = shiftNav.offset + direction;
            if (newOffset < 0) {
              if (newIndex === 0) return;
              newIndex -= 1;
              const prevEl = bulletTextElByIndex(page, newIndex);
              if (!prevEl) return;
              newOffset = prevEl.textContent.length;
            } else {
              const curEl = bulletTextElByIndex(page, newIndex);
              if (curEl && newOffset > curEl.textContent.length) {
                if (newIndex === page.bullets.length - 1) return;
                newIndex += 1;
                newOffset = 0;
              }
            }
            const targetEl = bulletTextElByIndex(page, newIndex);
            if (!targetEl) return;
            extendSelectionTo(targetEl, newOffset);
            shiftNav = { page, originEl: text, index: newIndex, offset: newOffset };
          } else {
            const atBoundary = direction === -1 ? isFocusAtStart(text) : isFocusAtEnd(text);
            const targetIdx = idx + direction;
            if (!atBoundary || targetIdx < 0 || targetIdx >= page.bullets.length) return;
            e.preventDefault();
            const targetEl = bulletTextElByIndex(page, targetIdx);
            if (!targetEl) return;
            const targetOffset = direction === -1 ? targetEl.textContent.length : 0;
            extendSelectionTo(targetEl, targetOffset);
            shiftNav = { page, originEl: text, index: targetIdx, offset: targetOffset };
          }
        } else {
          const atBoundary = direction === -1 ? isCaretAtStart(text) : isCaretAtEnd(text);
          const targetIdx = idx + direction;
          if (!atBoundary || targetIdx < 0 || targetIdx >= page.bullets.length) return;
          e.preventDefault();
          const targetEl = bulletTextElByIndex(page, targetIdx);
          if (!targetEl) return;
          if (direction === -1) placeCaretAtEnd(targetEl);
          else placeCaretAtStart(targetEl);
        }
        return;
      }

      if (e.key === 'Backspace' && isCaretAtStart(text)) {
        if (bullet.text.length === 0) {
          if (bullet.indent > 0) {
            e.preventDefault();
            bullet.indent--;
            rebuildBulletList(page);
            const el = pageEl(page.id).querySelector(`[data-bullet-id="${bullet.id}"] .bullet-text`);
            if (el) placeCaretAtStart(el);
            socket.emit('page:update', page);
          } else if (page.bullets.length > 1) {
            e.preventDefault();
            page.bullets.splice(idx, 1);
            rebuildBulletList(page);
            const prev = page.bullets[Math.max(0, idx - 1)];
            const prevEl = pageEl(page.id).querySelector(`[data-bullet-id="${prev.id}"] .bullet-text`);
            if (prevEl) placeCaretAtEnd(prevEl);
            socket.emit('page:update', page);
          }
        } else if (idx > 0) {
          e.preventDefault();
          const prev = page.bullets[idx - 1];
          const mergeOffset = prev.text.length;
          prev.text = prev.text + bullet.text;
          page.bullets.splice(idx, 1);
          rebuildBulletList(page);
          const prevEl = pageEl(page.id).querySelector(`[data-bullet-id="${prev.id}"] .bullet-text`);
          if (prevEl) setCaretCharOffset(prevEl, mergeOffset);
          socket.emit('page:update', page);
        }
      }
    });

    li.appendChild(dot);
    li.appendChild(text);
    li.appendChild(star);
    return li;
  }

  function pageEl(id) {
    const entry = pages.get(id);
    return entry ? entry.el : null;
  }

  function bulletTextElByIndex(page, index) {
    const b = page.bullets[index];
    if (!b) return null;
    const el = pageEl(page.id);
    if (!el) return null;
    return el.querySelector(`[data-bullet-id="${b.id}"] .bullet-text`);
  }

  function rebuildBulletList(page) {
    const el = pageEl(page.id);
    if (!el) return;
    const list = el.querySelector('.bullet-list');
    list.innerHTML = '';
    page.bullets.forEach((b) => list.appendChild(buildBulletRow(page, b)));
  }

  function normalizePage(page) {
    if (!page.color) page.color = colorForUser(page.authorId || page.author || 'anon');
    if (!page.starredBy) page.starredBy = [];
    page.bullets.forEach((b) => {
      if (!b.starredBy) b.starredBy = [];
      if (typeof b.indent !== 'number') b.indent = 0;
    });
  }

  function createPageElement(page) {
    normalizePage(page);

    const el = document.createElement('div');
    el.className = 'page';
    el.style.left = page.x + 'px';
    el.style.top = page.y + 'px';
    el.style.zIndex = page.zIndex;
    el.style.background = page.color;
    el.dataset.pageId = page.id;

    const header = document.createElement('div');
    header.className = 'page-header';

    const author = document.createElement('span');
    author.className = 'page-author';
    author.textContent = formatPageAuthorLabel(page);

    const actions = document.createElement('div');
    actions.className = 'page-header-actions';

    const starBtn = document.createElement('button');
    starBtn.className = 'icon-btn star-toggle';
    starBtn.title = 'Star this page';
    renderStarButton(starBtn, page.starredBy);
    starBtn.addEventListener('click', () => {
      toggleStar(page);
      renderStarButton(starBtn, page.starredBy);
      socket.emit('page:update', page);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete this page';
    deleteBtn.addEventListener('click', () => {
      removePageLocal(page.id);
      socket.emit('page:delete', page.id);
    });

    actions.appendChild(starBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(author);
    header.appendChild(actions);

    const list = document.createElement('ul');
    list.className = 'bullet-list';

    el.appendChild(header);
    el.appendChild(list);

    attachDrag(header, page, el);

    pages.set(page.id, { data: page, el });
    pagesLayer.appendChild(el);
    rebuildBulletList(page);
    return el;
  }

  function removePageLocal(id) {
    const entry = pages.get(id);
    if (!entry) return;
    entry.el.remove();
    pages.delete(id);
  }

  // ---------- dragging (pages) ----------
  function attachDrag(handle, page, el) {
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;
    let pending = false;

    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.icon-btn')) return;
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      origX = page.x;
      origY = page.y;
      page.zIndex = ++topZ;
      el.style.zIndex = page.zIndex;
    });

    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      page.x = origX + (e.clientX - startX) / zoom;
      page.y = origY + (e.clientY - startY) / zoom;
      el.style.left = page.x + 'px';
      el.style.top = page.y + 'px';
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          socket.emit('page:move', { id: page.id, x: page.x, y: page.y, zIndex: page.zIndex });
        });
      }
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      socket.emit('page:move', { id: page.id, x: page.x, y: page.y, zIndex: page.zIndex });
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }

  // ---------- floating board labels ----------
  function setLabelEditing(textEl, editing) {
    textEl.contentEditable = editing ? 'true' : 'false';
    textEl.style.cursor = editing ? 'text' : '';
  }

  function labelEl(id) {
    const entry = labels.get(id);
    return entry ? entry.el : null;
  }

  function removeLabelLocal(id) {
    const entry = labels.get(id);
    if (!entry) return;
    entry.el.remove();
    labels.delete(id);
  }

  function createLabelElement(label, opts) {
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'board-label';
    el.style.left = label.x + 'px';
    el.style.top = label.y + 'px';
    el.style.zIndex = label.zIndex;
    el.dataset.labelId = label.id;

    const text = document.createElement('div');
    text.className = 'board-label-text';
    text.textContent = label.text || '';
    setLabelEditing(text, !!opts.startEditing);

    const del = document.createElement('button');
    del.className = 'label-delete';
    del.textContent = '✕';
    del.title = 'Delete this note';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      removeLabelLocal(label.id);
      if (label._synced) socket.emit('label:delete', label.id);
    });

    function commit() {
      setLabelEditing(text, false);
      const val = text.textContent.trim();
      if (!val) {
        removeLabelLocal(label.id);
        if (label._synced) socket.emit('label:delete', label.id);
        return;
      }
      label.text = val;
      text.textContent = val;
      if (!label._synced) {
        label._synced = true;
        socket.emit('label:add', {
          id: label.id, x: label.x, y: label.y, zIndex: label.zIndex,
          text: label.text, author: label.author, authorId: label.authorId,
        });
      } else {
        socket.emit('label:update', { id: label.id, text: label.text });
      }
    }

    text.addEventListener('blur', commit);
    text.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        text.blur();
      }
    });
    text.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (text.contentEditable === 'true') return;
      setLabelEditing(text, true);
      placeCaretAtEnd(text);
    });

    el.appendChild(text);
    el.appendChild(del);

    attachLabelDrag(el, label, text);

    labels.set(label.id, { data: label, el });
    pagesLayer.appendChild(el);
    if (opts.startEditing) {
      requestAnimationFrame(() => text.focus());
    }
    return el;
  }

  function attachLabelDrag(el, label, textEl) {
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;
    let pending = false;

    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.label-delete')) return;
      if (textEl.contentEditable === 'true') return;
      dragging = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      origX = label.x;
      origY = label.y;
      label.zIndex = ++topZ;
      el.style.zIndex = label.zIndex;
    });

    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      label.x = origX + (e.clientX - startX) / zoom;
      label.y = origY + (e.clientY - startY) / zoom;
      el.style.left = label.x + 'px';
      el.style.top = label.y + 'px';
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          if (label._synced) socket.emit('label:move', { id: label.id, x: label.x, y: label.y, zIndex: label.zIndex });
        });
      }
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      if (label._synced) socket.emit('label:move', { id: label.id, x: label.x, y: label.y, zIndex: label.zIndex });
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }

  function boardPointToContent(clientX, clientY) {
    const rect = board.getBoundingClientRect();
    return {
      x: (clientX - rect.left + board.scrollLeft) / zoom,
      y: (clientY - rect.top + board.scrollTop) / zoom,
    };
  }

  function startNewLabel(clientX, clientY) {
    const { x, y } = boardPointToContent(clientX, clientY);
    const label = {
      id: uuid(), x, y, zIndex: ++topZ,
      text: '', author: getUsername() || 'Anonymous', authorId: getUserId(),
      _synced: false,
    };
    createLabelElement(label, { startEditing: true });
  }

  // ---------- zoom ----------
  // Matches Figma/FigJam conventions: continuous zoom (pinch / Ctrl+wheel) is
  // anchored at the cursor; discrete zoom (keyboard shortcuts, toolbar buttons)
  // is anchored at the viewport center. No auto-correction for blank space —
  // "zoom to fit" / "zoom to note" (double-click) are the explicit tools for that.
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function setZoom(newZoom, clientX, clientY) {
    newZoom = clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
    const rect = board.getBoundingClientRect();
    const anchorX = clientX !== undefined ? clientX - rect.left : rect.width / 2;
    const anchorY = clientY !== undefined ? clientY - rect.top : rect.height / 2;
    const contentX = (board.scrollLeft + anchorX) / zoom;
    const contentY = (board.scrollTop + anchorY) / zoom;
    zoom = newZoom;
    pagesLayer.style.transform = `scale(${zoom})`;
    board.scrollLeft = contentX * zoom - anchorX;
    board.scrollTop = contentY * zoom - anchorY;
    zoomLabel.textContent = Math.round(zoom * 100) + '%';
  }

  function focusOnContentRect(minX, minY, maxX, maxY, padding) {
    const rect = board.getBoundingClientRect();
    const contentW = Math.max(1, (maxX - minX) + padding * 2);
    const contentH = Math.max(1, (maxY - minY) + padding * 2);
    const newZoom = clamp(Math.min(rect.width / contentW, rect.height / contentH), MIN_ZOOM, MAX_ZOOM);
    zoom = newZoom;
    pagesLayer.style.transform = `scale(${zoom})`;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    board.scrollLeft = centerX * zoom - rect.width / 2;
    board.scrollTop = centerY * zoom - rect.height / 2;
    zoomLabel.textContent = Math.round(zoom * 100) + '%';
  }

  function zoomToFit() {
    if (pages.size === 0 && labels.size === 0) { setZoom(1); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pages.forEach(({ data, el }) => {
      minX = Math.min(minX, data.x);
      minY = Math.min(minY, data.y);
      maxX = Math.max(maxX, data.x + el.offsetWidth);
      maxY = Math.max(maxY, data.y + el.offsetHeight);
    });
    labels.forEach(({ data, el }) => {
      minX = Math.min(minX, data.x);
      minY = Math.min(minY, data.y);
      maxX = Math.max(maxX, data.x + el.offsetWidth);
      maxY = Math.max(maxY, data.y + el.offsetHeight);
    });
    focusOnContentRect(minX, minY, maxX, maxY, 80);
  }

  function zoomToPage(data, el) {
    focusOnContentRect(data.x, data.y, data.x + el.offsetWidth, data.y + el.offsetHeight, 100);
  }

  zoomInBtn.addEventListener('click', () => setZoom(zoom * 1.2));
  zoomOutBtn.addEventListener('click', () => setZoom(zoom / 1.2));
  zoomResetBtn.addEventListener('click', () => setZoom(1));

  board.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.01;
    setZoom(zoom * (1 + delta), e.clientX, e.clientY);
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      setZoom(zoom * 1.1);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      setZoom(zoom / 1.1);
    } else if (e.key === '0') {
      e.preventDefault();
      setZoom(1);
    }
  });

  // ---------- cross-bullet mouse text selection ----------
  // Each bullet is a separate contenteditable, so native drag-selection
  // refuses to extend past the one it started in. Let native handle drags
  // that stay within a single bullet (preserves double/triple-click word or
  // paragraph selection); the moment a drag crosses into another bullet, take
  // over and drive the real Selection manually via setBaseAndExtent so it can
  // span anywhere the pointer goes.
  pagesLayer.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || e.detail !== 1) { mouseDrag = null; return; }
    const bulletTextEl = e.target.closest('.bullet-text');
    if (!bulletTextEl) { mouseDrag = null; return; }
    mouseDrag = { bulletTextEl, overridden: false };
  });

  document.addEventListener('mousemove', (e) => {
    if (!mouseDrag) return;
    if (e.buttons !== 1) { mouseDrag = null; return; }
    const focusPoint = caretFromPoint(e.clientX, e.clientY);
    if (!focusPoint) return;

    if (!mouseDrag.overridden) {
      if (closestBulletText(focusPoint.node) === mouseDrag.bulletTextEl) return; // still native-handled
      const sel = window.getSelection();
      if (!sel.anchorNode) return;
      mouseDrag.anchorNode = sel.anchorNode;
      mouseDrag.anchorOffset = sel.anchorOffset;
      mouseDrag.overridden = true;
    }

    window.getSelection().setBaseAndExtent(mouseDrag.anchorNode, mouseDrag.anchorOffset, focusPoint.node, focusPoint.offset);
  });

  document.addEventListener('mouseup', () => {
    mouseDrag = null;
  });

  // ---------- blank-space interactions ----------
  pagesLayer.addEventListener('click', (e) => {
    if (e.target !== pagesLayer && e.target !== board) return;
    const cx = e.clientX, cy = e.clientY;
    clearTimeout(blankClickTimer);
    blankClickTimer = setTimeout(() => {
      blankClickTimer = null;
      startNewLabel(cx, cy);
    }, 230);
  });

  pagesLayer.addEventListener('dblclick', (e) => {
    if (e.target === pagesLayer || e.target === board) {
      clearTimeout(blankClickTimer);
      blankClickTimer = null;
      zoomToFit();
      return;
    }
    const pEl = e.target.closest('.page');
    if (pEl && !e.target.closest('.bullet-text') && !e.target.closest('.icon-btn')) {
      const entry = pages.get(pEl.dataset.pageId);
      if (entry) zoomToPage(entry.data, entry.el);
    }
  });

  // ---------- add page ----------
  addPageBtn.addEventListener('click', () => {
    const count = pages.size;
    const x = board.scrollLeft / zoom + 60 + (count % 6) * 30;
    const y = board.scrollTop / zoom + 60 + (count % 6) * 30;
    const myAuthorId = getUserId();
    const page = {
      id: uuid(),
      x, y,
      zIndex: ++topZ,
      author: getUsername() || 'Anonymous',
      authorId: myAuthorId,
      storyNumber: nextStoryNumberForAuthor(myAuthorId),
      color: colorForUser(myAuthorId),
      starredBy: [],
      bullets: [{ id: uuid(), text: '', starredBy: [], indent: 0 }],
    };
    createPageElement(page);
    socket.emit('page:add', page);
    const firstBullet = pageEl(page.id).querySelector('.bullet-text');
    if (firstBullet) firstBullet.focus();
  });

  // ---------- socket events ----------
  socket.on('board:init', (data) => {
    (data.pages || []).forEach((page) => {
      if (pages.has(page.id)) return;
      createPageElement(page);
      if (typeof page.zIndex === 'number') topZ = Math.max(topZ, page.zIndex);
    });
    (data.labels || []).forEach((label) => {
      if (labels.has(label.id)) return;
      label._synced = true;
      createLabelElement(label);
      if (typeof label.zIndex === 'number') topZ = Math.max(topZ, label.zIndex);
    });
  });

  socket.on('page:add', (page) => {
    if (pages.has(page.id)) return;
    createPageElement(page);
    if (typeof page.zIndex === 'number') topZ = Math.max(topZ, page.zIndex);
  });

  socket.on('page:update', (page) => {
    const entry = pages.get(page.id);
    if (!entry) {
      createPageElement(page);
      return;
    }
    normalizePage(page);
    entry.data.bullets = page.bullets;
    entry.data.starredBy = page.starredBy;
    entry.data.author = page.author;
    const el = entry.el;
    const starBtn = el.querySelector('.star-toggle');
    renderStarButton(starBtn, entry.data.starredBy);
    rebuildBulletList(entry.data);
  });

  socket.on('page:move', ({ id, x, y, zIndex }) => {
    const entry = pages.get(id);
    if (!entry) return;
    entry.data.x = x;
    entry.data.y = y;
    entry.el.style.left = x + 'px';
    entry.el.style.top = y + 'px';
    if (typeof zIndex === 'number') {
      entry.data.zIndex = zIndex;
      entry.el.style.zIndex = zIndex;
      topZ = Math.max(topZ, zIndex);
    }
  });

  socket.on('page:delete', (id) => {
    removePageLocal(id);
  });

  socket.on('label:add', (label) => {
    if (labels.has(label.id)) return;
    label._synced = true;
    createLabelElement(label);
    if (typeof label.zIndex === 'number') topZ = Math.max(topZ, label.zIndex);
  });

  socket.on('label:update', (partial) => {
    const entry = labels.get(partial.id);
    if (!entry) return;
    entry.data.text = partial.text;
    entry.el.querySelector('.board-label-text').textContent = partial.text;
  });

  socket.on('label:move', ({ id, x, y, zIndex }) => {
    const entry = labels.get(id);
    if (!entry) return;
    entry.data.x = x;
    entry.data.y = y;
    entry.el.style.left = x + 'px';
    entry.el.style.top = y + 'px';
    if (typeof zIndex === 'number') {
      entry.data.zIndex = zIndex;
      entry.el.style.zIndex = zIndex;
      topZ = Math.max(topZ, zIndex);
    }
  });

  socket.on('label:delete', (id) => {
    removeLabelLocal(id);
  });
})();
