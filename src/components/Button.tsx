import { twMerge } from "tailwind-merge";

interface Props {
  label: string;
  onClick: () => void;
  classes?: string;
}

export default function Button({ label, classes, onClick }: Props) {
  const mergedClasses = twMerge(
    "py-2 px-4 bg-violet-500 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-75",
    classes ?? ""
  );
  return (
    <button onClick={onClick} className={mergedClasses}>
      {label}
    </button>
  );
}
