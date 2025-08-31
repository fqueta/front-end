import { Controller, Control } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputMask from "react-input-mask-next";

type MaskedInputFieldProps = {
  name: string;
  control: Control<any>; // pode tipar com seu schema
  label: string;
  mask: string;
  placeholder?: string;
};

export function MaskedInputField({
  name,
  control,
  label,
  mask,
  placeholder,
}: MaskedInputFieldProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <InputMask
                mask={mask}
                value={field.value || ""}
                onChange={field.onChange}
                inputRef={field.ref} // v3 usa "inputRef"
                >
                <Input placeholder={placeholder} />
                </InputMask>
            )}
            />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
