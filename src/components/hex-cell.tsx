import clsx from "clsx";

type Props = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export function HexCell({ className, ...props }: Props) {
  return (
    <div className={clsx("hex-grid-cell relative", className)} {...props} />
  );
}
