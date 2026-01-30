import { getStoryById, getStoryBySlug } from "./StoryService.js";

let path = document.getElementById("path");
const name_story = document.getElementById("name_story");
const writer_story = document.getElementById("writer_story");
const time = document.getElementById("time");
let contentStory = document.getElementById("story");

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
    
    renderStory("#story", story.story);
    writer_story.textContent = story.name_writer;
    name_story.textContent = story.name_story;
    path = renderStory("#path", " [[الصفحة الرئيسية|../index.html]] ");
}