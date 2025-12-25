
import { buildApp01 } from './app01.js';
import { buildApp02 } from './app02.js';
import { buildApp03 } from './app03.js';

export let activePage = localStorage.getItem('activePage') ? parseInt(localStorage.getItem('activePage')) : 0;
export const $ = selector => document.querySelector(selector);
export const $all = selector => Array.from(document.querySelectorAll(selector));
export const fmtCurrency = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR",maximumFractionDigits: 2 });
export const fmtDecimal = (digits = 2) => new Intl.NumberFormat("nl-BE", { style: "decimal", maximumFractionDigits: digits });
export const fmtDate = d => new Date(d).toLocaleDateString("nl-BE");
//export const fmtPercent = new Intl.NumberFormat("nl-BE", { style: "percent", maximumFractionDigits: 4 });

export const  el = (tag, options = {}, children = []) => {
    const element = document.createElement(tag);

    Object.entries(options).forEach(([key, value]) => {
        if (key === "class") element.className = value;
        else if (key === "id") element.id = value;
        else if (key === "text") element.textContent = value;
        else if (key === "html") element.innerHTML = value;
        else element.setAttribute(key, value);
    });

    children.forEach(child => element.appendChild(child));
    return element;
};
export const showApp = (index) => {
    for (let i = 1; i <= 4; i++) {
        if (i !== index) {
            $(`#app0${i}`).style.display = "none";
        } else {
            $(`#app0${i}`).style.display = "block";
            $(`#app0${i}`).classList.add("wrapper");
        }   
    }
};


export function createHeader(tekst) {
    //const tekst = $('#topHeader').querySelector('.active').textContent;
    //console.log(tekst);
    return el("header", { class: "no-print" }, [
        el("h1", { text: tekst })
    ]);
}


function makeTopHeader() {
    const header = $('#topHeader');
    const tabArray = ['LENING CALCULATOR 1', 'LENING CALCULATOR 2', 'AFLOSSINGSTABEL'];
    header.setAttribute('role', 'tablist');
    tabArray.forEach((tab, i) => {
        const hyperlink = document.createElement('a');
        hyperlink.href = '#';
        hyperlink.textContent = tab;
        hyperlink.setAttribute('role', 'tab');
        hyperlink.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        if(i === activePage) hyperlink.classList.add('active');
        hyperlink.addEventListener('click', () => {
            if (hyperlink.classList.contains("active")) return;
            const activeLink = header.querySelector('.active');
            /*if (activeLink.textContent === tabArray[0] && $('#startDatum').value === '') {
                alert('Gelieve eerst een startdatum in te vullen in aflossingstabel sectie.');
                return;
            }*/
            activeLink.classList.remove("active");
            activeLink.setAttribute('aria-selected', 'false');
            hyperlink.classList.add("active");
            hyperlink.setAttribute('aria-selected', 'true');
            activePage = i;
            localStorage.setItem('activePage', activePage);
            showApp(activePage + 1);
            createHeader();
        });
        header.appendChild(hyperlink);
    });
};

/*$('#menuBtn').addEventListener('click', () => {
    $('#sidebar').classList.toggle('closed');
    $('#menuBtn').classList.toggle('open');
    $('.overlay').classList.toggle('active');
});*/

// Close sidebar when clicking outside (optional)
/*document.addEventListener('click', (e) => {
    if (!$('#sidebar').contains(e.target) && !$('#menuBtn').contains(e.target)) {
        $('#sidebar').classList.add('closed');
        $('#menuBtn').classList.remove('open');
        $('.overlay').classList.remove('active');
    }
});*/

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
    makeTopHeader();
    buildApp01();
    buildApp02();
    buildApp03();
    showApp(activePage + 1);
    //renderApps();
});

