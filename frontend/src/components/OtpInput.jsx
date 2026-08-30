import { useRef, useState, useEffect } from 'react';
import './OtpInput.css';

export function OtpInput({ length = 6, onComplete, disabled = false, autoFocus = false, resetKey }) {
  const inputRefs = useRef([]);

  const [values, setValues] = useState(Array(length).fill(''));

  useEffect(() => {
    setValues(Array(length).fill(''));
  }, [resetKey, length]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  function handleChange(index, e) {
    const val = e.target.value.replace(/[^0-9]/g, '');

    if (!val) return;

    const newValues = [...values];
    newValues[index] = val[val.length - 1];

    setValues(newValues);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValues.every((value) => value !== '')) {
      onComplete?.(newValues.join(''));
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      const newValues = [...values];

      if (!values[index] && index > 0) {
        newValues[index - 1] = '';
        setValues(newValues);

        inputRefs.current[index - 1]?.focus();
      } else {
        newValues[index] = '';
        setValues(newValues);
      }
    }
  }

  function handlePaste(e) {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, length);

    if (!pasted) return;

    const newValues = Array(length).fill('');

    pasted.split('').forEach((char, index) => {
      newValues[index] = char;
    });

    setValues(newValues);

    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (newValues.every((value) => value !== '')) {
      onComplete?.(newValues.join(''));
    }
  }

  return (
    <div className="otp-container">
      {values.map((val, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="otp-input"
        />
      ))}
    </div>
  );
}