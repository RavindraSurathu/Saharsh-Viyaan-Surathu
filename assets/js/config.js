/* ============================================================
   EDIT ME – everything personal lives in this file.
   Designed & crafted by Vivaah Creations · vivaahcreations.com
   ============================================================ */
window.VC = window.VC || {};

VC.CONFIG = {
  /* Final address of this invitation (used for sharing + calendar links).
     Change it when you move to your own domain, e.g. "https://saharsh.vivaahcreations.com/" */
  siteUrl: "https://vivaahcreations.com/Saharsh-Viyaan-Surathu/",

  baby: { en: "Saharsh Viyaan Surathu", te: "సహర్ష్ వియాన్ సురతు" },

  partyISO: "2026-11-28T19:00:00+05:30",   // 7 PM India time
  durationHours: 3,                         // only used for the "Add to calendar" end time

  mapLink: "https://maps.app.goo.gl/CJND2dXbT9ADyoSf7?g_st=ic",
  whatsapp: "919542222213",                 // RSVP number: country code + number, no + or spaces

  /* Photos: upload these files into the photos/ folder (see photos/README.txt) */
  mainPhoto: "photos/saharsh-main.jpg",
  photos: [
    { src: "photos/month-01.jpg", en: "Newborn",        te: "నవజాత శిశువు" },
    { src: "photos/month-03.jpg", en: "3 months",       te: "3 నెలలు" },
    { src: "photos/month-06.jpg", en: "6 months",       te: "6 నెలలు" },
    { src: "photos/month-09.jpg", en: "9 months",       te: "9 నెలలు" },
    { src: "photos/month-12.jpg", en: "12 months",      te: "12 నెలలు" },
    { src: "photos/family.jpg",   en: "With Mom & Dad", te: "అమ్మానాన్నలతో" },
    { src: "photos/brothers.jpg", en: "Big brother & little bear", te: "అన్నయ్య & తమ్ముడు", wide: true }
  ],

  /* Your brand. Leave logo "" to use the built-in VC monogram, or set e.g. "assets/img/logo.svg".
     Add whatsapp / instagram to show contact buttons in the brand section. */
  brand: {
    name: "Vivaah Creations",
    url: "https://vivaahcreations.com",
    logo: "",
    whatsapp: "",          // e.g. "919XXXXXXXXX"
    instagram: ""          // e.g. "https://instagram.com/yourhandle"
  }
};
