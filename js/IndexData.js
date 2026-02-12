import { database, auth } from "./FirebaseConfig.js";
import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { initViews, onViewsUpdate, getViews } from './ViewsManager.js';
import { createUserInDB, getUserDataByUID, getUserProfileImage, doesUserExist } from './DatabaseUser.js';

/* ========= Variables ========= */

let storiesList = [];
let filteredList = [];
let currentPage = 1;
const itemsPerPage = 5;
let selectedCategory = "";

const storyContainer = document.getElementById("storyContainer");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const searchInput = document.getElementById("search");

/* ========= Categories ========= */

const categoriesArabic = {
    community: "تواصل اجتماعي",
    children: "أطفال",
    notreal: "خيالي",
    history: "تاريخية",
    drama: "دراما",
    horror: "رعب",
    education: "تعليمية",
    love: "رومانسية",
    religion: "دينية",
    sad: "حزين",
    comedy: "كوميديا"
};

let UID = "";

async function checkOrCreateUser() {
  const user = auth.currentUser;
  if (user) {
    UID = user.uid;

    const exists = await doesUserExist(UID);
    if (!exists) {
      await createUserInDB(user);
    }
  }
}

///////

function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || ""; // لو مش موجود => all
}

/* ========= Helpers ========= */

function getCategoryString(story) {
    let list = [];
    for (let key in categoriesArabic) {
        if (story[key] === "on") {
            list.push(categoriesArabic[key]);
        }
    }
    return list.join(" - ");
}

/* ========= Firebase ========= */

async function loadStories() {
    try {
        const snapshot = await get(ref(database, "story"));
        const data = snapshot.val() || {};

        storiesList = Object.keys(data)
        .map(id => ({
            id,
            ...data[id]
        }))
        .filter(story => {
           
                if (!story) return false;
                if (story.type !== "story") return false;
                if(story.status === "check") return false;
                
                return true;
            });

        filteredList = [...storiesList];
        hideLoading();
        
    } catch (err) {
        console.error("Firebase Error:", err);
    }
}

/* ========= Render ========= */

function renderPage() {
    storyContainer.innerHTML = "";

    if (filteredList.length === 0) {
        storyContainer.innerHTML = "<p>لا توجد قصص</p>";
        pageInfo.textContent = "Not found !";
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredList.slice(start, start + itemsPerPage);
    
    let num = 0;

    pageItems.forEach(story => {
    
    num++;
    
    const card = document.createElement("div");
    card.style.cursor = "pointer";
    card.onclick = () => {
        window.location.href = `html/StoryShow.html?slug=${story.slug_story}`;
    };
    
        card.className = "storyCard";

        card.innerHTML = `
            <div class="CardStory">
                <div class="HeaderCard">
                    <span class="storyName">${story.name_story || ""} ${story.num_story}</span>
                    <span class="storyViews">👁️ ${story.seen}</span>
                </div>

                <div class="InfoCard">
                    <span class="storyType">${getCategoryString(story)}</span>
                    <span class="storyClass">${story.type || "قصة"}</span>
                </div>

                <div class="FooterCard">
                    <span class="storyWriter">${story.name_writer || ""}</span>
                    <span class="storyRate">${story.rate || 0} ⭐</span>
                </div>
            </div>
        `;

        storyContainer.appendChild(card);
    });

    pageInfo.textContent = `${currentPage} / ${Math.ceil(filteredList.length / itemsPerPage)}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= Math.ceil(filteredList.length / itemsPerPage);
}

/* ========= Filters ========= */

function applyFilters() {
    const search = searchInput.value.toLowerCase();

    filteredList = storiesList.filter(story => {
        const title  = (story.name_story || "").toLowerCase();
        const writer = (story.name_writer || "").toLowerCase();

        const matchCategory =
    selectedCategory === "" ||
    (story[selectedCategory] && story[selectedCategory] === "on");

        const matchSearch =
            search === "" ||
            title.includes(search) ||
            writer.includes(search) ||
            getCategoryString(story).toLowerCase().includes(search);

        return matchCategory && matchSearch;
    });

    currentPage = 1;
    renderPage();
}

/* ========= Events ========= */

searchInput.addEventListener("input", applyFilters);

document.querySelectorAll("#categoryButtons button").forEach(btn => {
    btn.addEventListener("click", (e) => {

        e.stopPropagation(); // ⛔ يمنع إغلاق الـ Drawer

        document.querySelectorAll("#categoryButtons button")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        selectedCategory = btn.dataset.category || "";

        const url = new URL(window.location);
        if (selectedCategory)
            url.searchParams.set("category", selectedCategory);
        else
            url.searchParams.delete("category");

        window.history.pushState({}, "", url);

        applyFilters();
        closeDrawer();
    });
});

prevBtn.onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
};

nextBtn.onclick = () => {
    if (currentPage < Math.ceil(filteredList.length / itemsPerPage)) {
        currentPage++;
        renderPage();
    }
};

/* ========= Init ========= */

const categoryFromURL = getCategoryFromURL();

loadStories().then(() => {

    // لو التصنيف غير موجود أو غير صحيح → all
    selectedCategory =
        categoryFromURL && categoriesArabic[categoryFromURL]
            ? categoryFromURL
            : "";

    document.querySelectorAll("#categoryButtons button").forEach(btn => {
        btn.classList.toggle(
            "active",
            btn.dataset.category === selectedCategory
        );
    });

    // تحديث الرابط ليكون نظيف
    const url = new URL(window.location);
    if (selectedCategory)
        url.searchParams.set("category", selectedCategory);
    else
        url.searchParams.delete("category");

    window.history.replaceState({}, "", url);

    applyFilters();
    initViews("web" ,"heyaka_story");
    checkOrCreateUser();
});