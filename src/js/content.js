if (document.readyState !== 'loading') {
    console.log("DOM LOADED")
    setTimeout(() => {
        var list = document.getElementsByClassName("hP");
        console.log("LIST CREATED: ", list, list.length)
        for (var i = 0; i < list.length; i++) {
            console.log("EMAIL TITLE!!!!", list[i].innerText);
        }
    }, 3000)
} else {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('document was not ready, place code here');
    });
}

Object.keys(document.body).forEach(key => {
    if (/^on/.test(key)) {
        window.addEventListener(key.slice(2), event => {
            console.log("EVENT: ",event);
        });
    }
});





// const links = document.links;
// for(var i = 0; i < links.length; i++) {
//     links[i].style.cssText += 'background-color:red;';
//     links[i].innerHTML = links[i].href
// }


// const FRESHNESS_UI = 'freshness_ui';

// // add freeshness_ui class to body
// var bodyEle = document.body;
// bodyEle.classList.add(FRESHNESS_UI);

// // toggle freshness ui class on the body element
// function toggleFreshness() {
//   var status = bodyEle.classList.toggle(FRESHNESS_UI);
//   // console.log("toggle status", status);
//   return status;
// }

// // keyboard shortcut for toggle
// function handleToggle(event) {
//   // cmd + j
//   if (event.metaKey && event.which == 74) {
//     toggleFreshness();
//     event.preventDefault();
//   }
// }
// window.addEventListener('keydown', handleToggle, false);


