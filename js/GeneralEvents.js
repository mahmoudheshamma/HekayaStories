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
            text: 'شاهد هذا الموقع 👇',  
            url: window.location.href  
        }).catch(err => console.log('تم إلغاء المشاركة'));  
    } else {
        alert("المشاركة غير مدعومة على هذا المتصفح");
    }
}

// ربط الدالة مع العنصر الذي له id "shareBtn"
document.addEventListener("DOMContentLoaded", () => {
    const shareButton = document.getElementById("shareBtn");
    shareButton.addEventListener("click", shareSite);
});

function GoToHome() {
    window.location.href = "../index.html";
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