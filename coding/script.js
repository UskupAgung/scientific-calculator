// ====================================================================
// BAGIAN 1: VARIABEL GLOBAL DAN UTAMA (calculator state)
// ====================================================================
const calculator = {
    displayValue: '0',        // Nilai yang ditampilkan di layar
    firstOperand: null,       // Operand pertama untuk perhitungan
    waitingForSecondOperand: false, // Menunggu input angka kedua
    operator: null,           // Operator yang dipilih (+, -, *, /)
    isDegreesMode: true,      // Default: true (Derajat)
    history: [],              // Array untuk menyimpan riwayat perhitungan
    lastAnswer: 0,            // Menyimpan hasil perhitungan terakhir untuk tombol Ans
};

// Fungsi untuk memperbarui layar kalkulator
function updateDisplay() {
    const display = document.querySelector('.calculator-screen');
    display.value = calculator.displayValue;
}

// ====================================================================
// BAGIAN 2: FUNGSI UTILITAS RIWAYAT (HISTORY)
// ====================================================================

function recordHistory(expression, result) {
    // Batasi jumlah entri, misalnya maksimal 10 entri
    if (calculator.history.length >= 10) {
        calculator.history.shift(); // Hapus entri tertua dari awal array
    }
    
    // Pastikan hasil perhitungan memiliki presisi yang wajar sebelum disimpan
    const formattedResult = Number(result).toPrecision(10);

    calculator.history.push({
        expression: expression,
        result: parseFloat(formattedResult) // Simpan hasil yang sudah diformat
    });
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyElement = document.querySelector('.calculator-history');
    if (!historyElement) return;

    // Membuat HTML dari item riwayat (dimulai dari yang terbaru)
    const historyHTML = calculator.history.map(item => `
        <div class="history-item">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        </div>
    `).reverse().join(''); // Reverse() agar yang terbaru ada di atas

    historyElement.innerHTML = historyHTML.length > 0 ? historyHTML : '<div style="padding: 10px; color: #888;">Belum ada riwayat.</div>';
}

// ====================================================================
// BAGIAN 3: FUNGSI SAINTIFIK DAN FUNGSI PEMBANTU
// ====================================================================

// Fungsi konversi (Wajib untuk sin/cos/tan)
function convertToRadian(degrees) {
    if (calculator.isDegreesMode) {
        return degrees * (Math.PI / 180);
    }
    return degrees;
}

function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) {
        return 'Error'; 
    }
    if (n === 0 || n === 1) {
        return 1;
    }
    let res = 1;
    for (let i = 2; i <= n; i++) {
        res *= i;
        if (res === Infinity) return 'Overflow'; 
    }
    return res;
}

function inputFactorial() {
    let currentValue = parseFloat(calculator.displayValue);

    if (isNaN(currentValue)) {
        calculator.displayValue = 'Error';
        return;
    }

    const result = factorial(currentValue);
    
    // Batasi presisi hasil faktorial
    let formattedResult = Number(result).toPrecision(10);
    
    calculator.displayValue = String(parseFloat(formattedResult));
    calculator.firstOperand = result; 
    calculator.waitingForSecondOperand = true;
}

function handleModeChange(mode) {
    if (mode === 'Deg') {
        calculator.isDegreesMode = true;
    } else if (mode === 'Rad') {
        calculator.isDegreesMode = false;
    }
}

function inputConstant(constValue) {
    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = '0';
        calculator.waitingForSecondOperand = false;
    }
    
    if (constValue === 'pi') {
        calculator.displayValue = String(Math.PI);
    } 
    else if (constValue === 'e') {
        calculator.displayValue = String(Math.E);
    }
}

function handleScientific(func) {
    let currentValue = parseFloat(calculator.displayValue);

    if (isNaN(currentValue)) {
        calculator.displayValue = 'Error';
        return;
    }

    let result;
    switch (func) {
        case 'ln':
            result = Math.log(currentValue);
            break;
        case 'log':
            result = Math.log10(currentValue); 
            break;
        case 'sin':
            result = Math.sin(convertToRadian(currentValue));
            break;
        case 'cos':
            result = Math.cos(convertToRadian(currentValue));
            break;
        case 'tan':
            result = Math.tan(convertToRadian(currentValue));
            break;
        case 'sqrt':
            if (currentValue < 0) {
                result = 'Error (i)'; 
            } else {
                result = Math.sqrt(currentValue);
            }
            break;
        // 'Inv' hanya untuk mode, tidak ada perhitungan di sini
        case 'Inv': 
            // Implementasi Inv (seperti membalik mode trigonometri) dilakukan di event listener
            return; 
        default:
            return;
    }
    
    // Batasi presisi hasil saintifik
    let formattedResult = Number(result).toPrecision(10);
    
    calculator.displayValue = String(parseFloat(formattedResult));
    calculator.firstOperand = result;
    calculator.waitingForSecondOperand = true;
}

