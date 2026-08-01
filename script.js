

const url = new URLSearchParams(window.location.search);

const kategori = url.get("kat");
const altKategori = url.get("alt");
const secilenUrun = url.get("urun");

const DIREKT_URUN_KATEGORILERI = [
    "tatlilar",
    "caylar",
    "sicak-icecekler",
    "soguk-icecekler"
];

const ALT_KATEGORILER = {

    "espresso-bazli": {
        ad: "Espresso Bazlı Kahveler",
        ikon: "assets/icons-alt/espresso.webp"
    },

    "sutlu": {
        ad: "Sütlü Kahveler",
        ikon: "assets/icons-alt/sutlu.webp"
    },

    "soguk": {
        ad: "Soğuk Kahveler",
        ikon: "assets/icons-alt/soguk.webp"
    },

    "geleneksel": {
        ad: "Geleneksel Kahveler",
        ikon: "assets/icons-alt/geleneksel.webp"
    },

    "waffle": {
        ad: "Waffle",
        ikon: "assets/icons/waffle.webp"
    },

    "tatlilar": {
        ad: "Diğer Tatlılar",
        ikon: "assets/icons/tatlilar.webp"
    },

    "milkshake": {
        ad: "Milkshake",
        ikon: "assets/icons-alt/milkshake.webp"
    },

    "frappe": {
        ad: "Frappe",
        ikon: "assets/icons-alt/frappe.webp"
    },

    "smoothie": {
        ad: "Smoothie",
        ikon: "assets/icons-alt/smoothie.webp"
    },

    "frozen": {
        ad: "Frozen",
        ikon: "assets/icons-alt/frozen.webp"
    },

    "cay": {
        ad: "Çaylar",
        ikon: "assets/icons/caylar.webp"
    },

    "sicak": {
        ad: "Sıcak İçecekler",
        ikon: "assets/icons/sicak-icecekler.webp"
    },

    "gunluk-lezzetler": {
        ad: "Günlük Lezzetler",
        ikon: "assets/icons-alt/gunluk-lezzetler.webp"
    },

    "atistirmaliklar": {
        ad: "Atıştırmalıklar",
        ikon: "assets/icons-alt/atistirmaliklar.webp"
    },

    "ilaveler": {
        ad: "İlaveler",
        ikon: "assets/icons-alt/ilaveler.webp"
    },

    "cocuk-menuleri": {
    ad: "Çocuk Menüleri",
    ikon: "assets/icons-alt/cocuk-menuleri.webp"
},

"cocuk-icecekleri": {
    ad: "Çocuk İçecekleri",
    ikon: "assets/icons-alt/cocuk-icecekleri.webp"
}

};

async function verileriGetir() {

    try {

       const cevap = await fetch("products.json");
const urunler = await cevap.json();

document.getElementById("arama") &&
    aramaKutusu(urunler);

document.getElementById("kategoriListesi") &&
    kategoriSayfasi(urunler);

document.getElementById("onerilenListe") &&
    onerilenSayfasi(urunler);

       
    } catch (e) {

        console.error(e);

    }
}


function renderUrunler(alan, liste) {

    if (!alan) return;

    if (!liste.length) {
        alan.innerHTML = "<p>Bu kategoride ürün bulunamadı.</p>";
        return;
    }

    alan.innerHTML = `
        <div class="urun-grid">
            ${liste.map(kartOlustur).join("")}
        </div>
    `;
}

function kartOlustur(u) {
console.log("kartOlustur çalıştı", u.isim);
    return `
<div class="premiumCard" id="urun-${encodeURIComponent(u.isim)}">

    <div class="premiumLeft">
   <img
    src="${urunResmi(u.isim)}"
    alt="${u.isim}"
    onerror="console.log('RESİM YOLU:', this.src); this.src='./assets/images/products/default.webp';"
    class="urunResmi"
    loading="lazy"
    decoding="async"
    onclick="fotoAc(this.src,this.alt)"
    onload="this.parentElement.classList.add('yuklendi')"
    onerror="this.src='./assets/images/products/default.webp';">
</div>

<div class="premiumRight">

       <div class="premiumTop">

    <div class="urunBaslik">

        <h3>${u.isim}</h3>

        <p class="kisaAciklama">
            ${u.aciklama}
        </p>

    </div>

    <div class="fiyat">
        ${u.fiyat} ₺
    </div>

</div>

        <div class="rozetler">

            ${u.onerilen
                ? `<span class="badge">⭐ En Çok Tercih Edilen</span>`
                : ""}

            <span class="badge">
                🔥 ${u.kalori} kcal
            </span>

            ${u.vejetaryen
                ? `<span class="badge">🌱 Vejetaryen</span>`
                : ""}

            ${u.gluten !== undefined
                ? `<span class="badge">${u.gluten ? "🌾 Gluten" : "🌾 Glutensiz"}</span>`
                : ""}

            ${u.laktoz !== undefined
                ? `<span class="badge">${u.laktoz ? "🥛 Laktoz" : "🥛 Laktozsuz"}</span>`
                : ""}

        </div>

        <div class="urunAccordion">

            <button class="accordionBtn">
                <span>Detayları Gör</span>
                <span>+</span>
            </button>

            <div class="accordionContent">

                <h4>İçindekiler</h4>

                <p>${u.icerik.join(", ")}</p>

                ${
                    u.alerjen && u.alerjen.length
                    ? `
                    <h4>Alerjenler</h4>
                    <p>${u.alerjen.join(", ")}</p>
                    `
                    : ""
                }

            </div>

        </div>

    </div>

</div>
`;
}




