import type { ChangeEvent, ClipboardEvent, ComponentProps } from "react";

const prefix = "+7";
const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "");
const nationalDigits = (value: string) => digitsOnly(value.slice(prefix.length));

function formatPhone(digits: string) {
  if (!digits) return prefix;
  const groups = [digits.slice(3, 6), digits.slice(6, 8), digits.slice(8)].filter(Boolean);
  const areaCode = digits.slice(0, 3);
  return `${prefix} (${areaCode}${groups.length ? `) ${groups.join("-")}` : ""}`;
}

function caretAfterDigit(value: string, digitCount: number) {
  if (digitCount === 0) return value === prefix ? prefix.length : value.indexOf("(") + 1;
  for (let index = prefix.length; index < value.length; index++) {
    if (/[0-9]/.test(value[index]) && --digitCount === 0) return index + 1;
  }
  return value.length;
}

export function CallbackPhoneInput({ value, onValueChange, ...props }: Omit<
  ComponentProps<"input">, "value" | "onChange" | "onPaste"
> & { value: string; onValueChange: (value: string) => void }) {
  function apply(input: HTMLInputElement, digits: string, caret: number) {
    const masked = formatPhone(digits);
    input.value = masked;
    const position = caretAfterDigit(masked, caret);
    input.setSelectionRange(position, position);
    onValueChange(masked);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const raw = input.value;
    const offset = input.selectionStart ?? raw.length;
    const previous = nationalDigits(value);
    const inputType = (event.nativeEvent as InputEvent).inputType;
    const deleting = inputType?.startsWith("delete");
    const hasPrefix = raw.startsWith(prefix);
    let newDigits = digitsOnly(raw);
    let caret = digitsOnly(raw.slice(0, offset)).length;

    // Dropping the plus sign alone must leave the existing number intact.
    if (deleting && raw === value.slice(1)) {
      apply(input, previous, 0);
      return;
    }
    if (!hasPrefix && offset <= prefix.length && raw.length > value.length) {
      apply(input, previous, 0);
      return;
    }

    if (hasPrefix || (/^[78][0-9]{10}$/.test(newDigits) && !deleting)) {
      newDigits = newDigits.slice(1);
      caret = Math.max(0, caret - 1);
    }

    // Backspace and Delete should cross the formatting characters in one step.
    const deletingOne = inputType === "deleteContentBackward" || inputType === "deleteContentForward";
    if (deletingOne && hasPrefix && offset >= prefix.length && newDigits === previous) {
      const index = inputType === "deleteContentBackward" ? caret - 1 : caret;
      if (index >= 0 && index < previous.length) {
        newDigits = previous.slice(0, index) + previous.slice(index + 1);
        caret = index;
      }
    }

    if (newDigits.length > 10) {
      apply(input, previous, Math.max(0, caret - 1));
      return;
    }
    apply(input, newDigits, caret);
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const input = event.currentTarget;
    const pasted = event.clipboardData.getData("text").trim();
    let digits = digitsOnly(pasted);
    if (pasted.startsWith(prefix) || /^[78][0-9]{10}$/.test(digits)) digits = digits.slice(1);
    if (digits.length === 10) {
      apply(input, digits, digits.length);
      return;
    }
    if (!digits || digits.length > 10) return;

    const start = nationalDigits(value.slice(0, input.selectionStart ?? value.length)).length;
    const end = nationalDigits(value.slice(0, input.selectionEnd ?? value.length)).length;
    const current = nationalDigits(value);
    const inserted = digits.slice(0, 10 - current.length + end - start);
    if (inserted) {
      apply(input, current.slice(0, start) + inserted + current.slice(end), start + inserted.length);
    }
  }

  return <input {...props} type="tel" autoComplete="tel" inputMode="numeric"
    value={value} onChange={onChange} onPaste={onPaste} />;
}
