import { NextRequest } from "next/server";
import { cadetManuals } from "@/lib/manuals";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdf(title: string, lines: string[]) {
  const contentLines = [
    "BT",
    "/F1 20 Tf",
    "72 760 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 11 Tf",
    "0 -34 Td",
    `(${escapePdfText("SAN ENRIQUE ROTC - Cadet Services Portal")}) Tj`,
    ...lines.flatMap((line) => ["0 -22 Td", `(${escapePdfText(line)}) Tj`]),
    "ET",
  ];
  const stream = contentLines.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manual = cadetManuals.find((item) => item.slug === slug);

  if (!manual) {
    return Response.json({ error: "PDF module not found." }, { status: 404 });
  }

  const pdf = createPdf(manual.title, [
    `Category: ${manual.category}`,
    `Version: ${manual.version}`,
    "",
    manual.desc,
    "",
    "This downloadable module is provided for cadet review and training preparation.",
    "For official updates, always follow San Enrique ROTC command announcements.",
  ]);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${manual.slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
