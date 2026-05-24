import { db }
from './firebase.js';

import {
  collection,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ================= HARI =================

const hariText = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

// ================= ELEMENT =================

const audioPlayer =
document.getElementById("audioPlayer");

const jadwalList =
document.getElementById("jadwalList");

const nextBell =
document.getElementById("nextBell");

// ================= AUDIO SUPER KERAS =================

audioPlayer.volume = 1.0;

const audioContext =
new AudioContext();

const source =
audioContext.createMediaElementSource(audioPlayer);

const gainNode =
audioContext.createGain();

gainNode.gain.value = 2.5;

source.connect(gainNode);

gainNode.connect(audioContext.destination);

// ================= VARIABLE =================

let semuaJadwal = [];

let sudahBunyi = "";

// ================= AMBIL DATA FIREBASE =================

onSnapshot(
collection(db,"jadwal_bel"),
(snapshot)=>{

  semuaJadwal = [];

  snapshot.forEach((doc)=>{

    semuaJadwal.push(doc.data());

  });

  tampilJadwal();

});

// ================= UPDATE JAM =================

function updateJam(){

  const now =
  new Date();

  const jam =
  String(now.getHours())
  .padStart(2,'0');

  const menit =
  String(now.getMinutes())
  .padStart(2,'0');

  const detik =
  String(now.getSeconds())
  .padStart(2,'0');

  // ================= TAMPIL JAM =================

  document.getElementById("jam")
  .innerHTML = jam;

  document.getElementById("menit")
  .innerHTML = menit;

  document.getElementById("detik")
  .innerHTML = detik;

  // ================= HARI =================

  const hari =
  hariText[now.getDay()];

  document.getElementById("hari")
  .innerHTML = hari;

  // ================= TANGGAL =================

  document.getElementById("tanggal")
  .innerHTML =
  now.toLocaleDateString(
    'id-ID',
    {
      weekday:'long',
      year:'numeric',
      month:'long',
      day:'numeric'
    }
  );

  // ================= CEK BEL =================

  cekBel(`${jam}:${menit}`);

  // ================= UPDATE WARNA JADWAL =================

  updateRealtimeJadwal(`${jam}:${menit}`);

}

// ================= JALANKAN JAM =================

updateJam();

setInterval(
updateJam,
1000
);

// ================= TAMPIL JADWAL =================

function tampilJadwal(){

  const hariSekarang =
  hariText[
    new Date().getDay()
  ];

  jadwalList.innerHTML = "";

  // ================= FILTER =================

  const dataHariIni =
  semuaJadwal.filter((item)=>{

    return item.hari === hariSekarang;

  });

  // ================= SORT =================

  dataHariIni.sort((a,b)=>{

    return a.jam.localeCompare(b.jam);

  });

  // ================= KOSONG =================

  if(dataHariIni.length <= 0){

    jadwalList.innerHTML = `
    <div class="kosong">
      Tidak ada jadwal hari ini
    </div>
    `;

    return;

  }

  // ================= TAMPIL =================

  dataHariIni.forEach((item)=>{

    jadwalList.innerHTML += `
    <div
    class="jadwalItem"
    id="jadwal-${item.jam.replace(':','-')}">

      <div class="jamBel">
        ${item.jam}
      </div>

      <div class="namaBel">
        ${item.nama}
      </div>

    </div>
    `;

  });

  tampilBelBerikutnya();

}

// ================= REALTIME WARNA =================

function updateRealtimeJadwal(waktu){

  const semuaItem =
  document.querySelectorAll(
    ".jadwalItem"
  );

  semuaItem.forEach((item)=>{

    item.classList.remove(
      "aktifRealtime"
    );

  });

  const id =
  `jadwal-${waktu.replace(':','-')}`;

  const aktif =
  document.getElementById(id);

  if(aktif){

    aktif.classList.add(
      "aktifRealtime"
    );

  }

}

// ================= CEK BEL =================

function cekBel(waktu){

  const hariSekarang =
  hariText[
    new Date().getDay()
  ];

  // ================= FILTER =================

  const dataHariIni =
  semuaJadwal.filter((item)=>{

    return item.hari === hariSekarang;

  });

  dataHariIni.forEach((item)=>{

    // ================= CEK JAM =================

    if(
      item.jam === waktu &&
      sudahBunyi !== `${hariSekarang}-${waktu}`
    ){

      // ================= STATUS =================

      sudahBunyi =
      `${hariSekarang}-${waktu}`;

      console.log(
        "BEL BUNYI:",
        item.nama
      );

      // ================= RESET AUDIO =================

      audioPlayer.pause();

      audioPlayer.currentTime = 0;

      // ================= SET AUDIO =================

      audioPlayer.src =
      `assets/audio/${item.audio}`;

      // ================= PLAY =================

      audioPlayer.play()
      .then(()=>{

        console.log(
          "Audio berhasil diputar"
        );

      })
      .catch((err)=>{

        console.log(
          "Audio gagal:",
          err
        );

      });

    }

  });

}

// ================= BEL BERIKUTNYA =================

function tampilBelBerikutnya(){

  const now =
  new Date();

  const sekarang =
  now.getHours()*60 +
  now.getMinutes();

  const hariSekarang =
  hariText[now.getDay()];

  // ================= FILTER =================

  const dataHariIni =
  semuaJadwal.filter((item)=>{

    return item.hari === hariSekarang;

  });

  let next = null;

  dataHariIni.forEach((item)=>{

    const pecah =
    item.jam.split(":");

    const total =
    parseInt(pecah[0])*60 +
    parseInt(pecah[1]);

    if(total > sekarang){

      if(
        !next ||
        total < next.total
      ){

        next = {

          total : total,
          nama  : item.nama,
          jam   : item.jam

        };

      }

    }

  });

  // ================= TAMPIL NEXT =================

  if(next){

    nextBell.innerHTML =
    `${next.jam} - ${next.nama}`;

  }else{

    nextBell.innerHTML =
    "SEMUA BEL SELESAI";

  }

}

// ================= UPDATE NEXT =================

tampilBelBerikutnya();

setInterval(
tampilBelBerikutnya,
60000
);

// ================= WAKE LOCK =================

let wakeLock = null;

async function aktifkanWakeLock(){

  try{

    wakeLock =
    await navigator.wakeLock.request(
      "screen"
    );

    console.log(
      "Wake Lock Aktif"
    );

  }catch(err){

    console.log(
      "Wake Lock Gagal:",
      err
    );

  }

}

// ================= AKTIFKAN =================

aktifkanWakeLock();

// ================= TAB KEMBALI =================

document.addEventListener(
"visibilitychange",
async ()=>{

  if(
    document.visibilityState ===
    "visible"
  ){

    aktifkanWakeLock();

  }

});