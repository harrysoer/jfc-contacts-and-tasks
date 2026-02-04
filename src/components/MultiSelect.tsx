"use client";

import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";

export interface SelectOption {
  value: string;
  label: string;
}

interface BaseSelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  className?: string;
}

interface MultiSelectModeProps extends BaseSelectProps {
  isMulti: true;
  value: SelectOption[];
  onChange: (selected: SelectOption[]) => void;
}

interface SingleSelectModeProps extends BaseSelectProps {
  isMulti?: false;
  value: SelectOption | null;
  onChange: (selected: SelectOption | null) => void;
}

type SelectProps = MultiSelectModeProps | SingleSelectModeProps;

export default function MultiSelect(props: SelectProps) {
  const {
    label,
    options,
    placeholder = "Select...",
    error,
    isDisabled = false,
    isLoading = false,
    isClearable = true,
    className = "",
    isMulti,
  } = props;

  const handleChange = (
    selected: MultiValue<SelectOption> | SingleValue<SelectOption>
  ) => {
    if (props.isMulti) {
      props.onChange(selected as SelectOption[]);
    } else {
      props.onChange(selected as SelectOption | null);
    }
  };

  const customStyles: StylesConfig<SelectOption, boolean> = {
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
        isMulti={isMulti}
        options={options}
        value={props.value}
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
