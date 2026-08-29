import { Badge } from "@/components/ui/badge";
import { messages } from "@/lib/i18n";

type TechTicketCopy = (typeof messages)["es"]["tech"]["ticket"];

const URL_SPLIT = /(https?:\/\/[^\s]+)/g;

function fillLetter(template: string, endpoint: string, exampleUrl: string) {
  return template
    .replaceAll("{endpoint}", endpoint)
    .replaceAll("{exampleUrl}", exampleUrl);
}

function LetterText({ text }: { text: string }) {
  const parts = text.split(URL_SPLIT);

  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, index) =>
        part.startsWith("http") ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="break-all text-primary underline-offset-4 hover:underline"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </div>
  );
}

function Meta({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] tracking-wider text-primary uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
      {detail ? (
        <p className="text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

export function TechTicket({
  ticket,
  endpoint,
  exampleUrl,
  sampleJson,
}: {
  ticket: TechTicketCopy;
  endpoint: string;
  exampleUrl: string;
  sampleJson: string;
}) {
  const before = fillLetter(ticket.letterBefore, endpoint, exampleUrl);
  const after = fillLetter(ticket.letterAfter, endpoint, exampleUrl);

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]">
      <header className="border-b border-foreground/10 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-primary">{ticket.id}</p>
          <Badge variant="outline">{ticket.status}</Badge>
        </div>
        <p className="mt-3 text-[11px] tracking-wider text-muted-foreground uppercase">
          {ticket.subjectLabel}
        </p>
        <h3 className="font-heading mt-1 text-lg leading-snug font-semibold text-balance sm:text-xl">
          {ticket.subject}
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Meta
            label={ticket.fromLabel}
            value={ticket.from}
            detail={ticket.fromTeam}
          />
          <Meta label={ticket.toLabel} value={ticket.to} />
          <Meta label={ticket.clientLabel} value={ticket.client} />
        </div>
      </header>

      <div className="p-4 text-sm leading-relaxed sm:p-5">
        <LetterText text={before} />
        <pre className="my-4 overflow-x-auto rounded-xl bg-muted/70 p-3 font-mono text-xs leading-relaxed whitespace-pre text-muted-foreground sm:p-4">
          {sampleJson}
        </pre>
        <LetterText text={after} />
      </div>
    </article>
  );
}
