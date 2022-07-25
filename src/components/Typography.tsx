import { twMerge } from "tailwind-merge";

interface Props {
  children?: JSX.Element | string;
  classes?: string;
}

export default function Typography({ classes, children }: Props) {
  const mergedClasses = twMerge("", classes ?? "");
  return <p className={mergedClasses}>{children}</p>;
}
