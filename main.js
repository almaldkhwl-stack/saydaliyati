
(function () {
"use strict";

function notify(type, message) {
    if (window.toastr) {
        toastr.options = {closeButton:true,progressBar:true,positionClass:"toast-top-right",timeOut:3000};
        if(type==="success") toastr.success(message);
        else if(type==="warning") toastr.warning(message);
        else if(type==="error") toastr.error(message);
        else toastr.info(message);
    } else { alert(message); }
}

function openModal(id) {
    var el=document.getElementById(id);
    if(!el) return;
    if(window.bootstrap && bootstrap.Modal) bootstrap.Modal.getOrCreateInstance(el).show();
}

function closeModal(id) {
    var el=document.getElementById(id);
    if(!el) return;
    if(window.bootstrap && bootstrap.Modal) {
        var m=bootstrap.Modal.getInstance(el);
        if(m) m.hide();
    }
}

document.addEventListener("DOMContentLoaded", function () {

    if (window.initWowSlider) window.initWowSlider();

    // البحث عن دواء
    var searchButton=document.getElementById("searchMedicineBtn");
    var searchInput=document.getElementById("medicineSearch");
    var searchMessage=document.getElementById("searchMessage");
    var cards=document.querySelectorAll(".medicine-card");
    var showAllButton=document.getElementById("showAllMedicines");

    if(searchButton){
        searchButton.addEventListener("click", function(e){
            e.preventDefault();
            var value=searchInput ? searchInput.value.trim().toLowerCase() : "";
            if(value===""){
                cards.forEach(function(card){card.style.display="";});
                if(searchMessage) searchMessage.textContent="";
                notify("info","اكتب اسم الدواء للبحث.");
                return;
            }

            var found=false;
            cards.forEach(function(card){
                var title=card.querySelector("h3");
                var name=title ? title.textContent.trim().toLowerCase() : "";
                var match=name.indexOf(value)!==-1;
                card.style.display=match ? "" : "none";
                if(match) found=true;
            });

            if(found){
                if(searchMessage) searchMessage.textContent="تم العثور على الدواء.";
                notify("success","تم العثور على الدواء.");
                var list=document.querySelector(".medicines-section");
                if(list) list.scrollIntoView({behavior:"smooth",block:"start"});
            }else{
                if(searchMessage) searchMessage.textContent="لم يتم العثور على الدواء. يمكنك إرسال استفسار عنه.";
                notify("warning","لم يتم العثور على الدواء. يمكنك إرسال استفسار عنه.");
                var section=document.getElementById("notFoundSection");
                if(section) section.scrollIntoView({behavior:"smooth",block:"center"});
                setTimeout(function(){
                    openModal("notFoundModal");
                    var req=document.getElementById("requestedMedicine");
                    if(req){req.value=searchInput.value.trim();req.focus();}
                },500);
            }
        });
    }

    // عرض جميع الأدوية
    if(showAllButton){
        showAllButton.addEventListener("click", function(e){
            e.preventDefault();
            cards.forEach(function(card){card.style.display="";});
            if(searchInput) searchInput.value="";
            if(searchMessage) searchMessage.textContent="تم عرض جميع الأدوية.";
            var list=document.querySelector(".medicines-section");
            if(list) list.scrollIntoView({behavior:"smooth",block:"start"});
            notify("success","تم عرض جميع الأدوية.");
        });
    }

    // فتح نافذة الاستفسار
    var notFoundButton=document.getElementById("notFoundButton");
    if(notFoundButton){
        notFoundButton.addEventListener("click",function(){
            setTimeout(function(){
                var req=document.getElementById("requestedMedicine");
                if(req) req.focus();
            },400);
        });
    }

    // تفاصيل الدواء
    document.querySelectorAll(".details-btn").forEach(function(button){
        button.addEventListener("click",function(){
            var n=document.getElementById("modalMedicineName");
            var d=document.getElementById("modalMedicineDescription");
            var p=document.getElementById("modalMedicinePrice");
            if(n) n.textContent=button.getAttribute("data-medicine")||"";
            if(d) d.textContent=button.getAttribute("data-description")||"";
            if(p) p.textContent=button.getAttribute("data-price")||"";
        });
    });

    // إرسال الاستفسار باستخدام jQuery Ajax
    var sendButton=document.getElementById("sendMedicineRequest");
    if(sendButton){
        sendButton.addEventListener("click",function(e){
            e.preventDefault();
            var medicineInput=document.getElementById("requestedMedicine");
            var phoneInput=document.getElementById("customerPhone");
            var medicine=medicineInput ? medicineInput.value.trim() : "";
            var phone=phoneInput ? phoneInput.value.trim() : "";

            if(medicine===""){notify("warning","يرجى كتابة اسم الدواء."); if(medicineInput) medicineInput.focus(); return;}
            if(phone===""){notify("warning","يرجى كتابة رقم الهاتف."); if(phoneInput) phoneInput.focus(); return;}
            if(!/^[0-9+\-\s]{7,20}$/.test(phone)){notify("warning","يرجى كتابة رقم هاتف صحيح."); if(phoneInput) phoneInput.focus(); return;}

            sendButton.disabled=true;
            notify("info","جاري إرسال الاستفسار...");

            if(window.jQuery){
                $.ajax({
                    url:"https://jsonplaceholder.typicode.com/posts",
                    method:"POST",
                    data:{medicine:medicine,phone:phone},
                    timeout:10000
                }).done(function(){
                    notify("success","تم إرسال استفسارك بنجاح.");
                    if(medicineInput) medicineInput.value="";
                    if(phoneInput) phoneInput.value="";
                    setTimeout(function(){closeModal("notFoundModal");},500);
                }).fail(function(){
                    // حفظ الطلب محلياً كخطة بديلة عند انقطاع الإنترنت
                    var requests=JSON.parse(localStorage.getItem("medicineRequests")||"[]");
                    requests.push({medicine:medicine,phone:phone,date:new Date().toISOString()});
                    localStorage.setItem("medicineRequests",JSON.stringify(requests));
                    notify("success","تم حفظ الاستفسار على الجهاز. عند توفر الإنترنت يمكن إرساله.");
                    if(medicineInput) medicineInput.value="";
                    if(phoneInput) phoneInput.value="";
                    setTimeout(function(){closeModal("notFoundModal");},700);
                }).always(function(){sendButton.disabled=false;});
            }else{
                notify("error","تعذر تشغيل Ajax. تأكد من تحميل jQuery.");
                sendButton.disabled=false;
            }
        });
    }

    // Validation
    document.querySelectorAll(".needs-validation").forEach(function(form){
        form.addEventListener("submit",function(e){
            e.preventDefault();
            if(!form.checkValidity()){
                e.stopPropagation();
                form.classList.add("was-validated");
                notify("warning","يرجى التأكد من صحة البيانات.");
                return;
            }
            var pass=form.querySelector('[name="password"]');
            var confirm=form.querySelector('[name="confirm"]');
            if(pass && confirm && pass.value!==confirm.value){
                confirm.setCustomValidity("mismatch");
                form.classList.add("was-validated");
                notify("warning","كلمتا المرور غير متطابقتين.");
                return;
            }
            if(confirm) confirm.setCustomValidity("");
            form.classList.add("was-validated");
            notify("success","تم التحقق من صحة البيانات بنجاح.");
        });
    });

});
})();