function kategoriSayfasi(veriler) {

    const alan = document.getElementById("kategoriListesi");

    if (!alan) return;

    // ALT KATEGORİLER



if (!altKategori && !DIREKT_URUN_KATEGORILERI.includes(kategori)){
        const altlar = [...new Set(

            veriler
                .filter(u => u.anaKategori === kategori)
                .map(u => u.altKategori)

        )];

        alan.innerHTML = altlar.map(kod => {

            const adet = veriler.filter(u =>
                u.anaKategori === kategori &&
                u.altKategori === kod
            ).length;

            return `
                <a class="category" href="kategori.html?kat=${kategori}&alt=${kod}">

                    <div class="icon">
                        ${altKategoriIcon(kod)}
                        
                    </div>

                    <div class="categoryInfo">

                        <div class="categoryTitle">
                            ${altKategoriAdi(kod)}
                        </div>

                        <div class="categoryCount">
                            ${adet} Ürün
                        </div>

                    </div>

                </a>
            `;

        }).join("");

        return;

    }

    // ÜRÜNLER

  const liste = veriler.filter(u => {

    if (DIREKT_URUN_KATEGORILERI.includes(kategori)) {
        return u.anaKategori === kategori;
    }

    return (
        u.anaKategori === kategori &&
        u.altKategori === altKategori
    );

});
    renderUrunler(alan, liste);

requestAnimationFrame(() => {
    seciliUrunuGoster();
});
}

function onerilenSayfasi(veriler){

    const alan=document.getElementById("onerilenListe");
    if(!alan) return;

    const liste=veriler.filter(u=>u.onerilen===true);

    if (!liste.length) {
    alan.innerHTML = "<p>Önerilen ürün bulunamadı.</p>";
    return;
}

renderUrunler(alan, liste);
}

function altKategoriIcon(kod) {

    function altKategoriIcon(kod) {
    console.log("Alt kategori kodu:", kod);

    return `<img src="${ALT_KATEGORILER[kod]?.ikon}" class="altKategoriIcon">`;
}
    const icon = ALT_KATEGORILER[kod]?.ikon;

    if (!icon) {
        return `
            <img
                src="assets/icons/default.webp"
                class="altKategoriIcon"
                alt="">
        `;
    }

    return `
        <img
            src="${icon}"
            class="altKategoriIcon"
            alt="${ALT_KATEGORILER[kod].ad}">
    `;
}

function altKategoriAdi(kod) {
    return ALT_KATEGORILER[kod]?.ad || kod;
}

function normalizeTR(text) {
    return (text || "")
        .toLowerCase()
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/ı/g, "i")
        .replace(/İ/g, "i")
        .replace(/ö/g, "o")
        .replace(/ş/g, "s")
        .replace(/ü/g, "u")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function urunResmi(isim) {
    return `./assets/images/products/${normalizeTR(isim)}.webp`;
}

function highlight(text, search) {
    if (!search) return text;

    const temiz = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${temiz})`, "ig");

    return text.replace(regex, "<mark>$1</mark>");
}

function aramaSonucAlaniOlustur(input) {

    let sonucAlani = document.getElementById("aramaSonuclari");

    if (!sonucAlani) {
        sonucAlani = document.createElement("div");
        sonucAlani.id = "aramaSonuclari";
        sonucAlani.className = "categories";
        input.parentElement.insertAdjacentElement("afterend", sonucAlani);
    }

    return sonucAlani;
}
function aramaSonucKart(u) {
    return `
