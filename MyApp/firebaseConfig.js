// firebaseConfig.js
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCqB3jStjCz8LF6PU_DWZJBKpV9fzXnvzM",
  authDomain: "shareabite-39cd3.firebaseapp.com",
  projectId: "shareabite-39cd3",
  storageBucket: "shareabite-39cd3.appspot.com",
  messagingSenderId: "207541606307",
  appId: "1:207541606307:android:84f1ebb6be9a67c71dac16"
};

// Initialize app only once
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebaseApp;
