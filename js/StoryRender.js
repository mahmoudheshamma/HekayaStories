function detectRTL(text){
    if(!text) return false;

    const arabicChars = text.match(/[\u0600-\u06FF]/g) || [];
    const totalChars  = text.replace(/\s/g,"").length;

    return totalChars > 0 && (arabicChars.length / totalChars) > 0.3;
}

function normalizeText(text){
    if(!text) return "";

    return text
        .toString()
        .toLowerCase()

        // توحيد الحروف العربية
        .replace(/[إأآٱ]/g,"ا")
        .replace(/[ى]/g,"ي")
        .replace(/[ؤ]/g,"و")
        .replace(/[ئ]/g,"ي")
        .replace(/[ة]/g,"ه")

        // إزالة التشكيل
        .replace(/[\u064B-\u065F]/g,"")

        // إزالة الرموز مع دعم جميع اللغات
        .replace(/[^\p{L}\p{N}\s]/gu,"")

        // توحيد المسافات
        .replace(/\s+/g," ")
        .trim();
}

function similarityScore(a,b){
    a = normalizeText(a);
    b = normalizeText(b);

    if(!a || !b) return 0;
    if(a === b) return 1;

    const maxLen = Math.max(a.length, b.length);
    let diff = Math.abs(a.length - b.length);

    for(let i = 0; i < Math.min(a.length, b.length); i++){
        if(a[i] !== b[i]) diff++;
    }

    return 1 - (diff / maxLen);
}

function isSimilar(a,b,threshold=0.8){
    return similarityScore(a,b) >= threshold;
}

function checkAnswer(input){
    const ok = isSimilar(input.value, input.dataset.answer);

    input.classList.toggle("correct", ok);
    input.classList.toggle("wrong", !ok);

    input.dataset.correct = ok ? "1" : "0";
}

function checkAllAnswers(){
    const inputs = document.querySelectorAll(".story-answer input");
    let correct = 0;

    inputs.forEach(i=>{
        checkAnswer(i);
        if(i.dataset.correct === "1") correct++;
    });

    const box = document.getElementById("resultBox");
    if(box){
        box.innerHTML = `
            ✅ صحيحة: ${correct}<br>
            ❌ خطأ: ${inputs.length-correct}<br>
            📊 النسبة: ${inputs.length ? Math.round(correct/inputs.length*100) : 0}%
        `;
    }
}

const StoryPlugins = [];

function addPlugin({name, regex, render, priority=10}){
    StoryPlugins.push({name, regex, render, priority});
    StoryPlugins.sort((a,b)=>a.priority-b.priority);
}

// Headers [###,##,#]
addPlugin({
    name: "headers",
    regex: /^### (.*)$/gm,
    render: m=> `<h3>${m[1]}</h3>`
});

addPlugin({
    name: "headers",
    regex: /^## (.*)$/gm,
    render: m=> `<h2>${m[1]}</h2>`
});

addPlugin({
    name: "headers",
    regex: /^# (.*)$/gm,
    render: m=> `<h1>${m[1]}</h1>`
});

// **BOLD** __ITALIC__
addPlugin({
    name: "bold",
    regex: /\*\*(.*?)\*\*/g,
    render: m=> `<strong>${m[1]}</strong>`
});

addPlugin({
    name: "italic",
    regex: /__(.*?)__/g,
    render: m=> `<em>${m[1]}</em>`
});

// ~~UnderLine~~ %%Strike%% ==highlight==
addPlugin({
    name: "underline",
    regex: /~~(.*?)~~/g,
    render: m=> `<u>${m[1]}</u>`
});

addPlugin({
    name: "strike",
    regex: /%%(.*?)%%/g,
    render: m=> `<del>${m[1]}</del>`
});

addPlugin({
    name: "highlight",
    regex: /==(.*?)==/g,
    render: m => `<mark>${m[1]}</mark>`
});

