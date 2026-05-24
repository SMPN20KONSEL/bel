import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
    getFirestore
}
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyBDAkaKUQJ9u3bA7yNIQgUl3HkQhNjT_kQ",

  authDomain:
  "belsekolah-62ae7.firebaseapp.com",

  projectId:
  "belsekolah-62ae7",

  storageBucket:
  "belsekolah-62ae7.firebasestorage.app",

  messagingSenderId:
  "1083033662304",

  appId:
  "1:1083033662304:web:09e0f33065ca3421be6405",

  measurementId:
  "G-VX49DVQMXE"

};

const app =
initializeApp(firebaseConfig);

export const db =
getFirestore(app);