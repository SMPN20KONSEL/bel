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

const btnEnableAudio =
document.getElementById("enableAudio");

// ================= AUDIO =================

audioPlayer.volume = 1.0;

audioPlayer.preload = "auto";

// ================= AUDIO CONTEXT =================

const AudioCtx =
window.AudioContext ||
window.webkitAudioContext;

const audioContext =
new AudioCtx();

// ================= SOURCE =================

const source =
audioContext.createMediaElementSource(
  audioPlayer
);

// ================= GAIN =================

const gainNode =
audioContext.createGain();

gainNode.gain.value = 1.5;

// ================= COMPRESSOR =================

const compressor =
audioContext.createDynamicsCompressor();

compressor.threshold.setValueAtTime(
  -10,
  audioContext.currentTime
);

compressor.knee.setValueAtTime(
  10,
  audioContext.currentTime
);

compressor.ratio.setValueAtTime(
  8,
  audioContext.currentTime
);

compressor.attack.setValueAtTime(
  0,
  audioContext.currentTime
);

compressor.release.setValueAtTime(
  0.25,
  audioContext.currentTime
);

// ================= CONNECT =================

source.connect(gainNode);

gainNode.connect(compressor);

compressor.connect(
  audioContext.destination
);

// ================= VARIABLE =================

let semuaJadwal = [];

let jadwalHariIni = [];

let sudahBunyi =
localStorage.getItem(
  "sudahBunyi"
) || "";

let lastMinute = "";

let sedangMemutar = false;

let wakeLock = null;

// ================= ENABLE AUDIO =================

async function enableAudio(){

  try{

    if(
      audioContext.state ===
      "suspended"
    ){

      await audioContext.resume();

    }

    audioPlayer.src =
    "assets/audio/test.mp3";

    await audioPlayer.play();

    audioPlayer.pause();

    audioPlayer.currentTime = 0;

    console.log(
      "Audio aktif"
    );

    if(btnEnableAudio){

      btnEnableAudio.style.display =
      "none";

    }

  }catch(err){

    console.log(
      "Enable audio gagal:",
      err
    );

    alert(
      "Klik lagi untuk mengaktifkan audio"
    );

  }

}

// ================= BUTTON =================

if(btnEnableAudio){

  btnEnableAudio.addEventListener(
    "click",
    enableAudio
  );

}

// ================= AUTO RESUME =================

document.addEventListener(
"click",
async ()=>{

  try{

    if(
      audioContext.state ===
      "suspended"
    ){

      await audioContext.resume();

      console.log(
        "AudioContext aktif"
      );

    }

    // ================= FULLSCREEN =================

    if(
      !document.fullscreenElement
    ){

      document.documentElement
      .requestFullscreen()
      .catch(()=>{});

    }

  }catch(err){

    console.log(err);

  }

});

// ================= FIREBASE =================

onSnapshot(
collection(db,"jadwal_bel"),
(snapshot)=>{

  semuaJadwal = [];

  snapshot.forEach((doc)=>{

    semuaJadwal.push(doc.data());

  });

  // ================= FILTER HARI =================

  const hariSekarang =
  hariText[
    new Date().getDay()
  ];

  jadwalHariIni =
  semuaJadwal.filter((item)=>{

    return (
      item.hari ===
      hariSekarang
    );

  });

  // ================= SORT =================

  jadwalHariIni.sort((a,b)=>{

    return a.jam.localeCompare(
      b.jam
    );

  });

  // ================= PRELOAD =================

  preloadAudio();

  // ================= TAMPIL =================

  tampilJadwal();

});

// ================= PRELOAD AUDIO =================

function preloadAudio(){

  semuaJadwal.forEach((item)=>{

    const audio =
    new Audio();

    audio.src =
    `assets/audio/${item.audio}`;

  });

}

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

  // ================= JAM =================

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

  // ================= WAKTU =================

  const waktuSekarang =
  `${jam}:${menit}`;

  // ================= UPDATE PER MENIT =================

  if(
    lastMinute !== waktuSekarang
  ){

    lastMinute =
    waktuSekarang;

    cekBel(waktuSekarang);

    tampilBelBerikutnya();

    updateRealtimeJadwal(
      waktuSekarang
    );

  }

}

// ================= START =================

