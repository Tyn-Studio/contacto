/* Members page, signed-out view: a look inside the members space, built
   from the shop's public teaser feed (thumbnails and counts only). */
(function () {
    'use strict';

    var root = document.querySelector('.mbx-teaser');
    if (!root || !root.dataset.preview) return;

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text) node.textContent = text;
        return node;
    }

    function join() {
        var a = el('a', 'mbx-cta', 'Join free to download them all');
        a.href = '#/portal/signup';
        a.setAttribute('data-portal', 'signup');
        return a;
    }

    fetch(root.dataset.preview)
        .then(function (r) {
            if (!r.ok) throw new Error(String(r.status));
            return r.json();
        })
        .then(function (data) {
            var walls = data.wallpapers || [];
            if (!walls.length && !data.member_discount_pct) return;

            var sec = el('section', 'mbx-sec');
            sec.appendChild(el('h2', 'mbx-h', 'A look inside'));

            if (walls.length) {
                sec.appendChild(el('p', 'mbx-teaser-lead',
                    data.wallpaper_count + ' wallpapers from the photo archive, cropped for desktop and phone. A few of them:'));
                var strip = el('div', 'mbx-teaser-walls');
                walls.forEach(function (w) {
                    var fig = el('figure', 'mbx-teaser-wall');
                    fig.style.setProperty('--ar', w.orientation === 'portrait' ? '0.4615' : '1.7778');
                    var img = el('img');
                    img.src = w.thumb;
                    img.alt = w.title;
                    img.loading = 'lazy';
                    fig.appendChild(img);
                    fig.appendChild(el('figcaption', null, w.title));
                    strip.appendChild(fig);
                });
                sec.appendChild(strip);
            }

            if (data.member_discount_pct) {
                var card = el('div', 'mbx-member-code mbx-teaser-card');
                card.appendChild(el('p', 'mbx-member-code-pct', data.member_discount_pct + '% off everything in the shop'));
                card.appendChild(el('p', 'mbx-member-code-copy',
                    'Prints, books and zines, on every order. Members enter their newsletter email in the basket and the discount is applied.'));
                sec.appendChild(card);
            }

            var cta = el('p', 'mbx-teaser-cta');
            cta.appendChild(join());
            cta.appendChild(el('span', 'mbx-note', 'Free, and you can leave anytime.'));
            sec.appendChild(cta);
            root.appendChild(sec);
        })
        .catch(function () { /* the page works without the teaser */ });
})();
