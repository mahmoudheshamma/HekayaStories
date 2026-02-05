const darkModeToggle = document.getElementById('darkMode');
const backToTop = document.getElementById('BackToTop');
const drawer = document.getElementById('drawer');
const DrawerOverLay = document.getElementById('DrawerOverLay');

// Drawer
function openDrawer() {
  if (!drawer || !DrawerOverLay) return;
  drawer.classList.add("active");
  DrawerOverLay.classList.add("active");
}

function closeDrawer() {
  if (!drawer || !DrawerOverLay) return;
  drawer.classList.remove("active");
  DrawerOverLay.classList.remove("active");
}

function shareSite() {  
    if (navigator.share) {  
        navigator.share({  
            title: document.title,  
            text: 'شاهد هذا القصة',  
            url: window.location.href  
        }).catch(err => console.log('تم إلغاء المشاركة'));  
    } else {
        alert("المشاركة غير مدعومة على هذا المتصفح");
    }
}

// ربط الدالة مع العنصر الذي له id "shareBtn"
document.addEventListener("DOMContentLoaded", () => {
    const shareButton = document.getElementById("shareBtn") || null;
   if (shareButton) shareButton.addEventListener("click", shareSite);
});

function GoToHome() {
    window.location.href = "../index.html";
}

function GoToTellYourStory() {
    window.location.href = "../html/StoryShow.html?slug=story-أخبرنا-قصتك";
}

function GoToChatUs(){
    window.location.href = "../html/ContactUs.html";
}
function GoToPrivacy() {
    window.location.href = "../html/StoryShow.html?slug=story-سياسة-خصوصية";
}

// Dark Mode
if (darkModeToggle) {

  darkModeToggle.addEventListener('click', () => {
  
    document.body.classList.toggle('dark-mode');
    
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark-mode') ? 'dark' : 'light'
    );
  });
}

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

// Back To Top
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// copy paste stop
document.addEventListener("contextmenu", e => e.preventDefault());

["copy", "cut", "paste"].forEach(event => {
  document.addEventListener(event, e => e.preventDefault());
});

document.addEventListener("keydown", function(e) {

  // Ctrl + C / V / X / A / S / U
  if (e.ctrlKey && ["c","v","x","a","s","u"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }

  // F12
  if (e.key === "F12") {
    e.preventDefault();
  }

  // Ctrl + Shift + I / J / C
  if (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

// 7️⃣ كشف فتح DevTools (طريقة ذكية)
setInterval(() => {
  const threshold = 160;
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    document.body.innerHTML = "<h1>🚫 المحتوى محمي</h1>";
  }
}, 500);

// 8️⃣ تعطيل السحب
document.addEventListener("dragstart", e => e.preventDefault());

// 9️⃣ تعطيل اللمس المطوّل (موبايل)
document.addEventListener("touchstart", e => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });