/* NESLIGA ADMIN API */

const API_BASE = String(API_URL || "").replace(/\/$/, "");
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

async function request(endpoint, options = {}, { authenticated = true } = {}) {
    if (!API_BASE) {
        throw new Error("API adresi tanımlı değil.");
    }

    const isFormData = options.body instanceof FormData;
    const token = authenticated ? getAuthToken() : "";
    const headers = {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    let response;

    try {
        response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    } catch {
        throw new Error("Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.");
    }

    if (!response.ok) {
        if (response.status === 401 && authenticated) clearAuthToken();
        throw new Error(await getErrorMessage(response));
    }

    return response;
}

async function apiLogin(password) {
    const result = await parseJson(await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ password })
    }, { authenticated: false }));

    if (!result?.token) {
        throw new Error("Sunucu oturum anahtarı döndürmedi.");
    }

    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, result.token);
    return result;
}

async function apiCheckSession() {
    return parseJson(await request("/auth/session"));
}

function apiLogout() {
    clearAuthToken();
}

function apiIsAuthenticated() {
    return Boolean(getAuthToken());
}

function getAuthToken() {
    return localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || "";
}

function clearAuthToken() {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    localStorage.removeItem("adminLogin");
}

async function getErrorMessage(response) {
    try {
        const body = await response.json();
        return body?.error || body?.message || getStatusMessage(response.status);
    } catch {
        return getStatusMessage(response.status);
    }
}

async function parseJson(response) {
    if (response.status === 204) return null;

    try {
        return await response.json();
    } catch {
        throw new Error("Sunucudan geçersiz bir yanıt alındı.");
    }
}

async function apiGetProducts() {
    return parseJson(await request("/products", {}, { authenticated: false }));
}

async function apiSaveProducts(products) {
    if (!Array.isArray(products)) throw new Error("Kaydedilecek ürün verisi geçersiz.");
    return parseJson(await request("/products", { method: "POST", body: JSON.stringify(products) }));
}

async function apiGetCategories() {
    return parseJson(await request("/categories", {}, { authenticated: false }));
}

async function apiSaveCategories(categories) {
    if (!Array.isArray(categories)) throw new Error("Kaydedilecek kategori verisi geçersiz.");
    return parseJson(await request("/categories", { method: "POST", body: JSON.stringify(categories) }));
}

function validateImage(file) {
    if (!file) throw new Error("Bir resim dosyası seçin.");
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Yalnızca JPG, PNG veya WEBP formatında resim yükleyebilirsiniz.");
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Resim dosyası 10 MB'dan büyük olamaz.");
}

async function apiUploadImage(file, productName) {
    validateImage(file);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("productName", productName);

    const result = await parseJson(await request("/upload-image", {
        method: "POST",
        body: formData
    }));

    if (!result?.fileName)
        throw new Error("Sunucu yüklenen resmin dosya adını döndürmedi.");

    return result.fileName;
}


async function apiHealthCheck() {
    return parseJson(await request("/health", {}, { authenticated: false }));
}

async function apiPing() {
    try {
        await apiHealthCheck();
        return true;
    } catch {
        return false;
    }
}

function getFileExtension(fileName) {
    const parts = String(fileName || "").split(".");
    return parts.length > 1 ? parts.pop().toLocaleLowerCase("tr-TR") : "";
}

function isImageFile(fileName) {
    return ["jpg", "jpeg", "png", "webp"].includes(getFileExtension(fileName));
}

function buildImageUrl(fileName) {
    const cleanName = String(fileName || "").replace(/^images\//, "");
    return cleanName ? `../assets/images/products/${cleanName}` : "../assets/images/products/no-image.webp";
}

function getStatusMessage(status) {
    const messages = {
        400: "Geçersiz istek gönderildi.",
        401: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
        403: "Bu işlem için erişim izniniz yok.",
        404: "İstenen kaynak bulunamadı.",
        409: "Bu kayıt başka bir işlemle çakıştı.",
        413: "Yüklenen dosya çok büyük.",
        415: "Desteklenmeyen dosya formatı.",
        429: "Çok fazla istek gönderildi. Kısa süre sonra tekrar deneyin.",
        500: "Sunucuda beklenmeyen bir hata oluştu.",
        502: "Sunucu geçici olarak kullanılamıyor.",
        503: "Hizmet şu anda kullanılamıyor."
    };

    return messages[status] || "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
}

window.api = {
    apiLogin,
    apiCheckSession,
    apiLogout,
    apiIsAuthenticated,
    apiGetProducts,
    apiSaveProducts,
    apiGetCategories,
    apiSaveCategories,
    apiUploadImage,
    apiHealthCheck,
    apiPing,
    validateImage,
    buildImageUrl,
    getFileExtension,
    isImageFile,
    getStatusMessage
};