<a class="category" href="kategori.html?kat=${u.anaKategori}&alt=${u.altKategori}&urun=${encodeURIComponent(u.isim)}">
    <img
        src="${urunResmi(u.isim)}"
        alt="${u.isim}"
        loading="lazy"
        decoding="async"
        onerror="this.src='./assets/images/products/default.webp';"
        style="width:52px;height:52px;object-fit:cover;border-radius:8px;margin-right:12px;flex-shrink:0">

    <div class="categoryInfo">
        <div class="categoryTitle">${u.isim}</div>
        <div class="categoryCount">${u.fiyat} ₺ • ${altKategoriAdi(u.altKategori)}</div>
    </div>
</a>
`;
}
function aramaSonucKart(u) {
    return `
<a class="category" href="kategori.html?kat=${u.anaKategori}&alt=${u.altKategori}&urun=${encodeURIComponent(u.isim)}">
    <img
        src="${urunResmi(u.isim)}"
        alt="${u.isim}"
        loading="lazy"
        decoding="async"
        onerror="this.src='./assets/images/products/default.webp';"
        style="width:52px;height:52px;object-fit:cover;border-radius:8px;margin-right:12px;flex-shrink:0">

    <div class="categoryInfo">
        <div class="categoryTitle">${u.isim}</div>
        <div class="categoryCount">${u.fiyat} ₺ • ${altKategoriAdi(u.altKategori)}</div>
    </div>
</a>
`;
}

verileriGetir();

function seciliUrunuGoster() {

    if (!secilenUrun) return;

    const id = "urun-" + encodeURIComponent(secilenUrun);

    console.log("Aranan ID:", id);

    const kart = document.getElementById(id);

    console.log("Bulunan kart:", kart);

    if (!kart) return;

    setTimeout(() => {

        kart.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        kart.classList.add("seciliUrun");

        kart.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.03)" },
                { transform: "scale(1.02)" }
            ],
            {
                duration: 500,
                easing: "ease-out"
            }
        );

        setTimeout(() => {
            kart.classList.remove("seciliUrun");
        }, 2500);

    }, 300);
}


function aramaKutusu(veriler){
const input=document.getElementById("arama"); if(!input) return;

const sonucAlani = aramaSonucAlaniOlustur(input);
input.addEventListener("input",function(){
const q = normalizeTR(this.value.trim()); if(!q){sonucAlani.innerHTML="";return;}
const sonuc = veriler
.filter(u =>
    [u.isim, u.aciklama, u.anaKategori, u.altKategori]
.some(v => normalizeTR(v || "").includes(q)))
.sort((a, b) => {

    const aIsim = normalizeTR(a.isim);
    const bIsim = normalizeTR(b.isim);

    const aBasliyor = aIsim.startsWith(q);
    const bBasliyor = bIsim.startsWith(q);

    if (aBasliyor && !bBasliyor) return -1;
    if (!aBasliyor && bBasliyor) return 1;

    return aIsim.length - bIsim.length;

})
.slice(0,8);
if(!sonuc.length){
    sonucAlani.innerHTML="<p style='padding:16px'>Sonuç bulunamadı.</p>";
    return;
}

sonucAlani.innerHTML = sonuc.map(aramaSonucKart).join("");



});
}

// Premium UI placeholder: planned enhancements

document.addEventListener("click", function (e) {

    const btn = e.target.closest(".accordionBtn");

    if (!btn) return;

    const kart = btn.closest(".premiumCard");

    kart.classList.toggle("open");

    btn.querySelector("span:last-child").textContent =
        kart.classList.contains("open") ? "−" : "+";

});

document.addEventListener('DOMContentLoaded',()=>{
 const back=document.getElementById('backBtn');
 if(back) back.onclick=()=>history.back();
 const searchBtn=document.getElementById('searchBtn');
 const input=document.getElementById('arama');
 if(searchBtn&&input){
   searchBtn.addEventListener('click',()=>setTimeout(()=>input.focus(),50));
 }
});

function fotoAc(src, alt) {

    let modal = document.getElementById("fotoModal");

    if (!modal) {

        modal = document.createElement("div");
        modal.id = "fotoModal";

        modal.innerHTML = `
            <div class="fotoOverlay" onclick="fotoKapat()">
                <img id="buyukFoto" src="" alt="">
            </div>
        `;

        document.body.appendChild(modal);
    }

    document.getElementById("buyukFoto").src = src;
    document.getElementById("buyukFoto").alt = alt;

    modal.classList.add("aktif");
}

function fotoKapat() {

    const modal = document.getElementById("fotoModal");

    if (modal) {
        modal.classList.remove("aktif");
    }

}