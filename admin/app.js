/* NESLIGA ADMIN PANEL */

(() => {
    "use strict";

    const DEFAULT_IMAGE = "../assets/images/products/no-image.webp";
    const state = {
        products: [],
        filteredProducts: [],
        categories: [],
        selectedProduct: null
    };

    const $ = (selector) => document.querySelector(selector);

    const elements = {
        loginScreen: $("#loginScreen"),
        dashboard: $("#dashboard"),
        password: $("#password"),
        loginButton: $("#loginBtn"),
        loginError: $("#loginError"),
        menuItems: [...document.querySelectorAll(".menuItem")],
        pages: [$("#productsPage"), $("#categoriesPage"), $("#imagesPage"), $("#settingsPage")],
        productEditor: $("#productEditor"),
        search: $("#searchInput"),
        productList: $("#productList"),
        newProductButtons: [$("#newProductBtn"), $("#newProductBtn2")],
        saveButton: $("#saveBtn"),
        deleteButton: $("#deleteBtn"),
        cancelButton: $("#cancelBtn"),
        imagePreview: $("#imagePreview"),
        imageInput: $("#imageInput"),
        selectImageButton: $("#selectImageBtn"),
        name: $("#editName"),
        price: $("#editPrice"),
        category: $("#editCategory"),
        subCategory: $("#editSubCategory"),
        description: $("#editDescription"),
        calories: $("#editCalories"),
        ingredients: $("#editIngredients"),
        allergens: $("#editAllergens"),
        caffeine: $("#editCaffeine"),
        vegetarian: $("#editVegetarian"),
        recommended: $("#editRecommended"),
        categoryList: $("#categoryList"),
        generateCategoriesButton: $("#generateCategoriesBtn"),
        newCategoryButton: $("#newCategoryBtn"),
        newSubCategoryButton: $("#newSubCategoryBtn"),
        saveCategoriesButton: $("#saveCategoriesBtn")
    };

    document.addEventListener("DOMContentLoaded", initialise);

    async function initialise() {
        bindEvents();
        await checkLogin();
    }

    function bindEvents() {
        elements.loginButton?.addEventListener("click", login);
        elements.password?.addEventListener("keydown", (event) => {
            if (event.key === "Enter") login();
        });

        elements.search?.addEventListener("input", filterProducts);
        elements.category?.addEventListener("change", () => populateSubCategoryOptions());
        elements.imageInput?.addEventListener("change", previewImage);
        elements.selectImageButton?.addEventListener("click", () => elements.imageInput?.click());
        elements.imagePreview?.addEventListener("click", () => elements.imageInput?.click());

        elements.newProductButtons.filter(Boolean).forEach((button) => {
            button.addEventListener("click", createProduct);
        });
        elements.saveButton?.addEventListener("click", saveCurrentProduct);
        elements.deleteButton?.addEventListener("click", deleteCurrentProduct);
        elements.cancelButton?.addEventListener("click", () => clearEditor());

        elements.menuItems.forEach((item, index) => {
            item.addEventListener("click", () => openPage(index));
        });

        elements.generateCategoriesButton?.addEventListener("click", generateCategoriesFromProducts);
        elements.newCategoryButton?.addEventListener("click", addCategory);
        elements.newSubCategoryButton?.addEventListener("click", addSubCategoryFromToolbar);
        elements.saveCategoriesButton?.addEventListener("click", saveCategories);
    }

    async function login() {
        const password = elements.password?.value.trim() || "";
        elements.loginError.textContent = "";

        if (!password) {
            elements.loginError.textContent = "Şifrenizi girin.";
            elements.password?.focus();
            return;
        }

        const originalLabel = elements.loginButton.textContent;

        try {
            setButtonBusy(elements.loginButton, "Kontrol ediliyor...");
            await apiLogin(password);
            elements.password.value = "";
            await openDashboard();
        } catch (error) {
            console.error(error);
            elements.loginError.textContent = error.message || "Giriş yapılamadı. Lütfen tekrar deneyin.";
            elements.password?.focus();
        } finally {
            restoreButton(elements.loginButton, originalLabel);
        }
    }

    async function checkLogin() {
        if (!apiIsAuthenticated()) {
            showLogin();
            return;
        }

        try {
            await apiCheckSession();
            await openDashboard();
        } catch {
            apiLogout();
            showLogin();
        }
    }

    function showLogin() {
        elements.loginScreen?.classList.remove("hidden");
        elements.dashboard?.classList.add("hidden");
        elements.password?.focus();
    }

    async function openDashboard() {
        elements.loginScreen?.classList.add("hidden");
        elements.dashboard?.classList.remove("hidden");
        openPage(0);
        showLoading();

        const [categoryResult, productResult] = await Promise.allSettled([
            apiGetCategories(),
            apiGetProducts()
        ]);

        if (categoryResult.status === "fulfilled") {
            state.categories = normaliseCategories(categoryResult.value);
        } else {
            console.error(categoryResult.reason);
            state.categories = [];
            toast("Uyarı", "Kategoriler yüklenemedi. Ürün verisinden oluşturulacak.", "error");
        }

        if (productResult.status === "fulfilled") {
            state.products = normaliseProducts(productResult.value);
            state.filteredProducts = [...state.products];
        } else {
            console.error(productResult.reason);
            state.products = [];
            state.filteredProducts = [];
            toast("Hata", "Ürünler yüklenemedi. API bağlantısını kontrol edin.", "error");
        }

        ensureProductCategories();
        renderCategories();
        populateCategoryOptions();
        renderProducts();
        clearEditor({ render: false });
    }

    function normaliseProducts(value) {
        return Array.isArray(value) ? value.map((product) => ({ ...product })) : [];
    }

    function normaliseCategories(value) {
        if (!Array.isArray(value)) return [];

        return value
            .filter((category) => category && category.id)
            .map((category) => ({
                id: String(category.id),
                name: String(category.name || category.id),
                subCategories: uniqueStrings(category.subCategories || [])
            }));
    }

    function ensureProductCategories() {
        const categoryMap = new Map(state.categories.map((category) => [category.id, category]));

        state.products.forEach((product) => {
            const categoryId = String(product.anaKategori || "").trim();
            const subCategory = String(product.altKategori || "").trim();
            if (!categoryId) return;

            if (!categoryMap.has(categoryId)) {
                const category = {
                    id: categoryId,
                    name: prettifySlug(categoryId),
                    subCategories: []
                };
                state.categories.push(category);
                categoryMap.set(categoryId, category);
            }

            if (subCategory && !categoryMap.get(categoryId).subCategories.includes(subCategory)) {
                categoryMap.get(categoryId).subCategories.push(subCategory);
            }
        });

        state.categories.forEach((category) => {
            category.subCategories = uniqueStrings(category.subCategories);
        });
    }

    function filterProducts() {
        const query = normaliseSearch(elements.search?.value || "");

        state.filteredProducts = !query
            ? [...state.products]
            : state.products.filter((product) => {
                const searchable = [
                    product.isim,
                    product.anaKategori,
                    product.altKategori,
                    categoryName(product.anaKategori)
                ].join(" ");

                return normaliseSearch(searchable).includes(query);
            });

        renderProducts();
    }

    function renderProducts() {
        if (!elements.productList) return;
        elements.productList.replaceChildren();

        if (!state.filteredProducts.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.className = "text-center";
            cell.textContent = state.products.length ? "Aramanızla eşleşen ürün bulunamadı." : "Henüz ürün bulunmuyor.";
            row.append(cell);
            elements.productList.append(row);
            return;
        }

        state.filteredProducts.forEach((product) => {
            const row = document.createElement("tr");
            row.dataset.id = String(product.id);

            if (String(state.selectedProduct?.id) === String(product.id)) {
                row.classList.add("selected");
            }

            const nameCell = document.createElement("td");
            nameCell.textContent = product.isim || "İsimsiz ürün";

            const categoryCell = document.createElement("td");
            categoryCell.append(document.createTextNode(categoryName(product.anaKategori)));
            if (product.altKategori) {
                categoryCell.append(document.createElement("br"));
                const subCategory = document.createElement("small");
                subCategory.textContent = product.altKategori;
                categoryCell.append(subCategory);
            }

            const priceCell = document.createElement("td");
            priceCell.textContent = `₺${formatPrice(product.fiyat)}`;

            const actionCell = document.createElement("td");
            const editButton = createButton("Düzenle", "editBtn", () => selectProduct(product.id));
            const deleteButton = createButton("Sil", "deleteBtn", () => deleteProduct(product.id));
            actionCell.append(editButton, deleteButton);

            row.append(nameCell, categoryCell, priceCell, actionCell);
            elements.productList.append(row);
        });
    }

    function selectProduct(id) {
        const product = state.products.find((item) => String(item.id) === String(id));
        if (!product) return;

        state.selectedProduct = { ...product };
        fillEditor(state.selectedProduct);
        renderProducts();
    }

    function createProduct() {
        clearEditor({ render: false });
        state.selectedProduct = createEmptyProduct();
        populateCategoryOptions();
        elements.name?.focus();
        renderProducts();
    }

    function createEmptyProduct() {
        return {
            id: createId(),
            anaKategori: "",
            altKategori: "",
            isim: "",
            fiyat: 0,
            resim: "",
            aciklama: "",
            kalori: 0,
            icerik: [],
            alerjen: [],
            kafein: false,
            vejetaryen: false,
            onerilen: false
        };
    }

    function fillEditor(product) {
        elements.name.value = product.isim || "";
        elements.price.value = product.fiyat ?? "";
        elements.description.value = product.aciklama || "";
        elements.calories.value = product.kalori ?? "";
        elements.ingredients.value = Array.isArray(product.icerik) ? product.icerik.join(", ") : "";
        elements.allergens.value = Array.isArray(product.alerjen) ? product.alerjen.join(", ") : "";
        elements.caffeine.checked = Boolean(product.kafein);
        elements.vegetarian.checked = Boolean(product.vejetaryen);
        elements.recommended.checked = Boolean(product.onerilen);
        elements.imagePreview.src = imageUrl(product.resim);
        elements.imagePreview.alt = product.isim ? `${product.isim} ürün görseli` : "Seçilen ürün görseli";
        elements.imageInput.value = "";

        populateCategoryOptions(product.anaKategori, product.altKategori);
    }

    function clearEditor({ render = true } = {}) {
        elements.name.value = "";
        elements.price.value = "";
        elements.description.value = "";
        elements.calories.value = "";
        elements.ingredients.value = "";
        elements.allergens.value = "";
        elements.caffeine.checked = false;
        elements.vegetarian.checked = false;
        elements.recommended.checked = false;
        elements.imageInput.value = "";
        elements.imagePreview.src = DEFAULT_IMAGE;
        elements.imagePreview.alt = "Seçilen ürün görseli";
        state.selectedProduct = null;
        populateCategoryOptions();

        if (render) renderProducts();
    }

    function populateCategoryOptions(selectedCategory = "", selectedSubCategory = "") {
        if (!elements.category) return;

        const chosenCategory = selectedCategory || elements.category.value || "";
        elements.category.replaceChildren(createOption("", "Kategori seçin"));

        state.categories.forEach((category) => {
            elements.category.append(createOption(category.id, category.name));
        });

        elements.category.value = chosenCategory;
        populateSubCategoryOptions(selectedSubCategory);
    }

    function populateSubCategoryOptions(selectedSubCategory = "") {
        if (!elements.subCategory) return;

        const category = state.categories.find((item) => item.id === elements.category.value);
        const chosenSubCategory = selectedSubCategory || elements.subCategory.value || "";
        elements.subCategory.replaceChildren(createOption("", "Alt kategori seçin"));

        (category?.subCategories || []).forEach((subCategory) => {
            elements.subCategory.append(createOption(subCategory, subCategory));
        });

        elements.subCategory.value = chosenSubCategory;
    }

    function previewImage() {
        const file = elements.imageInput?.files?.[0];
        if (!file) return;

        try {
            if (typeof validateImage === "function") validateImage(file);
        } catch (error) {
            elements.imageInput.value = "";
            toast("Uyarı", error.message || "Geçerli bir resim seçin.", "error");
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            elements.imagePreview.src = String(reader.result || DEFAULT_IMAGE);
        });
        reader.readAsDataURL(file);
    }

    async function saveCurrentProduct() {
        if (!state.selectedProduct) {
            toast("Uyarı", "Kaydetmek için önce bir ürün seçin veya yeni ürün oluşturun.", "error");
            return;
        }

        const originalLabel = elements.saveButton.textContent;
        let imageName = state.selectedProduct.resim || "";

        try {
            setButtonBusy(elements.saveButton, "Kaydediliyor...");

            if (elements.imageInput?.files?.length) {
                imageName = await apiUploadImage(elements.imageInput.files[0]);
            }

            const product = readProductForm(imageName);
            if (!validateProduct(product)) return;

            const productIndex = state.products.findIndex((item) => String(item.id) === String(product.id));
            const nextProducts = [...state.products];

            if (productIndex === -1) {
                nextProducts.push(product);
            } else {
                nextProducts[productIndex] = product;
            }

            await apiSaveProducts(nextProducts);

            state.products = nextProducts;
            state.selectedProduct = { ...product };
            ensureProductCategories();
            populateCategoryOptions(product.anaKategori, product.altKategori);
            renderCategories();
            filterProducts();
            fillEditor(product);
            toast("Başarılı", "Ürün başarıyla kaydedildi.", "success");
        } catch (error) {
            console.error(error);
            toast("Hata", error.message || "Ürün kaydedilemedi.", "error");
        } finally {
            restoreButton(elements.saveButton, originalLabel);
        }
    }

    function readProductForm(imageName) {
        return {
            id: state.selectedProduct.id,
            anaKategori: elements.category.value.trim(),
            altKategori: elements.subCategory.value.trim(),
            isim: elements.name.value.trim(),
            fiyat: Number(elements.price.value),
            resim: imageName,
            aciklama: elements.description.value.trim(),
            kalori: Number(elements.calories.value) || 0,
            icerik: commaSeparatedValues(elements.ingredients.value),
            alerjen: commaSeparatedValues(elements.allergens.value),
            kafein: elements.caffeine.checked,
            vejetaryen: elements.vegetarian.checked,
            onerilen: elements.recommended.checked
        };
    }

    function validateProduct(product) {
        if (!product.isim) {
            toast("Uyarı", "Ürün adı zorunludur.", "error");
            elements.name.focus();
            return false;
        }

        if (!product.anaKategori) {
            toast("Uyarı", "Ana kategori seçin.", "error");
            elements.category.focus();
            return false;
        }

        if (!product.altKategori) {
            toast("Uyarı", "Alt kategori seçin.", "error");
            elements.subCategory.focus();
            return false;
        }

        if (!Number.isFinite(product.fiyat) || product.fiyat < 0) {
            toast("Uyarı", "Geçerli bir fiyat girin.", "error");
            elements.price.focus();
            return false;
        }

        return true;
    }

    async function deleteCurrentProduct() {
        if (!state.selectedProduct) {
            toast("Uyarı", "Silinecek bir ürün seçin.", "error");
            return;
        }

        await deleteProduct(state.selectedProduct.id);
    }

    async function deleteProduct(id) {
        const product = state.products.find((item) => String(item.id) === String(id));

        if (!product) {
            clearEditor();
            return;
        }

        if (!window.confirm(`“${product.isim}” ürününü silmek istediğinize emin misiniz?`)) return;

        const nextProducts = state.products.filter((item) => String(item.id) !== String(id));
        const originalLabel = elements.deleteButton.textContent;

        try {
            setButtonBusy(elements.deleteButton, "Siliniyor...");
            await apiSaveProducts(nextProducts);
            state.products = nextProducts;
            state.filteredProducts = nextProducts;
            state.selectedProduct = null;
            clearEditor({ render: false });
            ensureProductCategories();
            renderCategories();
            filterProducts();
            toast("Başarılı", "Ürün silindi.", "success");
        } catch (error) {
            console.error(error);
            toast("Hata", error.message || "Ürün silinemedi.", "error");
        } finally {
            restoreButton(elements.deleteButton, originalLabel);
        }
    }

    function renderCategories() {
        if (!elements.categoryList) return;
        elements.categoryList.replaceChildren();

        if (!state.categories.length) {
            const empty = document.createElement("p");
            empty.className = "text-center";
            empty.textContent = "Henüz kategori bulunmuyor.";
            elements.categoryList.append(empty);
            return;
        }

        state.categories.forEach((category) => {
            const card = document.createElement("article");
            card.className = "categoryCard";

            const header = document.createElement("div");
            header.className = "categoryHeader";
            const title = document.createElement("h3");
            title.textContent = category.name;
            const deleteCategoryButton = createButton("Sil", "deleteCategory", () => deleteCategory(category.id));
            deleteCategoryButton.setAttribute("aria-label", `${category.name} kategorisini sil`);
            header.append(title, deleteCategoryButton);

            const subCategoryList = document.createElement("div");
            subCategoryList.className = "subCategoryList";
            category.subCategories.forEach((subCategory) => {
                const row = document.createElement("div");
                row.className = "subCategoryRow";
                const label = document.createElement("span");
                label.textContent = subCategory;
                const deleteSubButton = createButton("Sil", "deleteSubCategory", () => deleteSubCategory(category.id, subCategory));
                deleteSubButton.setAttribute("aria-label", `${subCategory} alt kategorisini sil`);
                row.append(label, deleteSubButton);
                subCategoryList.append(row);
            });

            const addSubButton = createButton("Alt kategori ekle", "addSubCategory", () => addSubCategory(category.id));
            card.append(header, subCategoryList, addSubButton);
            elements.categoryList.append(card);
        });
    }

    function addCategory() {
        const name = window.prompt("Yeni ana kategori adı:");
        if (name === null) return;

        const cleanName = name.trim();
        if (!cleanName) {
            toast("Uyarı", "Kategori adı boş olamaz.", "error");
            return;
        }

        const id = slugify(cleanName);
        if (state.categories.some((category) => category.id === id)) {
            toast("Uyarı", "Bu kategori zaten mevcut.", "error");
            return;
        }

        state.categories.push({ id, name: cleanName, subCategories: [] });
        renderCategories();
        populateCategoryOptions(id);
        toast("Hazır", "Kategori eklendi. Kalıcı hale getirmek için kaydedin.", "success");
    }

    function addSubCategoryFromToolbar() {
        if (!state.categories.length) {
            toast("Uyarı", "Önce bir ana kategori oluşturun.", "error");
            return;
        }

        const choices = state.categories.map((category) => `${category.id} (${category.name})`).join("\n");
        const selection = window.prompt(`Alt kategori eklenecek ana kategorinin kodunu girin:\n${choices}`, state.categories[0].id);
        if (selection === null) return;

        const selectedCategory = selection.trim();
        const category = state.categories.find((item) => (
            item.id === selectedCategory || item.name.toLocaleLowerCase("tr-TR") === selectedCategory.toLocaleLowerCase("tr-TR")
        ));

        if (!category) {
            toast("Uyarı", "Geçerli bir ana kategori seçin.", "error");
            return;
        }

        addSubCategory(category.id);
    }

    function addSubCategory(categoryId) {
        const category = state.categories.find((item) => item.id === categoryId);
        if (!category) return;

        const name = window.prompt(`${category.name} için yeni alt kategori adı:`);
        if (name === null) return;

        const cleanName = name.trim();
        if (!cleanName) {
            toast("Uyarı", "Alt kategori adı boş olamaz.", "error");
            return;
        }

        const id = slugify(cleanName);
        if (category.subCategories.includes(id)) {
            toast("Uyarı", "Bu alt kategori zaten mevcut.", "error");
            return;
        }

        category.subCategories.push(id);
        renderCategories();
        populateCategoryOptions(categoryId, id);
        toast("Hazır", "Alt kategori eklendi. Kalıcı hale getirmek için kaydedin.", "success");
    }

    async function deleteCategory(categoryId) {
        const category = state.categories.find((item) => item.id === categoryId);
        if (!category) return;

        const productCount = state.products.filter((product) => product.anaKategori === categoryId).length;
        if (productCount) {
            toast("Uyarı", `Bu kategoride ${productCount} ürün var. Önce ürünleri başka kategoriye taşıyın.`, "error");
            return;
        }

        if (!window.confirm(`“${category.name}” kategorisini silmek istediğinize emin misiniz?`)) return;

        state.categories = state.categories.filter((item) => item.id !== categoryId);
        renderCategories();
        populateCategoryOptions();
        toast("Hazır", "Kategori silindi. Kalıcı hale getirmek için kaydedin.", "success");
    }

    async function deleteSubCategory(categoryId, subCategory) {
        const category = state.categories.find((item) => item.id === categoryId);
        if (!category) return;

        const productCount = state.products.filter((product) => (
            product.anaKategori === categoryId && product.altKategori === subCategory
        )).length;
        if (productCount) {
            toast("Uyarı", `Bu alt kategoride ${productCount} ürün var. Önce ürünleri taşıyın.`, "error");
            return;
        }

        if (!window.confirm(`“${subCategory}” alt kategorisini silmek istediğinize emin misiniz?`)) return;

        category.subCategories = category.subCategories.filter((item) => item !== subCategory);
        renderCategories();
        populateCategoryOptions(categoryId);
        toast("Hazır", "Alt kategori silindi. Kalıcı hale getirmek için kaydedin.", "success");
    }

    function generateCategoriesFromProducts() {
        if (!state.products.length) {
            toast("Uyarı", "Kategori oluşturmak için önce ürün yüklenmelidir.", "error");
            return;
        }

        if (!window.confirm("Ürünlerdeki kategori bilgilerine göre kategori listesi güncellensin mi?")) return;

        const existing = new Map(state.categories.map((category) => [category.id, category.name]));
        const grouped = new Map();

        state.products.forEach((product) => {
            const categoryId = String(product.anaKategori || "").trim();
            const subCategory = String(product.altKategori || "").trim();
            if (!categoryId) return;

            if (!grouped.has(categoryId)) grouped.set(categoryId, new Set());
            if (subCategory) grouped.get(categoryId).add(subCategory);
        });

        state.categories = [...grouped.entries()].map(([id, subCategories]) => ({
            id,
            name: existing.get(id) || prettifySlug(id),
            subCategories: [...subCategories].sort(localeCompare)
        }));

        renderCategories();
        populateCategoryOptions();
        toast("Hazır", "Kategoriler ürün verilerine göre güncellendi. Kaydetmeyi unutmayın.", "success");
    }

    async function saveCategories() {
        const originalLabel = elements.saveCategoriesButton.textContent;

        try {
            setButtonBusy(elements.saveCategoriesButton, "Kaydediliyor...");
            await apiSaveCategories(state.categories);
            toast("Başarılı", "Kategori değişiklikleri kaydedildi.", "success");
        } catch (error) {
            console.error(error);
            toast("Hata", error.message || "Kategoriler kaydedilemedi.", "error");
        } finally {
            restoreButton(elements.saveCategoriesButton, originalLabel);
        }
    }

    function openPage(index) {
        elements.pages.forEach((page, pageIndex) => {
            page?.classList.toggle("hidden", pageIndex !== index);
        });

        elements.menuItems.forEach((item, itemIndex) => {
            const active = itemIndex === index;
            item.classList.toggle("active", active);
            if (active) item.setAttribute("aria-current", "page");
            else item.removeAttribute("aria-current");
        });

        elements.productEditor?.classList.toggle("hidden", index !== 0);
    }

    function showLoading() {
        if (!elements.productList) return;
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        const loading = document.createElement("div");
        loading.className = "loading";
        const spinner = document.createElement("div");
        spinner.className = "spinner";
        spinner.setAttribute("aria-label", "Yükleniyor");
        spinner.setAttribute("role", "status");
        loading.append(spinner);
        cell.append(loading);
        row.append(cell);
        elements.productList.replaceChildren(row);
    }

    function toast(title, message, type = "success") {
        document.querySelector(".toast")?.remove();

        const notification = document.createElement("div");
        notification.className = `toast ${type}`;
        notification.setAttribute("role", type === "error" ? "alert" : "status");
        const heading = document.createElement("h4");
        heading.textContent = title;
        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        notification.append(heading, paragraph);
        document.body.append(notification);
        window.setTimeout(() => notification.remove(), 3500);
    }

    function createButton(text, className, handler) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = text;
        button.addEventListener("click", handler);
        return button;
    }

    function createOption(value, text) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        return option;
    }

    function categoryName(categoryId) {
        return state.categories.find((category) => category.id === categoryId)?.name || prettifySlug(categoryId);
    }

    function imageUrl(fileName) {
        const cleanName = String(fileName || "").replace(/^images\//, "");
        return cleanName ? `../assets/images/products/${cleanName}` : DEFAULT_IMAGE;
    }

    function commaSeparatedValues(value) {
        return String(value || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function uniqueStrings(values) {
        return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))].sort(localeCompare);
    }

    function normaliseSearch(value) {
        return String(value).toLocaleLowerCase("tr-TR").trim();
    }

    function prettifySlug(value) {
        return String(value || "")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("tr-TR"));
    }

    function slugify(value) {
        return String(value)
            .toLocaleLowerCase("tr-TR")
            .replace(/ı/g, "i")
            .replace(/ş/g, "s")
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function formatPrice(value) {
        return new Intl.NumberFormat("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(value) || 0);
    }

    function createId() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function localeCompare(first, second) {
        return first.localeCompare(second, "tr-TR");
    }

    function setButtonBusy(button, label) {
        if (!button) return;
        button.disabled = true;
        button.textContent = label;
    }

    function restoreButton(button, label) {
        if (!button) return;
        button.disabled = false;
        button.textContent = label;
    }
})();
