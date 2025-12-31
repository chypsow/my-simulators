
import { createTab01 } from './tab01.js';
import { createTab02 } from './tab02.js';
import { createTab03 } from './tab03.js';
import { translations } from './i18n.js';

// Current language
let currentLang = localStorage.getItem('lang') || 'en';
export let activePage = localStorage.getItem('activePage') ? parseInt(localStorage.getItem('activePage')) : 0;
export const $ = selector => document.querySelector(selector);
export const $all = selector => Array.from(document.querySelectorAll(selector));
export const fmtCurrency = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR",maximumFractionDigits: 2 });
export const fmtDecimal = (digits = 2) => new Intl.NumberFormat("nl-BE", { style: "decimal", maximumFractionDigits: digits });
export const fmtDate = d => new Date(d).toLocaleDateString("nl-BE");

// Format date to local ISO string (YYYY-MM-DD) instead of UTC
export function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
//export const fmtPercent = new Intl.NumberFormat("nl-BE", { style: "percent", maximumFractionDigits: 4 });

export const  el = (tag, options = {}, children = []) => {
    const element = document.createElement(tag);

    Object.entries(options).forEach(([key, value]) => {
        if (key === "class") element.className = value;
        else if (key === "id") element.id = value;
        else if (key === "text") element.textContent = value;
        else if (key === "html") element.innerHTML = value;
        else if (typeof value === 'boolean') element[key] = value;
        else element.setAttribute(key, value);
    });

    children.forEach(child => element.appendChild(child));
    return element;
}

// Translation function
export function t(key) {
  if (!translations[currentLang] || !translations[currentLang][key]) {
    // Fallback to NL or key itself
    return translations['en']?.[key] || key;
  }
  return translations[currentLang][key];
}

function applyLang(lang) {
  if (!translations[lang]) {
    console.warn(`Language ${lang} not supported`);
    return;
  }

  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });

  // Update all elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
}

// Create Elements
export function createHeader(keyOrText) {
    // If it starts with "header.", it's a i18n key, otherwise it's direct text
    const isI18nKey = keyOrText && keyOrText.startsWith('header.');
    if (isI18nKey) {
        return el("header", { class: "no-print" }, [
            el("h1", { "data-i18n": keyOrText , text: t(keyOrText) })
        ]);
    } else {
        return el("header", { class: "no-print" }, [
            el("h1", { text: keyOrText })
        ]);
    }
}

function createCircles() {
    const container = $(".circles-wrapper");
    for (let i = 0; i < 7; i++) {
        container.appendChild(el('div', { class: 'circle' }));
    }
    return container;
}

function createTopHeader() {
    const header = $('#topHeader');
    const tabLabels = {'tab.simulator': t('tab.simulator'), 'tab.calculator': t('tab.calculator'), 'tab.reports': t('tab.reports')};
    header.setAttribute('role', 'tablist');
    Object.entries(tabLabels).forEach(([key, label], index) => {
        const tab = el('a', { href: '#', 'data-i18n': key, text: label, role: 'tab', 'aria-selected': index === activePage ? 'true' : 'false' });
        if (index === activePage) {
            tab.classList.add('active');
        }
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            if (tab.classList.contains("active")) return;
            const activeTab = header.querySelector('.active');
            if (activeTab) {
                activeTab.classList.remove('active');
                activeTab.setAttribute('aria-selected', 'false');
            }
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            activePage = index;
            localStorage.setItem('activePage', activePage);
            renderTab(activePage + 1);
        });
        header.appendChild(tab);
    });
}

function createLangSwitcher () {
    const container = $('#lang-switch');
    const languages = [{ code: 'en', label: 'EN' }, { code: 'fr', label: 'FR' }, { code: 'nl', label: 'NL' }];
    languages.forEach(lang => {
        const button = el('button', { class: 'lang-btn', 'data-lang': lang.code, text: lang.label });
        button.addEventListener('click', () => {
            if (currentLang === lang.code) return;
            currentLang = lang.code;
            localStorage.setItem('lang', lang.code);
            applyLang(lang.code);
            // Update active button highlight
            container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
        container.appendChild(button);
    });
    // Highlight active language button
    const activeButton = container.querySelector(`button[data-lang="${currentLang}"]`);
    if (activeButton) activeButton.classList.add('active');
}

export function renderTab(tabNumber) {
    const tabs = [$('div#tab01'), $('div#tab02'), $('div#tab03')];
    tabs.forEach((tab, index) => {
        if (index === tabNumber - 1) {
            tab.style.display = 'block';
            //if(tabNumber === 4) preparePrintOverview();
        } else {
            tab.style.display = 'none';
        }
    });
}

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
    createCircles();
    createTopHeader();
    createLangSwitcher();
    createTab01();
    createTab02();
    createTab03();
    renderTab(activePage + 1);
});
