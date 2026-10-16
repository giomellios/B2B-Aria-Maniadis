/**
 * Switching language navigates /el/… ↔ /en/…. The root layout sits under [locale], so React
 * remounts the whole page: entrance animations would replay and the page would "stutter". While a
 * switch is in progress, motion entrances are skipped (useEntranceAnimation) and CSS entrance
 * animations are fast-forwarded (`html[data-locale-switch]` in globals.css).
 */

const ATTRIBUTE = "data-locale-switch";
/** Longer than the longest CSS entrance animation + delay, so none restarts when the flag clears. */
const SETTLE_MS = 1200;
/** Safety net if the navigation never completes. */
const TIMEOUT_MS = 10_000;

let switching = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function end() {
  switching = false;
  document.documentElement.removeAttribute(ATTRIBUTE);
}

/** Call right before navigating to the other language. */
export function beginLocaleSwitch() {
  switching = true;
  document.documentElement.setAttribute(ATTRIBUTE, "");
  clearTimeout(timer);
  timer = setTimeout(end, TIMEOUT_MS);
}

/** Call once the page in the new language has mounted. */
export function settleLocaleSwitch() {
  if (!switching) return;
  clearTimeout(timer);
  timer = setTimeout(end, SETTLE_MS);
}

export function isLocaleSwitching() {
  return switching;
}
