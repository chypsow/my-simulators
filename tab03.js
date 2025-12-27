import { $, el, createHeader, fmtCurrency, fmtDate } from './main.js';
import { parseInputs, monthlyRate, computePayment, updateSummary } from './tab01.js';

export function buildtab03() {
    $('#tab03').append(
        createHeader('LENING - AFLOSSINGSTABEL'),
        createTable()
    );
    
    $('#aflossingBtn').addEventListener('click', () => {
        if ($("#aflossingstabel").hidden) {
            generateSchedule();
        } else {
            $("#aflossingstabel").hidden = true;
            $("#afdrukken").style.visibility = "hidden";
        }
    });
    $('#afdrukken').addEventListener('click', printData);
}

function generateSchedule() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);

    $("#tableInhoud").innerHTML = "";
    $("#aflossingstabel").hidden = false;
    $("#afdrukken").style.visibility = "visible";

    let currentDate = new Date(startDate);
    let balance = bedrag;
    let cumInterest = 0;
    let cumPrincipal = 0;

    for (let n = 1; n <= periode; n++) {
        const tr = document.createElement("tr");

        // Date: increment month for each payment (payment at end of period)
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

        const interest = balance * i;
        const principal = Math.min(betaling - interest, balance); // last payment protection
        const payment = principal + interest;
        const newBalance = Math.max(balance - principal, 0);

        cumInterest += interest;
        cumPrincipal += principal;

        const cells = [
            n,
            fmtDate(currentDate),
            fmtCurrency.format(balance),
            fmtCurrency.format(payment),
            fmtCurrency.format(principal),
            fmtCurrency.format(interest),
            fmtCurrency.format(newBalance),
            fmtCurrency.format(cumInterest),
            fmtCurrency.format(cumPrincipal),
            fmtCurrency.format(payment * n)
        ];

        for (const c of cells) {
            const td = document.createElement("td");
            td.textContent = c;
            tr.appendChild(td);
        }

        $("#tableInhoud").appendChild(tr);
        balance = newBalance;
        if (balance <= 0) break;
    }
}

function createTable() {
    
    return el("div", { id: "managerTable", class: "print-container" }, [
        el("ul", {
            id: "leningOverzicht",
            class: "lening-overzicht on-print",
        }),
        el("div", { class: "button-group no-print" }, [
            el("button", {id: "aflossingBtn", class: "bereken-btn no-print", text: "Aflossingstabel"}),
            el("button", {id: "afdrukken", class: "bereken-btn no-print", text: "Afdrukken"})
        ]),
        el("table", { id: "aflossingstabel" }, [
            el("thead", { id: "tableHeader", class: "table-header", html: `
                <tr>
                    <th>No</th>
                    <th>Datum</th>
                    <th>Begin kapitaal</th>
                    <th>Aflossing totaal</th>
                    <th>Aflossing kapitaal</th>
                    <th>Aflossing rente</th>
                    <th>Uitstaand kapitaal</th>
                    <th>Cumulatieve interesten</th>
                    <th>Cumulatief afbetaald KPT</th>
                    <th>Cumulatif aflossing</th>
                </tr>
            `}),
            el("tbody", {
                id: "tableInhoud",
                class: "table-inhoud"
            })
        ])
    ]);
}
export function preparePrintOverview() {
    const inputs = parseInputs();
    if (!inputs) {
        $("#aflossingstabel").hidden = true;
        $("#afdrukken").style.visibility = "hidden";
        $("#aflossingBtn").style.visibility = "hidden";
        $("#leningOverzicht").hidden = true;
        return;
    }

    $("#leningOverzicht").innerHTML = "";
    
    updateSummary();
    const li = (text) => {
        const el = document.createElement("li");
        el.textContent = text;
        $("#leningOverzicht").appendChild(el);
    };
    li("Te lenen bedrag: " + fmtCurrency.format(inputs.bedrag));
    li("JKP: " + (inputs.jkp.toString().replace('.', ',') || "-") + " %");
    li("Maandelijkse rentevoet: " + ($("#rente-1").textContent || "-"));
    li("Maandelijkse aflossing: " + ($("#pmt-1").textContent || "-"));
    li("Totaal interesten: " + ($("#interesten-1").textContent || "-"));
    li("Periode: " + (inputs.periode || "-") + " maanden");
    li("Startdatum: " + fmtDate(inputs.startDate));
    li("Einddatum: " + ($('#endDatumDisplay').textContent || "-"));

    $("#leningOverzicht").hidden = false;
    $("#aflossingBtn").style.visibility = "visible";
}
function printData() {
    window.print();
}