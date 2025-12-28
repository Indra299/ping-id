const statusText = document.getElementById("status");

navigator.geolocation.getCurrentPosition(
  () => {
    statusText.innerText = "Ada orang di sekitar kamu 👀";
  },
  () => {
    statusText.innerText = "Izinkan lokasi untuk menggunakan Ping.ID";
  }
);

function sendPing() {
  alert("📡 Ping terkirim ke orang terdekat!");
}
