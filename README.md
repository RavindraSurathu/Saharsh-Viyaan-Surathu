# Saharsh Viyaan – 1st Birthday Invitation (v2) · by Vivaah Creations

Pure static site (HTML/CSS/JS, no build step) – works on GitHub Pages.

```
index.html          v2 premium invitation (this is the live page)
links.html          personalised guest-link maker
v1/index.html       the original simple version (kept as archive)
assets/css|js|img   styles, scripts (config.js, i18n.js, gl.js, fx.js, audio.js, app.js), og.png, favicon
photos/             put the baby photos here (see photos/README.txt)
```

## Hosting
Live at https://vivaahcreations.com/Saharsh-Viyaan-Surathu/ — served from the `Manikanta-Rajeswari-Wedding` repo (CNAME vivaahcreations.com), folder `Saharsh-Viyaan-Surathu/`, and linked from the Vivaah Creations home page.
This repo is the source copy. To publish changes, copy the files into that folder of the Vivaah Creations repo and push.

## Editing
* Details, WhatsApp number, photos, brand logo/links: `assets/js/config.js`
* All English/Telugu wording: `assets/js/i18n.js`
* Personal links: open `links.html`, or add `?to=Name` and `&lang=te` to the URL. `?open=1` skips the opening screen.
