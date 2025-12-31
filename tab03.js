import { $, el, createHeader, fmtCurrency, fmtDate, t } from './main.js';
import { parseInputs, updateSummary, monthlyRate, computePayment } from './tab01.js';

export function createTab03() {
    $('#tab03').append(
        createHeader('header.loan-reports'),
        createReportContainer()
    );

    $('#executeBtn').addEventListener('click', () => {
        generateReport();
    });
}

function generateReport() {
    const inputs = parseInputs();
    if (!inputs) return;

    updateSummary();
    const reportType = document.querySelector('input[name="reportDescription"]:checked').value;
    if (reportType === 'annual-overview') {
        generateAnnualOverviewReport(inputs);
    } else if (reportType === 'detailed') {
        // Generate detailed report
        console.log('Generating Detailed Report...');
        // Add logic for generating detailed report
    }
}

function generateAnnualOverviewReport(inputs) {
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    
    // Calculate monthly interest rate and payment
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    
    // Create report container
    const reportContainer = el('div', { class: 'annual-report-container' }, [
        createAnnualReportTable(bedrag, betaling, i, periode, startDate)
    ]);
    
    // Insert report into page
    const existingReport = $('#annualReportOutput');
    if (existingReport) {
        existingReport.innerHTML = '';
        existingReport.appendChild(reportContainer);
    } else {
        // If container doesn't exist, create it
        const reportOutput = el('div', { id: 'annualReportOutput', class: 'report-output' }, [reportContainer]);
        $('#tab03').appendChild(reportOutput);
    }
}

function createAnnualReportTable(bedrag, betaling, monthlyRate, totalMonths, startDate) {
    const table = el('table', { class: 'annual-report-table' });
    
    // Create table header
    const thead = el('thead');
    const headerRow = el('tr');
    headerRow.appendChild(el('th', { text: 'Interval' }));
    headerRow.appendChild(el('th', { text: 'Afbetaald Kapitaal' }));
    headerRow.appendChild(el('th', { text: 'Afbetaalde Rente' }));
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = el('tbody');
    
    let balance = bedrag;
    let i = monthlyRate;
    
    // Determine number of year intervals
    const numYears = Math.ceil(totalMonths / 12);
    
    for (let year = 1; year <= numYears; year++) {
        let yearStartDate = new Date(startDate);
        yearStartDate = new Date(yearStartDate.getFullYear() + year - 1, yearStartDate.getMonth(), yearStartDate.getDate());
        let yearEndDate = new Date(startDate);
        yearEndDate = new Date(yearEndDate.getFullYear() + year, yearEndDate.getMonth(), yearEndDate.getDate());
        
        // Calculate cumulative principal and interest for this year
        let yearPrincipal = 0;
        let yearInterest = 0;
        let tempBalance = balance;
        
        // Calculate payments for this year interval
        const yearStartMonth = (year - 1) * 12 + 1;
        const yearEndMonth = Math.min(year * 12, totalMonths);
        
        for (let month = yearStartMonth; month <= yearEndMonth; month++) {
            const monthlyInterest = tempBalance * i;
            const monthlyPrincipal = Math.min(betaling - monthlyInterest, tempBalance);
            
            yearPrincipal += monthlyPrincipal;
            yearInterest += monthlyInterest;
            tempBalance -= monthlyPrincipal;
            
            if (tempBalance <= 0) break;
        }
        
        balance -= yearPrincipal;
        
        const row = el('tr');
        
        // Interval column
        const intervalCell = el('td', { 
            text: `${fmtDate(yearStartDate)} - ${fmtDate(yearEndDate)}`
        });
        row.appendChild(intervalCell);
        
        // Principal column
        const principalCell = el('td', { 
            text: fmtCurrency.format(yearPrincipal),
            class: 'currency-cell'
        });
        row.appendChild(principalCell);
        
        // Interest column
        const interestCell = el('td', { 
            text: fmtCurrency.format(yearInterest),
            class: 'currency-cell'
        });
        row.appendChild(interestCell);
        
        tbody.appendChild(row);
        
        if (balance <= 0) break;
    }
    
    table.appendChild(tbody);
    return table;
}


// DOM Creation Functions
function createReportContainer() {
    return el('div', { class: 'main-container' }, [
        createOverzicht(),
        createKeuzeContainer()
    ]);
}

function createOverzicht() {
    return el("div", { class: "overzicht" }, [
        el('div', { class: 'overzicht-header', html: `<h2 data-i18n="section.loan-overview">${t('section.loan-overview')}</h2><span><span data-i18n="label.today">${t('label.today')}</span> <span>${fmtDate(new Date())}</span></span>` }),
        el('div', { class: 'overzicht-inhoud' }, [
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
                <p> <span data-i18n="output.total-interest">${t('output.total-interest')}</span>
                    <span class="output-overview total-interest"></span>
                </p>
            `}),
            el("div", { html: `
                <p> <span data-i18n="label.start-date">${t('label.start-date')}</span>
                    <span  class="output-overview startDateDisplay"></span>
                </p>
                <p> <span data-i18n="label.end-date">${t('label.end-date')}</span>
                    <span class="output-overview endDateDisplay"></span>
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

function createKeuzeContainer() {
    return el('div', { class: 'keuze-container' }, [
        el('h2', { "data-i18n": "section.report-header", text: t('section.report-header') }),
        createRadioKeuze(),
        createExecuteButton()
    ]);
}

function createRadioKeuze() {
    return el('div', { class: 'radio-keuze' }, [
        el('label', { html: `<input type="radio" name="reportDescription" value="annual-overview" checked> <span data-i18n="label.annual-report">${t('label.annual-report')}</span>` }),
        el('label', { html: `<input type="radio" name="reportDescription" value="detailed"> <span data-i18n="label.detailed-report">${t('label.detailed-report')}</span>` })
    ]);
}

function createExecuteButton() {
    return el('button', { id: 'executeBtn', class: 'accented-btn', "data-i18n": "button.execute", text: t('button.execute') });
}