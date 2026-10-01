/**
 * Winamp クラシックスキン (.wsz) の描画。
 *
 * 座標は Winamp 2.x の仕様に従う。メイン窓は 275x116 固定で、
 * 各スプライトは元 BMP の決まった位置から切り出して決まった位置に置く。
 * BMP は Chromium がデコードできるので data URL のまま background-image に使う。
 */
(function () {
  'use strict';

  // ---- スプライト定義: [元画像, 元X, 元Y, 幅, 高さ] ----
  const S = {
    // titlebar.bmp
    titleActive:   ['titlebar.bmp', 27,  0, 275, 14],
    titleInactive: ['titlebar.bmp', 27, 15, 275, 14],
    btnMenu:       ['titlebar.bmp',  0,  0,   9,  9],
    btnMenuDown:   ['titlebar.bmp',  0,  9,   9,  9],
    btnMin:        ['titlebar.bmp',  9,  0,   9,  9],
    btnMinDown:    ['titlebar.bmp',  9,  9,   9,  9],
    btnShade:      ['titlebar.bmp',  0, 18,   9,  9],
    btnShadeDown:  ['titlebar.bmp',  9, 18,   9,  9],
    btnClose:      ['titlebar.bmp', 18,  0,   9,  9],
    btnCloseDown:  ['titlebar.bmp', 18,  9,   9,  9],

    // cbuttons.bmp
    prev:     ['cbuttons.bmp',   0,  0, 23, 18],
    prevDown: ['cbuttons.bmp',   0, 18, 23, 18],
    play:     ['cbuttons.bmp',  23,  0, 23, 18],
    playDown: ['cbuttons.bmp',  23, 18, 23, 18],
    pause:    ['cbuttons.bmp',  46,  0, 23, 18],
    pauseDown:['cbuttons.bmp',  46, 18, 23, 18],
    stop:     ['cbuttons.bmp',  69,  0, 23, 18],
    stopDown: ['cbuttons.bmp',  69, 18, 23, 18],
    next:     ['cbuttons.bmp',  92,  0, 22, 18],
    nextDown: ['cbuttons.bmp',  92, 18, 22, 18],
    eject:    ['cbuttons.bmp', 114,  0, 22, 16],
    ejectDown:['cbuttons.bmp', 114, 16, 22, 16],

    // posbar.bmp
    posBg:      ['posbar.bmp',   0, 0, 248, 10],
    posThumb:   ['posbar.bmp', 248, 0,  29, 10],
    posThumbDn: ['posbar.bmp', 278, 0,  29, 10],

    // playpaus.bmp（再生状態のランプ）
    lampPlay:  ['playpaus.bmp',  0, 0, 9, 9],
    lampPause: ['playpaus.bmp',  9, 0, 9, 9],
    lampStop:  ['playpaus.bmp', 18, 0, 9, 9],

    // shufrep.bmp（リピート/シャッフル/EQ/PL）
    repOff:       ['shufrep.bmp',  0,  0, 28, 15],
    repOn:        ['shufrep.bmp',  0, 15, 28, 15],
    repOffDown:   ['shufrep.bmp',  0, 30, 28, 15],
    repOnDown:    ['shufrep.bmp',  0, 45, 28, 15],
    shufOff:      ['shufrep.bmp', 28,  0, 47, 15],
    shufOn:       ['shufrep.bmp', 28, 15, 47, 15],
    shufOffDown:  ['shufrep.bmp', 28, 30, 47, 15],
    shufOnDown:   ['shufrep.bmp', 28, 45, 47, 15],
    eqOff:        ['shufrep.bmp',  0, 61, 23, 12],
    eqOn:         ['shufrep.bmp',  0, 73, 23, 12],
    eqOffDown:    ['shufrep.bmp', 46, 61, 23, 12],
    eqOnDown:     ['shufrep.bmp', 46, 73, 23, 12],
    plOff:        ['shufrep.bmp', 23, 61, 23, 12],
    plOn:         ['shufrep.bmp', 23, 73, 23, 12],
    plOffDown:    ['shufrep.bmp', 69, 61, 23, 12],
    plOnDown:     ['shufrep.bmp', 69, 73, 23, 12],
  };

  // ---- 配置座標: [X, Y] ----
  const POS = {
    title:  [0, 0],
    menu:   [6, 3],
    min:    [244, 3],
    shade:  [254, 3],
    close:  [264, 3],

    prev:  [16, 88],
    play:  [39, 88],
    pause: [62, 88],
    stop:  [85, 88],
    next:  [108, 88],
    eject: [136, 89],

    posbar: [16, 72],
    volume: [107, 57],
    lamp:   [26, 28],
    title_text: [111, 27],

    shuffle: [164, 89],
    repeat:  [210, 89],
    eq:      [219, 58],
    pl:      [242, 58],

    // 時間表示（数字4桁）
    digits: [[48, 26], [60, 26], [78, 26], [90, 26]],
  };

  // ---- text.bmp のビットマップフォント（1文字 5x6） ----
  const FONT_ROWS = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ"@ ',
    '0123456789…:()-\'!_+\\/[]^&%.=$#',
    'ÅÖÄ?* ',
  ];
  const CHAR_W = 5, CHAR_H = 6;
  const TITLE_CHARS = 30; // 111..265 を 5px 刻みで

  let images = {};
  let texts = {};
  let root = null;
  let handlers = {};
  let active = false;
  let volumeFrames = 28;

  // トグルボタンの状態
  const toggles = { shuffle: false, repeat: false, eq: false, pl: false };
  const toggleEls = {};

  function has(file) { return !!images[file]; }

  /** スプライト1枚を div にして返す */
  function sprite(def, x, y, extra) {
    const [file, sx, sy, w, h] = def;
    const d = document.createElement('div');
    d.style.cssText =
      'position:absolute;left:' + x + 'px;top:' + y + 'px;' +
      'width:' + w + 'px;height:' + h + 'px;' +
      'background-image:url("' + (images[file] || '') + '");' +
      'background-position:' + (-sx) + 'px ' + (-sy) + 'px;' +
      'background-repeat:no-repeat;image-rendering:pixelated;' +
      (extra || '');
    return d;
  }

  function setSprite(el, def) {
    const [file, sx, sy, w, h] = def;
    el.style.backgroundImage = 'url("' + (images[file] || '') + '")';
    el.style.backgroundPosition = (-sx) + 'px ' + (-sy) + 'px';
    el.style.width = w + 'px';
    el.style.height = h + 'px';
  }

  /** 押下で見た目が変わるボタン */
  function button(upDef, downDef, x, y, onClick, title) {
    const b = sprite(upDef, x, y, 'cursor:pointer;-webkit-app-region:no-drag;');
    if (title) b.title = title;
    if (downDef && has(downDef[0])) {
      b.addEventListener('mousedown', () => setSprite(b, downDef));
      const up = () => setSprite(b, upDef);
      b.addEventListener('mouseup', up);
      b.addEventListener('mouseleave', up);
    }
    b.addEventListener('click', (e) => { e.preventDefault(); onClick && onClick(); });
    return b;
  }

  /** ON/OFF を持つトグルボタン */
  function toggleButton(key, defs, x, y, onToggle, title) {
    const b = sprite(defs.off, x, y, 'cursor:pointer;-webkit-app-region:no-drag;');
    b.title = title;
    const paint = () => setSprite(b, toggles[key] ? defs.on : defs.off);
    b.addEventListener('mousedown', () => setSprite(b, toggles[key] ? defs.onDown : defs.offDown));
    b.addEventListener('mouseleave', paint);
    b.addEventListener('click', (e) => {
      e.preventDefault();
      toggles[key] = !toggles[key];
      paint();
      onToggle && onToggle(toggles[key]);
    });
    toggleEls[key] = { el: b, defs, paint };
    return b;
  }

  /** 外部から状態を反映する（メニューや設定画面で変わった場合） */
  function setToggle(key, value) {
    toggles[key] = !!value;
    if (toggleEls[key]) toggleEls[key].paint();
  }

  /** region.txt を CSS clip-path 用の SVG パスに変換する */
  function regionToPath(txt) {
    if (!txt) return null;
    // [Normal] セクションの NumPoints / PointList を読む
    const sec = /\[Normal\]([\s\S]*?)(?:\[|$)/i.exec(txt);
    const body = sec ? sec[1] : txt;
    const nums = /NumPoints\s*=\s*([^\r\n]+)/i.exec(body);
    const pts = /PointList\s*=\s*([^\r\n]+)/i.exec(body);
    if (!nums || !pts) return null;

    const counts = nums[1].split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => n > 0);
    const flat = pts[1].split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    if (!counts.length || !flat.length) return null;

    let i = 0;
    const parts = [];
    for (const c of counts) {
      const need = c * 2;
      if (i + need > flat.length) break;
      const seg = flat.slice(i, i + need);
      i += need;
      let d = 'M' + seg[0] + ',' + seg[1];
      for (let k = 2; k < seg.length; k += 2) d += 'L' + seg[k] + ',' + seg[k + 1];
      parts.push(d + 'Z');
    }
    return parts.length ? parts.join(' ') : null;
  }

  /** 文字を text.bmp から引く */
  function glyphPos(ch) {
    const up = ch.toUpperCase();
    for (let r = 0; r < FONT_ROWS.length; r++) {
      const i = FONT_ROWS[r].indexOf(up);
      if (i >= 0) return [i * CHAR_W, r * CHAR_H];
    }
    return [FONT_ROWS[0].indexOf(' ') * CHAR_W, 0]; // 不明な文字は空白
  }

  let titleCells = [];
  let digitCells = [];
  let posThumbEl = null;
  let volThumbEl = null;
  let volBgEl = null;
  let lampEl = null;

  let jpTitleEl = null;

  /** スキンを適用して DOM を組み立てる */
  function apply(imgs, txts, hooks) {
    images = imgs || {};
    texts = txts || {};
    handlers = hooks || {};
    if (!has('main.bmp')) return false;

    root = document.getElementById('wszSkin');
    if (!root) return false;
    root.innerHTML = '';
    titleCells = []; digitCells = [];
    for (const k in toggleEls) delete toggleEls[k];

    root.style.cssText =
      'position:absolute;left:0;top:0;width:275px;height:116px;' +
      'background-image:url("' + images['main.bmp'] + '");' +
      'background-repeat:no-repeat;image-rendering:pixelated;overflow:hidden;' +
      '-webkit-app-region:drag;';

    // --- タイトルバー ---
    if (has('titlebar.bmp')) {
      root.appendChild(sprite(S.titleActive, POS.title[0], POS.title[1], '-webkit-app-region:drag;'));
      root.appendChild(button(S.btnMenu,  S.btnMenuDown,  POS.menu[0],  POS.menu[1],  () => handlers.onMenu && handlers.onMenu(), 'メニュー'));
      root.appendChild(button(S.btnMin,   S.btnMinDown,   POS.min[0],   POS.min[1],   () => handlers.onMinimize && handlers.onMinimize(), '最小化'));
      root.appendChild(button(S.btnClose, S.btnCloseDown, POS.close[0], POS.close[1], () => handlers.onClose && handlers.onClose(), '閉じる'));
    }

    // --- 操作ボタン ---
    if (has('cbuttons.bmp')) {
      root.appendChild(button(S.prev,  S.prevDown,  POS.prev[0],  POS.prev[1],  () => handlers.onPrev && handlers.onPrev(), '前の曲'));
      root.appendChild(button(S.play,  S.playDown,  POS.play[0],  POS.play[1],  () => handlers.onPlay && handlers.onPlay(), '再生'));
      root.appendChild(button(S.pause, S.pauseDown, POS.pause[0], POS.pause[1], () => handlers.onPause && handlers.onPause(), '一時停止'));
      root.appendChild(button(S.stop,  S.stopDown,  POS.stop[0],  POS.stop[1],  () => handlers.onStop && handlers.onStop(), '停止'));
      root.appendChild(button(S.next,  S.nextDown,  POS.next[0],  POS.next[1],  () => handlers.onNext && handlers.onNext(), '次の曲'));
      root.appendChild(button(S.eject, S.ejectDown, POS.eject[0], POS.eject[1], () => handlers.onOpen && handlers.onOpen(), 'ファイルを開く'));
    }

    // --- シークバー ---
    if (has('posbar.bmp')) {
      const track = sprite(S.posBg, POS.posbar[0], POS.posbar[1], '-webkit-app-region:no-drag;cursor:pointer;');
      posThumbEl = sprite(S.posThumb, 0, 0, 'position:absolute;left:0;top:0;-webkit-app-region:no-drag;');
      track.appendChild(posThumbEl);
      hookDrag(track, 248 - 29, (f) => handlers.onSeek && handlers.onSeek(f), posThumbEl, S.posThumb, S.posThumbDn);
      root.appendChild(track);
    }

    // --- 音量 ---
    if (has('volume.bmp')) {
      volBgEl = sprite(['volume.bmp', 0, 0, 68, 13], POS.volume[0], POS.volume[1],
                       '-webkit-app-region:no-drag;cursor:pointer;');
      volThumbEl = sprite(['volume.bmp', 15, 422, 14, 11], 0, 1,
                          'position:absolute;-webkit-app-region:no-drag;');
      volBgEl.appendChild(volThumbEl);
      hookDrag(volBgEl, 68 - 14, (f) => handlers.onVolume && handlers.onVolume(f), volThumbEl,
               ['volume.bmp', 15, 422, 14, 11], ['volume.bmp', 0, 422, 14, 11]);
      root.appendChild(volBgEl);
    }

    // --- 再生状態ランプ ---
    if (has('playpaus.bmp')) {
      lampEl = sprite(S.lampStop, POS.lamp[0], POS.lamp[1], '');
      root.appendChild(lampEl);
    }

    // --- 時間表示 ---
    const numFile = has('nums_ex.bmp') ? 'nums_ex.bmp' : (has('numbers.bmp') ? 'numbers.bmp' : null);
    if (numFile) {
      for (let i = 0; i < 4; i++) {
        const d = sprite([numFile, 0, 0, 9, 13], POS.digits[i][0], POS.digits[i][1], '');
        d.dataset.file = numFile;
        digitCells.push(d);
        root.appendChild(d);
      }
    }

    // --- シャッフル / リピート / EQ / PL ---
    if (has('shufrep.bmp')) {
      root.appendChild(toggleButton('shuffle',
        { off: S.shufOff, on: S.shufOn, offDown: S.shufOffDown, onDown: S.shufOnDown },
        POS.shuffle[0], POS.shuffle[1],
        (v) => handlers.onShuffle && handlers.onShuffle(v), 'シャッフル'));

      root.appendChild(toggleButton('repeat',
        { off: S.repOff, on: S.repOn, offDown: S.repOffDown, onDown: S.repOnDown },
        POS.repeat[0], POS.repeat[1],
        (v) => handlers.onRepeat && handlers.onRepeat(v), 'リピート'));

      // EQ / PL は対応するウィンドウを実装済みのときだけ出す。
      // 押しても何も起きないボタンを表示しないための判定。
      if (handlers.onEqualizer) {
        root.appendChild(toggleButton('eq',
          { off: S.eqOff, on: S.eqOn, offDown: S.eqOffDown, onDown: S.eqOnDown },
          POS.eq[0], POS.eq[1], handlers.onEqualizer, 'イコライザ'));
      }
      if (handlers.onPlaylist) {
        root.appendChild(toggleButton('pl',
          { off: S.plOff, on: S.plOn, offDown: S.plOffDown, onDown: S.plOnDown },
          POS.pl[0], POS.pl[1], handlers.onPlaylist, 'プレイリスト'));
      }
    }

    // --- 曲名（ビットマップフォント） ---
    if (has('text.bmp')) {
      for (let i = 0; i < TITLE_CHARS; i++) {
        const c = sprite(['text.bmp', 0, 0, CHAR_W, CHAR_H],
                         POS.title_text[0] + i * CHAR_W, POS.title_text[1], '');
        titleCells.push(c);
        root.appendChild(c);
      }
    }

    // --- 日本語などの曲名用の代替表示 ---
    // text.bmp は英数記号しか持たないため、収録外の文字が含まれる場合は
    // 通常フォントで描く。配色は pledit.txt の Normal を使う。
    jpTitleEl = document.createElement('div');
    jpTitleEl.style.cssText =
      'position:absolute;left:' + POS.title_text[0] + 'px;top:' + (POS.title_text[1] - 2) + 'px;' +
      'width:' + (TITLE_CHARS * CHAR_W) + 'px;height:10px;line-height:10px;' +
      'font-family:"MS UI Gothic","ＭＳ Ｐゴシック",sans-serif;font-size:9px;' +
      'white-space:nowrap;overflow:hidden;display:none;pointer-events:none;' +
      'color:' + (pleditColor('normal') || '#00FF00') + ';';
    root.appendChild(jpTitleEl);

    // --- region.txt があれば窓を切り抜く ---
    const path = regionToPath(texts['region.txt']);
    if (path) {
      root.style.clipPath = 'path("' + path + '")';
      document.body.classList.add('shaped');
    } else {
      root.style.clipPath = '';
      document.body.classList.remove('shaped');
    }

    active = true;
    document.body.classList.add('skinned');
    return true;
  }

  /** pledit.txt から配色を取り出す（例: Normal=#00FF00） */
  function pleditColor(key) {
    const t = texts['pledit.txt'];
    if (!t) return null;
    const m = new RegExp('^\\s*' + key + '\\s*=\\s*(#?[0-9A-Fa-f]{6})', 'im').exec(t);
    if (!m) return null;
    return m[1].startsWith('#') ? m[1] : '#' + m[1];
  }

  /** つまみのドラッグ操作 */
  function hookDrag(track, maxX, onChange, thumb, upDef, downDef) {
    let dragging = false;
    const calc = (e) => {
      const r = track.getBoundingClientRect();
      let x = e.clientX - r.left - (thumb.offsetWidth / 2);
      x = Math.max(0, Math.min(maxX, x));
      return x / maxX;
    };
    track.addEventListener('mousedown', (e) => {
      dragging = true;
      if (downDef && has(downDef[0])) setSprite(thumb, downDef);
      onChange(calc(e));
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => { if (dragging) onChange(calc(e)); });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      if (upDef && has(upDef[0])) setSprite(thumb, upDef);
    });
  }

  /** 表示の更新 */
  function update(st) {
    if (!active) return;

    // 曲名。text.bmp に無い文字（日本語など）が含まれるなら通常フォントに切り替える
    const raw = st.title || '';
    const needsFallback = /[^\x20-\x7E]/.test(raw);

    if (jpTitleEl) {
      jpTitleEl.style.display = needsFallback ? 'block' : 'none';
      if (needsFallback) jpTitleEl.textContent = raw;
    }
    if (titleCells.length) {
      const show = needsFallback ? '' : raw;
      const text = show.slice(0, TITLE_CHARS).padEnd(TITLE_CHARS, ' ');
      for (let i = 0; i < titleCells.length; i++) {
        const [gx, gy] = glyphPos(text[i] || ' ');
        titleCells[i].style.backgroundPosition = (-gx) + 'px ' + (-gy) + 'px';
      }
    }

    // 時間（分:秒）
    if (digitCells.length) {
      const t = Math.max(0, Math.floor(st.current || 0));
      const mm = Math.floor(t / 60), ss = t % 60;
      const ds = [Math.floor(mm / 10) % 10, mm % 10, Math.floor(ss / 10), ss % 10];
      for (let i = 0; i < 4; i++) {
        digitCells[i].style.backgroundPosition = (-(ds[i] * 9)) + 'px 0px';
      }
    }

    // シーク位置
    if (posThumbEl && st.duration) {
      const f = Math.max(0, Math.min(1, (st.current || 0) / st.duration));
      posThumbEl.style.left = Math.round(f * (248 - 29)) + 'px';
    }

    // 音量つまみと背景フレーム
    if (volThumbEl) {
      const v = Math.max(0, Math.min(1, (st.volume ?? 0.7)));
      volThumbEl.style.left = Math.round(v * (68 - 14)) + 'px';
      if (volBgEl) {
        const frame = Math.min(volumeFrames - 1, Math.round(v * (volumeFrames - 1)));
        volBgEl.style.backgroundPosition = '0px ' + (-(frame * 15)) + 'px';
      }
    }

    // 再生状態ランプ
    if (lampEl) {
      setSprite(lampEl, st.state === 'playing' ? S.lampPlay
                      : st.state === 'paused'  ? S.lampPause
                                               : S.lampStop);
    }
  }

  function clear() {
    active = false;
    if (root) { root.innerHTML = ''; root.style.clipPath = ''; }
    document.body.classList.remove('skinned', 'shaped');
  }

  window.WinampSkin = {
    apply, update, clear,
    isActive: () => active,
    setToggle,
    color: pleditColor,
  };
})();
