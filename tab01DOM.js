import { el, fmtDate, t } from './main.js';

// Create Elements
export function createSimulatorDOM() {
    const container = el("div", { class: "simulator" }, [
        createMainSection(),
    ]);
    return container;
}
function createTopRow() {
    const createCurrencyInput = () => {
        const currencyOptions = ['EUR', 'USD', 'CAD', 'GBP', 'CHF', 'JPY', 'TND', 'TRY', 'EGP', 'ZAR', 'SEK', 'DKK', 'NOK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD'];
        return el("label", { class: "currency-input" }, [
            el("span", { "data-i18n": "label.currency", text: t('label.currency') }),
            el("select", { id: "currencySelect", class: "currency-select"}, currencyOptions.map(currency => el("option", { value: currency, text: currency })))
        ]);
    }
    const createImportExportButtons = () => {
        return el("div", { class: "import-export-buttons no-print" }, [
            el("button", { id: "importBtn", "data-i18n": "button.import", text: t('button.import') }),
            el("button", { id: "exportBtn", "data-i18n": "button.export", text: t('button.export') })
        ]);
    }
    return el("div", { class: "top-row" }, [
        createImportExportButtons(),
        createCurrencyInput()
    ]);
}

function createMainSection() {
    return el("section", { class: "main-section" }, [
        createTopRow(),
        el('div', { class: 'top-section' }, [
            createInputFieldset(),
            createOverviewContainer()
        ]),
        createOutputFieldset()
    ]);
}

function createInputFieldset() {
    const bedragInput = () => {
        return el("label", {
            html: `<span data-i18n="label.loan-amount">${t('label.loan-amount')}</span> <span class="currency-symbol"></span> <input type="text" id="teLenenBedrag" class="invoer">`
        });
    };
    const renteInput = () => {
        return el("div", { class: "label-select", html: `
            <label>
                <span data-i18n="label.interest-rate">${t('label.interest-rate')}</span> <input type="text" id="jkp" class="invoer">
            </label>
            <select id="renteType" class="rente-type">
                <option value="1" data-i18n="label.interest-type.effective">${t('label.interest-type.effective')}</option>
                <option value="2" data-i18n="label.interest-type.nominal">${t('label.interest-type.nominal')}</option>
            </select>
        `});
    };
    const periodeInput = () => {
        return el("div", { class: "label-select", html: `
            <label>
                <span data-i18n="label.loan-period">${t('label.loan-period')}</span> <input type="text" id="periode" class="invoer">
            </label>
            <select id="periodeEenheid" class="periode-eenheid">
                <option value="months" data-i18n="label.period-unit.months">${t('label.period-unit.months')}</option>
                <option value="years" data-i18n="label.period-unit.years">${t('label.period-unit.years')}</option>
            </select>

        `})
    };
    const datums = () => {
        return el("div", { class: "datums" }, [
            el("label", {
                html: `<span data-i18n="label.start-date">${t('label.start-date')}</span>&nbsp;<input type="date" id="startDatum" class="invoer">`
            }),
            el("p", { 
                id: "eindDatum-container", 
                html: `<span data-i18n="label.end-date">${t('label.end-date')}</span>&nbsp;&nbsp;` 
            }, [el("span", { id: "eindDatum", class: "eind-datum-hidden" })])
        ])
    };
    return el("div", { class: "input-fields card-light" }, [
        el("div", { class: "header-row-inputs", html: `<h2 data-i18n="section.input-fields">${t('section.input-fields')}</h2><span><span data-i18n="label.today">${t('label.today')}</span> <span id="todayDate">${fmtDate(new Date())}</span></span>` }),
        el("div", { class: "form-inhoud" }, [
            bedragInput(),
            renteInput(),
            periodeInput(),
            datums(),
        ])
    ]);
}

function createOverviewContainer() {
    return el("div", { class: "overzicht overzicht-simulator" }, [
        el("div", { class: 'overzicht-header' }, [
            el("h2", { "data-i18n": "section.loan-overview", text: t('section.loan-overview') }),
        ]),
        el("div", { class: "overzicht-inhoud overzicht-inhoud-simulator" }, [
            el("div", { html: `
                <p> <span data-i18n="output.loan-amount">${t('output.loan-amount')}</span>
                    <span class="output-overview loan-amount"></span>
                </p>
                <p> <span data-i18n="output.monthly-payment">${t('output.monthly-payment')}</span>
                    <span class="output-overview monthly-payment"></span>
                </p>
                <p> <span data-i18n="output.monthly-rate">${t('output.monthly-rate')}</span>
                    <span class="output-overview monthly-rate"></span>
                </p>
            `}),
            el("div", { html: `
                <p> <span data-i18n="output.total-interest">${t('output.total-interest')}</span>
                    <span class="output-overview total-interest"></span>
                </p>
                <p> <span data-i18n="output.loan-period">${t('output.loan-period')}</span>
                    <span class="output-overview loan-period"></span>
                </p>
                <p> <span data-i18n="output.remaining-duration">${t('output.remaining-duration')}</span>
                    <span class="output-overview remaining-duration"></span>
                </p>
            `})
        ])
    ]);
}

function createOutputFieldset() {
    return el("div", { class: "output-fields" }, [
        el("div", { class: "header-row-output", html: `
            <button id="berekenBtn-1" class="accented-btn" data-i18n="button.calculate-status">${t('button.calculate-status')}</button>
            <input type="date" id="currentDate" class="invoer" }>
            ` 
        }),
        el("div", { class: "info-box", html: `
            <p> <span data-i18n="output.outstanding-capital">${t('output.outstanding-capital')}</span>
                <span id="uitstaandKapitaal" class="output-tab01"></span>
            </p>
            <p> <span data-i18n="output.remaining-interest">${t('output.remaining-interest')}</span>
                <span id="resterendeInteresten" class="output-tab01"></span>
            </p>
            <br>
            <p> <span data-i18n="output.paid-capital">${t('output.paid-capital')}</span>
                <span id="afbetaaldKapitaal-1" class="output-tab01"></span>
            </p>
            <p> <span data-i18n="output.paid-interest">${t('output.paid-interest')}</span>
                <span id="afbetaaldeRente-1" class="output-tab01"></span>
            </p>
            <hr class="output-sectie-separator">
            <p> <span data-i18n="output.total-paid">${t('output.total-paid')}</span>
                <span id="totaalBetaald-1" class="output-tab01"></span>
            </p>
         `
        })
    ]);
}
