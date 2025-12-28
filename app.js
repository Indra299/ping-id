console.log("APP.JS JALAN - Live Radar");

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
const chatRef = ref(db, "chat");
const usersRef = ref(db, "users");

// Generate anonymous ID
const userID = "Ping#" + Math.floor(Math.random() * 9000 + 1000);

// Get radar container
const radar = document.querySelector(".radar");
let radarDots = [];

// Fungsi update posisi user sendiri secara random di radar
function updateUserPosition() {
  const angle = Math.random() * 2 * Math.PI;
  const radius = Math.random() * 90 + 20; 
  const x = 50 + radius * Math.cos(angle) / 1.1; 
  const y = 50 + radius * Math.sin(angle) / 1.1;
  
  set(ref(db, `users/${userID}`), {
    x, y,
    lastActive: Date.now()
  });
}
setInterval(updateUserPosition, 3000); // update tiap 3 detik

// Fungsi render semua user di radar
onValue(usersRef, (snapshot) => {
  // Hapus titik radar sebelumnya
  radarDots.forEach(dot => radar.removeChild(dot));
  radarDots = [];

  snapshot.forEach(userSnap => {
    const userData = userSnap.val();
    if (userSnap.key === userID) return; // skip diri sendiri

    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.style.left = `${userData.x}%`;
    dot.style.top = `${userData.y}%`;

    radar.appendChild(dot);
    radarDots.push(dot);
  });

  // Chat box muncul jika ada user dalam radius ~10–20m (simulasi)
  const chatBox = document.getElementById("chatBox");
  if (radarDots.length > 0) {
    chatBox.classList.remove("hidden");
    radar.classList.add("detected");
  } else {
    chatBox.classList.add("hidden");
    radar.classList.remove("detected");
  }
});

// Kirim pesan
window.sendMessage = function () {
  const input = document.getElementById("msgInput");
  if (!input.value.trim()) return;

  push(chatRef, {
    msg: input.value,
    user: userID,
    time: Date.now()
  });

  input.value = "";
};

// Terima pesan realtime
onChildAdded(chatRef, (snapshot) => {
  const chatBox = document.getElementById("chatBox");
  chatBox.classList.remove("hidden");

  const messages = document.getElementById("messages");
  const data = snapshot.val();

  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.msg}`;
  messages.appendChild(div);
});
