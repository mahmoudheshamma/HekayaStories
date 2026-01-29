import { getStoryById, getStoryBySlug } from "./StoryService.js";

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const id = params.get("id");

let story =[];

if (slug) {
    story = await getStoryBySlug(slug);
    
    render(story);
    
} else if(id){
    story = await getStoryById(id);
    
    render(story);
}

const path = document.getElementById("path");
const name_story = document.getElementById("name_story")
const writer_story = document.getElementById("writer_story");
const time = document.getElementById("time");
const contentStory = document.getElementById("story");


function render(story) {

    document.head.textContent = story.name_story;
    
    renderStory(contentStory, story.name_story);
}