// Color: {color:red}text{/color}
addPlugin({
    name: "color",
    regex: /\{color:(.*?)\}(.*?)\{\/color\}/g,
    render: m => `<span style="color:${m[1]}">${m[2]}</span>`
});

// [[String | Link]]
addPlugin({
    name: "link",
    regex: /\[\[(.*?)\s*\|\s*(.*?)\]\]/g,
    render: m=> `<a href="${m[2]}" target="_blank">${m[1]}</a>`
});

// Info Box: [info]content[/info]
addPlugin({
    name: "box-info",
    regex: /\[info\]([\s\S]*?)\[\/info\]/g,
    render: m => `<div class="box info">${m[1]}</div>`
});

// Warning Box: [warn]content[/warn]
addPlugin({
    name: "box-warn",
    regex: /\[warn\]([\s\S]*?)\[\/warn\]/g,
    render: m => `<div class="box warn">⚠️ ${m[1]}</div>`
});

// Step Box: [step:title]content[/step]
addPlugin({
    name: "box-step",
    regex: /\[step:(.*?)\]([\s\S]*?)\[\/step\]/g,
    render: m => `
        <div class="step">
            <span class="step-title">${m[1]}</span>
            <div class="step-content">${m[2]}</div>
        </div>`
});

// >>> string
addPlugin({
    name: "quote",
    regex: />>>\s*\n([\s\S]*?)\n\]/g,
    render: m => `<blockquote>${m[1]}</blockquote>`
});

/*. LIST
- عنصر
∆ عنصر
1. عنصر
*/
addPlugin({
    name:"list",
    regex:/^([\-∆»]|\d+\.)\s+(.*)$/gm,
    priority:2,
    render:m=>`<li>${m[2]}</li>`
});

// new line :;:
addPlugin({
    name: "space_Withoutline",
    regex: /^:;:+$/gm,
    render: () => `<br>`
});

// ;;; space_withoutLine
addPlugin({
    name: "space",
    regex: /^;;;+$/gm,
    render: () => `<div class="space">`
});

// ::: space_line
addPlugin({
    name: "divider",
    regex: /^:::+$/gm,
    render: () => `<hr class="big">`
});

//^^string^^
addPlugin({
    name: "tip",
    regex: /\^\^(.*?)\^\^/g,
    render:m=>`<div class="tip">💡 ${m[1]}</div>`
});

//::icon[url|msg])
addPlugin({
    name: "icon",
    regex:/::icon\[(.*?)\|(.*?)\]/g,
    render:m=>`
        <span class="icon">
            <img src="${m[1]}" alt="${m[2]}">
            <small>${m[2]}</small>
        </span>`
});

//{{answer}}
addPlugin({
    name: "answer",
    regex:/\{\{(.*?)\}\}/g,
    render:m=>`
        <span class="story-answer">
            <input type="text" data-answer="${m[1]}"
                   onblur="checkAnswer(this)">
        </span>`
});

/* Table
   ||table||
   || a | b ||
   ||end||
*/

addPlugin({
    name: "table",
    regex:/\|\|table\|\|([\s\S]*?)\|\|end\|\|/g,
    render:m=>{
        const rows = m[1].trim().split("\n");
        let html = `<table class="story-table"><tbody>`;
        rows.forEach((r,i)=>{
            const cols = r.replace(/\|\|/g,"").split("|").filter(Boolean);
            html += "<tr>";
            cols.forEach(c=>{
                html += i===0 ? `<th>${c.trim()}</th>` : `<td>${c.trim()}</td>`;
            });
            html += "</tr>";
        });
        return html + "</tbody></table>";
    }
});


/*====≠========*/

function parseStory(text){
    let output = text || "";

    StoryPlugins.forEach(p=>{
        output = output.replace(p.regex,(...m)=>p.render(m));
    });

    return `
    <div class="story-root" dir="${detectRTL(text)?"rtl":"ltr"}">
        ${output}
    </div>`;
}

function renderStory(target,text){
    const el = document.querySelector(target);
    if(el) el.innerHTML = parseStory(text);
}