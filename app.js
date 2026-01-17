console.log("PingIDX Radar Aktif");

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// ID user anonim
const myID = "Ping#" + Math.floor(Math.random() * 9000 + 1000);

// Radar
const radar = document.querySelector(".radar");
const nearbyCount = document.getElementById("nearbyCount");
const chatBox = document.getElementById("chatBox");

let dots = [];

// Update posisi user (simulasi GPS)
function updateMyPosition() {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 40; // radius radar
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;

  set(ref(db, `users/${myID}`), {
    x,
    y,
    lastActive: Date.now()
  });
}

setInterval(updateMyPosition, 3000);
updateMyPosition();

// Render radar user terdekat
onValue(usersRef, (snapshot) => {
  dots.forEach(d => d.remove());
  dots = [];

  let count = 0;

  snapshot.forEach(userSnap => {
    if (userSnap.key === myID) return;

    const user = userSnap.val();
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.left = user.x + "%";
    dot.style.top = user.y + "%";

    radar.appendChild(dot);
    dots.push(dot);
    count++;
  });

  nearbyCount.textContent = `📍 ${count} orang terdeteksi`;

  if (count > 0) {
    chatBox.classList.remove("hidden");
  } else {
    chatBox.classList.add("hidden");
  }
});

// Kirim pesan
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

// Terima pesan
onChildAdded(chatRef, (snap) => {
  const data = snap.val();
  const msgBox = document.getElementById("messages");

  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.msg}`;
  msgBox.appendChild(div);

  msgBox.scrollTop = msgBox.scrollHeight;
});
