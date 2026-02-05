document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    // مدة الانتظار بالثواني بين الرسائل
    const COOLDOWN_TIME = 60;
    let canSend = true;
    let countdownInterval;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!canSend) {
            formMessage.style.color = 'red';
            formMessage.innerHTML = `⚠️ يرجى الانتظار قبل إرسال رسالة جديدة.`;
            return;
        }

        formMessage.style.color = 'blue';
        formMessage.innerHTML = `📨 جاري إرسال رسالتك...`;

        emailjs.sendForm('service_dkohf1n', 'template_v1xldn5', form)
        .then(function() {
            formMessage.style.color = 'green';
            formMessage.innerHTML = `✅ تم إرسال الرسالة بنجاح!`;

            form.reset(); // تفريغ الحقول

            // تفعيل فترة الانتظار
            canSend = false;
            let countdown = COOLDOWN_TIME;

            countdownInterval = setInterval(() => {
                formMessage.style.color = 'orange';
                formMessage.innerHTML = `
                    ⏳ يمكنك إرسال رسالة جديدة بعد 
                    <span style="font-weight:bold; font-size:1.2em;">${countdown}</span> ثانية
                `;
                countdown--;

                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    canSend = true;
                    formMessage.innerHTML = ''; // إخفاء الرسالة بعد انتهاء العد
                }
            }, 1000);

        })
        .catch(function(error) {
            formMessage.style.color = 'red';
            formMessage.innerHTML = `❌ حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.`;
            console.error('EmailJS Error:', error);
        });
    });
});