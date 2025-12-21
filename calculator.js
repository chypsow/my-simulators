import { $, el, showApp, fmtCurrency } from './main.js';
import { createHeader, parseInputs, monthlyRate, computePayment } from './lening.js';

export function renderApp02() {
    showApp(2);
    const root = $('#app02');
    if (root.innerHTML.trim() !== "") {
        overzichtInvullen();
        return; // Prevent re-initialization
    }
    root.append(
        createHeader('LENING STATUS'),
        createCalculator()
    );

    overzichtInvullen();

    $('#vandaag').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        $('#input1').value = today;
    });

    $('#berekenBtn').addEventListener('click', () => {
        calculteTotals();
    });
}

function overzichtInvullen() {
    const pmtElement = $('#pmt');
    const renteElement = $('#rente');
    const periodeElement = $('#periodeJaar');
    const interestenElement = $('#interesten');
    if (pmtElement) $('#pmt2').value = $('#pmt').value;
    if (renteElement) $('#rente2').value = $('#rente').value;
    if (periodeElement) $('#periodeJaar2').value = $('#periodeJaar').value;
    if (interestenElement) $('#interesten2').value = $('#interesten').value;
}

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type } = inputs;
    const currentDate = new Date($('#input1').value);
    if (isNaN(currentDate.getTime())) return;
    const startDate = new Date($('#startDatum').value);
    if (isNaN(startDate.getTime())) return;

    const paymentDate = new Date(startDate);
    const maandRentePercentage = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, maandRentePercentage, periode);
    let totaalKapitaal = 0;
    let totaalRente = 0;
    const totalInterestAll = betaling * periode - bedrag;
    let restantRente = totalInterestAll;
    //console.log('restantRente init: ' + restantRente);
    let maandRente = 0;

    for (let i = 1; i <= periode; i++) {
        paymentDate.setMonth(paymentDate.getMonth() + 1);
        if (paymentDate > currentDate) break;
        maandRente = (bedrag - totaalKapitaal) * maandRentePercentage;
        totaalRente += maandRente;
        restantRente -= maandRente;
        totaalKapitaal += (betaling - maandRente);
    }
    
    const restantKapitaal = bedrag - totaalKapitaal;
    //const restantPeriode = periode - Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 30.44));

    $('#totaal-kapitaal').value = fmtCurrency.format(totaalKapitaal);
    $('#restant-kapitaal').value = fmtCurrency.format(restantKapitaal);
    $('#totaal-rente').value = fmtCurrency.format(totaalRente);
    $('#restant-rente').value = fmtCurrency.format(Math.max(restantRente, 0));
}

function createCalculator() {
    // Implementation for calculator 1 goes here
    return el('div', { class: 'calculator' }, [
        createOverzicht(),
        createSectie1(),
        createSectie2(),
        createSectie3()
        //createSectie4()
    ]);
}
function createOverzicht() {
    return el("div", { class: "overzicht" }, [
        el("h2", { text: "Overzicht lening :" }),
        el("div", { class: "info-box", html: `
            <label> Maandelijkse betaling:
                <input type="text" id="pmt2" disabled>
            </label>
            <label> Maandelijkse rentevoet:
                <input type="text" id="rente2" disabled>
            </label>
            <label> Lening periode:
                <input type="text" id="periodeJaar2" disabled>
            </label>
            <label> Totaal te betalen interesten:
                <input type="text" id="interesten2" disabled>
            </label>
        `})
    ]);
}
function createSectie1() {
    return el('div', { class: 'sectie1' }, [
        el('div', { class: 'top-sectie' }, [
            el('label', { text: 'Datum:', class: 'label-status', for: 'input1' }, [
                el('input', { type: 'date', id: 'input1', class: 'input-status' })
            ]),
            el('button', { id: 'vandaag', class: 'vandaag-btn', text: 'vandaag' })
            //el('button', { id: 'berekenBtn', class: 'bereken-btn', text: 'Bereken' })
        ]),
        // Add more elements as needed
    ]);
}
function createSectie2() {
    return el('div', { class: 'sectie2' }, [
        el('button', { id: 'berekenBtn', class: 'bereken-btn', text: 'Bereken' })
           
    ]);
}

function createSectie3() {
    return el('div', { class: 'sectie-wrapper' }, [
        
        el('div', { class: 'kapitaal-groep' , html:`
            <div class="sectie-header">Kapitaal</div>
            
            <label> Totaal afbetaald kapitaal:
                <input type="text" id="totaal-kapitaal" disabled>
            </label>
            <label> Totaal restant kapitaal:
                <input type="text" id="restant-kapitaal" disabled>
            </label>
            `
        }),
        el('div', { class: 'rente-groep' , html:`
            <div class="sectie-header">Rente</div>
           
            <label> Totaal afbetaalde rente:
                <input type="text" id="totaal-rente" disabled>
            </label>
            <label> Totaal restant rente:
                <input type="text" id="restant-rente" disabled>
            </label>
            `
        }),
    ]);
}
