import { $, $all, el, createHeader, fmtCurrency, fmtDate, fmtDecimal } from './main.js';

export function buildApp03() {
    $('#app03').append(
        createHeader('LENING - AFLOSSINGSTABEL'),
        createCalculator()
    );
    $('#generateTableBtn').addEventListener('click', generateAmortizationTable);
}

function createCalculator() {
    return el('section', { class: 'calculator-section' }, [
        el('div', { class: 'input-group' }, [
            el('label', { for: 'loanAmount', text: 'Lening Bedrag (€):' }),
            el('input', { type: 'number', id: 'loanAmount', min: '0', step: '0.01', value: '10000' })
        ]),
        el('div', { class: 'input-group' }, [
            el('label', { for: 'annualInterestRate', text: 'Jaarlijkse Rente (%):' }),
            el('input', { type: 'number', id: 'annualInterestRate', min: '0', step: '0.01', value: '5' })
        ]),
        el('div', { class: 'input-group' }, [
            el('label', { for: 'loanTermMonths', text: 'Looptijd (maanden):' }),
            el('input', { type: 'number', id: 'loanTermMonths', min: '1', step: '1', value: '60' })
        ]),
        el('button', { id: 'generateTableBtn', class: 'bereken-btn', text: 'Genereer Aflossingstabel' }),
        el('div', { id: 'amortizationTableContainer' })
    ]);
}
function generateAmortizationTable() {
    const loanAmount = parseFloat($('#loanAmount').value);
    const annualInterestRate = parseFloat($('#annualInterestRate').value) / 100;
    const loanTermMonths = parseInt($('#loanTermMonths').value);
    const monthlyInterestRate = annualInterestRate / 12;

    const monthlyPayment = (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths));
    let balance = loanAmount;
    const tableContainer = $('#amortizationTableContainer');
    tableContainer.innerHTML = '';

    const table = el('table', { class: 'amortization-table' }, [
        el('thead', {}, [
            el('tr', {}, [
                el('th', { text: 'Maand' }),
                el('th', { text: 'Betaling (€)' }),
                el('th', { text: 'Rente (€)' }),
                el('th', { text: 'Aflossing (€)' }),
                el('th', { text: 'Restant Schuld (€)' })
            ])
        ]),
        el('tbody')
    ]);
    const tbody = table.querySelector('tbody');

    for (let month = 1; month <= loanTermMonths; month++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        const row = el('tr', {}, [
            el('td', { text: month.toString() }),
            el('td', { text: fmtDecimal(2).format(monthlyPayment) }),   
            el('td', { text: fmtDecimal(2).format(interestPayment) }),
            el('td', { text: fmtDecimal(2).format(principalPayment) }),
            el('td', { text: fmtDecimal(2).format(Math.max(balance, 0)) })
        ]);
        tbody.appendChild(row);
    }
    tableContainer.appendChild(table);
}