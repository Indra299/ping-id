console.log("APP.JS JALAN - Ping.IDX Modern GPS");

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "API_KEY_FIREBASE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "YOUR_PROJECT_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatRef = ref(db, "chat");
const usersRef = ref(db, "users");

// User anonymous ID
const myID = "Ping#" + Math.floor(Math.random() * 9000 + 1000);

const radar = document.querySelector(".radar");
let radarDots = [];
const nearbyCount = document.getElementById("nearbyCount");
const chatBox = document.getElementById("chatBox");

// =========================
// GPS REAL
// =========================
function updateUserLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    // Simpan posisi di Firebase
    set(ref(db, `users/${myID}`), {
      lat, lon,
      lastActive: Date.now()
    });
  });
}

// Update lokasi tiap 3 detik
setInterval(updateUserLocation, 3000);

// =========================
// HITUNG JARAK (Haversine)
// =========================
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meter
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // meter
}

// =========================
// RADAR & USER DETECTION
// =========================
onValue(usersRef, snap => {
  radarDots.forEach(dot => radar.removeChild(dot));
  radarDots = [];

  let nearbyUsers = 0;

  snap.forEach(userSnap => {
    if (userSnap.key === myID) return; // skip diri sendiri

    const u = userSnap.val();
    const myPos = snap.val()[myID];

    if (!myPos || !u.lat || !u.lon) return;

    const distance = getDistance(myPos.lat, myPos.lon, u.lat, u.lon);

    if (distance <= 200) { // 100–200 meter
      const angle = Math.random() * Math.PI * 2;
      const radius = distance / 2; 
      const x = 130 + Math.cos(angle) * radius;
      const y = 130 + Math.sin(angle) * radius;

      const dot = document.createElement("div");
      dot.className = "dot";
      dot.style.left = x + "px";
      dot.style.top = y + "px";

      radar.appendChild(dot);
      radarDots.push(dot);

      nearbyUsers++;
    }
  });

  nearbyCount.textContent = `📍 ${nearbyUsers} orang ≤ 200 meter`;
  chatBox.classList.toggle("hidden", nearbyUsers === 0);
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
  const msgBox = document.getElementById("messages");

  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.msg}`;
  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
});

// =========================
// PING / NUDGE
// =========================
window.sendPing = function() {
  push(chatRef, {
    user: myID,
    msg: "⚡️ Ping!",
    time: Date.now()
  });
};
