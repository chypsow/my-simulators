import { $, el, createHeader, fmtCurrency, $all, fmtDate } from './main.js';
import { parseInputs, monthlyRate, computePayment } from './app01.js';

export function buildApp02() {
    $('#app02').append(
        createHeader('LENING STATUS TUSSEN 2 DATUMS'),
        createCalculator()
    );

    //overzichtInvullen();

    /*const setDatumInput = () => {
        const input = $('.datum-status');
        const today = new Date().toISOString().split('T')[0];
        if (input.value !== today) {
            input.value = today;
            const event = new Event('change');
            input.dispatchEvent(event);
        }
    };*/
    //$('#vandaag').addEventListener('click', setDatumInput);

    const handleChangeDatum = () => {
        const gekozenDatumSpan = $all('#gekozen-datum');
        const datumInput = $('.datum-status').value;
        const gekozenDatum = new Date(datumInput);
        if (!isNaN(gekozenDatum.getTime())) {
            const formattedDate = fmtDate(gekozenDatum);
            gekozenDatumSpan.forEach(span => {
                span.textContent = formattedDate;
            });
        } else {
            gekozenDatumSpan.forEach(span => {
                span.textContent = '';
            });
        }
        $all('.uitkomst').forEach(el => el.textContent = '');
    };
    $('.datum-status').addEventListener('change', handleChangeDatum);
    $('#berekenBtn2').addEventListener('click', calculteTotals);
}

/*export function overzichtInvullen() {
    $('#bedrag').textContent = bedragElement.value ? fmtCurrency.format(bedragElement.value) : '';
    $('#pmt2').textContent = pmtElement.textContent;
    $('#rente2').textContent = renteElement.value;
    $('#interesten2').textContent = interestenElement.textContent;
    
    //const startDate = new Date(startdatumElement.value);
    if (!isNaN(startDate.getTime())) {
        $('#startDatumDisplay').textContent = fmtDate(startDate);
        const periodeMaanden = periodeElement ? parseInt(periodeElement.value) : 0;
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + periodeMaanden);
        $('#endDatumDisplay').textContent = fmtDate(endDate);
    }
    
    $('#periodeJaar2').textContent = periodeElement.value ? `${periodeElement.value} maanden` : '';
    //const startDate = new Date(startdatumElement.value);
    const today = new Date();
    const totalePeriodeMaanden = parseInt(periodeElement.value);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + totalePeriodeMaanden);
    let resterendeMaanden = 0;
    if (today < endDate) {
        resterendeMaanden = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    }   
    $('#resterendeLooptijd').textContent = resterendeMaanden ? `${resterendeMaanden} maanden` : '';
    
}*/

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) {
        alert('Ongeldige invoer. Controleer de leninggegevens.');
        return;
    }
    const { bedrag, jkp, periode, renteType: type } = inputs;

    const startDate = new Date($('#startDatum').value);
    if (isNaN(startDate.getTime())) {
        alert('Er is geen geldige startdatum voor de lening gevonden.');
        return;
    }
    const currentDate = new Date($('.datum-status').value);
    if (isNaN(currentDate.getTime())) {
        alert('Kies een datum.');
        return;
    } else if (currentDate < startDate) {
        alert('De gekozen datum ligt voor de startdatum van de lening.');
        $all('.uitkomst').forEach(el => el.textContent = '');
        return;
    }
    
    const paymentDate = new Date(startDate);
    const maandRentePercentage = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, maandRentePercentage, periode);
    let totaalKapitaal = 0;
    let totaalRente = 0;
    const totalInterestAll = betaling * periode - bedrag;
    let restantRente = totalInterestAll;
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

    $('#totaal-kapitaal').textContent = fmtCurrency.format(totaalKapitaal);
    $('#restant-kapitaal').textContent = fmtCurrency.format(restantKapitaal);
    $('#totaal-rente').textContent = fmtCurrency.format(totaalRente);
    $('#restant-rente').textContent = fmtCurrency.format(Math.max(restantRente, 0));
}

function createCalculator() {
    const createBerekenButton = () => {
        return el('button', { id: 'berekenBtn2', class: 'bereken-btn', text: 'Bereken' });
    }
    return el('div', { class: 'calculator' }, [
        createOverzicht(),
        createSectie1(),
        createBerekenButton(),
        createSectie3()
        //createSectie4()
    ]);
}

function createOverzicht() {
    return el("div", { class: "overzicht" }, [
        el("h2", { text: "Leningsgegevens :", class: "overzicht-titel" }),
        el('div', { class: 'overzicht-inhoud' }, [
            el("div", { html: `
                <p> Lening bedrag:
                    <span id="bedrag" class="resultaat"></span>
                </p>
                <p> Maandelijkse betaling:
                    <span id="pmt2" class="resultaat"></span>
                </p>
                <p> Maandelijkse rentevoet:
                    <span id="rente2" class="resultaat"></span>
                </p>
                <p> Totaal te betalen interesten:
                    <span id="interesten2" class="resultaat"></span>
                </p>
            `}),
            el("div", { html: `
                <p> Startdatum lening:
                    <span id="startDatumDisplay" class="resultaat"></span>
                </p>
                <p> Einddatum lening:
                    <span id="endDatumDisplay" class="resultaat"></span>
                </p>
                <p> Lening periode:
                    <span id="periodeJaar2" class="resultaat"></span>
                </p>
                <p> Resterende looptijd:
                    <span id="resterendeLooptijd2" class="resultaat"></span>
                </p>
            `})
        ])
    ]);
}

function createSectie1() {
    return el('div', { class: 'top-sectie' }, [
        el('div', { class: 'datum-sectie' }, [
            el('div', { class: 'start-datum-sectie' }, [
                el('h2', { text: 'Startdatum :', class: 'kies-datum' }),
                el('input', { type: 'date', id:'startdatum-status', class: 'datum-status' })]),
            el('div', { class: 'eind-datum-sectie' }, [
                el('h2', { text: 'Einddatum :', class: 'kies-datum' }),
                el('input', { type: 'date', id:'einddatum-status', class: 'datum-status' }),
                //el('button', { id: 'vandaag', class: 'vandaag-btn', text: 'vandaag' })
            ]),
        ]),
        el('div', { class: 'uitleg-sectie' }, [
        el('p', { class: 'uitleg-tekst', text: 'Bereken de status van je lening op een bepaalde datum door een datum te kiezen bovenaan en op bereken te klikken.' }),
        el('p', { class: 'uitleg-tekst', html: `De berekening is gebaseerd op de ingevoerde leninggegevens in de <strong>Aflossingstabel</strong> sectie.` }),
        ])
    ]);
}

function createSectie3() {
    return el('div', { class: 'sectie-wrapper' }, [
        el('div', { class: 'kapitaal-groep' , html:`
            <div class="sectie-header">Kapitaal status op : <span id="gekozen-datum"></span></div>
            <p> Afbetaald kapitaal: 
                <span id="totaal-kapitaal" class="uitkomst"></span>
            </p>
            <p> Uitstaand kapitaal: 
                <span id="restant-kapitaal" class="uitkomst"></span>
            </p>
            `
        }),
        el('div', { class: 'rente-groep' , html:`
            <div class="sectie-header">Interesten status op : <span id="gekozen-datum"></span></div>
            <p> Afbetaalde interesten: 
                <span id="totaal-rente" class="uitkomst"></span>
            </p>
            <p> Restant interesten: 
                <span id="restant-rente" class="uitkomst"></span>
            </p>
            `
        }),
    ]);
}
