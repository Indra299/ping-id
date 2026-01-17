console.log("PingIDX Modern App.js JALAN");

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ====== CONFIG FIREBASE ======
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxx",
  authDomain: "pingidx-76020038.firebaseapp.com",
  databaseURL: "https://pingidx-76020038-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pingidx-76020038",
  storageBucket: "pingidx-76020038.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References
const chatRef = ref(db, "chat");
const usersRef = ref(db, "users");

// User anonim
const userID = "PingIDX#" + Math.floor(Math.random() * 9000 + 1000);
const radar = document.querySelector(".radar");
const nearbyCount = document.getElementById("nearbyCount");
const chatBox = document.getElementById("chatBox");
let radarDots = [];

// ====== UPDATE POSISI & STATUS ONLINE ======
function updateUserPosition() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    set(ref(db, `users/${userID}`), { latitude, longitude, lastActive: Date.now() });
  }, err => {
    // fallback random
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 90 + 20;
    const x = 50 + radius * Math.cos(angle) / 1.1;
    const y = 50 + radius * Math.sin(angle) / 1.1;
    set(ref(db, `users/${userID}`), { x, y, lastActive: Date.now() });
  });
}
setInterval(updateUserPosition, 3000);

// ====== RENDER RADAR DENGAN JARAK ======
onValue(usersRef, (snapshot) => {
  radarDots.forEach(dot => radar.removeChild(dot));
  radarDots = [];
  let count = 0;

  snapshot.forEach(userSnap => {
    const data = userSnap.val();
    if (userSnap.key === userID) return;

    const dot = document.createElement("div");
    dot.classList.add("dot");

    if(data.latitude && data.longitude && navigator.geolocation) {
      // hitung jarak sederhana (meters)
      navigator.geolocation.getCurrentPosition(pos => {
        const lat1 = pos.coords.latitude;
        const lon1 = pos.coords.longitude;
        const lat2 = data.latitude;
        const lon2 = data.longitude;
        const R = 6371000; // radius bumi
        const dLat = (lat2 - lat1) * Math.PI/180;
        const dLon = (lon2 - lon1) * Math.PI/180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        if(distance <= 200) { // ≤ 200 meter
          dot.style.left = `${50 + Math.random()*80-40}%`;
          dot.style.top = `${50 + Math.random()*80-40}%`;
          radar.appendChild(dot);
          radarDots.push(dot);
          count++;
        }
      });
    } else { // fallback random
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 90 + 20;
      dot.style.left = `${50 + radius * Math.cos(angle)/1.1}%`;
      dot.style.top = `${50 + radius * Math.sin(angle)/1.1}%`;
      radar.appendChild(dot);
      radarDots.push(dot);
      count++;
    }
  });

  nearbyCount.textContent = `📍 ${count} user ≤ 200 meter`;
  chatBox.classList.toggle("hidden", count === 0);
});

// ====== CHAT 1-to-1 ======
window.sendMessage = function() {
  const input = document.getElementById("msgInput");
  if(!input.value.trim()) return;

  push(chatRef, { user: userID, msg: input.value, time: Date.now() });
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

// ====== PING USER ======
window.sendPing = function() {
  alert("PING terkirim ke user sekitar!");
};
