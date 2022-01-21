
const links = document.links;
alert("hello")

window.document.body.style.backgroundColor = "#ff0";

for(var i = 0; i < links.length; i++) {
    links[i].style.cssText += 'background-color:red;';
    // links[i].innerHTML = links[i].href
}


