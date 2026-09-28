/* Contacto — portfolio gallery viewer. Progressive enhancement, no deps.
   Collects the images from the page content, hides them, and shows one
   photo at a time with arrows, counter, keyboard and swipe navigation.
   Without JS the page just renders its images as normal content. */
(function () {
    'use strict';

    var viewer = document.querySelector('.gallery-viewer');
    var source = document.querySelector('.gallery-source');
    if (!viewer || !source) return;

    var imgs = Array.prototype.slice.call(source.querySelectorAll('img'));
    if (!imgs.length) return;

    source.hidden = true;
    viewer.hidden = false;

    var stageImg = viewer.querySelector('.gv-img');
    var idxEl = viewer.querySelector('.gv-index');
    var totalEl = viewer.querySelector('.gv-total');
    var current = 0;

    totalEl.textContent = imgs.length;
    if (imgs.length < 2) {
        viewer.querySelector('.gv-prev').hidden = true;
        viewer.querySelector('.gv-next').hidden = true;
        viewer.querySelector('.gv-count').hidden = true;
    }

    function show(i) {
        current = (i + imgs.length) % imgs.length;
        var im = imgs[current];
        if (im.srcset) {
            stageImg.srcset = im.srcset;
            stageImg.sizes = '(min-width: 1100px) 1040px, 100vw';
        } else {
            stageImg.removeAttribute('srcset');
        }
        stageImg.src = im.currentSrc || im.src;
        stageImg.alt = im.alt || '';
        idxEl.textContent = current + 1;
        [1, -1].forEach(function (d) {
            var n = imgs[(current + d + imgs.length) % imgs.length];
            var pre = new Image();
            if (n.srcset) { pre.srcset = n.srcset; pre.sizes = stageImg.sizes; }
            pre.src = n.src;
        });
    }

    viewer.querySelector('.gv-prev').addEventListener('click', function () { show(current - 1); });
    viewer.querySelector('.gv-next').addEventListener('click', function () { show(current + 1); });

    // clicking the photo opens the site lightbox bound to the source images
    stageImg.addEventListener('click', function () { imgs[current].click(); });

    document.addEventListener('keydown', function (e) {
        if (document.querySelector('.lb')) return; /* lightbox handles its own keys */
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });

    var touchX = null;
    viewer.addEventListener('touchstart', function (e) {
        touchX = e.touches[0].clientX;
    }, { passive: true });
    viewer.addEventListener('touchend', function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
        touchX = null;
    }, { passive: true });

    show(0);
})();
