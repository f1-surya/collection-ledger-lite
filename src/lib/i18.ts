import { I18n } from "i18n-js";

const i18n = new I18n({
  tn: {
    loginTitle: "தொடர்வதற்கு Login செய்யவும்",
    createAccount: "புதிய கணக்கை உருவாக்கவும்",
    error: "ஏதோ தவறாகிவிட்டது, பிறகு முயற்சிக்கவும்",
    customerName: "வாடிக்கையாளர் பெயர்",
    boxNumber: "செட்டாப் பாக்ஸ் எண்",
    phoneNumber: "தொலைபேசி எண்",
    area: "பகுதி",
    addArea: "ஒரு பகுதியை உருவாக்க",
    areaName: "பகுதியின் பெயர்",
    packName: "பேக்கின் பெயர்",
    createPack: "ஒரு பேக் உருவாக்க",
    lcoPrice: "LCO விலை",
    customerPrice: "வாடிக்கையாளருக்கான விலை",
    savePack: "பேக் சேமிக்க",
    createPackTitle:
      "இங்கே நீங்கள் உருவாக்கும் பேக்குகள் செட்டாப் பாக்ஸ்களுடன் இணைக்கப்படலாம்",
    save: "சேமிக்க",
    savedConnection: "இணைப்பு வெற்றிகரமாக சேமிக்கப்பட்டது",
    markAsPaid: "செலுத்தப்பட்டது",
    history: "வரலாறு",
    lastPayment: "கடைசி கட்டணம்",
  },
});

i18n.defaultLocale = "tn";
i18n.locale = "tn";

export default i18n;
