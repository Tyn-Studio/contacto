/* Contacto — minimal lightbox for post images and galleries. No dependencies. */
(function () {
    'use strict';

    var imgs = Array.prototype.slice.call(
        document.querySelectorAll('.gh-content .kg-image-card img, .gh-content .kg-gallery-image img')
    );
    if (!imgs.length) return;

    var lb = null;
    var current = 0;

    function srcFor(img) {
        // prefer the largest srcset candidate if present
        if (img.srcset) {
            var parts = img.srcset.split(',').map(function (s) { return s.trim().split(' '); });
            parts.sort(function (a, b) { return (parseInt(b[1]) || 0) - (parseInt(a[1]) || 0); });
            if (parts[0] && parts[0][0]) return parts[0][0];
        }
        return img.currentSrc || img.src;
    }

    function render() {
        lb.querySelector('img').src = srcFor(imgs[current]);
        lb.querySelector('img').alt = imgs[current].alt || '';
        lb.querySelector('.lb-count').textContent = (current + 1) + ' / ' + imgs.length;
        var multi = imgs.length > 1;
        lb.querySelector('.lb-prev').style.display = multi ? '' : 'none';
        lb.querySelector('.lb-next').style.display = multi ? '' : 'none';
        lb.querySelector('.lb-count').style.display = multi ? '' : 'none';
    }

    function open(index) {
        current = index;
        if (!lb) {
            lb = document.createElement('div');
            lb.className = 'lb';
            lb.setAttribute('role', 'dialog');
            lb.setAttribute('aria-label', 'Image viewer');
            lb.innerHTML =
                '<button class="lb-close" aria-label="Close">✕</button>' +
                '<button class="lb-prev" aria-label="Previous image">←</button>' +
                '<img alt="">' +
                '<button class="lb-next" aria-label="Next image">→</button>' +
                '<span class="lb-count"></span>';
            lb.addEventListener('click', function (e) {
                if (e.target.classList.contains('lb-prev')) return step(-1);
                if (e.target.classList.contains('lb-next')) return step(1);
                if (e.target.tagName !== 'IMG') close();
            });
        }
        document.body.appendChild(lb);
        document.body.style.overflow = 'hidden';
        render();
        lb.querySelector('.lb-close').focus();
    }

    function close() {
        if (lb && lb.parentNode) lb.parentNode.removeChild(lb);
        document.body.style.overflow = '';
    }

    function step(dir) {
        current = (current + dir + imgs.length) % imgs.length;
        render();
    }

    imgs.forEach(function (img, i) {
        img.addEventListener('click', function () { open(i); });
    });

    document.addEventListener('keydown', function (e) {
        if (!lb || !lb.parentNode) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
    });
})();
