import { $, $all, formatLocalDate, createHeader, fmtCurrency, fmtDate, fmtDecimal, t, el, getCurrency, currencyState } from './main.js';
import { createSimulatorDOM, createCalculator1DOM, createCalculator2DOM, createToggleButtons } from './tab01_DOM.js';
import { setTableVisibility, createReportContainer, printData, generateTable } from './tab01_Table.js';

export function createTab01() {
    const tab01 = el('div', { id: 'tab01', class: 'tab-content' });
    tab01.append(
        createHeader('header.loan-overview'),
        createSimulatorDOM(),
        createToggleButtons(),
        createCalculator1DOM(),
        createCalculator2DOM(),
        createReportContainer()
    );
    $('main').appendChild(tab01);
    
    // Event listeners for tab01-1 and tab01-2
    function handlePeriodAndUnitChange() {
        // Update end date preview
        const startDate = $("#startDatum").valueAsDate;
        const periode = parseInt($("#periode").value || "0", 10);
        if (startDate && periode > 0) {
            
            const periodeEenheid = $("#periodeEenheid").value;
            let adjustedPeriode = periode;
            if (periodeEenheid === "years") {
                adjustedPeriode = periode * 12;
            }
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + adjustedPeriode, startDate.getDate());
            $("#eindDatum").textContent = fmtDate(endDate);
            $("#eindDatum").setAttribute("data-prev-date", fmtDate(endDate));
            $("#eindDatum").classList.remove("eind-datum-hidden");
        } else {
            $("#eindDatum").classList.add("eind-datum-hidden");
        }
    }

    $all(".invoer").forEach(inp => inp.addEventListener("input", () => {
        inp.value = inp.value.replace('.', ',');
        if (inp.id === "periode") {
            handlePeriodAndUnitChange();
        }
        // Skip resetOutputs if startDatum changed but month/year didn't
        if (inp.id === "startDatum" || inp.id === "currentDate") {
            // handle eindDatum update in separate listener
            return;
        }
        resetOutputs();
        updateSummary();
    }));

    $("#renteType").addEventListener("change", () => {
        resetOutputs();
        updateSummary();
    });

    $("#periodeEenheid").addEventListener("change", () => {
        handlePeriodAndUnitChange();
        resetOutputs();
        updateSummary();
    });

    $("#startDatum").addEventListener("change", (event) => {
        const shouldRecalculate = event.detail?.shouldRecalculate ?? true;
        const startDate = $("#startDatum").valueAsDate;
        let periode = parseInt($("#periode").value || "0", 10);
        if (startDate && periode > 0) {
            $("#eindDatum").classList.remove("eind-datum-hidden");
            const periodeEenheid = $("#periodeEenheid").value;
            if (periodeEenheid === "years") {
                periode = periode * 12;
            }
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + periode, startDate.getDate());
            const newEndDateStr = formatLocalDate(endDate);
            $("#eindDatum").textContent = fmtDate(endDate);
            if (!hasMonthYearChanged($("#eindDatum"))) {
                $("#eindDatum").setAttribute("data-prev-date", newEndDateStr);
                $all(".startDateDisplay").forEach(elm => elm.textContent = fmtDate(startDate));
                $all(".endDateDisplay").forEach(elm => elm.textContent = fmtDate(endDate));
                return;
            }
            $("#eindDatum").setAttribute("data-prev-date", newEndDateStr);
            $all(".startDateDisplay").forEach(elm => elm.textContent = fmtDate(startDate));
            $all(".endDateDisplay").forEach(elm => elm.textContent = fmtDate(endDate));
        } else {
            $("#eindDatum").classList.add("eind-datum-hidden");
           
        }
        
        resetOutputs();
        if (shouldRecalculate) {
            //console.log("startDatum changed + recalculation needed");
            updateSummary();
        }
    });

    $("#currentDate").addEventListener("change", function() {
        if (hasMonthYearChanged(this)) {
            resetOutputsTab01();
            updateSummary();
        }
    });

    // Events for buttons to toggle between calculators and table generator
    const toggleConfigs = [
        { button: '#toggleCalculator1', content: '.calculator-1' },
        { button: '#toggleCalculator2', content: '.calculator-2' },
        { button: '#toggleTableGenerator', content: '.table-generator' }
    ];

    const handleToggle = (event) => {
        const clickedButton = event.currentTarget;
        const wasActive = clickedButton.classList.contains('active');

        // First, deactivate all buttons and hide all content
        toggleConfigs.forEach(config => {
            const button = $(config.button);
            const content = $(config.content);
            if (button && content) {
                button.classList.remove('active');
                content.classList.add('hidden');
            }
        });

        // If the clicked button was not already active, activate it and show its content
        if (!wasActive) {
            const config = toggleConfigs.find(c => $(c.button) === clickedButton);
            if (config) {
                const content = $(config.content);
                if (content) {
                    clickedButton.classList.add('active');
                    content.classList.remove('hidden');
                }
            }
        }
    };
    
    toggleConfigs.forEach(config => {
        const btnElement = $(config.button);
        if (btnElement) {
            btnElement.addEventListener('click', handleToggle);
        }
    });

    $("#berekenBtn-1").addEventListener("click", calculateRemainingCapitalAndInterest);
    $('#berekenBtn-2').addEventListener('click', calculateTotals);
    $("#importBtn").addEventListener("click", importData);
    $("#exportBtn").addEventListener("click", exportData);
    $('#startdatum-status').addEventListener('change', function() {
        if (hasMonthYearChanged(this)) $all('.output-tab02').forEach(el => el.textContent = '');
    });

    $('#einddatum-status').addEventListener('change', function() {
        if (hasMonthYearChanged(this)) $all('.output-tab02').forEach(el => el.textContent = '');
    });

    // Currency select listener - update currency when changed
    $("#currencySelect").addEventListener("change", () => {
        const currency = $("#currencySelect").value;
        currencyState.setCurrency(currency);
        localStorage.setItem('currency', currency);
        $all(".currency-symbol").forEach(elm => elm.textContent = `(${currency}):`);
        resetOutputs();
        updateSummary();
    });

    // Initialize currency on page load
    const savedCurrency = getCurrency();
    currencyState.setCurrency(savedCurrency);
    $("#currencySelect").value = savedCurrency;
    $all(".currency-symbol").forEach(elm => elm.textContent = `(${savedCurrency}):`);

    // event listeners for tab01-3
    setTableVisibility(false);
    
    $('#generateBtn').addEventListener('click', () => {
        generateTable();
    });

    $('#afdrukken').addEventListener('click', printData);

    $('#selectAllBtn').addEventListener('click', () => {
        document.querySelectorAll('.column-checkbox').forEach(checkbox => checkbox.checked = true);
    });

    $('#deselectAllBtn').addEventListener('click', () => {
        document.querySelectorAll('.column-checkbox').forEach(checkbox => checkbox.checked = false);
    });
}

