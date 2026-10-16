/* Contacto — portfolio wall. Lays the page's photos out in justified rows,
   builds category filters from the captions ("Street · Amsterdam, 2025")
   and opens a full-screen viewer. Without JS the photos are a plain column. */
(function () {
    'use strict';

    var wall = document.querySelector('.wall');
    if (!wall) return;
    var figures = Array.prototype.slice.call(wall.querySelectorAll('figure.kg-image-card'));
    if (!figures.length) return;
    document.documentElement.classList.add('has-wall');

    var CAT = /^\s*([^·|:]+?)\s*[·|:]\s*(.*)$/;
    // Ghost resizes on request: /size/w600/format/webp/... gives a WebP of
    // that width, far lighter than the JPEG sizes in the default srcset.
    var WIDTHS = [300, 600, 1000, 1600, 2000];
    var GHOST = /\/content\/images\/(?:size\/w\d+\/(?:format\/\w+\/)?)?/;
    function sized(src, w) {
        return GHOST.test(src) ? src.replace(GHOST, '/content/images/size/w' + w + '/format/webp/') : src;
    }
    var counts = {};
    var order = [];

    figures.forEach(function (fig, index) {
        var img = fig.querySelector('img');
        var original = img.getAttribute('src');
        if (GHOST.test(original)) {
            img.srcset = WIDTHS.map(function (w) { return sized(original, w) + ' ' + w + 'w'; }).join(', ');
            img.dataset.full = sized(original, 2000);
        }
        // The first rows are on screen at once: fetch them straight away.
        if (index < 8) {
            img.loading = 'eager';
            if (index < 2) img.setAttribute('fetchpriority', 'high');
        }
        var cap = fig.querySelector('figcaption');
        var text = cap ? cap.textContent.trim() : '';
        var m = text.match(CAT);
        var cat = m ? m[1] : '';
        var place = m ? m[2] : text;
        if (cap) cap.textContent = place;
        fig.dataset.cat = cat.toLowerCase();
        fig.dataset.place = place;
        if (cat) {
            if (!counts[cat]) { counts[cat] = 0; order.push(cat); }
            counts[cat] += 1;
        }
        function ratio() {
            var w = img.naturalWidth || +img.getAttribute('width');
            var h = img.naturalHeight || +img.getAttribute('height');
            if (w && h) fig.style.setProperty('--ar', (w / h).toFixed(3));
        }
        ratio();
        if (!img.complete) img.addEventListener('load', ratio);
        fig.tabIndex = 0;
    });

    // Tell the browser how wide each photo is drawn, so it picks the
    // smallest file that is still sharp.
    function setSizes() {
        figures.forEach(function (fig) {
            var w = fig.getBoundingClientRect().width;
            if (w) fig.querySelector('img').sizes = Math.ceil(w) + 'px';
        });
    }
    setSizes();
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setSizes, 200);
    });

    // Filters
    var bar = document.querySelector('.wall-filters');
    function button(label, value, n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.dataset.value = value;
        b.innerHTML = label + ' <span>' + n + '</span>';
        b.addEventListener('click', function () { filter(value, true); });
        bar.appendChild(b);
    }
    function filter(value, push) {
        figures.forEach(function (fig) {
            fig.hidden = !!value && fig.dataset.cat !== value;
        });
        setSizes();
        Array.prototype.forEach.call(bar.children, function (b) {
            b.setAttribute('aria-pressed', b.dataset.value === value ? 'true' : 'false');
        });
        if (push) history.replaceState(null, '', value ? '#' + value : location.pathname);
    }
    if (bar && order.length > 1) {
        button('All', '', figures.length);
        order.forEach(function (c) { button(c, c.toLowerCase(), counts[c]); });
        bar.hidden = false;
        filter(location.hash.slice(1).toLowerCase(), false);
    }

    // Viewer
    var viewer = document.querySelector('.wall-viewer');
    if (!viewer) return;
    var vImg = viewer.querySelector('.wv-img');
    var vPlace = viewer.querySelector('.wv-place');
    var vCount = viewer.querySelector('.wv-count');
    var vPrint = viewer.querySelector('.wv-print');
    var list = [];
    var current = 0;
    var opener = null;

    function largest(img) {
        if (img.dataset.full) return img.dataset.full;
        var best = img.currentSrc || img.src;
        if (img.srcset) {
            var top = 0;
            img.srcset.split(',').forEach(function (part) {
                var bits = part.trim().split(/\s+/);
                var w = parseInt(bits[1], 10) || 0;
                if (w > top) { top = w; best = bits[0]; }
            });
        }
        return best;
    }
    function show(i) {
        current = (i + list.length) % list.length;
        var fig = list[current];
        var img = fig.querySelector('img');
        var link = fig.querySelector('a[href]');
        vImg.src = largest(img);
        vImg.alt = img.alt || '';
        vPlace.textContent = fig.dataset.place || '';
        vCount.textContent = (current + 1) + ' / ' + list.length;
        vPrint.hidden = !link;
        if (link) vPrint.href = link.href;
        // Warm the cache for the neighbours so arrows feel instant.
        [current - 1, current + 1].forEach(function (j) {
            var n = list[(j + list.length) % list.length];
            if (n) { var pre = new Image(); pre.src = largest(n.querySelector('img')); }
        });
    }
    function open(fig) {
        list = figures.filter(function (f) { return !f.hidden; });
        opener = fig;
        viewer.hidden = false;
        document.documentElement.classList.add('wall-open');
        show(list.indexOf(fig));
        viewer.querySelector('.wv-close').focus();
    }
    function close() {
        viewer.hidden = true;
        document.documentElement.classList.remove('wall-open');
        if (opener) opener.focus();
    }
    figures.forEach(function (fig) {
        fig.addEventListener('click', function (e) { e.preventDefault(); open(fig); });
        fig.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(fig); }
        });
    });
    viewer.querySelector('.wv-close').addEventListener('click', close);
    viewer.querySelector('.wv-prev').addEventListener('click', function () { show(current - 1); });
    viewer.querySelector('.wv-next').addEventListener('click', function () { show(current + 1); });
    viewer.addEventListener('click', function (e) { if (e.target === viewer) close(); });
    document.addEventListener('keydown', function (e) {
        if (viewer.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });
    var x0 = null;
    viewer.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
        x0 = null;
    });
})();
