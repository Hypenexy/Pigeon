async function load(){

document.body.style.background = "#000";

const socket = io();

const logon = await fetch('http://app.midelightdev.localhost/logon/', {
    method: 'post',
    credentials: "include",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

const logonData = await logon.json();
if(logonData.user != false){
    socket.emit("logon", logonData.user.sessionId, (success, error) => {
        console.log(success);
        console.log(error);
    });
}
else{
    window.location.replace("../");
}

/**
 * Creates an element and appends it
 * @param {String} tag The class of the element
 * @param {Element} parent The parent to append it to
 * @returns The created element
 */
function createAppendElement(tag, parent){
    const element = document.createElement("div");
    element.classList.add(tag);
    parent.appendChild(element);
    return element;
}

const app = document.createElement("app");
document.body.appendChild(app);

const sidepanel = createAppendElement("sidepanel", app);

const profileEl = createAppendElement("profileEl", sidepanel);

var pfpURL = "https://assets.midelight.net/ui/pfp.png";
if(logonData.user.pfp){
    pfpURL = `http://i.midelightdev.localhost/?i=${logonData.user.pfp}`;
} 
profileEl.innerHTML = `<div class='status'></div><img src='${pfpURL}'><p>${logonData.user.username}</p>`;

const search = createAppendElement("search", sidepanel);
search.innerHTML = "<input placeholder='Search or start conversations'>"

const main = createAppendElement("main", app);

}
load();