//make function to check if date changed month/year only
export function hasMonthYearChanged(element) {
    let currentDate;
    let prevDateStr;
    let newDateStr;

    if (element instanceof HTMLInputElement) {
        currentDate = element.valueAsDate;
        if (currentDate) {
            prevDateStr = element.getAttribute("data-prev-date");
            newDateStr = formatLocalDate(currentDate);
            element.setAttribute("data-prev-date", newDateStr);
        }
    } else if (element instanceof HTMLSpanElement) {
        const rawDateStr = element.textContent;
        const [dag, maand, jaar] = rawDateStr.split('/');
        newDateStr = `${jaar}-${maand.padStart(2,'0')}-${dag.padStart(2,'0')}`;
        prevDateStr = element.getAttribute("data-prev-date");
    }

    if (prevDateStr && newDateStr && prevDateStr.slice(0, 7) === newDateStr.slice(0, 7)) {
        return false;
    }
    return true;
}

// Lening calculator logic
function formatDuration(remainingMonths) {   
    const jaren = Math.floor(remainingMonths / 12);
    const maanden = remainingMonths % 12;
    let html = '';
    if (jaren > 0) {
        html += `${jaren}<span class="duration-label" data-i18n="label.years" >${t('label.years')}</span>`;
        if (maanden > 0) {
            html += ` ${maanden}<span class="duration-label" data-i18n="label.months">${t('label.months')}</span>`;
        }
    } else {
        html += `${maanden}<span class="duration-label" data-i18n="label.months">${t('label.months')}</span>`;
    }
    return html;
}

