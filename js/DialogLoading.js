(function () {

  /* =========================
     Inject HTML + CSS
  ========================== */

  const style = document.createElement("style");
  style.innerHTML = `
    #global-loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(8px);
      z-index: 100000;

      display: flex;
      align-items: center;
      justify-content: center;

      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease;
    }

    #global-loading-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    #global-loading-dialog {
      background: rgba(15, 15, 18, 0.95);
      border-radius: 20px;
      padding: 32px 40px;
      min-width: 260px;
      text-align: center;

      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
      transform: scale(0.92);
      transition: transform 0.3s ease;
    }

    #global-loading-overlay.active #global-loading-dialog {
      transform: scale(1);
    }

    #global-lottie {
      width: 120px;
      height: 120px;
      margin: auto;
    }

    #global-loading-text {
      margin-top: 14px;
      color: #fff;
      font-weight: bold;
      font-size: 20px;
      opacity: 0.85;
      letter-spacing: 0.3px;
      text-shadow: 0px 0px 6px white;
    }

    body.loading-lock {
      overflow: hidden;
      touch-action: none;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "global-loading-overlay";
  overlay.innerHTML = `
    <div id="global-loading-dialog">
      <div id="global-lottie"></div>
      <div id="global-loading-text">جاري التحميل...</div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* =========================
     Lottie Init
  ========================== */

  let lottieAnim = null;

  function initLottie() {
    if (lottieAnim) return;

    lottieAnim = lottie.loadAnimation({
      container: document.getElementById("global-lottie"),
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: "../img/Loading.json" // ← ضع ملف Lottie هنا
    });
  }

  /* =========================
     Public API
  ========================== */

  window.showLoading = function (text = "جاري التحميل...") {
    document.body.classList.add("loading-lock");
    overlay.classList.add("active");

    document.getElementById("global-loading-text").innerText = text;

    initLottie();
    lottieAnim.play();
  };

  window.hideLoading = function () {
    overlay.classList.remove("active");
    document.body.classList.remove("loading-lock");

    if (lottieAnim) lottieAnim.stop();
  };

})();