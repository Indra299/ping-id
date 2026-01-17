console.log("APP.JS JALAN - GPS RADAR REAL");

// =========================
// FIREBASE
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnmYG0cZsv52GmMRxjPPuWmIyNpr4xww",
  authDomain: "ping-id-chat.firebaseapp.com",
  databaseURL: "https://ping-id-chat-578b6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ping-id-chat",
  storageBucket: "ping-id-chat.appspot.com",
  messagingSenderId: "1034233458438",
  appId: "1:1034233458438:web:0c14b3dd9765cdb8a73887"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================
// GLOBAL
// =========================
const myID = "Ping#" + Math.floor(Math.random() * 9000 + 1000);
const usersRef = ref(db, "users");
const chatRef = ref(db, "chat");

const radar = document.querySelector(".radar");
const chatBox = document.getElementById("chatBox");
const nearbyCount = document.getElementById("nearbyCount");

let myLat = null;
let myLng = null;
let dots = [];

// =========================
// GPS REAL
// =========================
navigator.geolocation.watchPosition(
  pos => {
    myLat = pos.coords.latitude;
    myLng = pos.coords.longitude;

    set(ref(db, `users/${myID}`), {
      lat: myLat,
      lng: myLng,
      lastActive: Date.now()
    });
  },
  err => console.error("GPS ERROR:", err),
  { enableHighAccuracy: true }
);

// =========================
// HITUNG JARAK (METER)
// =========================
function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// =========================
// METER → PIXEL RADAR
// =========================
function meterToPixel(meter) {
  const MAX_METER = 20;
  const MAX_PIXEL = 130; // radius radar (260 / 2)
  return (Math.min(meter, MAX_METER) / MAX_METER) * MAX_PIXEL;
}

// =========================
// RADAR REALTIME
// =========================
onValue(usersRef, snap => {
  dots.forEach(d => d.remove());
  dots = [];

  let count = 0;
  const center = 130;

  snap.forEach(u => {
    if (u.key === myID) return;

    const data = u.val();
    if (!data.lat || !data.lng || !myLat || !myLng) return;

    const jarak = hitungJarak(myLat, myLng, data.lat, data.lng);
    console.log("JARAK:", jarak.toFixed(2), "meter");

    if (jarak <= 20) {
      count++;

      const angle = Math.random() * Math.PI * 2;
      const radius = meterToPixel(jarak);

      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      const dot = document.createElement("div");
      dot.className = "dot";
      dot.style.left = x + "px";
      dot.style.top = y + "px";

      radar.appendChild(dot);
      dots.push(dot);
    }
  });

  nearbyCount.textContent = `📍 ${count} orang ≤ 20 meter`;
  chatBox.classList.toggle("hidden", count === 0);
});

// =========================
// CHAT REALTIME
// =========================
window.sendMessage = function () {
  const input = document.getElementById("msgInput");
  if (!input.value.trim()) return;

  push(chatRef, {
    user: myID,
    msg: input.value,
    time: Date.now()
  });

  input.value = "";
};

onChildAdded(chatRef, snap => {
  const data = snap.val();
  const box = document.getElementById("messages");

  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.msg}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
});
