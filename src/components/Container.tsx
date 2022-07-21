import { twMerge } from "tailwind-merge";

interface Props {
  children?: JSX.Element | JSX.Element[];
  classes?: string;
}

export default function Container({ classes, children }: Props) {
  const mergedClasses = twMerge(
    "bg-white shadow overflow-hidden sm:rounded-lg p-4",
    classes ?? ""
  );
  return <div className={mergedClasses}>{children}</div>;
}
