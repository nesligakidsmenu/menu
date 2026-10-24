

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

// Alt kategori görünen adları categories.json içindeki subCategoryNames alanından gelir.
const ALT_KATEGORI_ADLARI = {};

const ALT_KATEGORILER = {
"espresso-bazli": {
    ad: "Espresso Bazlı Kahveler",
    ikon: "assets/subcategory-banners/espresso-bazli-kahveler.webp"
},

"sutlu": {
    ad: "Sütlü Kahveler",
    ikon: "assets/subcategory-banners/sutlu-kahveler.webp"
},

"soguk": {
    ad: "Soğuk Kahveler",
    ikon: "assets/subcategory-banners/soguk-kahveler.webp"
},

"geleneksel": {
    ad: "Geleneksel Kahveler",
    ikon: "assets/subcategory-banners/geleneksel-kahveler.webp"
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
        ikon: "assets/subcategory-banners/milkshake.webp"
    },

    "frappe": {
        ad: "Frappe",
        ikon: "assets/subcategory-banners/frappe.webp"
    },

    "smoothie": {
        ad: "Smoothie",
        ikon: "assets/subcategory-banners/smoothie.webp"
    },

    "frozen": {
        ad: "Frozen",
        ikon: "assets/subcategory-banners/frozen.webp"
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
        ikon: "assets/subcategory-banners/gunluk-lezzetler.webp"
    },

    "atistirmaliklar": {
        ad: "Atıştırmalıklar",
        ikon: "assets/subcategory-banners/atistirmaliklar.webp"
    },

    "ilaveler": {
        ad: "İlaveler",
        ikon: "assets/subcategory-banners/ilaveler.webp"
    },

    "cocuk-menuleri": {
    ad: "Çocuk Menüleri",
    ikon: "assets/subcategory-banners/cocuk-menuleri.webp"
},

"cocuk-icecekleri": {
    ad: "Çocuk İçecekleri",
    ikon: "assets/subcategory-banners/cocuk-icecekleri.webp"
}

};

function urunleriSirala(urunler) {

    if (!Array.isArray(urunler)) return [];

    return urunler
        .map((urun, index) => ({
            urun,
            index,
            order: Number.isFinite(Number(urun?.order)) ? Number(urun.order) : index + 1
        }))
        .sort((ilk, ikinci) => ilk.order - ikinci.order || ilk.index - ikinci.index)
        .map(({ urun }) => urun);
}

