const AD_ZONE = '12156617';
const AD_SRC = 'https://n6wxm.com/vignette.min.js';
let adInFlight = false;

export function showAdThen(continueAction) {
  if (adInFlight) return;
  adInFlight = true;
  const script = document.createElement('script');
  script.dataset.zone = AD_ZONE;
  script.src = `${AD_SRC}?v=${Date.now()}-${Math.random().toString(36).slice(2)}`;
  script.async = false;
  const displayWindow = 2500 + Math.floor(Math.random() * 2000);

  let continued = false;
  const continueOnce = () => {
    if (continued) return;
    continued = true;
    adInFlight = false;
    continueAction();
  };

  script.addEventListener('load', () => window.setTimeout(continueOnce, displayWindow));
  script.addEventListener('error', continueOnce);
  document.body.appendChild(script);
  window.setTimeout(continueOnce, 7000);
}
