import { styled, useTheme } from "@mui/material/styles";
import { Column, Row } from "components/check/CheckDisplay";
import { useRouter } from "next/router";
import {
  ChangeEventHandler,
  DetailedHTMLProps,
  FocusEventHandler,
  forwardRef,
  InputHTMLAttributes,
} from "react";
import { formatCurrency, formatInteger } from "services/formatter";
import { getCurrencyType } from "services/locale";
import { parseNumericValue } from "services/parser";

export type InputProps = DetailedHTMLProps<
  Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue">,
  HTMLInputElement
> & {
  column: Column;
  defaultValue?: number | string;
  numberFormat?: "currency" | "integer";
  row: Row;
};

export const Input = styled(
  forwardRef<HTMLInputElement, InputProps>(
    ({ className, column, defaultValue, numberFormat, row, ...props }, ref) => {
      const router = useRouter();
      const theme = useTheme();
      const locale = router.locale ?? router.defaultLocale!;
      const currency = getCurrencyType(locale);
      const isCurrencyFormat = numberFormat === "currency";
      let formatter: typeof formatCurrency | typeof formatInteger | undefined;

      if (isCurrencyFormat) {
        formatter = formatCurrency;
      } else if (numberFormat === "integer") {
        formatter = formatInteger;
      }
      let displayValue;
      if (formatter && typeof defaultValue === "number") {
        displayValue = formatter(locale, defaultValue);
      } else {
        displayValue = defaultValue ?? "";
      }

      const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
        if (formatter) {
          const numericValue = parseNumericValue(locale, e.target.value);
          const newValue = isCurrencyFormat
            ? Math.round(numericValue * Math.pow(currency.base, currency.exponent))
            : numericValue;
          e.target.dataset.value = newValue.toString();
          const newFormattedValue = formatter(locale, newValue);
          e.target.value = newFormattedValue;
          e.target.style.minWidth = `calc(${newFormattedValue.length}ch + ${theme.spacing(
            4
          )} + 1px)`;
        }
        if (typeof props.onBlur === "function") {
          props.onBlur(e);
        }
      };

      const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        e.target.style.minWidth = `calc(${e.target.value.length}ch + ${theme.spacing(4)} + 1px)`;
        if (typeof props.onChange === "function") {
          props.onChange(e);
        }
      };

      const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
        const target = e.target;
        if (formatter) {
          const numericValue = parseNumericValue(locale, e.target.value);
          target.value = numericValue.toString();
        }
        target.select();
        if (typeof props.onFocus === "function") {
          props.onFocus(e);
        }
      };

      return (
        <input
          {...props}
          className={`Input-root ${className}`}
          data-column={column}
          data-row={row}
          data-value={defaultValue}
          defaultValue={displayValue}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          ref={ref}
          style={{
            minWidth: `calc(${displayValue.toString().length || 0}ch + ${theme.spacing(4)} + 1px)`,
          }}
        />
      );
    }
  )
)`
  ${({ theme }) => `
    appearance: none;
    background: none;
    border: 0;
    font: inherit;
    height: 100%;
    padding: ${theme.spacing(1, 2)};
    text-align: inherit;
    width: 100%;

    &:disabled {
      color: ${theme.palette.text.disabled};
    }

    &:not(:disabled) {
      color: currentColor;
    }
  `}
`;
