import React from "react";
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

interface FormFieldProps extends Omit<TextFieldProps, "name" | "error"> {
  name: string;
  label: string;
  value: unknown;
  touched?: boolean;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  value,
  touched,
  error,
  onChange,
  onBlur,
  ...rest
}) => {
  return (
    <TextField
      fullWidth
      id={name}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={Boolean(touched && error)}
      helperText={touched && error}
      margin="normal"
      {...rest}
    />
  );
};

export default FormField;
