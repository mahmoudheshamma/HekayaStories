import { getStoryById, getStoryBySlug } from "./StoryService.js";
import { initStoryViews, onStoryViewsUpdate, getStoryViews } from './ViewsManager.js';

let path = document.getElementById("path");
const name_story = document.getElementById("name_story");
const writer_story = document.getElementById("writer_story");
const time = document.getElementById("time");
let contentStory = document.getElementById("story");

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

/* ========= Helpers ========= */

function getCategoryString(story) {
    let list = [];
    for (let key in categoriesArabic) {
        if (story[key] === "on") {
            list.push(categoriesArabic[key]);
        }
    }
    return list.join("، ");
}

showLoading();

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const id = params.get("id");

let story = null;

if (slug) {
    story = await getStoryBySlug(slug);
} else if (id) {
    story = await getStoryById(id);
}

if (story) {
    render(story);
} else {
    contentStory.textContent = "القصة غير موجودة.";
}

function render(story) {

// SEO

    document.title = story.name_story;
let metaDescription = document.querySelector('meta[name="description"]');
if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = "description";
    document.head.appendChild(metaDescription);
}
metaDescription.content = /* story.description || */ story.story.slice(0, 150);

//

    let strClass = getCategoryString(story);
    
    renderStory("#story", story.story);
    writer_story.textContent = story.name_writer;
    name_story.textContent = story.name_story;
    path = renderStory("#path", " [[الصفحة الرئيسية|../index.html]] > strClass ");
    
    // StoryShow.js
initStoryViews(story.id_story);

onStoryViewsUpdate(views => {
  
  const viewsElement = document.getElementById("views");
  if (viewsElement) {
    viewsElement.textContent = views;
  }
  
});

    hideLoading();
}