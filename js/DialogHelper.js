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

  const content = document.querySelector(".content");

  // حماية كاملة
  if (!dialog || !overlay || !toggleBtn || !content) return;

  /* ================== Load Settings ================== */
  let fontSize   = parseInt(localStorage.getItem("fontSize")) || 18;
  let lineHeight = parseFloat(localStorage.getItem("lineHeight")) || 1.6;

  const applySettings = () => {
    content.style.fontSize = fontSize + "px";
    content.style.lineHeight = lineHeight;

    fontSlider.value = fontSize;
    lineSlider.value = lineHeight;

    fontValue.textContent = fontSize;
    lineValue.textContent = lineHeight;
  };

  applySettings();

  /* ================== Dialog Logic ================== */
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

  /* ESC */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !dialog.classList.contains("hidden")) {
      closeDialog();
    }
  });

  /* Mobile Back */
  window.addEventListener("popstate", () => {
    if (!dialog.classList.contains("hidden")) {
      closeDialog();
    }
  });

  /* ================== Sliders ================== */
  fontSlider.addEventListener("input", () => {
    fontSize = parseInt(fontSlider.value);
    fontValue.textContent = fontSize;
    content.style.fontSize = fontSize + "px";
    localStorage.setItem("fontSize", fontSize);
  });

  lineSlider.addEventListener("input", () => {
    lineHeight = parseFloat(lineSlider.value);
    lineValue.textContent = lineHeight;
    content.style.lineHeight = lineHeight;
    localStorage.setItem("lineHeight", lineHeight);
  });

  /* Reset */
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("fontSize");
      localStorage.removeItem("lineHeight");
      location.reload();
    });
  }

});