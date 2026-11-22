/* 兰斋丛编 · 子页脚本
   主题与语言沿用首页的 localStorage 键（hubTheme / hubLang），
   这样从首页点进「关于」不会突然变白或变中文。 */

/* ====== 唯一需要改的地方：把账号名填进来，页面自动显示 ======
   留空 = 该渠道不显示（不会出现空按钮）。
   视频号没有网页地址，只能写名字，页面提示「微信搜一搜」。 */
var CONTACT = {
  xhs:    { name: '永远の兰兰 · 719673770', url: '' },         // 小红书昵称 + 主页链接（url 留空 = 显示「App 内搜索」）
  shipin: { name: '永远の兰兰' },                             // 视频号名字（无链接）
  email:  '',                                                  // 公开邮箱，建议用别名
  github: { name: 'podcatcher962', url: 'https://github.com/podcatcher962' }
};

(function () {
  var root = document.documentElement;
  var theme = 'light';
  var lang = 'zh';
  try {
    theme = localStorage.getItem('hubTheme') || 'light';
    lang = localStorage.getItem('hubLang') || 'zh';
  } catch (e) {}

  var qs = location.search;
  if (/[?&]l=en\b/.test(qs)) lang = 'en';
  if (/[?&]l=zh\b/.test(qs)) lang = 'zh';

  root.setAttribute('data-theme', theme);
  root.setAttribute('data-ui', lang);
  root.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

  window.toggleTheme = function () {
    var cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', cur);
    try { localStorage.setItem('hubTheme', cur); } catch (e) {}
    syncButtons();
  };

  window.setLang = function (l) {
    root.setAttribute('data-ui', l);
    root.setAttribute('lang', l === 'en' ? 'en' : 'zh-CN');
    try { localStorage.setItem('hubLang', l); } catch (e) {}
    syncButtons();
    paintContacts();
  };

  function syncButtons() {
    var t = document.getElementById('btnTheme');
    if (t) t.textContent = root.getAttribute('data-theme') === 'dark' ? '☀' : '🌙';
    var z = document.getElementById('lZh'), e = document.getElementById('lEn');
    var isEn = root.getAttribute('data-ui') === 'en';
    if (z) z.className = isEn ? '' : 'on';
    if (e) e.className = isEn ? 'on' : '';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 联系方式按 CONTACT 渲染；没填的整块不出现，不占位、不留「待补」 */
  function paintContacts() {
    var boxes = document.querySelectorAll('.contact');
    if (!boxes.length) return;
    var zh = root.getAttribute('data-ui') !== 'en';
    var out = [];
    function card(href, title, sub, cls) {
      var tag = href ? 'a' : 'div';
      return '<' + tag + ' class="c ' + (cls || '') + '"' +
        (href ? ' href="' + esc(href) + '" target="_blank" rel="noopener"' : '') + '>' +
        '<b>' + esc(title) + '</b><span>' + esc(sub) + '</span></' + tag + '>';
    }
    if (CONTACT.xhs && CONTACT.xhs.name) {
      out.push(card(CONTACT.xhs.url, zh ? '小红书' : 'Xiaohongshu',
        CONTACT.xhs.name + (CONTACT.xhs.url ? '' : (zh ? '（App 内搜索）' : ' (search in app)')))
      );
    }
    if (CONTACT.shipin && CONTACT.shipin.name) {
      out.push(card('', zh ? '微信视频号' : 'WeChat Channels',
        CONTACT.shipin.name + (zh ? ' · 微信搜一搜' : ' · search in WeChat'), 'off'));
    }
    if (CONTACT.email) {
      out.push(card('mailto:' + CONTACT.email, zh ? '邮箱' : 'Email', CONTACT.email));
    }
    if (CONTACT.github && CONTACT.github.url) {
      out.push(card(CONTACT.github.url, 'GitHub', CONTACT.github.name));
    }
    var html = out.join('');
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].innerHTML = html;
      if (out.length <= 1) boxes[i].classList.add('single');
    }
  }
  function paintYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncButtons();
    paintContacts();
    paintYear();
  });
})();
