import clsx from "clsx";

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={clsx(
        "rounded-sm px-4 py-2 font-bold transition-colors",
        {
          "text-white bg-purple-600 hover:bg-purple-700 focus:bg-purple-700 active:bg-purple-800":
            variant === "primary",
          "text-white border hover:bg-white/5 focus:bg-white/5 active:bg-white/10":
            variant === "secondary",
        },
        className
      )}
      {...props}
    />
  );
}
