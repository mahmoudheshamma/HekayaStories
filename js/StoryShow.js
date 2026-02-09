import { getStoryById, getStoryBySlug } from "./StoryService.js";
import { initViews, onViewsUpdate, getViews } from './ViewsManager.js';
import { LoadComments } from "./CommentsSystem.js";


const pathEl = document.getElementById("path"); // DOM element للمسار
const name_story = document.getElementById("name_story");
const writer_story = document.getElementById("writer_story");
const time = document.getElementById("time");
const contentStory = document.getElementById("story");

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

const categoriesEnglish = {
    community: "community",
    children: "children",
    notreal: "notreal",
    history: "history",
    drama: "drama",
    horror: "horror",
    education: "education",
    love: "love",
    religion: "religion",
    sad: "sad",
    comedy: "comedy"
};

/* ========= Helpers ========= */
function getCategoryKey(story) {
    // ترجع أول تصنيف مفعّل فقط
    return Object.keys(categoriesEnglish).find(key => story[key] === "on") || "";
}

function getCategoryString(story) {
    const list = [];
    for (let key in categoriesArabic) {
        if (story[key] === "on") {
            list.push(categoriesArabic[key]);
        }
    }
    return list.join(" - ");
}

// دالة لإنشاء مسار تنقّل احترافي
function renderBreadcrumb(story) {
    pathEl.innerHTML = ""; // مسح القديم

    // الصفحة الرئيسية
    const home = document.createElement("a");
    home.href = "../index.html";
    home.textContent = "الصفحة الرئيسية";
    pathEl.appendChild(home);

    // فاصل
    const sep1 = document.createElement("span");
    sep1.className = "separator";
    sep1.textContent = "»";
    pathEl.appendChild(sep1);

    // القسم
    const categoryKey = getCategoryKey(story);
    const categoryText = getCategoryString(story);
    const category = document.createElement("a");
    category.href = `../?category=${categoryKey}`;
    category.textContent = categoryText;
    pathEl.appendChild(category);

    // فاصل
    const sep2 = document.createElement("span");
    sep2.className = "separator";
    sep2.textContent = "»";
    pathEl.appendChild(sep2);

    // اسم القصة
    const storyName = document.createElement("span");
    storyName.textContent = story.name_story;
    pathEl.appendChild(storyName);
}

// ======================================
showLoading();

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const id = params.get("id");

let story = null;

try {
    if (slug) story = await getStoryBySlug(slug);
    else if (id) story = await getStoryById(id);
} catch (err) {
    // error
    window.location.href = "../html/error.html";
}

if (story) {
    render(story);
} else {
    //Not Found
    window.location.href = "../html/error.html";
}

// ======================================
function render(story) {
    // SEO
    document.title = story.name_story;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
    }
    // إزالة أي HTML قبل أخذ الوصف
    const plainText = story.story.replace(/<[^>]*>/g, "");
    metaDescription.content = plainText.slice(0, 150);

    // المحتوى
    renderStory("#story", story.story);
    writer_story.textContent = story.name_writer;
    name_story.textContent = story.name_story;

    // مسار التنقل
    renderBreadcrumb(story);

    // StoryShow.js
    initViews("story" ,story.id_story);

   (async () => {
      const count = await getViews("story", story.id_story);
      document.getElementById("views").textContent = count;
    })();  
    
    LoadComments(story.id_story);

    hideLoading();
}