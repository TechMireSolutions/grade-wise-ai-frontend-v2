export const loadRecaptcha = (siteKey) => {
  return new Promise((resolve) => {
    if (!siteKey || siteKey === 'undefined' || siteKey === 'dummy-key') {
      console.warn("Skipping reCAPTCHA load: No valid site key provided.");
      return resolve();
    }

    if (window.recaptchaLoaded) return resolve();

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.onload = () => {
      window.recaptchaLoaded = true;

      // HIDE BADGE AFTER LOAD
      const badge = document.querySelector('.grecaptcha-badge');
      if (badge) badge.style.visibility = 'hidden';

      resolve();
    };
    script.onerror = () => {
      console.error("Failed to load reCAPTCHA script.");
      resolve(); // Resolve anyway to not block the app
    };
    document.head.appendChild(script);
  });
};

export const getCaptchaToken = (siteKey, action) => {
  return new Promise((resolve, reject) => {
    if (!siteKey || siteKey === 'undefined' || siteKey === 'dummy-key') {
      console.warn("Bypassing getCaptchaToken: No valid site key provided.");
      return resolve("dummy-captcha-token");
    }

    if (!window.grecaptcha) {
      console.warn("reCAPTCHA not loaded, returning dummy token.");
      return resolve("dummy-captcha-token");
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action })
        .then((token) => resolve(token))
        .catch((err) => {
          console.error("reCAPTCHA execution failed:", err);
          resolve("dummy-captcha-token");
        });
    });
  });
};