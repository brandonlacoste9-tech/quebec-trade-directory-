(function () {
  var client = window.TD_ADSENSE_CLIENT;
  if (!client || typeof client !== "string" || !/^ca-pub-\d+$/.test(client.trim())) return;
  client = client.trim();

  function fillManualSlots() {
    var ids = window.TD_ADSENSE_SLOTS;
    if (!ids || !ids.length) return;
    var holders = document.querySelectorAll(".ad-slot");
    for (var i = 0; i < ids.length && i < holders.length; i++) {
      var slotId = String(ids[i]).trim();
      if (!slotId || /[^\d]/.test(slotId)) continue;
      var wrap = holders[i];
      if (wrap.querySelector(".adsbygoogle")) continue;
      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", client);
      ins.setAttribute("data-ad-slot", slotId);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      wrap.appendChild(ins);
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }

  var scr = document.createElement("script");
  scr.async = true;
  scr.crossOrigin = "anonymous";
  scr.src =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
  scr.onload = fillManualSlots;
  document.head.appendChild(scr);
})();
