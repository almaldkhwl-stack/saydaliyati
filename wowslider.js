
(function(window){
"use strict";
function WowSlider(root){
    this.root=root; this.slides=[].slice.call(root.querySelectorAll(".slide"));
    this.dots=[].slice.call(root.querySelectorAll(".wowslider-dots button"));
    this.index=0; this.timer=null;
    var self=this;
    root.querySelector(".ws-next").addEventListener("click",function(){self.go(self.index+1);self.start();});
    root.querySelector(".ws-prev").addEventListener("click",function(){self.go(self.index-1);self.start();});
    this.dots.forEach(function(dot,i){dot.addEventListener("click",function(){self.go(i);self.start();});});
    this.go(0); this.start();
}
WowSlider.prototype.go=function(i){
    if(!this.slides.length)return;
    this.index=(i+this.slides.length)%this.slides.length;
    this.slides.forEach(function(s){s.classList.remove("active");});
    this.dots.forEach(function(d){d.classList.remove("active");});
    this.slides[this.index].classList.add("active");
    if(this.dots[this.index])this.dots[this.index].classList.add("active");
};
WowSlider.prototype.start=function(){
    var self=this; clearInterval(this.timer);
    this.timer=setInterval(function(){self.go(self.index+1);},3500);
};
window.initWowSlider=function(){
    document.querySelectorAll(".wowslider").forEach(function(el){new WowSlider(el);});
};
})(window);
