/* ブラウザ版（iPad など）用の electronAPI。
   各画面（本体・EQ・プレイリスト・オプション…）は iframe で、
   親ページの CK（shell.js）を通してやり取りする。 */
(function () {
  'use strict';
  var hub = window.parent && window.parent !== window ? window.parent.CK : null;
  if (!hub) { document.documentElement.style.display = 'none'; location.replace('../index.html'); return; }
  var me = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  if (me === 'index') me = 'main';
  document.documentElement.classList.add('web', 'web-' + me);

  /* iPad の Safari は、画面に触れるまで音を出す仕組み（AudioContext）が止まったまま。
     作られた AudioContext を覚えておき、触れるたびに起こす。 */
  var ctxs = [];
  ['AudioContext', 'webkitAudioContext'].forEach(function (k) {
    var C = window[k]; if (!C) return;
    var W = function (o) { var c = o ? new C(o) : new C(); ctxs.push(c); return c; };
    W.prototype = C.prototype;
    window[k] = W;
  });
  var wake = function () { ctxs.forEach(function (c) { if (c.state !== 'running') c.resume().catch(function () {}); }); };
  ['touchend', 'click', 'keydown'].forEach(function (e) { document.addEventListener(e, wake, true); });
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* 無い端末もある */ }

  var on = function (ch) { return function (cb) { hub.on(me, ch, cb); }; };
  var send = function (ch) { return function (x) { hub.emit(me, ch, x); }; };
  var none = function () { return Promise.resolve(null); };
  var noop = function () {};

  window.electronAPI = {
    platform: 'web',
    urlFor: function (p) { return hub.urlFor(p); },
    openFiles: function () { return hub.pickFiles(); },
    ripDir: none,
    onOpenPaths: on('open-paths'),
    mediaExts: function () { return Promise.resolve(hub.EXTS); },
    mediaMeta: function (p) { return hub.meta(p); },
    alacDecode: function (p) { return hub.alacDecode(p); },
    onAlacProgress: noop,
    metaLookup: none,
    openOptions: function () { hub.show('options'); },
    minimize: noop,
    close: function () { hub.closeFrame(me); },
    toggleFullscreen: function () { hub.toggleFull(me); },
    showFileMenu: function (x, y) { hub.fileMenu(me, x, y); },
    onMenuCommand: function (cb) {
      ['open-files', 'play', 'pause', 'stop', 'prev', 'next'].forEach(function (n) {
        hub.on(me, 'menu:' + n, function () { cb(n); });
      });
    },
    eqToggle: function (v) { v ? hub.show('eq') : hub.hide('eq'); },
    eqApply: send('eq:apply'),
    onEqApply: on('eq:apply'),
    onEqClosed: on('eq:closed'),
    cdScan: function () { return Promise.resolve({ ok: false, error: 'ブラウザ版では使えません。' }); },
    cdLookup: none, cdChooseDir: none, cdRip: none, cdReveal: none, onCdProgress: noop,
    plToggle: function (v) { v ? hub.show('playlist') : hub.hide('playlist'); },
    plState: send('pl:state'),
    onPlState: on('pl:state'),
    plCmd: send('pl:cmd'),
    onPlCmd: on('pl:cmd'),
    onPlRequest: on('pl:request'),
    onPlClosed: on('pl:closed'),
    zoomGet: function () { return Promise.resolve(1); },
    zoomSet: function () { return Promise.resolve(1); },
    skinPick: none, skinRestore: none, skinReset: none,
    pushSettings: function (s) { hub.setSettings(s); },
    getSettings: function () { return Promise.resolve(hub.getSettings()); },
    setMainHeight: noop,
    skinsList: function () { return hub.skinsList(); },
    skinCss: function (id, which) { return hub.skinCss(id, which); },
    skinsOpenDir: none,
    appInfo: function () { return Promise.resolve(hub.appInfo()); },
    openAbout: function () { hub.show('about'); },
    onOpenFailed: on('open-failed'),
    copyText: function (t) { try { navigator.clipboard.writeText(String(t)); } catch (e) { /* 無視 */ } },
    openDocs: none,
    onSettings: on('settings-changed'),
    videoCmd: function (c) { hub.videoCmd(c); },
    onVideoCmd: on('video:cmd'),
    videoEvent: send('video:event'),
    onVideoEvent: on('video:event'),
    onVideoClosed: on('video:closed'),
  };
  /* ブラウザ版では使えない項目を隠す */
  var WEB_CSS = 'html.web-main #btnMin, html.web-main #btnClose { visibility: hidden !important; }'
    + 'html.web-options #btnSkinDir { display: none !important; }';
  var st = document.createElement('style'); st.textContent = WEB_CSS;
  document.documentElement.appendChild(st);
  if (me === 'options') {
    document.addEventListener('DOMContentLoaded', function () {
      Array.prototype.forEach.call(document.querySelectorAll('fieldset'), function (fs) {
        var lg = fs.querySelector('legend');
        var t = lg ? lg.textContent.trim() : '';
        if (t === '曲名' || t === 'CD 取り込み') fs.style.display = 'none';
      });
      var sd = document.getElementById('btnSkinDir');
      if (sd && sd.nextElementSibling && sd.nextElementSibling.classList.contains('note')) sd.nextElementSibling.style.display = 'none';
    });
  }
  hub.ready(me, window);
})();
