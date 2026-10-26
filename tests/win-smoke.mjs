// Windows 上で、作った ちょこっとplayer.exe を実際に動かして確かめる（CI 用）
import { _electron as electron } from 'playwright';
import path from 'node:path';
const [,, exe, mediaDir, testsDir] = process.argv;
let fail = 0;
const check = (ok, label, detail = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + label + (detail ? '  ' + detail : '')); if (!ok) fail++; };
const app = await electron.launch({ executablePath: exe, args: [], timeout: 90000 });
const errs = [];
const win = await app.firstWindow();
win.on('pageerror', (e) => errs.push(String(e.message)));
win.on('console', (m) => { if (m.type() === 'error' || /Content Security Policy/.test(m.text())) errs.push(m.text()); });
await win.waitForLoadState('load'); await win.waitForTimeout(2500);
const ver = await app.evaluate(({ app }) => ({ e: process.versions.electron, v: app.getVersion(), p: process.platform }));
check(ver.e === '43.8.3' && ver.v === '1.1.2', 'version', JSON.stringify(ver));

const send = (p) => app.evaluate(({ BrowserWindow }, p) => BrowserWindow.getAllWindows().find((w) => w.webContents.getURL().endsWith('/index.html')).webContents.send('open-paths', [p]), p);
for (const n of ['plain.wav', 'a#b.wav', '100%25.wav', '日本語 曲名 (live).mp3', 'x#y.flac', 'z#alac.m4a']) {
  const p = path.join(mediaDir, n);
  await send(p); await win.waitForTimeout(n.endsWith('.m4a') ? 6000 : 2500);
  const r = await win.evaluate(() => ({ dur: audio.duration, err: audio.error && audio.error.code, src: audio.getAttribute('src') }));
  check(r.dur > 0.5 && !r.err, 'play ' + n, JSON.stringify(r));
}
await send(path.join(mediaDir, '#1 動画.mp4')); await win.waitForTimeout(5000);
const vw = (await app.windows()).find((w) => w.url().endsWith('/video.html'));
const vr = vw ? await vw.evaluate(() => { const v = document.getElementById('v'); return { dur: v.duration, w: v.videoWidth, err: v.error && v.error.code, src: v.getAttribute('src') }; }) : null;
check(!!vr && vr.dur > 1 && vr.w === 320, 'video #1 動画.mp4', JSON.stringify(vr));

for (const [f, want] of [['good.wsz', true], ['bomb.wsz', false]]) {
  const r = await app.evaluate(({ app }, p) => {
    const req = process.mainModule.require; const { loadSkin } = req(req('path').join(app.getAppPath(), 'build', 'skin.js'));
    const t = Date.now(); const s = loadSkin(p); return { ms: Date.now() - t, main: !!s.images['main.bmp'] };
  }, path.join(testsDir, f));
  check(r.main === want && r.ms < 2000, 'skin ' + f, JSON.stringify(r));
}

// CD：CI にはドライブが無いので「見つからない」系の答えが返れば ckcd.exe が動いている
const cd = await win.evaluate(() => window.electronAPI.cdScan());
check(cd && cd.ok === false && /ドライブ|CD/.test(cd.error || '') && !/ckcd\.exe/.test(cd.error || ''), 'ckcd.exe runs', JSON.stringify(cd));

await win.evaluate((u) => { location.href = u; }, 'file:///' + path.join(mediaDir, 'plain.wav').replace(/\\/g, '/')).catch(() => {});
await win.waitForTimeout(1500);
check(win.url().endsWith('/index.html'), 'navigation blocked', win.url());
await win.evaluate(() => window.open('https://example.com/')).catch(() => {});
await win.waitForTimeout(1000);
check(!(await app.windows()).some((w) => /example\.com/.test(w.url())), 'window.open blocked');
check(errs.length === 0, 'no renderer errors', errs.slice(0, 3).join(' | '));
await win.screenshot({ path: path.join(testsDir, 'win-shot.png') }).catch(() => {});
await app.close();
console.log(fail ? `${fail} FAILED` : 'ALL PASSED');
process.exit(fail ? 1 : 0);
