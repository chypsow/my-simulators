import { $, el, fmtCurrency, fmtDate, t } from './main.js';
import { parseInputs, monthlyRate, computePayment } from './tab01.js';

export function createTable() {
    return el("div", { id: "managerTable", class: "print-container" }, [
        el("div", { class: "button-group no-print" }, [
            el("button", {id: "aflossingBtn", class: "accented-btn no-print", "data-i18n": "button.amortization-table", text: t('button.amortization-table')}),
            el("button", {id: "afdrukken", class: "accented-btn no-print", "data-i18n": "button.print", text: t('button.print')})
        ]),
        el("ul", {
            id: "leningOverzicht",
            class: "lening-overzicht on-print",
            hidden: true
        }),
        el("table", { id: "aflossingstabel" }, [
            el("thead", { id: "tableHeader", class: "table-header", html: `
                <tr>
                    <th data-i18n="table.no">${t('table.no')}</th>
                    <th data-i18n="table.date">${t('table.date')}</th>
                    <th data-i18n="table.begin-capital">${t('table.begin-capital')}</th>
                    <th data-i18n="table.total-payment">${t('table.total-payment')}</th>
                    <th data-i18n="table.principal">${t('table.principal')}</th>
                    <th data-i18n="table.interest">${t('table.interest')}</th>
                    <th data-i18n="table.outstanding">${t('table.outstanding')}</th>
                    <th data-i18n="table.cumulative-interest">${t('table.cumulative-interest')}</th>
                    <th data-i18n="table.cumulative-principal">${t('table.cumulative-principal')}</th>
                    <th data-i18n="table.cumulative-payment">${t('table.cumulative-payment')}</th>
                </tr>
            `}),
            el("tbody", {
                id: "tableInhoud",
                class: "table-inhoud"
            })
        ])
    ]);
}

function preparePrintOverview() {
    $("#leningOverzicht").innerHTML = "";
    const inputs = parseInputs();

    const bedrag = el("li", { html: `<strong data-i18n="print.loan-amount">${t('print.loan-amount')}</strong> <span>${fmtCurrency.format(inputs.bedrag)}</span>` });
    const jkp = el("li", { html: `<strong data-i18n="print.annual-rate">${t('print.annual-rate')}</strong> <span>${inputs.jkp.toString().replace('.', ',') || "-"} %</span>` });
    const rentevoet = el("li", { html: `<strong data-i18n="print.monthly-rate">${t('print.monthly-rate')}</strong> <span>${$('.monthly-rate').textContent || "-"}</span>` });
    const pmt = el("li", { html: `<strong data-i18n="print.monthly-payment">${t('print.monthly-payment')}</strong> <span>${$('.monthly-payment').textContent || "-"}</span>` });
    const rente = el("li", { html: `<strong data-i18n="print.total-interest">${t('print.total-interest')}</strong> <span>${$('.total-interest').textContent || "-"}</span>` });
    const periode = el("li", { html: `<strong data-i18n="print.period">${t('print.period')}</strong> <span>${inputs.periode || "-"}</span> <span data-i18n="label.months">${t('label.months')}</span>` });
    const startDate = el("li", { html: `<strong data-i18n="print.start-date">${t('print.start-date')}</strong> <span>${fmtDate(inputs.startDate)}</span>` });
    const endDate = el("li", { html: `<strong data-i18n="print.end-date">${t('print.end-date')}</strong> <span>${$('.endDateDisplay').textContent || "-"}</span>` });
    $("#leningOverzicht").append(bedrag, jkp, rentevoet, pmt, rente, periode, startDate, endDate);
}

export function printData() {
    preparePrintOverview();
    window.print();
}

export function setTableVisibility(visible) {
    if (visible) {
        $("#aflossingstabel").hidden = false;
        $("#afdrukken").style.visibility = "visible";
    } else {
        $("#aflossingstabel").hidden = true;
        $("#afdrukken").style.visibility = "hidden";
    }
}

export function generateSchedule() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);

    $("#tableInhoud").innerHTML = "";
    setTableVisibility(true);

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

