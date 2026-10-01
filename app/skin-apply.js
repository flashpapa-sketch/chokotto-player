/* 別窓に、本体で選んでいるスキン（配色）を当てる。
   内蔵スキンは data-theme の切り替え、追加スキンは CSS を読み込む。
   本体で見た目を変えると、開いている別窓にもすぐ反映される。 */
(function () {
  const api = window.electronAPI;
  if (!api || !api.getSettings) return;
  const BUILTIN = ['vintage', 'rock', 'glass', 'retro', 'white'];
  let cur = '';
  async function apply(t) {
    if (!t || t === cur) return;
    cur = t;
    const old = document.getElementById('pluginSkin');
    if (t.startsWith('plugin:') && api.skinCss) {
      let css = '';
      try { css = await api.skinCss(t.slice(7), 'main'); } catch { css = ''; }
      if (cur !== t) return;
      if (css) {
        const st = document.createElement('style');
        st.id = 'pluginSkin';
        st.textContent = css;
        // 別窓用の対応表（skin-windows.css）より前に置き、変数だけを効かせる
        const bridge = document.getElementById('skinWindowsCss');
        document.head.insertBefore(st, bridge || null);
        if (old) old.remove();
        document.body.dataset.theme = 'plugin';
        return;
      }
      t = 'vintage';
    }
    if (old) old.remove();
    document.body.dataset.theme = BUILTIN.includes(t) ? t : 'vintage';
  }
  api.getSettings().then((s) => apply((s && s.theme) || 'plugin:signal')).catch(() => apply('plugin:signal'));
  if (api.onSettings) api.onSettings((s) => s && apply(s.theme));
})();
