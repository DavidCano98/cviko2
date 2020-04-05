window.addEventListener("mousemove", function f(event) {
    document.getElementById("mouseX").innerHTML =String (event.clientX);
    document.getElementById("mouseY").innerHTML =String (event.clientY);

    let logo = document.getElementById("logo");
    logo.style.left = (event.clientX - logo.width/2)+'px';
    logo.style.top = (event.clientY - logo.width/2)+'px';
    const newDuration = String(window.innerWidth/event.clientX/4 + window.innerHeight/event.clientY/4) + 's';
    document.getElementById("duration").innerHTML = newDuration;



    logo.style.animationDuration =  newDuration;
});