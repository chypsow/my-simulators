import { $, el, formatLocalDate, createHeader, fmtCurrency, $all } from './main.js';
import { parseInputs, computeRemaining, updateSummary } from './tab01.js';

export function buildtab02() {
    $('#tab02').append(
        createHeader('LENING - STATUS TUSSEN 2 DATUMS'),
        createCalculator()
    );

    const startDateInput = $('#startdatum-status');
    startDateInput.addEventListener('change', () => {
        const currentDate = startDateInput.valueAsDate;
        if (currentDate) {
            const prevDateStr = startDateInput.getAttribute("data-prev-date");
            const newDateStr = formatLocalDate(currentDate);
            if (prevDateStr && prevDateStr.slice(0,7) === newDateStr.slice(0,7)) return;
            startDateInput.setAttribute("data-prev-date", newDateStr);
        }
        $all('.output-tab02').forEach(el => el.textContent = '');
    });

    const endDateInput = $('#einddatum-status');
    endDateInput.addEventListener('change', () => {
        const currentDate = endDateInput.valueAsDate;
        if (currentDate) {
            const prevDateStr = endDateInput.getAttribute("data-prev-date");
            const newDateStr = formatLocalDate(currentDate);
            //console.log('endDateInput change - newDateStr:', newDateStr);
            //console.log('endDateInput change - prevDateStr:', prevDateStr);
            if (prevDateStr && prevDateStr.slice(0,7) === newDateStr.slice(0,7)) return;
            endDateInput.setAttribute("data-prev-date", newDateStr);
        }
        $all('.output-tab02').forEach(el => el.textContent = '');
    });
    $('#berekenBtn2').addEventListener('click', calculteTotals);
}

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) {
        alert('Ongeldige invoer. Controleer de leninggegevens.');
        return;
    }
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const datum1Input = $('#startdatum-status').value;
    const datum2Input = $('#einddatum-status').value;
    const datum1 = new Date(datum1Input);
    const datum2 = new Date(datum2Input);
    if (isNaN(datum1.getTime()) || isNaN(datum2.getTime())) {
        alert('Gelieve geldige datums in te vullen.');
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
   
    updateSummary();
    // deduct one month from first date to include correct month in calculation
    if(firstDate > startDate) firstDate.setMonth(firstDate.getMonth() - 1);
    const remainingAtFirstDate = computeRemaining(bedrag, jkp, periode, type, startDate, firstDate);
    const remainingAtLastDate = computeRemaining(bedrag, jkp, periode, type, startDate, lastDate);
    const capitalPaid = remainingAtFirstDate.capital - remainingAtLastDate.capital;
    const interestPaid = remainingAtFirstDate.interest - remainingAtLastDate.interest;
    $('#totaal-kapitaal').textContent = fmtCurrency.format(capitalPaid);
    $('#totaal-rente').textContent = fmtCurrency.format(interestPaid);
    $('#totaal-afbetaald').textContent = fmtCurrency.format(capitalPaid + interestPaid);
}

function createCalculator() {
    const createBerekenButton = () => {
        return el('button', { id: 'berekenBtn2', class: 'bereken-btn', text: 'Bereken' });
    }
    return el('div', { class: 'calculator' }, [
        createOverzicht(),
        createInputSectie(),
        createBerekenButton(),
        createOutputSectie()
    ]);
}

function createOverzicht() {
    return el("div", { class: "overzicht" }, [
        el('div', { class: 'overzicht-header', html: `<h2>Lening Overzicht</h2><span> Vandaag: ${new Date().toLocaleDateString('nl-BE')}</span>` }),
        el('div', { class: 'overzicht-inhoud' }, [
            el("div", { html: `
                <p> Lening bedrag:
                    <span id="bedrag-2" class="output-tab01"></span>
                </p>
                <p> Maandelijkse betaling:
                    <span id="pmt-2" class="output-tab01"></span>
                </p>
                <p> Maandelijkse rentevoet:
                    <span id="rente-2" class="output-tab01"></span>
                </p>
                <p> Totaal te betalen interesten:
                    <span id="interesten-2" class="output-tab01"></span>
                </p>
            `}),
            el("div", { html: `
                <p> Startdatum lening:
                    <span id="startDatumDisplay" class="output-tab01"></span>
                </p>
                <p> Einddatum lening:
                    <span id="endDatumDisplay" class="output-tab01"></span>
                </p>
                <p> Lening periode:
                    <span id="periodeJaar-2" class="output-tab01"></span>
                </p>
                <p> Resterende looptijd:
                    <span id="resterendeLooptijd-2" class="output-tab01"></span>
                </p>
            `})
        ])
    ]);
}

function createInputSectie() {
    return el('div', { class: 'input-sectie' }, [
        el('div', { class: 'uitleg-sectie' }, [
            el('p', { class: 'uitleg-tekst', text: 'Bereken het afbetaalde kapitaal en de betaalde rente tussen twee datums op basis van de ingevoerde leninggegevens.' }),
            el('p', { class: 'uitleg-tekst', html: `De berekening is gebaseerd op de ingevoerde leninggegevens in de <strong>Lening Calculator 1</strong> sectie.` })
        ]),
        el('div', { class: 'datum-sectie' }, [
            el('div', { class: 'start-datum-sectie' }, [
                el('h2', { text: 'Datum 1 :', class: 'kies-datum' }),
                el('input', { type: 'date', id:'startdatum-status', class: 'datum-status' })]),
            el('div', { class: 'eind-datum-sectie' }, [
                el('h2', { text: 'Datum 2 :', class: 'kies-datum' }),
                el('input', { type: 'date', id:'einddatum-status', class: 'datum-status' }),
            ]),
        ]),
    ]);
}

function createOutputSectie() {
    return el('div', { class: 'output-sectie' }, [
        el('div', { class: 'kapitaal-groep' , html:`
            <div class="sectie-header">
                <p> Afbetaald kapitaal: 
                    <span id="totaal-kapitaal" class="output-tab02"></span>
                </p>
            </div>
            `
        }),
        el('div', { class: 'rente-groep' , html:`
            <div class="sectie-header">
                <p> Afbetaalde Rente: 
                    <span id="totaal-rente" class="output-tab02"></span>
                </p>
            </div>
            `
        }),
        el('hr' , { class: 'output-sectie-separator' }),
        el('div', { class: 'totaal-groep' , html:`
            <div class="sectie-header">
                <p> Totaal Afbetaald:
                    <span id="totaal-afbetaald" class="output-tab02"></span>
                </p>
            </div>
            `
        }),

    ]);
}