export function updateSummary(tab = '01') {
    const inputs = parseInputs();
    if (!inputs) {
        resetOutputs();
        if(tab !== '01') alert(t('message.invalid-input'));
        return;
    }

    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);

    // Update output fields for all overviews (tabs 1, 2 and 3)
    $all('.loan-amount').forEach(elm => elm.textContent = fmtCurrency.format(bedrag));
    $all('.monthly-payment').forEach(elm => elm.textContent = fmtCurrency.format(betaling));
    $all('.monthly-rate').forEach(elm => elm.textContent = fmtDecimal(4).format(i * 100) + " %");
    $all('.total-interest').forEach(elm => elm.textContent = fmtCurrency.format((betaling * periode - bedrag)));
    $all('.loan-period').forEach(elm => elm.innerHTML = formatDuration(periode));
    
    // Calculate remaining duration from today to end date
    const today = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + periode);
    let resterendeMaanden = 0;
    if (today < endDate) {
        resterendeMaanden = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    }
    const display = formatDuration(resterendeMaanden);
    $all('.remaining-duration').forEach(elm => elm.innerHTML = display);
    $all('.startDateDisplay').forEach(elm => elm.textContent = fmtDate(startDate));
    $all('.endDateDisplay').forEach(elm => elm.textContent = fmtDate(endDate));

    //console.log(`calculation within updateSummary called from tab${tab} complete`);
    return inputs;
}