function kategoriKodunuGuzellestir(kategoriKodu) {

    return String(kategoriKodu || "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (harf) => harf.toLocaleUpperCase("tr-TR"));
}

function dinamikAnaKategorileriGoster(kategoriler, urunler) {
    const alan = document.getElementById("anaKategoriListesi");
    if (!alan) return;

    const kayitliKategoriler = Array.isArray(kategoriler) ? kategoriler : [];
    const kategoriHaritasi = new Map();
    kayitliKategoriler.forEach((k) => {
        const id = String(k?.id || "").trim();
        const name = String(k?.name || "").trim();
        if (id && name) kategoriHaritasi.set(id, { ...k, id, name });
    });

    const ikonYollari = {
        "kahveler": "./assets/category-banners/kahveler.webp",
        "yiyecekler": "./assets/category-banners/yiyecekler.webp",
        "tatlilar": "./assets/category-banners/tatlilar.webp",
        "soguk-icecekler": "./assets/category-banners/soguk-icecekler.webp",
        "caylar": "./assets/category-banners/caylar.webp",
        "sicak-icecekler": "./assets/category-banners/sicak-icecekler.webp",
        "soguk-special": "./assets/category-banners/soguk-special-icecekler.webp",
        "cocuk": "./assets/category-banners/cocuklar-icin.webp"
    };

    const mevcutKartlar = new Map(
        [...alan.querySelectorAll("a.category")].map((kart) => {
            const href = kart.getAttribute("href") || "";
            const match = href.match(/[?&]kat=([^&]+)/);
            return [match ? decodeURIComponent(match[1]) : "", kart];
        }).filter(([id]) => Boolean(id))
    );

    const gecerliIdler = new Set(kategoriHaritasi.keys());
    mevcutKartlar.forEach((kart, id) => {
        if (!gecerliIdler.has(id)) {
            kart.remove();
            mevcutKartlar.delete(id);
        }
    });

    kategoriHaritasi.forEach((bilgi) => {
        const id = bilgi.id;
        const ad = bilgi.name;
        let kart = mevcutKartlar.get(id);
        if (!kart) {
            kart = document.createElement("a");
            alan.appendChild(kart);
            mevcutKartlar.set(id, kart);
        }

        const gorsel = String(ikonYollari[id] || bilgi.image || bilgi.ikon || "./assets/images/logo/gorsel-yok.png").trim();
        const banner = gorsel.includes("assets/category-banners/");
        kart.className = banner ? "category category-banner" : "category";
        kart.href = `kategori.html?kat=${encodeURIComponent(id)}`;

        if (banner) {
            kart.innerHTML = `<img class="categoryBannerImage" alt="">`;
            const resim = kart.querySelector("img");
            resim.alt = ad;
            resim.onerror = function () {
                this.onerror = null;
                this.src = "./assets/images/logo/gorsel-yok.png";
            };
            const yol = `./${gorsel.replace(/^\.\//, "")}`;
            if (resim.getAttribute("src") !== yol) resim.src = yol;
        } else {
            kart.innerHTML = `<div class="icon"><img alt=""></div><span></span>`;
            kart.querySelector("span").textContent = ad;
            const resim = kart.querySelector(".icon img");
            resim.alt = ad;
            resim.onerror = function () {
                this.onerror = null;
                this.src = "./assets/images/logo/gorsel-yok.png";
            };
            const yol = `./${gorsel.replace(/^\.\//, "")}`;
            if (resim.getAttribute("src") !== yol) resim.src = yol;
        }
    });
}

function kategoriAltKategorileriniGetir(veriler, kategoriler, kategoriKodu) {

    const kayitliKategori = Array.isArray(kategoriler)
        ? kategoriler.find((item) => String(item?.id || "") === kategoriKodu)
        : null;
    const kayitliAltKategoriler = Array.isArray(kayitliKategori?.subCategories)
        ? kayitliKategori.subCategories
        : [];
    const urunAltKategorileri = veriler
        .filter((urun) => urun.anaKategori === kategoriKodu)
        .map((urun) => urun.altKategori);

    return [...new Set([...kayitliAltKategoriler, ...urunAltKategorileri]
        .map((altKategoriKodu) => String(altKategoriKodu || "").trim())
        .filter(Boolean))];
}

async function verileriGetir() {

    try {

       const cevap = await fetch("products.json");
const urunler = urunleriSirala(await cevap.json()).filter(urun => urun.aktif !== false);

const kategoriCevap = await fetch("categories.json");
const kategoriler = await kategoriCevap.json();
Object.keys(ALT_KATEGORI_ADLARI).forEach((key) => delete ALT_KATEGORI_ADLARI[key]);
if (Array.isArray(kategoriler)) {
    kategoriler.forEach((kategori) => {
        const isimler = kategori?.subCategoryNames;
        if (isimler && typeof isimler === "object") {
            Object.entries(isimler).forEach(([kod, ad]) => {
                if (String(kod).trim() && String(ad).trim()) ALT_KATEGORI_ADLARI[kod] = String(ad).trim();
            });
        }
    });
}
dinamikAnaKategorileriGoster(kategoriler, urunler);

document.getElementById("arama") &&
    aramaKutusu(urunler);

document.getElementById("kategoriListesi") &&
    kategoriSayfasi(urunler, kategoriler);

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
    onerror="this.src='./assets/images/products/default.webp';"
    class="urunResmi"
    loading="lazy"
    decoding="async"
    onclick="fotoAc(this.src,this.alt)"
    onload="this.parentElement.classList.add('yuklendi')">
    <div class="premiumPriceRow">
        <div class="fiyat">${u.fiyat} ₺</div>
    </div>
</div>

<div class="premiumRight">

       <div class="premiumTop">

    <div class="urunBaslik">

        <h3>${u.isim}</h3>

        <p class="kisaAciklama">
            ${u.aciklama}
        </p>

    </div>



</div>

       

<div class="rozetler">

    ${u.onerilen
        ? `<span class="badge onerilenRozet">⭐ En Çok Tercih Edilen</span>`
        : ""}

    <div class="temelRozetler">
        <span class="badge">🔥 ${u.kalori} kcal</span>

        ${u.vejetaryen
            ? `<span class="badge">🌱 Vejetaryen</span>`
            : ""}
    </div>

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




function kategoriSayfasi(veriler, kategoriler = []) {

    const alan = document.getElementById("kategoriListesi");

    if (!alan) return;

    // ALT KATEGORİLER



if (!altKategori && !DIREKT_URUN_KATEGORILERI.includes(kategori)){
        const altlar = kategoriAltKategorileriniGetir(veriler, kategoriler, kategori);

        if (!altlar.length) {
            alan.innerHTML = "<p>Bu kategoride henüz alt kategori bulunmuyor.</p>";
            return;
        }

        alan.innerHTML = altlar.map(kod => {

            const adet = veriler.filter(u =>
                u.anaKategori === kategori &&
                u.altKategori === kod
            ).length;

            const ikonYolu = String(ALT_KATEGORILER[kod]?.ikon || "");
            const banner = ikonYolu.includes("assets/subcategory-banners/");
            if (banner) {
                return `
                    <a class="category subcategory-banner" href="kategori.html?kat=${encodeURIComponent(kategori)}&alt=${encodeURIComponent(kod)}">
                        <img class="subcategoryBannerImage" src="./${ikonYolu.replace(/^\.\//, "")}" alt="${altKategoriAdi(kod).replace(/["&<>]/g, "")}" loading="lazy" decoding="async"
                             onerror="this.onerror=null;this.src='./assets/icons/default.webp';">
                    </a>`;
            }

            return `
                <a class="category" href="kategori.html?kat=${encodeURIComponent(kategori)}&alt=${encodeURIComponent(kod)}">
                    <div class="icon">
                        ${(() => {
                            const parent = Array.isArray(kategoriler) ? kategoriler.find(item => String(item?.id || "") === kategori) : null;
                            const customImage = parent?.subCategoryImages?.[kod];
                            return customImage
                                ? `<img class="altKategoriIcon" src="./${String(customImage).replace(/^\.\//, "")}" alt="${kod.replace(/["&<>]/g, "")}" onerror="this.onerror=null;this.src='./assets/icons/default.webp';">`
                                : altKategoriIcon(kod);
                        })()}
                    </div>
                    <div class="categoryInfo">
                        <div class="categoryTitle">${altKategoriAdi(kod)}</div>
                        <div class="categoryCount">${adet} Ürün</div>
                    </div>
                </a>`;

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
    return ALT_KATEGORI_ADLARI[kod] || ALT_KATEGORILER[kod]?.ad || kod;
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


function aramaKutusu(veriler) {

    const input = document.getElementById("arama");
    if (!input) return;

    const sonucAlani = aramaSonucAlaniOlustur(input);

    input.addEventListener("input", function () {

        const q = normalizeTR(this.value.trim());

        if (!q) {
            sonucAlani.innerHTML = "";
            return;
        }

        const sonuc = veriler
            .filter(u =>
                [u.isim, u.aciklama, u.anaKategori, u.altKategori]
                    .some(v => normalizeTR(v || "").includes(q))
            )
            .sort((a, b) => {

                const aIsim = normalizeTR(a.isim);
                const bIsim = normalizeTR(b.isim);

                const aBasliyor = aIsim.startsWith(q);
                const bBasliyor = bIsim.startsWith(q);

                if (aBasliyor && !bBasliyor) return -1;
                if (!aBasliyor && bBasliyor) return 1;

                return aIsim.length - bIsim.length;

            });

        if (!sonuc.length) {
            sonucAlani.innerHTML = "<p style='padding:16px'>Sonuç bulunamadı.</p>";
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
