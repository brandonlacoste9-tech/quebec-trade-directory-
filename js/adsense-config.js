/**
 * Google AdSense — flip on after your site is approved.
 *
 * 1. AdSense → Account → Publisher ID looks like: ca-pub-1234567890123456
 * 2. Set TD_ADSENSE_CLIENT below (string, required to load any ads).
 * 3. ads.txt at site root: add the line AdSense shows (google.com, pub-…, DIRECT, f08c47fec0942fa0).
 * 4. Optional: create up to 3 “Display” units and paste their slot numbers into TD_ADSENSE_SLOTS
 *    in the same order as the asides on index.html (leaderboard → in-feed → footer).
 *    Leave the array empty to rely on Auto ads only (enable in the AdSense UI) or paste <ins> manually in HTML.
 *
 * Policy: keep privacy.html linked; no “click ads” wording; replace sample listings for approval.
 */
(function () {
  window.TD_ADSENSE_CLIENT = null;

  /** @type {string[]} Up to three numeric ad slot IDs, or [] for Auto/manual HTML only */
  window.TD_ADSENSE_SLOTS = [];
})();
