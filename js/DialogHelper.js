document.addEventListener("DOMContentLoaded", () => {

  const dialog  = document.getElementById("dialog");
  const overlay = document.getElementById("overlay");
  const toggleBtn = document.getElementById("toggleDialog");
  const closeBtn  = document.getElementById("closeDialog");
  const resetBtn  = document.getElementById("resetSettings");

  const fontSlider = document.getElementById("fontSlider");
  const lineSlider = document.getElementById("lineSlider");
  const fontValue  = document.getElementById("fontValue");
  const lineValue  = document.getElementById("lineValue");

  const mainContent = document.querySelector("main");
  if (!dialog || !overlay || !toggleBtn || !mainContent) return;

  /* ================== Load Settings ================== */
  let fontSize   = parseInt(localStorage.getItem("fontSize")) || 18;
  let lineHeight = parseFloat(localStorage.getItem("lineHeight")) || 1.6;

  const applySettings = () => {
    document.documentElement.style.setProperty('--main-font-size', fontSize + 'px');
    document.documentElement.style.setProperty('--main-line-height', lineHeight);

    fontSlider.value = fontSize;
    lineSlider.value = lineHeight;

    fontValue.textContent = fontSize;
    lineValue.textContent = lineHeight;
  };

  applySettings();

  /* ================== Dialog Logic ================== */
  const autoBtn = document.getElementById("autoAdjust");

autoBtn.addEventListener("click", () => {

  // حجم الشاشة أو عنصر main
  const mainWidth = mainContent.offsetWidth;
  const mainHeight = mainContent.offsetHeight;

  // حساب حجم الخط الأمثل (مثال: 2.5% من عرض العنصر)
  let autoFontSize = Math.round(mainWidth * 0.025); // يمكن تعديل النسبة حسب التصميم
  autoFontSize = Math.min(Math.max(autoFontSize, 12), 60); // ضبط ضمن الحدود

  // ارتفاع السطر نسبة لحجم الخط (مثال: 1.4 إلى 1.8)
  let autoLineHeight = parseFloat((autoFontSize * 0.09 + 1).toFixed(1));
  autoLineHeight = Math.min(Math.max(autoLineHeight, 1), 4);

  // تحديث القيم
  fontSize = autoFontSize;
  lineHeight = autoLineHeight;

  document.documentElement.style.setProperty('--main-font-size', fontSize + 'px');
  document.documentElement.style.setProperty('--main-line-height', lineHeight);

  fontSlider.value = fontSize;
  lineSlider.value = lineHeight;

  fontValue.textContent = fontSize;
  lineValue.textContent = lineHeight;

  // حفظ في localStorage
  localStorage.setItem("fontSize", fontSize);
  localStorage.setItem("lineHeight", lineHeight);
});
  
  const openDialog = () => {
    dialog.classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.classList.add("dialog-open");
    history.pushState({ dialog: true }, "");
  };

  const closeDialog = () => {
    dialog.classList.add("hidden");
    overlay.classList.add("hidden");
    document.body.classList.remove("dialog-open");
  };

  toggleBtn.addEventListener("click", openDialog);
  overlay.addEventListener("click", closeDialog);
  if (closeBtn) closeBtn.addEventListener("click", closeDialog);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !dialog.classList.contains("hidden")) closeDialog();
  });

  window.addEventListener("popstate", () => {
    if (!dialog.classList.contains("hidden")) closeDialog();
  });

  /* ================== Sliders ================== */
  const updateFont = () => {
    fontSize = parseInt(fontSlider.value);
    fontValue.textContent = fontSize;
    document.documentElement.style.setProperty('--main-font-size', fontSize + 'px');
    localStorage.setItem("fontSize", fontSize);
  };

  const updateLine = () => {
    lineHeight = parseFloat(lineSlider.value);
    lineValue.textContent = lineHeight;
    document.documentElement.style.setProperty('--main-line-height', lineHeight);
    localStorage.setItem("lineHeight", lineHeight);
  };

  fontSlider.addEventListener("input", () => requestAnimationFrame(updateFont));
  lineSlider.addEventListener("input", () => requestAnimationFrame(updateLine));

  /* ================== Reset ================== */
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("fontSize");
      localStorage.removeItem("lineHeight");
      fontSize = 18;
      lineHeight = 1.6;
      applySettings();
    });
  }

});