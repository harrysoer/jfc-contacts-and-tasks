"use client";

import Select, { MultiValue, StylesConfig } from "react-select";

export interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  value: SelectOption[];
  onChange: (selected: SelectOption[]) => void;
  placeholder?: string;
  error?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  className?: string;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  error,
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  className = "",
}: MultiSelectProps) {
  const handleChange = (selected: MultiValue<SelectOption>) => {
    onChange(selected as SelectOption[]);
  };

  const customStyles: StylesConfig<SelectOption, true> = {
    control: (base, state) => ({
      ...base,
      borderColor: error
        ? "#fca5a5"
        : state.isFocused
          ? "#3b82f6"
          : "#d1d5db",
      boxShadow: state.isFocused
        ? error
          ? "0 0 0 1px #ef4444"
          : "0 0 0 1px #3b82f6"
        : "none",
      "&:hover": {
        borderColor: error ? "#f87171" : "#3b82f6",
      },
      borderRadius: "0.5rem",
      minHeight: "42px",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#dbeafe",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1e40af",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#1e40af",
      "&:hover": {
        backgroundColor: "#bfdbfe",
        color: "#1e3a8a",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? "#dbeafe"
          : "white",
      color: state.isSelected ? "white" : "#111827",
      "&:active": {
        backgroundColor: "#2563eb",
      },
    }),
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Select
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        styles={customStyles}
        classNamePrefix="multi-select"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
