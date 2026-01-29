import { getStoryById, getStoryBySlug } from "./StoryService.js";

const path = document.getElementById("path");
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
    document.title = story.name_story;
    
    renderStory("#story", story.story);
}