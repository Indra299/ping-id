const firebaseConfig = {
  apiKey: "AIzaSyCnmYG0cZsv52GmMRxjJPPuWmIyNpr4xww",
  authDomain: "ping-id-chat.firebaseapp.com",
  databaseURL: "https://ping-id-chat-578b6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ping-id-chat",
  storageBucket: "ping-id-chat.firebasestorage.app",
  messagingSenderId: "1034233458438",
  appId: "1:1034233458438:web:0c14b3dd9765cdb8a73887"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const chatRef = database.ref("chat");

const chatBox = document.getElementById("chatBox");
const messages = document.getElementById("messages");
const userId = "Ping#" + Math.floor(Math.random() * 10000);

document.querySelector(".dot").addEventListener("click", () => {
  chatBox.classList.remove("hidden");
});

function sendMessage() {
  const input = document.getElementById("msgInput");
  if (!input.value.trim()) return;

  chatRef.push({
    user: userId,
    text: input.value,
    time: Date.now()
  });

  input.value = "";
}

chatRef.limitToLast(20).on("child_added", snapshot => {
  const data = snapshot.val();
  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
