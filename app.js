let myLat = null;
let myLng = null;

navigator.geolocation.watchPosition(
  (pos) => {
    myLat = pos.coords.latitude;
    myLng = pos.coords.longitude;

    // update ke Firebase
    set(ref(db, `users/${userID}`), {
      lat: myLat,
      lng: myLng,
      lastActive: Date.now()
    });
  },
  (err) => {
    console.error("GPS ERROR", err);
  },
  { enableHighAccuracy: true }
);
console.log("PingIDX GPS REAL AKTIF");

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCnmYG0cZsv52GmMRxjPPuWmIyNpr4xww",
  authDomain: "ping-id-chat.firebaseapp.com",
  databaseURL: "https://ping-id-chat-578b6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ping-id-chat",
  storageBucket: "ping-id-chat.appspot.com",
  messagingSenderId: "1034233458438",
  appId: "1:1034233458438:web:0c14b3dd9765cdb8a73887"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const usersRef = ref(db, "users");
const chatRef = ref(db, "chat");

// User anonim
const myID = "Ping#" + Math.floor(Math.random() * 9000 + 1000);

// UI
const radar = document.querySelector(".radar");
const nearbyCount = document.getElementById("nearbyCount");
const chatBox = document.getElementById("chatBox");

let dots = [];
let myLocation = null;

// =========================
// GPS LOCATION
// =========================
function getLocation() {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung GPS");
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      myLocation = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      };

      set(ref(db, `users/${myID}`), {
        lat: myLocation.lat,
        lon: myLocation.lon,
        lastActive: Date.now()
      });
    },
    () => alert("Izin lokasi ditolak"),
    { enableHighAccuracy: true }
  );
}

getLocation();

// =========================
// HITUNG JARAK (METER)
// =========================
function distanceMeter(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meter
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
// RADAR REAL 20 METER
// =========================
onValue(usersRef, (snapshot) => {
  dots.forEach(d => d.remove());
  dots = [];

  if (!myLocation) return;

  let count = 0;

  snapshot.forEach(userSnap => {
    if (userSnap.key === myID) return;

    const u = userSnap.val();
    if (!u.lat || !u.lon) return;

    const d = distanceMeter(
      myLocation.lat,
      myLocation.lon,
      u.lat,
      u.lon
    );

    if (d <= 20) {
      count++;

      // Konversi meter → radar
      const angle = Math.random() * Math.PI * 2;
      const radius = (d / 20) * 120;

      const x = 130 + Math.cos(angle) * radius;
      const y = 130 + Math.sin(angle) * radius;

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
// CHAT
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

onChildAdded(chatRef, (snap) => {
  const data = snap.val();
  const msgBox = document.getElementById("messages");

  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.msg}`;
  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
});
