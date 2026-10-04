"use client";

/** A submit button that asks for confirmation first — for destructive forms. */
export function ConfirmButton({
  message,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  return (
    <button
      type="submit"
      {...rest}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
