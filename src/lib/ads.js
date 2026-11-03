const AD_ZONE = '12156617';
const AD_SRC = 'https://n6wxm.com/vignette.min.js';

export function showAdThen(continueAction) {
  const script = document.createElement('script');
  script.dataset.zone = AD_ZONE;
  script.src = AD_SRC;
  script.async = false;

  let continued = false;
  const continueOnce = () => {
    if (continued) return;
    continued = true;
    continueAction();
  };

  script.addEventListener('load', () => window.setTimeout(continueOnce, 5000));
  script.addEventListener('error', continueOnce);
  document.body.appendChild(script);
  window.setTimeout(continueOnce, 7000);
}
