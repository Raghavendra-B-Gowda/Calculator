document.addEventListener('DOMContentLoaded', () => {
    const currentDisplay = document.getElementById('current-operand');
    const previousDisplay = document.getElementById('previous-operand');
    
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let shouldResetScreen = false;

    // Element bindings
    const numberBtns = document.querySelectorAll('.btn-number');
    const operatorBtns = document.querySelectorAll('.btn-operator');
    const clearBtn = document.getElementById('btn-clear');
    const deleteBtn = document.getElementById('btn-delete');
    const equalsBtn = document.getElementById('btn-equals');

    // Update screen DOM
    function updateDisplay() {
        if (currentOperand === 'Error') {
            currentDisplay.textContent = 'Error';
            previousDisplay.textContent = '';
            return;
        }

        // Format commas for better readability (optional, but a nice UX touch)
        const formatNumber = (number) => {
            if (number === '' || number === '-') return number;
            const stringNumber = number.toString();
            const integerDigits = parseFloat(stringNumber.split('.')[0]);
            const decimalDigits = stringNumber.split('.')[1];
            let integerDisplay;
            
            if (isNaN(integerDigits)) {
                integerDisplay = '';
            } else {
                integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
            }

            if (decimalDigits != null) {
                return `${integerDisplay}.${decimalDigits}`;
            } else {
                return integerDisplay;
            }
        };

        currentDisplay.textContent = formatNumber(currentOperand);
        
        if (operation != null) {
            let opSymbol = '';
            switch(operation) {
                case 'add': opSymbol = '+'; break;
                case 'subtract': opSymbol = '−'; break;
                case 'multiply': opSymbol = '×'; break;
                case 'divide': opSymbol = '÷'; break;
            }
            // If the user has typed an operation, show previous number + operation
            previousDisplay.textContent = `${formatNumber(previousOperand)} ${opSymbol}`;
        } else {
            previousDisplay.textContent = '';
        }
    }

    // Number & decimal input logic
    function appendNumber(number) {
        if (currentOperand === 'Error') clear();
        
        // Reset screen if we recently hit equals
        if (shouldResetScreen) {
            currentOperand = '';
            shouldResetScreen = false;
        }
        
        // Prevent multiple decimals
        if (number === '.' && currentOperand.includes('.')) return;
        
        // Handle leading zeros
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number.toString();
        } else {
            // Prevent length overflow to fit on screen
            if (currentOperand.length > 15) return;
            currentOperand = currentOperand.toString() + number.toString();
        }
        updateDisplay();
    }

    // Operator input logic
    function chooseOperation(op) {
        if (currentOperand === 'Error') clear();
        
        // If current is empty but previous has value, user is swapping operations midway
        if (currentOperand === '') {
            if (previousOperand !== '') {
                operation = op;
                updateDisplay();
            }
            return;
        }

        // Calculate intermediate chain operations (e.g. 5 + 5 + ... calculates first pair)
        if (previousOperand !== '') {
            calculate();
        }

        operation = op;
        previousOperand = currentOperand;
        currentOperand = '';
        updateDisplay();
    }

    // Calculation logic
    function calculate() {
        if (currentOperand === 'Error' || operation == undefined || shouldResetScreen) return;
        
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    currentOperand = 'Error';
                    operation = undefined;
                    previousOperand = '';
                    updateDisplay();
                    shouldResetScreen = true;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Fix JS floating point issues (e.g. 0.1 + 0.2)
        computation = Math.round(computation * 1e10) / 1e10;
        
        currentOperand = computation.toString();
        operation = undefined;
        previousOperand = '';
        shouldResetScreen = true;
        updateDisplay();
    }

    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        updateDisplay();
    }

    function deleteNumber() {
        if (currentOperand === 'Error') {
            clear();
            return;
        }
        if (shouldResetScreen) {
            clear();
            return;
        }
        
        currentOperand = currentOperand.toString().slice(0, -1);
        if (currentOperand === '' || currentOperand === '-') {
            currentOperand = '0';
        }
        updateDisplay();
    }

    // Mouse Listeners
    numberBtns.forEach(btn => {
        btn.addEventListener('click', () => appendNumber(btn.dataset.number));
    });

    operatorBtns.forEach(btn => {
        btn.addEventListener('click', () => chooseOperation(btn.dataset.action));
    });

    clearBtn.addEventListener('click', clear);
    deleteBtn.addEventListener('click', deleteNumber);
    equalsBtn.addEventListener('click', calculate);

    // Keyboard support bonus feature
    window.addEventListener('keydown', (e) => {
        if (e.key >= 0 && e.key <= 9) appendNumber(e.key);
        if (e.key === '.') {
            e.preventDefault();
            appendNumber('.');
        }
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault(); 
            calculate();
        }
        if (e.key === 'Backspace') {
            e.preventDefault();
            deleteNumber();
        }
        if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            e.preventDefault();
            clear();
        }
        if (e.key === '+') {
            e.preventDefault();
            chooseOperation('add');
        }
        if (e.key === '-') {
            e.preventDefault();
            chooseOperation('subtract');
        }
        if (e.key === '*') {
            e.preventDefault();
            chooseOperation('multiply');
        }
        if (e.key === '/') {
            e.preventDefault();
            chooseOperation('divide');
        }
    });
});
