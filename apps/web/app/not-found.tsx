import { Notice } from "@/components/notice";
import { m } from "@/lib/messages";

export default function NotFound() {
  return (
    <Notice
      title={m.notFound.title}
      text={m.notFound.text}
      action={{ href: "/", label: m.ticket.backToCalendar }}
    />
  );
}
