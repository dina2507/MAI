import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { app } from "./firebase";

let analytics = null;

// Initialize analytics only if supported (e.g. not in environments where it's not supported like some extensions or older browsers)
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

export const logCivicEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  } else {
    // Fallback or dev logging
    if (import.meta.env.DEV) {
      console.log(`[Analytics Mock] ${eventName}`, eventParams);
    }
  }
};
