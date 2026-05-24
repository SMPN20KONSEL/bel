import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ================= ELEMENT =================

const namaBel =
document.getElementById("namaBel");

const jamBel =
document.getElementById("jamBel");

const hariBel =
document.getElementById("hariBel");

const audioBel =
document.getElementById("audioBel");

const btnSimpan =
document.getElementById("btnSimpan");

const dataJadwal =
document.getElementById("dataJadwal");

// ================= AUDIO LIST =================

const daftarAudio = [

  "5_menit_sebelum_berakhir_istirahat.mp3",

  "5_menit_sebelum_berakrih_istirahat_ke1.mp3",

  "5_menit_sebelum_berakrih_istirahat_ke2.mp3",
  "5_menit_sebelum_mulai_jam_ke1.mp3",
  "5_menit_sebelum_upacara.mp3",
  "Indonesia Raya.mp3",
  "jam_pulang_khusus_sabtu.mp3",
  "masuk_jam_ke1.mp3",
  "masuk_jam_ke2.mp3",
  "masuk_jam_ke3.mp3",
  "pulang_sekolah_versi2.mp3",
  "pulang_sekolah.mp3",
  "saatny_istirahat.mp3",
  "saatnya_istirahat_ke2.mp3",
  "saatnya_istirahat_per1.mp3"

];

// ================= FORMAT NAMA AUDIO =================

function formatNamaAudio(namaFile){

  return namaFile
    .replace(".mp3","")
    .replaceAll("_"," ")
    .replace(/\b\w/g,huruf =>
      huruf.toUpperCase()
    );

}

// ================= TAMPIL AUDIO =================

audioBel.innerHTML = "";

daftarAudio.forEach((audio)=>{

  const namaTampil =
  formatNamaAudio(audio);

  audioBel.innerHTML += `
    <option value="${audio}">
      ${namaTampil}
    </option>
  `;

});

// ================= AUTO NAMA BEL =================

audioBel.addEventListener(
"change",
()=>{

  namaBel.value =
  formatNamaAudio(
    audioBel.value
  );

});

// ================= DEFAULT =================

namaBel.value =
formatNamaAudio(
  audioBel.value
);

// ================= SIMPAN DATA =================

btnSimpan.addEventListener(
"click",
async ()=>{

  const nama =
  namaBel.value.trim();

  const jam =
  jamBel.value;

  const hari =
  hariBel.value;

  const audio =
  audioBel.value;

  // ================= VALIDASI =================

  if(
    nama === "" ||
    jam === ""
  ){

    alert(
      "Lengkapi data dahulu"
    );

    return;

  }

  try{

    btnSimpan.disabled = true;

    btnSimpan.innerText =
    "MENYIMPAN...";

    // ================= SIMPAN FIREBASE =================

    await addDoc(
      collection(db,"jadwal_bel"),
      {

        nama : nama,

        jam : jam,

        hari : hari,

        audio : audio

      }
    );

    // ================= RESET =================

    jamBel.value = "";

    hariBel.selectedIndex = 0;

    audioBel.selectedIndex = 0;

    namaBel.value =
    formatNamaAudio(
      audioBel.value
    );

    console.log(
      "Berhasil simpan"
    );

  }catch(err){

    console.log(err);

    alert(
      "Gagal menyimpan data"
    );

  }finally{

    btnSimpan.disabled = false;

    btnSimpan.innerText =
    "SIMPAN";

  }

});

// ================= QUERY =================

const q = query(
  collection(db,"jadwal_bel")
);

// ================= TAMPIL DATA =================

onSnapshot(
q,
(snapshot)=>{

  dataJadwal.innerHTML = "";

  // ================= DATA KOSONG =================

  if(snapshot.empty){

    dataJadwal.innerHTML = `
      <div class="kosong">
        Belum ada jadwal bel
      </div>
    `;

    return;

  }

  // ================= ARRAY DATA =================

  const semuaData = [];

  snapshot.forEach((item)=>{

    semuaData.push({

      id : item.id,

      ...item.data()

    });

  });

  // ================= SORT DATA =================

  semuaData.sort((a,b)=>{

    const urutanHari = {

      "Minggu" : 0,

      "Senin" : 1,

      "Selasa" : 2,

      "Rabu" : 3,

      "Kamis" : 4,

      "Jumat" : 5,

      "Sabtu" : 6

    };

    // ================= SORT HARI =================

    if(
      urutanHari[a.hari] !==
      urutanHari[b.hari]
    ){

      return (
        urutanHari[a.hari] -
        urutanHari[b.hari]
      );

    }

    // ================= SORT JAM =================

    return a.jam.localeCompare(
      b.jam
    );

  });

  // ================= TAMPIL =================

  semuaData.forEach((data)=>{

    dataJadwal.innerHTML += `

      <div class="jadwalItem">

        <div class="infoJadwal">

          <b>
            ${data.nama}
          </b>

          <br>

          ${data.hari}
          -
          ${data.jam}

          <br>

          <small>

            ${formatNamaAudio(
              data.audio
            )}

          </small>

        </div>

        <button
          class="hapusBtn"
          onclick="hapusData('${data.id}')"
        >

          HAPUS

        </button>

      </div>

    `;

  });

});

// ================= HAPUS DATA =================

window.hapusData =
async function(id){

  const konfirmasi =
  confirm(
    "Hapus jadwal ini?"
  );

  if(!konfirmasi) return;

  try{

    await deleteDoc(
      doc(
        db,
        "jadwal_bel",
        id
      )
    );

    console.log(
      "Berhasil hapus"
    );

  }catch(err){

    console.log(err);

    alert(
      "Gagal menghapus data"
    );

  }

};