updateJam();

setInterval(
  updateJam,
  1000
);

// ================= KEEP ALIVE =================

setInterval(()=>{

  console.log(
    "Bel sekolah aktif"
  );

},30000);

// ================= TAMPIL JADWAL =================

function tampilJadwal(){

  jadwalList.innerHTML = "";

  // ================= KOSONG =================

  if(jadwalHariIni.length <= 0){

    jadwalList.innerHTML = `
    <div class="kosong">
      Tidak ada jadwal hari ini
    </div>
    `;

    return;

  }

  // ================= TAMPIL =================

  jadwalHariIni.forEach((item)=>{

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

}

// ================= REALTIME =================

function updateRealtimeJadwal(
waktu
){

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

  jadwalHariIni.forEach((item)=>{

    const hariSekarang =
    hariText[
      new Date().getDay()
    ];

    if(

      item.jam === waktu &&

      sudahBunyi !==
      `${hariSekarang}-${waktu}`

    ){

      sudahBunyi =
      `${hariSekarang}-${waktu}`;

      localStorage.setItem(
        "sudahBunyi",
        sudahBunyi
      );

      console.log(
        "BEL:",
        item.nama
      );

      playBell(item);

    }

  });

}

// ================= PLAY BELL =================

async function playBell(item){

  // ================= ANTI DOBEL =================

  if(sedangMemutar){

    console.log(
      "Masih memutar audio"
    );

    return;

  }

  sedangMemutar = true;

  try{

    // ================= RESUME =================

    if(
      audioContext.state ===
      "suspended"
    ){

      await audioContext.resume();

    }

    // ================= STOP AUDIO =================

    if(
      !audioPlayer.paused
    ){

      audioPlayer.pause();

    }

    // ================= RESET =================

    audioPlayer.currentTime = 0;

    // ================= FADE IN =================

    gainNode.gain.setValueAtTime(
      0,
      audioContext.currentTime
    );

    gainNode.gain.linearRampToValueAtTime(
      1.5,
      audioContext.currentTime + 1
    );

    // ================= AUDIO =================

    audioPlayer.src =
    `assets/audio/${item.audio}`;

    audioPlayer.load();

    // ================= PLAY =================

    await audioPlayer.play();

    console.log(
      "Audio diputar"
    );

    // ================= END =================

    audioPlayer.onended = ()=>{

      gainNode.gain.linearRampToValueAtTime(
        0,
        audioContext.currentTime + 1
      );

      sedangMemutar = false;

      console.log(
        "Audio selesai"
      );

    };

  }catch(err){

    sedangMemutar = false;

    console.log(
      "Audio gagal:",
      err
    );

  }

}

// ================= ERROR AUDIO =================

audioPlayer.onerror = ()=>{

  sedangMemutar = false;

  console.log(
    "File audio tidak ditemukan"
  );

};

// ================= NEXT BELL =================

function tampilBelBerikutnya(){

  const now =
  new Date();

  const sekarang =
  now.getHours()*60 +
  now.getMinutes();

  let next = null;

  jadwalHariIni.forEach((item)=>{

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

  // ================= TAMPIL =================

  if(next){

    nextBell.innerHTML =
    `${next.jam} - ${next.nama}`;

  }else{

    nextBell.innerHTML =
    "SEMUA BEL SELESAI";

  }

}

// ================= WAKE LOCK =================

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
      "Wake Lock gagal:",
      err
    );

  }

}

// ================= START WAKE LOCK =================

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

    try{

      if(
        audioContext.state ===
        "suspended"
      ){

        await audioContext.resume();

      }

    }catch(err){

      console.log(err);

    }

  }

});

// ================= INTERNET =================

window.addEventListener(
"offline",
()=>{

  console.log(
    "Internet terputus"
  );

});

window.addEventListener(
"online",
()=>{

  console.log(
    "Internet tersambung"
  );

});

// ================= PWA =================

if(
  "serviceWorker" in navigator
){

  window.addEventListener(
  "load",
  ()=>{

    navigator.serviceWorker
    .register("./sw.js")
    .then(()=>{

      console.log(
        "PWA aktif"
      );

    })
    .catch((err)=>{

      console.log(
        "SW gagal:",
        err
      );

    });

  });

}
