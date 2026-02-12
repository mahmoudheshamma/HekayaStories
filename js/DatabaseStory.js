import { database } from "./FirebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

/* ========= Categories Arabic ========= */

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

    return list.join(" - ");
}

/* ========= Create Story Card ========= */

function createStoryCard(story) {
    const card = document.createElement("div");
    card.className = "storyCard";
    card.style.cursor = "pointer";

    card.onclick = () => {
        if (story.slug_story) {
            window.location.href = `html/StoryShow.html?slug=${story.slug_story}`;
        }
    };

    card.innerHTML = `
        <div class="CardStory">

            <div class="HeaderCard">
                <span class="storyName">
                    ${story.name_story || ""} ${story.num_story || ""}
                </span>
                <span class="storyViews">
                    👁️ ${story.seen || 0}
                </span>
            </div>

            <div class="InfoCard">
                <span class="storyType">
                    ${getCategoryString(story)}
                </span>
                <span class="storyClass">
                    ${story.type || "قصة"}
                </span>
            </div>

            <div class="FooterCard">
                <span class="storyWriter">
                    ${story.name_writer || ""}
                </span>
                <span class="storyRate">
                    ${story.rate || 0} ⭐
                </span>
            </div>

        </div>
    `;

    return card;
}

/* ========= Main Renderer ========= */

/**
 * عرض قائمة قصص حسب مفتاح وقيمة محددة مع استبعاد قصة معينة
 * @param {HTMLElement} container مكان عرض القائمة
 * @param {string} path مسار البيانات في Firebase
 * @param {string|null} key اسم الحقل داخل القصة (مثل: "type" أو "id_list")
 * @param {any|null} value القيمة المطلوبة
 * @param {string|null} excludeId معرف القصة التي لا نريد عرضها
 */
export async function renderStoriesByField(container, path, key = null, value = null, excludeId = null) {
    try {
        container.innerHTML = "جاري التحميل...";

        const snapshot = await get(ref(database, path));
        const data = snapshot.val() || {};

        let list = Object.keys(data).map(id => ({
            id,
            ...data[id]
        }));

        /* ========= الشروط الأساسية ========= */

        list = list.filter(item => {
            if (!item) return false;
            if (item.type !== "story") return false;   // مثل السكربت الأول
            if (item.status === "check") return false;
            if (excludeId && item.id === excludeId) return false;
            if (key && value) {
                // لو القيمة عبارة عن Array، نتحقق من احتواء القيمة
                if (Array.isArray(value)) {
                    if (!value.includes(item[key])) return false;
                } else {
                    if (item[key] !== value) return false;
                }
            }
            return true;
        });

        /* ========= لا توجد نتائج ========= */

        if (list.length === 0) {
            container.innerHTML = "<p>لا توجد قصص مطابقة</p>";
            return;
        }

        /* ========= الرسم ========= */

        container.innerHTML = "";

        list.forEach(story => {
            const card = createStoryCard(story);
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Render Stories Error:", err);
        container.innerHTML = "<p>حدث خطأ أثناء التحميل</p>";
    }
}