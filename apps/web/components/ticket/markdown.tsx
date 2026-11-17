import type { ReactNode } from "react";

/**
 * Markdown mínimo para los enunciados: párrafos, `## títulos`, listas con "-", bloques ``` y en línea `código`
 * y **negrita**. Genera elementos de React (sin HTML crudo), así que no hay riesgo de inyección.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  return <div className={className}>{parseBlocks(source)}</div>;
}

function parseBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const key = blocks.length;
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) code.push(lines[i++] ?? "");
      i++;
      blocks.push(
        <pre key={key}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={key}>{inline(line.slice(3))}</h2>);
      i++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("- ")) items.push((lines[i++] ?? "").slice(2));
      blocks.push(
        <ul key={key}>
          {items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lista estática que nunca se reordena
            <li key={index}>{inline(item)}</li>
          ))}
        </ul>,
      );
    } else if (line.trim() === "") {
      i++;
    } else {
      const paragraph: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim() !== "" && !/^(```|## |- )/.test(lines[i] ?? "")) {
        paragraph.push(lines[i++] ?? "");
      }
      blocks.push(<p key={key}>{inline(paragraph.join(" "))}</p>);
    }
  }
  return blocks;
}

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      // biome-ignore lint/suspicious/noArrayIndexKey: trozos estáticos de una línea
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
      // biome-ignore lint/suspicious/noArrayIndexKey: trozos estáticos de una línea
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
