import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { mmkv } from "./mmkv";

const resources = {
  tn: {
    translation: {
      error: "ஏதோ தவறாகிவிட்டது, பிறகு முயற்சிக்கவும்",
      customerName: "பெயர்",
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
      duplicateSmc: "இந்த செட்டாப் பாக்ஸ் எண் ஏற்கனவே உள்ளது",
      noPayment:
        "நீங்கள் தேர்ந்தெடுத்த மாதத்தில் பணம் செலுத்தும் பதிவு எதுவும் இல்லை",
      noConnections: "உங்கள் வினவலுக்கு எந்த இணைப்புகளும் கிடைக்கவில்லை.",
      warning: "எச்சரிக்கை",
      deleteWarning: "இந்தச் செயல் நிரந்தரமானது, இதைத் திரும்பப் பெற முடியாது.",
      migrateBeforeDelete:
        "இந்த தொகுப்பு சில இணைப்புகளால் பயன்படுத்தப்படுகிறது. நீக்குவதற்கு முன் அவற்றை நகர்த்த.",
      areaDelete:
        "நீங்கள் நீக்க விரும்பும் பகுதியில் இணைப்புகள் உள்ளன. நீக்குவதற்கு முன் அவற்றை நகர்த்தவும்.",
      empytName: "பெயர் காலியாக இருக்கக்கூடாது.",
      noAddons: "இந்த இணைப்பில் கூடுதல் சேனல்கள் எதுவும் இல்லை.",
      channelName: "சேனலின் பெயர்",
      createChannel: "சேனலை உருவாக்க படிவத்தை நிரப்பவும்.",
      noChannels: "நீங்கள் இன்னும் எந்த சேனல்களையும் உருவாக்கவில்லை.",
      delete:
        "இந்த சேனலை இணைப்புகள் பயன்படுத்துகின்றன. எனவே நீக்குவதற்கு முன் அவற்றை அகற்றவும்.",
      sms: "உங்கள் சந்தா தொகையை இந்த மாத இறுதிக்குள் செலுத்தவும்",
      noPaymentForConnection:
        "இந்த இணைப்பிற்கான கட்டண பதிவுகள் எதுவும் கிடைக்கவில்லை.",
    },
  },
  en: {
    translation: {
      error: "Something went wrong, please try again",
      customerName: "Name",
      boxNumber: "Set-Top Box Number",
      phoneNumber: "Phone Number",
      area: "Area",
      addArea: "Create an Area",
      areaName: "Area Name",
      packName: "Pack Name",
      createPack: "Create a Pack",
      lcoPrice: "LCO Price",
      customerPrice: "Customer Price",
      savePack: "Save Pack",
      createPackTitle:
        "The packs you create here can be linked with set-top boxes",
      save: "Save",
      savedConnection: "Connection saved successfully",
      markAsPaid: "Mark as Paid",
      history: "History",
      lastPayment: "Last Payment",
      duplicateSmc: "This set-top box number already exists",
      noPayment: "No payment records found for the selected month",
      noConnections: "No connections found for your query.",
      warning: "Warning",
      deleteWarning: "This action is permanent and cannot be undone.",
      migrateBeforeDelete:
        "This pack is being used by some connections. Please migrate them before deleting.",
      areaDelete:
        "The area you want to delete has connections. Please migrate them before deleting.",
      empytName: "Name cannot be empty.",
      noAddons: "This connection has no additional channels.",
      channelName: "Channel Name",
      createChannel: "Fill the form to create a channel.",
      noChannels: "You haven't created any channels yet.",
      delete:
        "This channel is being used by connections. Please remove them before deleting.",
      sms: "Please pay your subscription amount by the end of this month",
      noPaymentForConnection: "No payment records found for this connection.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: mmkv.getString("lang") ?? "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
