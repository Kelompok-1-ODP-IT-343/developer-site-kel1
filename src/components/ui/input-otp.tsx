"use client"

import * as React from "react"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Lightweight internal OTP input implementation to avoid external dependency
type SlotInfo = { char?: string; isActive?: boolean; hasFakeCaret?: boolean };

type OTPInputProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  containerClassName?: string;
};

const OTPInputContext = React.createContext<{
  value: string;
  slots: SlotInfo[];
  focus: () => void;
}>({ value: "", slots: [], focus: () => {} });

function OTPInput({ value = "", onChange, maxLength = 6, disabled, containerClassName, className, children, ...props }: OTPInputProps) {
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFocus = () => {
    if (disabled) return;
    setFocused(true);
    inputRef.current?.focus();
  };

  const handleBlur = () => setFocused(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const cleaned = raw.replace(/\D/g, "").slice(0, maxLength);
    onChange?.(cleaned);
  };

  const slots: SlotInfo[] = Array.from({ length: maxLength }).map((_, i) => {
    const char = value[i];
    const caretIndex = Math.min(value.length, maxLength - 1);
    return {
      char,
      isActive: focused && i === caretIndex,
      hasFakeCaret: focused && i === value.length && !value[i],
    };
  });

  return (
    <OTPInputContext.Provider value={{ value, slots, focus: () => inputRef.current?.focus() }}>
      <div
        onClick={handleFocus}
        onBlur={handleBlur}
        className={cn(containerClassName, className)}
        {...props}
      >
        {children}
        <input
          ref={inputRef}
          aria-hidden
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          inputMode="numeric"
          pattern="[0-9]*"
          className="sr-only"
          disabled={disabled}
        />
      </div>
    </OTPInputContext.Provider>
  );
}

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-12 w-12 items-center justify-center border rounded-md text-lg shadow-xs transition-all outline-none data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