// Calculate remaining capital and interest up to currentDate
function calculateRemainingCapitalAndInterest() {
    const inputs = parseInputs();
    if (!inputs) {
        alert(t('message.invalid-input'));
        return;
    }
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);

    const currentDateInput = $("#currentDate").value;
    const currentDate = currentDateInput ? new Date(currentDateInput) : new Date();
    if (!currentDateInput) {
        const currentDateStr = formatLocalDate(currentDate);
        $("#currentDate").value = currentDateStr;
        $("#currentDate").setAttribute("data-prev-date", currentDateStr);
    }
    const remaining = computeRemaining(bedrag, jkp, periode, type, startDate, currentDate);
    $("#uitstaandKapitaal").textContent = fmtCurrency.format(remaining.capital);
    $("#resterendeInteresten").textContent = fmtCurrency.format(remaining.interest);
    $("#afbetaaldKapitaal-1").textContent = fmtCurrency.format(bedrag - remaining.capital);
    $("#afbetaaldeRente-1").textContent = fmtCurrency.format((betaling * periode - bedrag) - remaining.interest);
    $("#totaalBetaald-1").textContent = fmtCurrency.format(betaling * (periode - remaining.period));
}
export function computeRemaining(bedrag, jkp, periode, type, startDate, currentDate = new Date()) {
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);

    
    let monthsElapsed = 0;
    if (currentDate > startDate) {
        monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
        if (monthsElapsed > periode) monthsElapsed = periode;
    }
    let balance = bedrag;
    let totalInterest = 0;
    for (let n = 1; n <= monthsElapsed; n++) {
        const interest = balance * i;
        const principal = Math.min(betaling - interest, balance);
        totalInterest += interest;
        balance = Math.max(balance - principal, 0);
        if (balance <= 0) break;
    }
    const remainingInterest = (betaling * (periode - monthsElapsed)) - balance;
    const period = periode - monthsElapsed;
    return {
        capital: balance,
        interest: Math.max(remainingInterest, 0),
        period: period
    };
}
export function parseInputs() {
    const bedrag = parseFloat($("#teLenenBedrag").value.replace(',', '.'));
    const jkp = parseFloat($("#jkp").value.replace(',', '.'));
    const renteType = $("#renteType").value;
    let periode = parseInt($("#periode").value, 10);
    const periodeEenheid = $("#periodeEenheid").value;
    if (periodeEenheid === "years") {
        periode = periode * 12;
    }
    const startdatumValue = $("#startDatum").value;
    const startDate = new Date(startdatumValue);
    
    if (!isFinite(bedrag) || !isFinite(jkp) || !isFinite(periode) || periode <= 0 || isNaN(startDate.getTime())) {
        return null;
    }
    return { bedrag, jkp, periode, renteType, startDate };
}
function resetOutputs() {
    resetOutputsOverview();
    resetOutputsTab01();
    resetOutputsTab02();
    setTableVisibility(false);
}
function resetOutputsOverview() {
    $all(".output-overview").forEach(o => o.textContent = "");
}
function resetOutputsTab01() {
    $all(".output-tab01-1").forEach(o => o.textContent = "");
}
function resetOutputsTab02() {
    $all(".output-tab01-2").forEach(o => o.textContent = "");
}
export function monthlyRate(jkp, type) {
    if (type === "1") { // effectief
        return Math.pow(1 + jkp / 100, 1 / 12) - 1;
    } else { // nominaal
        return jkp / 100 / 12;
    }
}
export function computePayment(principal, monthlyI, periods) {
    if (monthlyI <= 0) return principal / periods;
    const denom = 1 - Math.pow(1 + monthlyI, -periods);
    return principal * (monthlyI / denom);
}
function calculateTotals() {
    const inputs = updateSummary('02');
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;

    const datum1Input = $('#startdatum-status').value;
    const datum2Input = $('#einddatum-status').value;
    const datum1 = new Date(datum1Input);
    const datum2 = new Date(datum2Input);
    if (isNaN(datum1.getTime()) || isNaN(datum2.getTime())) {
        alert(t('message.valid-dates'));
        return;
    }

    // ensure datum1 en datum2 are between startDate and endDate of the loan
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + periode, startDate.getDate());
    const firstDate = datum1 < datum2 ? new Date(datum1) : new Date(datum2);
    const lastDate = datum1 < datum2 ? new Date(datum2) : new Date(datum1);
    if (firstDate < startDate) {
        firstDate.setTime(startDate.getTime());
        //adjust input field to reflect change
        $('#startdatum-status').value = formatLocalDate(firstDate);
        //attribute to avoid triggering change event
        $('#startdatum-status').setAttribute("data-prev-date", formatLocalDate(firstDate));
    }
    if (lastDate > endDate) {
        lastDate.setTime(endDate.getTime());
        //adjust input field to reflect change
        $('#einddatum-status').value = formatLocalDate(lastDate);
        //attribute to avoid triggering change event
        $('#einddatum-status').setAttribute("data-prev-date", formatLocalDate(lastDate));
    }
   
    // deduct one month from first date to include correct month in calculation
    if(firstDate.getMonth() > startDate.getMonth() || firstDate.getFullYear() > startDate.getFullYear()) {
        firstDate.setMonth(firstDate.getMonth() - 1);
    }
    const remainingAtFirstDate = computeRemaining(bedrag, jkp, periode, type, startDate, firstDate);
    const remainingAtLastDate = computeRemaining(bedrag, jkp, periode, type, startDate, lastDate);
    const capitalPaid = remainingAtFirstDate.capital - remainingAtLastDate.capital;
    const interestPaid = remainingAtFirstDate.interest - remainingAtLastDate.interest;
    $('#totaal-kapitaal').textContent = fmtCurrency.format(capitalPaid);
    $('#totaal-rente').textContent = fmtCurrency.format(interestPaid);
    $('#totaal-afbetaald').textContent = fmtCurrency.format(capitalPaid + interestPaid);
}
function importData() {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.json';
    fileInput.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = event => {
            let data = JSON.parse(event.target.result);
            // Populate fields - support both old and new naming conventions
            const importedCurrency = data["currency-code"] || "EUR";
            $("#currencySelect").value = importedCurrency;
            currencyState.setCurrency(importedCurrency);
            localStorage.setItem('currency', importedCurrency);
            $all(".currency-symbol").forEach(elm => elm.textContent = `(${importedCurrency}):`);
            $("#teLenenBedrag").value = data["loan-amount"] || "";
            $("#jkp").value = data["annual-rate"] ? fmtDecimal(4).format(data["annual-rate"]) : "";
            $("#renteType").value = data["rate-type"] || "1";
            $("#periode").value = data["period-months"] || "";
            $("#periodeEenheid").value = "months";
            $("#startDatum").value = data["start-date"] || "";
            $("#startDatum").dispatchEvent(new CustomEvent('change', { detail: { shouldRecalculate: false } }));
            
            resetOutputs();
            updateSummary();
        };
        reader.readAsText(file);
    };
    fileInput.click();
}
function exportData() {
    const inputs = parseInputs();
    if (!inputs) {
        alert(t('message.no-data-export'));
        return;
    }
    const data = {
        "currency-code": currencyState.current,
        "loan-amount": inputs.bedrag,
        "annual-rate": inputs.jkp,
        "rate-type": inputs.renteType,
        "period-months": inputs.periode,
        "start-date": formatLocalDate(inputs.startDate)
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const filename = `${currencyState.current}_${inputs.bedrag/1000}k_${inputs.periode}m_${formatLocalDate(inputs.startDate)}.txt`;
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();  
}







