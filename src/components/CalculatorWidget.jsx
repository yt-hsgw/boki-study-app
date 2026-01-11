import { useState } from 'react';
import { Calculator, X } from 'lucide-react';

export function CalculatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let result;

      switch (operator) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 'Error';
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = () => {
    if (!operator || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result;

    switch (operator) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '×':
        result = previousValue * inputValue;
        break;
      case '÷':
        result = inputValue !== 0 ? previousValue / inputValue : 'Error';
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const buttonClass = (type) => {
    const base = "w-14 h-12 rounded-lg font-semibold text-lg transition active:scale-95 ";
    switch (type) {
      case 'number':
        return base + "bg-gray-100 hover:bg-gray-200 text-gray-800";
      case 'operator':
        return base + "bg-indigo-500 hover:bg-indigo-600 text-white";
      case 'function':
        return base + "bg-gray-300 hover:bg-gray-400 text-gray-800";
      case 'equals':
        return base + "bg-green-500 hover:bg-green-600 text-white";
      default:
        return base;
    }
  };

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-40 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
        title={isOpen ? '電卓を閉じる' : '電卓を開く'}
      >
        {isOpen ? <X size={24} className="text-white" /> : <Calculator size={24} className="text-white" />}
      </button>

      {/* 電卓本体 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white rounded-xl shadow-2xl p-4 z-40 border">
          <div className="mb-3">
            <div className="text-xs text-gray-500 h-4 text-right">
              {previousValue !== null && `${previousValue} ${operator || ''}`}
            </div>
            <div className="bg-gray-100 rounded-lg p-3 text-right text-2xl font-mono overflow-hidden">
              {display.length > 12 ? parseFloat(display).toExponential(6) : display}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* 1行目 */}
            <button onClick={clear} className={buttonClass('function')}>C</button>
            <button onClick={toggleSign} className={buttonClass('function')}>±</button>
            <button onClick={percentage} className={buttonClass('function')}>%</button>
            <button onClick={() => performOperation('÷')} className={buttonClass('operator')}>÷</button>

            {/* 2行目 */}
            <button onClick={() => inputDigit('7')} className={buttonClass('number')}>7</button>
            <button onClick={() => inputDigit('8')} className={buttonClass('number')}>8</button>
            <button onClick={() => inputDigit('9')} className={buttonClass('number')}>9</button>
            <button onClick={() => performOperation('×')} className={buttonClass('operator')}>×</button>

            {/* 3行目 */}
            <button onClick={() => inputDigit('4')} className={buttonClass('number')}>4</button>
            <button onClick={() => inputDigit('5')} className={buttonClass('number')}>5</button>
            <button onClick={() => inputDigit('6')} className={buttonClass('number')}>6</button>
            <button onClick={() => performOperation('-')} className={buttonClass('operator')}>−</button>

            {/* 4行目 */}
            <button onClick={() => inputDigit('1')} className={buttonClass('number')}>1</button>
            <button onClick={() => inputDigit('2')} className={buttonClass('number')}>2</button>
            <button onClick={() => inputDigit('3')} className={buttonClass('number')}>3</button>
            <button onClick={() => performOperation('+')} className={buttonClass('operator')}>+</button>

            {/* 5行目 */}
            <button onClick={() => inputDigit('0')} className={buttonClass('number') + " col-span-2"}>0</button>
            <button onClick={inputDecimal} className={buttonClass('number')}>.</button>
            <button onClick={calculate} className={buttonClass('equals')}>=</button>
          </div>
        </div>
      )}
    </>
  );
}
