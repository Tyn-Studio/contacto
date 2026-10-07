/* Members extras: renders deals, wallpapers and downloads from the shop feed.
   Runs only on the members page for signed-in members (the container and
   feed URL are rendered server-side inside the member branch). */
(function () {
    var root = document.querySelector('.mbx');
    if (!root || !root.dataset.feed) return;

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text) node.textContent = text;
        return node;
    }

    function euros(cents) {
        var value = cents / 100;
        return '€' + (cents % 100 ? value.toFixed(2) : String(value));
    }

    function fileSize(bytes) {
        if (!bytes) return '';
        return bytes >= 1048576
            ? (bytes / 1048576).toFixed(1) + ' MB'
            : Math.max(1, Math.round(bytes / 1024)) + ' KB';
    }

    function section(title) {
        var wrap = el('section', 'mbx-sec');
        wrap.appendChild(el('h2', 'mbx-h', title));
        return wrap;
    }

    function copyButton(code) {
        var btn = el('button', 'mbx-code', code);
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Copy code ' + code);
        btn.addEventListener('click', function () {
            navigator.clipboard.writeText(code).then(function () {
                btn.textContent = 'copied';
                btn.classList.add('is-copied');
                setTimeout(function () {
                    btn.textContent = code;
                    btn.classList.remove('is-copied');
                }, 1600);
            });
        });
        return btn;
    }

    function renderMemberDiscount(info) {
        var sec = section('Your shop discount');
        var card = el('div', 'mbx-member-code');
        card.appendChild(el('p', 'mbx-member-code-pct', info.pct + '% off everything'));
        var copy = el('p', 'mbx-member-code-copy');
        copy.appendChild(document.createTextNode('Prints, books and zines, on every order, as often as you like. No code needed: in the basket of the '));
        var link = el('a', null, 'shop');
        link.href = info.url;
        copy.appendChild(link);
        copy.appendChild(document.createTextNode(', enter the email you subscribed with and the discount is applied.'));
        card.appendChild(copy);
        sec.appendChild(card);
        return sec;
    }

    function renderDeals(deals) {
        var sec = section('Member deals');
        var grid = el('div', 'mbx-deals');
        deals.forEach(function (deal) {
            var card = el('article', 'mbx-deal');
            var link = el('a', 'mbx-deal-media');
            link.href = deal.url;
            if (deal.image) {
                var img = el('img');
                img.src = deal.image;
                img.alt = deal.title;
                img.loading = 'lazy';
                link.appendChild(img);
            } else {
                link.appendChild(el('span', 'mbx-deal-empty'));
            }
            card.appendChild(link);

            var body = el('div', 'mbx-deal-body');
            var title = el('h3', 'mbx-deal-title');
            var titleLink = el('a', null, deal.title);
            titleLink.href = deal.url;
            title.appendChild(titleLink);
            body.appendChild(title);

            var price = el('p', 'mbx-price');
            if (deal.from_price) price.appendChild(el('span', 'mbx-from', 'from '));
            var was = el('s', null, euros(deal.price_cents));
            var now = el('strong', null, ' ' + euros(deal.member_price_cents));
            price.appendChild(was);
            price.appendChild(now);
            price.appendChild(el('span', 'mbx-note', ' with your code'));
            body.appendChild(price);

            var codeRow = el('p', 'mbx-code-row');
            codeRow.appendChild(copyButton(deal.code));
            codeRow.appendChild(el('span', 'mbx-note', ' ' + deal.pct + '% off at checkout'));
            body.appendChild(codeRow);

            card.appendChild(body);
            grid.appendChild(card);
        });
        sec.appendChild(grid);
        return sec;
    }

    function downloadLink(href, label) {
        var a = el('a', 'mbx-dl', label);
        a.href = href;
        a.setAttribute('download', '');
        return a;
    }

    function renderWallpapers(wallpapers) {
        var sec = section('Wallpapers');
        var grid = el('div', 'mbx-walls');
        wallpapers.forEach(function (wall) {
            var fig = el('figure', 'mbx-wall' +
                (wall.orientation === 'portrait' ? ' mbx-wall--portrait' : ''));
            if (wall.preview) {
                var img = el('img');
                img.src = wall.preview;
                img.alt = wall.title;
                img.loading = 'lazy';
                fig.appendChild(img);
            }
            var cap = el('figcaption');
            cap.appendChild(el('span', 'mbx-wall-title', wall.title));
            var links = el('span', 'mbx-dl-row');
            if (wall.versions.desktop) links.appendChild(downloadLink(wall.versions.desktop, 'Desktop / tablet'));
            if (wall.versions.phone) links.appendChild(downloadLink(wall.versions.phone, 'Phone'));
            cap.appendChild(links);
            fig.appendChild(cap);
            grid.appendChild(fig);
        });
        sec.appendChild(grid);
        return sec;
    }

    function renderDownloads(downloads) {
        var sec = section('Zines and guides');
        var list = el('ul', 'mbx-lib');
        downloads.forEach(function (item) {
            var row = el('li', 'mbx-lib-item');
            if (item.cover) {
                var img = el('img', 'mbx-lib-cover');
                img.src = item.cover;
                img.alt = '';
                img.loading = 'lazy';
                row.appendChild(img);
            }
            var body = el('div', 'mbx-lib-body');
            body.appendChild(el('h3', 'mbx-lib-title', item.title));
            if (item.description) body.appendChild(el('p', 'mbx-lib-desc', item.description));
            row.appendChild(body);
            var size = fileSize(item.size_bytes);
            row.appendChild(downloadLink(item.url, 'Download' + (size ? ' (' + size + ')' : '')));
            list.appendChild(row);
        });
        sec.appendChild(list);
        return sec;
    }

    fetch(root.dataset.feed)
        .then(function (response) {
            if (!response.ok) throw new Error(String(response.status));
            return response.json();
        })
        .then(function (data) {
            if (data.member_discount && data.member_discount.pct) root.appendChild(renderMemberDiscount(data.member_discount));
            if (data.deals && data.deals.length) root.appendChild(renderDeals(data.deals));
            if (data.wallpapers && data.wallpapers.length) root.appendChild(renderWallpapers(data.wallpapers));
            if (data.downloads && data.downloads.length) root.appendChild(renderDownloads(data.downloads));
        })
        .catch(function () {
            root.appendChild(el('p', 'mbx-error', 'Member extras could not load. Refresh to try again.'));
        });
})();