function inputAnswer() {
    const answer = String(calculator.lastAnswer);
    
    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = answer;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = answer;
    }
}

function handleExponent() {
    const displayValue = calculator.displayValue;
    if (!displayValue.includes('e')) {
        // Tambahkan 'e' untuk notasi ilmiah (misal: 1.2e+3)
        calculator.displayValue += 'e';
    }
}


// ====================================================================
// BAGIAN 4: FUNGSI PERHITUNGAN INTI DAN OPERATOR DASAR
// ====================================================================

function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

function inputDecimal(dot) {
    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
    }
}

function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue); 

    if (operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        return;
    }

    if (firstOperand === null) {
        calculator.firstOperand = inputValue;
    } 
    else if (operator) {
        const result = performCalculation[operator](firstOperand, inputValue);
        const expression = `${firstOperand} ${operator} ${inputValue}`;
        
        // Merekam Riwayat
        recordHistory(expression, result); 
        
        // Memperbarui lastAnswer
        calculator.lastAnswer = result; 
        
        // Batasi presisi hasil dan tampilkan
        let formattedResult = Number(result).toPrecision(10);
        
        calculator.displayValue = String(parseFloat(formattedResult));
        calculator.firstOperand = result; 
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
}

const performCalculation = {
    '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '=': (firstOperand, secondOperand) => secondOperand, 
    '^': (firstOperand, secondOperand) => Math.pow(firstOperand, secondOperand), 
};

function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    // Pilihan: Anda bisa mereset history dan lastAnswer juga
}

function inputBackspace() {
    const { displayValue } = calculator;
    
    if (displayValue === '0' || displayValue.length === 0) {
        return;
    }
    
    calculator.displayValue = displayValue.slice(0, -1);
    
    if (calculator.displayValue.length === 0) {
        calculator.displayValue = '0';
    }
}

function inputPercent() {
    let { displayValue, firstOperand, operator, waitingForSecondOperand } = calculator;
    let currentValue = parseFloat(displayValue);

    if (currentValue === 0) {
        return;
    }

    if (operator && waitingForSecondOperand) {
        calculator.displayValue = String((firstOperand * currentValue) / 100);
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = String(currentValue / 100);
    }
}


// ====================================================================
// BAGIAN 5: EVENT LISTENER UTAMA
// ====================================================================

const keys = document.querySelector('.calculator-keys');
keys.addEventListener('click', (event) => 
    {
        const { target } = event; 
        if (!target.matches('button')) {
            return; 
        }

        // --- Logika Operator Dasar dan Utility (% dan Backspace) ---
        if (target.classList.contains('operator')) 
        { 
            const operatorValue = target.value;
            
            if (operatorValue === 'backspace') {
                inputBackspace();
                updateDisplay();
                return; 
            }

            if (operatorValue === '%') {
                inputPercent();
                updateDisplay();
                return; 
            }
            
            handleOperator(operatorValue);
            updateDisplay();
            return; 
        }


        // --- Logika Tombol Saintifik ---
        if (target.classList.contains('scientific')) {
            const scientificValue = target.value;

            // 1. Operator Dua Operand (x^y)
            if (scientificValue === 'x^y') {
                handleOperator('^'); 
                updateDisplay();
                return;
            }

            // 2. Tombol Ans, EXP, Konstanta, dan Mode
            if (scientificValue === 'Ans') {
                inputAnswer();
                updateDisplay();
                return;
            }
            if (scientificValue === 'EXP') {
                handleExponent();
                updateDisplay();
                return;
            }
            if (scientificValue === 'pi' || scientificValue === 'e') {
                inputConstant(scientificValue); 
                updateDisplay();
                return;
            }
            if (scientificValue === 'Deg' || scientificValue === 'Rad') {
                handleModeChange(scientificValue); 
                return;
            }

            // 3. Fungsi Instan (x!, sin, ln, cos, log, tan, sqrt, Inv)
            if (['x!', 'Inv', 'sin', 'ln', 'cos', 'log', 'tan', 'sqrt'].includes(scientificValue)) {
                
                if (scientificValue === 'x!') {
                    inputFactorial(); 
                } else {
                    handleScientific(scientificValue); 
                }
                
                updateDisplay();
                return;
            }
        }


        // --- Logika Titik Desimal dan All Clear ---
        if (target.classList.contains('decimal')) {
            inputDecimal(target.value);
            updateDisplay();
            return;
        }

        if (target.classList.contains('all-clear')) {
            resetCalculator();
            updateDisplay();
            updateHistoryDisplay(); // Juga mereset tampilan riwayat
            return;
        }

        // --- Logika Input Angka (Digit) ---
        inputDigit(target.value);
        updateDisplay();
});

// Memastikan layar awal ter-update saat load
updateDisplay();