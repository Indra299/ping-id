console.log("APP.JS JALAN");
// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// Chat reference
const chatRef = ref(db, "chat");

// Kirim pesan
window.sendMessage = function () {
  const input = document.getElementById("msgInput");
  if (input.value.trim() === "") return;

  push(chatRef, {
    msg: input.value,
    time: Date.now()
  });

  input.value = "";
};

// Terima pesan realtime
onChildAdded(chatRef, (snapshot) => {
  const messages = document.getElementById("messages");
  const data = snapshot.val();

  const div = document.createElement("div");
  div.textContent = data.msg;
  messages.appendChild(div);
});
