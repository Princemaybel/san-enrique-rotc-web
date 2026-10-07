"use client";

import { Download } from "lucide-react";

export function ExportCsvButton({
  filename,
  headers,
  rows,
  label = "Export to CSV",
}: {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  label?: string;
}) {
  const downloadCsv = () => {
    const escapeCsv = (val: string | number | null | undefined) => {
      const str = val === null || val === undefined ? "" : String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={downloadCsv}
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3.5 py-2 text-xs font-bold text-charcoal shadow-xs transition-all hover:bg-mist active:scale-[0.98]"
    >
      <Download className="h-3.5 w-3.5 text-field" />
      {label}
    </button>
  );
}

