import { cn } from "@/lib/utils";

type ViewMode = "table" | "tree";

export function ProfileLineageViewToggle({
  value,
  onChange,
}: Readonly<{
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}>) {
  const isTable = value === "table";

  return (
    <div className="inline-flex w-full max-w-[14.5rem] rounded-[10px] bg-[#285e68] p-1 shadow-[0_16px_30px_-24px_rgba(16,47,52,0.42)] sm:w-auto sm:max-w-none">
      <button
        aria-pressed={isTable}
        className={cn(
          "min-w-0 flex-1 cursor-pointer rounded-[8px] px-3.5 py-1.5 text-[13px] font-medium transition-colors sm:min-w-20 sm:px-4 sm:text-[14px]",
          isTable
            ? "bg-[#e7f7fb] text-[#245c67]"
            : "text-white hover:bg-white/8",
        )}
        type="button"
        onClick={() => onChange("table")}
      >
        Table
      </button>
      <button
        aria-pressed={!isTable}
        className={cn(
          "min-w-0 flex-1 cursor-pointer rounded-[8px] px-3.5 py-1.5 text-[13px] font-medium transition-colors sm:min-w-20 sm:px-4 sm:text-[14px]",
          !isTable
            ? "bg-[#e7f7fb] text-[#245c67]"
            : "text-white hover:bg-white/8",
        )}
        type="button"
        onClick={() => onChange("tree")}
      >
        Tree
      </button>
    </div>
  );
}
