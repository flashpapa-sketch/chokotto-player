/* ちょこっとplayer ブラウザ版の土台。
   本体・EQ・プレイリスト・オプション・ヘルプ・映像を iframe で並べ、
   それぞれの画面からの呼び出し（electronAPI の代わり）をここで受ける。
   曲はこの端末の中だけで扱い、どこにも送らない。 */
(function () {
  'use strict';
  var VERSION = '1.1.1';
  var VIDEO = ['mp4', 'm4v', 'webm', 'mkv', 'mov'];
  var AUDIO = ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'mka', 'weba'];
  var DEF = { volume: 100, speed: 1, loop: 'none', shuffle: false, hires: false, netMeta: false, theme: 'plugin:signal' };
  var THEMES = ['vintage', 'rock', 'white', 'glass', 'retro'];
  var FRAMES = {
    main:     { src: 'app/index.html',    w: 275, h: 116, dock: true },
    eq:       { src: 'app/eq.html',       w: 275, h: 116, dock: true },
    playlist: { src: 'app/playlist.html', w: 275, h: 232, dock: true },
    options:  { src: 'app/options.html',  w: 275, h: 340, modal: true },
    about:    { src: 'app/about.html',    w: 430, h: 640, modal: true },
    video:    { src: 'app/video.html',    w: 960, h: 540, video: true },
  };
  var ORDER = ['main', 'eq', 'playlist'];

  var listeners = {};     // name -> { channel: [cb] }
  var wins = {};          // name -> window（読み込み済み）
  var pending = {};       // name -> [[ch, x]] 読み込み前に届いた知らせ
  var files = {};         // 仮のパス -> { file, url }
  var seq = 0;
  var settings = load();

  function load() {
    var s = {};
    try { s = JSON.parse(localStorage.getItem('ck-settings') || '{}') || {}; } catch (e) { s = {}; }
    return sanitize(s);
  }
  function sanitize(s) {
    var n = function (v, a, b, d) { v = Number(v); return isFinite(v) && v >= a && v <= b ? v : d; };
    return {
      volume: n(s.volume, 0, 200, DEF.volume), speed: n(s.speed, 0.5, 2, DEF.speed),
      loop: ['none', 'one', 'all'].indexOf(s.loop) >= 0 ? s.loop : DEF.loop,
      shuffle: s.shuffle === true, hires: s.hires === true, netMeta: false,
      theme: (THEMES.indexOf(s.theme) >= 0 || /^plugin:[A-Za-z0-9_-]{1,64}$/.test(String(s.theme))) ? s.theme : DEF.theme,
    };
  }

  /* ---------- 画面（iframe）の出し入れ ---------- */
  var stage = document.getElementById('stage');
  var dock = document.getElementById('dock');
  var modal = document.getElementById('modal');
  var vlayer = document.getElementById('video');
  var holders = {};

  function frame(name) {
    if (holders[name]) return holders[name];
    var f = FRAMES[name];
    var box = document.createElement('div');
    box.className = 'fr fr-' + name;
    var ifr = document.createElement('iframe');
    ifr.src = f.src;
    ifr.title = name;
    ifr.setAttribute('allow', 'autoplay; fullscreen');
    ifr.setAttribute('allowfullscreen', '');
    ifr.style.width = f.w + 'px';
    ifr.style.height = f.h + 'px';
    box.appendChild(ifr);
    box.hidden = true;
    if (f.dock) {
      // 本体 → EQ → プレイリストの順に並べる
      var after = null;
      for (var i = ORDER.indexOf(name) + 1; i < ORDER.length; i++) if (holders[ORDER[i]]) { after = holders[ORDER[i]]; break; }
      dock.insertBefore(box, after);
    } else if (f.modal) {
      modal.appendChild(box);
    } else {
      vlayer.appendChild(box);
    }
    holders[name] = box;
    layout();
    return box;
  }
  function visible(name) { return !!holders[name] && !holders[name].hidden; }
  function show(name) {
    var box = frame(name);
    var was = !box.hidden;
    box.hidden = false;
    if (FRAMES[name].modal) modal.hidden = false;
    if (FRAMES[name].video) vlayer.hidden = false;
    layout();
    if (name === 'playlist' && !was && wins.playlist) deliver('main', 'pl:request');
    if (name === 'about' && !was && wins.about) { try { wins.about.location.reload(); } catch (e) { /* 無視 */ } }
  }
  function hide(name, quiet) {
    var box = holders[name];
    if (!box || box.hidden) return;
    box.hidden = true;
    if (FRAMES[name].modal && !Array.prototype.some.call(modal.children, function (c) { return !c.hidden; })) modal.hidden = true;
    if (FRAMES[name].video) { vlayer.hidden = true; vlayer.classList.remove('full'); }
    layout();
    if (quiet) return;
    if (name === 'eq') deliver('main', 'eq:closed');
    if (name === 'playlist') deliver('main', 'pl:closed');
    if (name === 'video') { deliver('video', 'video:cmd', { type: 'stop' }); deliver('main', 'video:closed'); }
  }

  /* 端末の幅に合わせて拡大する（iPad で指で押しやすい大きさに） */
  function layout() {
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var s = Math.max(1, Math.min(3.2, (vw - 24) / 275));
    var used = 0;
    ORDER.forEach(function (n) { if (visible(n)) used += FRAMES[n].h; });
    // 縦に入りきらないときは少し縮める（ヒントの分も残す）
    if (used * s + 120 > vh) s = Math.max(1, (vh - 120) / used);
    Object.keys(holders).forEach(function (n) {
      var f = FRAMES[n], box = holders[n], ifr = box.firstChild, k = s;
      if (f.modal) k = Math.max(1, Math.min(s, (vw - 24) / f.w, (vh - 24) / f.h));
      if (f.video) {
        k = Math.min((vw - 16) / f.w, (vh * (vlayer.classList.contains('full') ? 1 : 0.6)) / f.h);
        if (vlayer.classList.contains('full')) k = Math.min(vw / f.w, vh / f.h);
      }
      box.style.width = Math.round(f.w * k) + 'px';
      box.style.height = Math.round(f.h * k) + 'px';
      ifr.style.transform = 'scale(' + k + ')';
    });
    document.documentElement.style.setProperty('--k', s);
  }
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', function () { setTimeout(layout, 300); });

  /* ---------- 知らせの受け渡し ---------- */
  function deliver(to, ch, x) {
    var w = wins[to];
    if (!w) { (pending[to] = pending[to] || []).push([ch, x]); return; }
    var l = listeners[to] && listeners[to][ch];
    if (l) l.slice().forEach(function (cb) { try { cb(x); } catch (e) { console.error(e); } });
  }
  var ROUTE = {
    'eq:apply': ['main', 'video'], 'pl:state': ['playlist'], 'pl:cmd': ['main'],
    'video:event': ['main'],
  };

  var CK = window.CK = {
    EXTS: { video: VIDEO, audio: AUDIO },
    on: function (who, ch, cb) {
      var m = listeners[who] = listeners[who] || {};
      (m[ch] = m[ch] || []).push(cb);
    },
    emit: function (from, ch, x) {
      var to = ROUTE[ch] || Object.keys(wins).filter(function (n) { return n !== from; });
      to.forEach(function (n) { if (wins[n] || n !== 'video') deliver(n, ch, x); });
    },
    ready: function (who, w) {
      wins[who] = w;
      listeners[who] = {};
      // 各画面の初期化（リスナー登録）が済んでから、溜まっていた知らせを渡す
      setTimeout(function () {
        var q = pending[who] || []; pending[who] = [];
        q.forEach(function (p) { deliver(who, p[0], p[1]); });
        if (who === 'playlist') deliver('main', 'pl:request');
        if (who === 'main') document.body.classList.add('ready');
      }, 0);
    },
    show: show,
    hide: hide,
    closeFrame: function (who) { if (who !== 'main') hide(who); },
    toggleFull: function (who) {
      if (who !== 'video') return;
      vlayer.classList.toggle('full'); layout();
    },
    getSettings: function () { return Object.assign({}, settings); },
    setSettings: function (s) {
      settings = sanitize(Object.assign({}, settings, s));
      try { localStorage.setItem('ck-settings', JSON.stringify(settings)); } catch (e) { /* 保存できなくても動く */ }
      Object.keys(wins).forEach(function (n) { deliver(n, 'settings-changed', Object.assign({}, settings)); });
      document.documentElement.dataset.theme = settings.theme;
    },
    skinsList: function () {
      return fetch('app/skins/index.json').then(function (r) { return r.json(); }).catch(function () { return []; });
    },
    skinCss: function (id, which) {
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(String(id))) return Promise.resolve('');
      return fetch('app/skins/' + id + '/' + (which === 'options' ? 'options' : 'main') + '.css')
        .then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; });
    },
    appInfo: function () {
      return { version: VERSION, company: 'Chokotto Software', packaged: true,
        os: navigator.userAgent, electron: '—（ブラウザ版）', chrome: '—', node: '—',
        exeDir: location.origin + location.pathname, settings: 'このブラウザの中（localStorage）' };
    },
    urlFor: function (p) {
      var f = files[p];
      if (!f) return '';
      if (!f.url) f.url = URL.createObjectURL(f.file);
      return f.url;
    },
    videoCmd: function (c) {
      if (!c) return;
      if (c.type === 'load') { show('video'); deliver('video', 'video:cmd', c); return; }
      if (wins.video) deliver('video', 'video:cmd', c);
    },
    fileMenu: fileMenu,
    pickFiles: pickFiles,
    meta: meta,
    alacDecode: function (p) {
      if (canAlac()) return Promise.resolve({ ok: true, path: p });
      return Promise.resolve({ ok: false, error: 'このブラウザは ALAC を再生できません（iPad・Mac の Safari では再生できます）' });
    },
  };

  /* ---------- 曲を選ぶ ---------- */
  function addFiles(list) {
    var out = [];
    Array.prototype.forEach.call(list, function (file) {
      var ext = (file.name.split('.').pop() || '').toLowerCase();
      if (VIDEO.indexOf(ext) < 0 && AUDIO.indexOf(ext) < 0) return;
      var p = '/web/' + (++seq) + '/' + file.name;
      files[p] = { file: file, url: null };
      out.push(p);
    });
    return out;
  }
  function pickFiles() {
    return new Promise(function (resolve) {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.multiple = true;
      inp.accept = VIDEO.concat(AUDIO).map(function (e) { return '.' + e; }).join(',') + ',audio/*,video/*';
      inp.style.display = 'none';
      inp.addEventListener('change', function () {
        resolve(addFiles(inp.files || []));
        inp.remove();
      });
      document.body.appendChild(inp);
      inp.click();
    });
  }
  // 「ファイル」アプリなどからドラッグして渡された曲
  document.addEventListener('dragover', function (e) { e.preventDefault(); });
  document.addEventListener('drop', function (e) {
    e.preventDefault();
    var ps = addFiles((e.dataTransfer && e.dataTransfer.files) || []);
    if (ps.length) deliver('main', 'open-paths', ps);
  });

  /* ---------- 形式の読み取り（タグ・ビット数・周波数） ---------- */
  var probe = document.createElement('audio');
  var can = function (t) { try { return probe.canPlayType(t) !== ''; } catch (e) { return false; } };
  function canAlac() { return can('audio/mp4; codecs="alac"') || /iPad|iPhone|Macintosh/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|Edg/.test(navigator.userAgent); }
  var TYPE = { mp3: 'audio/mpeg', aac: 'audio/mp4; codecs="mp4a.40.2"', flac: 'audio/flac',
    vorbis: 'audio/ogg; codecs="vorbis"', opus: 'audio/ogg; codecs="opus"', pcm: 'audio/wav' };
  var HEAD = 8 * 1024 * 1024, WHOLE = 48 * 1024 * 1024;
  function slice(file, a, b) { return file.slice(a, b).arrayBuffer().then(function (x) { return { pos: a, data: new Uint8Array(x) }; }); }
  function meta(p) {
    var f = files[p];
    if (!f || !window.CKMeta) return Promise.resolve(null);
    var file = f.file, size = file.size;
    var parts = size <= WHOLE ? [slice(file, 0, size)]
      : [slice(file, 0, HEAD), slice(file, Math.max(HEAD, size - HEAD), size)];
    return Promise.all(parts).then(function (chunks) {
      var m = window.CKMeta.read(p, size, chunks);
      if (!m) return null;
      m.hasCover = !!m.cover; delete m.cover;
      if (m.codec === 'alac') m.nativePlayable = canAlac();
      else if (TYPE[m.codec] && m.nativePlayable && !can(TYPE[m.codec])) m.nativePlayable = false;
      if (m.tags && m.tags.titleFromFilename) m.tags.title = file.name.replace(/\.[^.]+$/, '');
      return m;
    }).catch(function () { return null; });
  }

  /* ---------- 「File」メニュー ---------- */
  var menu = document.getElementById('menu');
  function fileMenu(who, x, y) {
    var box = holders[who];
    if (!box) return;
    var r = box.getBoundingClientRect(), k = r.width / FRAMES[who].w;
    menu.style.left = Math.round(r.left + x * k) + 'px';
    menu.style.top = Math.round(r.top + window.scrollY + y * k + 4) + 'px';
    menu.hidden = false;
  }
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    menu.hidden = true;
    var c = b.dataset.cmd;
    if (c === 'options' || c === 'about') { show(c); return; }
    deliver('main', 'menu:' + c);
  });
  document.addEventListener('pointerdown', function (e) { if (!menu.hidden && !menu.contains(e.target)) menu.hidden = true; }, true);
  modal.addEventListener('click', function (e) { if (e.target === modal) Object.keys(FRAMES).forEach(function (n) { if (FRAMES[n].modal) hide(n); }); });

  /* ---------- 起動 ---------- */
  document.documentElement.dataset.theme = settings.theme;
  show('main');
  var standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  if (standalone) document.body.classList.add('standalone');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () { /* 無くても動く */ });
  }
})();
