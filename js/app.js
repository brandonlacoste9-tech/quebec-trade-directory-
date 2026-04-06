(function () {
  const { TRADE_TYPES, REGIONS, LISTINGS, TRADE_IMAGES, DEFAULT_LISTING_IMAGE } =
    window.TRADE_DIRECTORY;

  const FAV_KEY = "quebec-trade-directory-favourites";
  let favCache = null;

  function favSet() {
    if (favCache) return favCache;
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      favCache = new Set(Array.isArray(arr) ? arr : []);
    } catch {
      favCache = new Set();
    }
    return favCache;
  }

  function invalidateFav() {
    favCache = null;
  }

  function isFavourite(id) {
    return favSet().has(String(id));
  }

  function toggleFavourite(id) {
    const s = new Set(favSet());
    const sid = String(id);
    if (s.has(sid)) s.delete(sid);
    else s.add(sid);
    localStorage.setItem(FAV_KEY, JSON.stringify([...s]));
    invalidateFav();
  }

  const els = {
    q: document.getElementById("q"),
    trade: document.getElementById("trade"),
    region: document.getElementById("region"),
    city: document.getElementById("city"),
    reset: document.getElementById("reset"),
    chips: document.getElementById("chips"),
    list: document.getElementById("list"),
    count: document.getElementById("count"),
    empty: document.getElementById("empty"),
    favOnly: document.getElementById("fav-only"),
    copyLink: document.getElementById("copy-link"),
  };

  let activeChip = "";

  function uniqueSortedCities() {
    const set = new Set(LISTINGS.map((l) => l.city));
    return [...set].sort((a, b) => a.localeCompare(b, "en-CA"));
  }

  function fillSelect(select, values) {
    const frag = document.createDocumentFragment();
    for (const v of values) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      frag.appendChild(opt);
    }
    select.appendChild(frag);
  }

  function normalize(s) {
    return s.trim().toLowerCase();
  }

  function matchesFilters(item) {
    const q = normalize(els.q.value);
    const tradeVal = els.trade.value;
    const regionVal = els.region.value;
    const cityVal = els.city.value;
    const chip = activeChip;

    if (els.favOnly && els.favOnly.checked && !isFavourite(item.id)) return false;
    if (chip && item.trade !== chip) return false;
    if (tradeVal && item.trade !== tradeVal) return false;
    if (regionVal && item.region !== regionVal) return false;
    if (cityVal && item.city !== cityVal) return false;
    if (!q) return true;
    const rev = item.reviews ? `${item.reviews.rating} ${item.reviews.count}` : "";
    const hay = normalize(
      [
        item.name,
        item.trade,
        item.city,
        item.region,
        item.description,
        item.phone,
        item.website || "",
        item.hours || "",
        rev,
      ].join(" ")
    );
    return hay.includes(q);
  }

  function listingImageUrl(item) {
    if (item.image) return item.image;
    return TRADE_IMAGES[item.trade] || DEFAULT_LISTING_IMAGE;
  }

  function mapsSearchUrl(item) {
    const query = encodeURIComponent(`${item.name} ${item.city} Québec Canada`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function renderCard(item) {
    const li = document.createElement("li");
    li.className = "card";
    const imgSrc = escapeAttr(listingImageUrl(item));
    const imgAlt = escapeAttr(`${item.name} — ${item.trade}`);
    const favOn = isFavourite(item.id);
    const revHtml = item.reviews
      ? `<p class="card-reviews" aria-label="Average rating ${item.reviews.rating} from ${item.reviews.count} reviews"><span class="card-reviews-stars" aria-hidden="true">★</span> <strong>${escapeHtml(String(item.reviews.rating))}</strong> <span class="card-reviews-count">(${escapeHtml(String(item.reviews.count))} reviews)</span></p>`
      : "";
    const hoursHtml = item.hours
      ? `<p class="card-hours"><strong>Hours:</strong> ${escapeHtml(item.hours)}</p>`
      : "";
    const verifiedHtml = item.verified
      ? `<span class="badge-verified" title="Listing verified by directory (demo)">Verified</span>`
      : "";

    li.innerHTML = `
    <div class="card-media">
      <button type="button" class="card-fav ${favOn ? "is-on" : ""}" data-fav-id="${escapeAttr(item.id)}" aria-pressed="${favOn}" aria-label="${favOn ? "Remove from favourites" : "Add to favourites"}" title="Favourite">${favOn ? "★" : "☆"}</button>
      <img src="${imgSrc}" alt="${imgAlt}" width="640" height="360" loading="lazy" decoding="async" />
    </div>
    <div class="card-body">
      <div class="card-top">
        <h3 class="card-name">${escapeHtml(item.name)}</h3>
        <div class="card-badges">${verifiedHtml}<span class="badge">${escapeHtml(item.trade)}</span></div>
      </div>
      <p class="card-trade">${escapeHtml(item.city)} · ${escapeHtml(item.region)}</p>
      <p class="card-loc"><strong>Phone:</strong> ${escapeHtml(item.phone)}</p>
      ${hoursHtml}
      ${revHtml}
      ${
        item.website
          ? `<p class="card-web"><strong>Website:</strong> <a class="card-web-link" href="${escapeAttr(item.website)}" rel="noopener noreferrer" target="_blank">${escapeHtml(websiteLabel(item.website))}</a></p>`
          : ""
      }
      <p class="card-maps"><a href="${escapeAttr(mapsSearchUrl(item))}" rel="noopener noreferrer" target="_blank">Map / directions</a></p>
      <p class="card-desc">${escapeHtml(item.description)}</p>
      ${item.licensed ? '<p class="licensed-tag">Licensed / certified (demo flag)</p>' : ""}
      <div class="card-actions">
        ${item.website ? `<a class="btn-link-primary" href="${escapeAttr(item.website)}" rel="noopener noreferrer" target="_blank">Open website</a>` : ""}
        <a href="${telHref(item.phone)}">Call</a>
      </div>
    </div>
  `;
    const img = li.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        img.src = DEFAULT_LISTING_IMAGE;
      });
    }
    return li;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;");
  }

  function telHref(phone) {
    const digits = phone.replace(/[^\d+]/g, "");
    return `tel:${digits}`;
  }

  function websiteLabel(url) {
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname && u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "");
    } catch {
      return url;
    }
  }

  function renderChips() {
    els.chips.innerHTML = "";
    const all = document.createElement("li");
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.textContent = "All";
    allBtn.classList.toggle("is-active", activeChip === "");
    allBtn.addEventListener("click", () => {
      activeChip = "";
      els.trade.value = "";
      syncChipActive();
      apply();
    });
    all.appendChild(allBtn);
    els.chips.appendChild(all);

    for (const t of TRADE_TYPES) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = t;
      btn.classList.toggle("is-active", activeChip === t);
      btn.addEventListener("click", () => {
        activeChip = activeChip === t ? "" : t;
        els.trade.value = activeChip;
        syncChipActive();
        apply();
      });
      li.appendChild(btn);
      els.chips.appendChild(li);
    }
  }

  function syncChipActive() {
    const buttons = els.chips.querySelectorAll("button");
    buttons.forEach((btn, i) => {
      if (i === 0) {
        btn.classList.toggle("is-active", activeChip === "");
        return;
      }
      const t = TRADE_TYPES[i - 1];
      btn.classList.toggle("is-active", activeChip === t);
    });
  }

  function readUrlIntoForm() {
    const p = new URLSearchParams(location.search);
    els.q.value = p.get("q") || "";
    const trade = p.get("trade") || "";
    if (trade && TRADE_TYPES.includes(trade)) {
      els.trade.value = trade;
      activeChip = trade;
    } else {
      els.trade.value = "";
      activeChip = "";
    }
    const region = p.get("region") || "";
    els.region.value = REGIONS.includes(region) ? region : "";
    const city = p.get("city") || "";
    const cities = uniqueSortedCities();
    els.city.value = cities.includes(city) ? city : "";
    if (els.favOnly) els.favOnly.checked = p.get("fav") === "1";
    syncChipActive();
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.search = "";
    const qv = els.q.value.trim();
    if (qv) url.searchParams.set("q", qv);
    if (els.trade.value) url.searchParams.set("trade", els.trade.value);
    if (els.region.value) url.searchParams.set("region", els.region.value);
    if (els.city.value) url.searchParams.set("city", els.city.value);
    if (els.favOnly && els.favOnly.checked) url.searchParams.set("fav", "1");
    const next = url.pathname + url.search + url.hash;
    history.replaceState(null, "", next);
  }

  function apply() {
    const filtered = LISTINGS.filter(matchesFilters);
    els.list.innerHTML = "";
    for (const item of filtered) {
      els.list.appendChild(renderCard(item));
    }
    const n = filtered.length;
    els.count.textContent =
      n === 0
        ? "No listings match."
        : n === 1
          ? "1 listing shown."
          : `${n} listings shown.`;
    els.empty.hidden = n !== 0;
    els.list.hidden = n === 0;
    syncUrl();
  }

  function onTradeSelectChange() {
    activeChip = els.trade.value;
    syncChipActive();
    apply();
  }

  fillSelect(els.trade, TRADE_TYPES);
  fillSelect(els.region, REGIONS);
  fillSelect(els.city, uniqueSortedCities());
  renderChips();
  readUrlIntoForm();

  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest(".card-fav");
    if (!btn) return;
    e.preventDefault();
    toggleFavourite(btn.getAttribute("data-fav-id"));
    apply();
  });

  els.q.addEventListener("input", () => apply());
  els.region.addEventListener("change", () => apply());
  els.city.addEventListener("change", () => apply());
  els.trade.addEventListener("change", onTradeSelectChange);
  if (els.favOnly) els.favOnly.addEventListener("change", () => apply());

  if (els.copyLink) {
    els.copyLink.addEventListener("click", async () => {
      syncUrl();
      const href = location.href;
      try {
        await navigator.clipboard.writeText(href);
        const prev = els.copyLink.textContent;
        els.copyLink.textContent = "Copied link";
        setTimeout(() => {
          els.copyLink.textContent = prev;
        }, 2000);
      } catch {
        window.prompt("Copy this link:", href);
      }
    });
  }

  els.reset.addEventListener("click", () => {
    els.q.value = "";
    els.trade.value = "";
    els.region.value = "";
    els.city.value = "";
    activeChip = "";
    if (els.favOnly) els.favOnly.checked = false;
    syncChipActive();
    apply();
  });

  window.addEventListener("popstate", () => {
    readUrlIntoForm();
    apply();
  });

  apply();
})();
