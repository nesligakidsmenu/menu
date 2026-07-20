

const url = new URLSearchParams(window.location.search);

const kategori = url.get("kat");
const altKategori = url.get("alt");

const DIREKT_URUN_KATEGORILERI = [
    "tatlilar",
    "caylar",
    "sicak-icecekler",
    "soguk-icecekler"
];

const ALT_KATEGORILER = {
    "espresso-bazli": {
        ad: "Espresso Bazlı Kahveler",
        ikon: "☕"
    },
    "sutlu": {
        ad: "Sütlü Kahveler",
        ikon: "🥛"
    },
    "soguk": {
        ad: "Soğuk Kahveler",
        ikon: "🧊"
    },
    "geleneksel": {
        ad: "Geleneksel Kahveler",
        ikon: "🇹🇷"
    },
    "waffle": {
        ad: "Waffle",
        ikon: "🧇"
    },
    "tatlilar": {
        ad: "Diğer Tatlılar",
        ikon: "🍰"
    },
    "milkshake": {
        ad: "Milkshake",
        ikon: "🥤"
    },
    "frappe": {
        ad: "Frappe",
        ikon: "☕"
    },
    "smoothie": {
        ad: "Smoothie",
        ikon: "🥭"
    },
    "frozen": {
        ad: "Frozen",
        ikon: "❄️"
    },
    "cay": {
        ad: "Çaylar",
        ikon: "🍵"
    },
    "sicak": {
        ad: "Sıcak İçecekler",
        ikon: "🔥"
    },
    "cocuk-menu": {
        ad: "Çocuk Menüleri",
        ikon: "🍽️"
    },
    "cocuk-icecek": {
        ad: "Çocuk İçecekleri",
        ikon: "🧃"
    }
};

async function verileriGetir() {

    try {

        const cevap = await fetch("products.json");
const urunler = await cevap.json();


        if (document.getElementById("arama")) {
            aramaKutusu(urunler);
        }

        if (document.getElementById("kategoriListesi")) {
            kategoriSayfasi(urunler);
        }

       

    } catch (e) {

        console.error(e);

    }

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

    if (liste.length === 0) {

        alan.innerHTML = "<p>Bu kategoride ürün bulunamadı.</p>";
        return;

    }

    alan.innerHTML = `
<div class="urun-grid">

${liste.map(u=>{




return `

<div class="premiumCard">

    <div class="premiumLeft">

        <img src="${u.resim}" alt="${u.isim}">

    </div>

    <div class="premiumRight">

        <div class="premiumTop">

            <div>

                <h3>${u.isim}</h3>

                <p class="kisaAciklama">${u.aciklama}</p>

            </div>

            <div class="fiyat">
                ${u.fiyat} ₺
            </div>

        </div>

        <div class="rozetler">

            ${u.onerilen ? `<span class="badge">⭐ En Çok Tercih Edilen</span>` : ""}

            <span class="badge">
                🔥 ${u.kalori} kcal
            </span>

            ${u.vejetaryen ? `<span class="badge">🌱 Vejetaryen</span>` : ""}

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

                
            

        </div>

    </div>

</div>

`;

       

}).join("")}

</div>
`;

}



    

function altKategoriIcon(kod) {

    const ikonlar = {

        "espresso-bazli":"☕",
        "sutlu":"🥛",
        "soguk":"🧊",
        "geleneksel":"🇹🇷",

        "waffle":"🧇",
        "tatlilar":"🍰",

        "milkshake":"🥤",
        "frappe":"☕",
        "smoothie":"🥭",
        "frozen":"❄️",

        "cay":"🍵",
        "sicak":"🔥",

        "cocuk-menu":"🍽️",
        "cocuk-icecek":"🧃"

    };

    return ikonlar[kod] || "📋";

}

function altKategoriAdi(kod) {

    const isimler = {

        "espresso-bazli":"Espresso Bazlı Kahveler",
        "sutlu":"Sütlü Kahveler",
        "soguk":"Soğuk Kahveler",
        "geleneksel":"Geleneksel Kahveler",

        "waffle":"Waffle",
        "tatlilar":"Diğer Tatlılar",

        "milkshake":"Milkshake",
        "frappe":"Frappe",
        "smoothie":"Smoothie",
        "frozen":"Frozen",

        "cay":"Çaylar",
        "sicak":"Sıcak İçecekler",

        "cocuk-menu":"Çocuk Menüleri",
        "cocuk-icecek":"Çocuk İçecekleri"

    };

    return isimler[kod] || kod;

}

verileriGetir();


function aramaKutusu(veriler){
const tr=s=>s.toLowerCase().replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/İ/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u");
const input=document.getElementById("arama"); if(!input) return;
const highlight = (text, search) => {
    if (!search) return text;

    const temiz = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${temiz})`, "ig");

    return text.replace(regex, "<mark>$1</mark>");
};
let sonucAlani=document.getElementById("aramaSonuclari");
if(!sonucAlani){sonucAlani=document.createElement("div");sonucAlani.id="aramaSonuclari";sonucAlani.className="categories";input.parentElement.insertAdjacentElement("afterend",sonucAlani);}
input.addEventListener("input",function(){
const q=tr(this.value.trim()); if(!q){sonucAlani.innerHTML="";return;}
const sonuc = veriler
.filter(u =>
    [u.isim, u.aciklama, u.anaKategori, u.altKategori]
        .some(v => tr(v || "").includes(q))
)
.sort((a, b) => {

    const aIsim = tr(a.isim);
    const bIsim = tr(b.isim);

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

sonucAlani.innerHTML = sonuc.map(u => `
<a class="category" href="kategori.html?kat=${u.anaKategori}&alt=${u.altKategori}">    <img src="${u.resim}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;margin-right:12px">
    <div class="categoryInfo">
        <div class="categoryTitle">${u.isim}</div>
        <div class="categoryCount">${u.fiyat} ₺ • ${u.anaKategori}</div>
    </div>
</a>
`).join("");

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
