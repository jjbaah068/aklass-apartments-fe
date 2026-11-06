import type { ReactNode, Ref } from "react";
import { formatDateUK, formatTime, type Receipt } from "../lib/booking";

/** "£1,234.00", or "-£24.00" for discounts and refunds (same as the PDF). */
function money(pounds: number) {
  const abs = Math.abs(pounds).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${pounds < 0 ? "-" : ""}£${abs}`;
}

/** "4 November 2026, 14:05" in UK time. */
function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">{children}</p>;
}

/** The guest's receipt, styled like the PDF. Never shows the receipt key. */
export default function ReceiptCard({ receipt: r, ref }: { receipt: Receipt; ref?: Ref<HTMLDivElement> }) {
  const refunded = r.paymentStatus !== "paid";
  const b = r.business;

  return (
    <div ref={ref} className="receipt-print bg-white p-5 text-navy-900 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b-2 border-gold-500 pb-4">
        <div className="min-w-0">
          <p className="font-display text-[26px] font-semibold leading-tight sm:text-[30px]">{b.tradingName}</p>
          {b.legalName !== b.tradingName && <p className="mt-0.5 text-[12px] text-ink-subtle">{b.legalName}</p>}
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[15px] font-bold tracking-[0.12em]">RECEIPT</p>
          <p className="mt-1 text-[13px] text-ink-subtle tabular">{r.receiptNumber}</p>
          <p className="text-[13px] text-ink-subtle">Issued {dateTime(r.issuedAt)}</p>
        </div>
      </div>

      {/* Status */}
      <p
        className={`mt-4 rounded-lg px-3 py-2 text-[14px] font-semibold ${refunded ? "bg-error-bg text-error" : "bg-success-bg text-success"}`}
      >
        {r.statusLabel}
      </p>

      {/* Guest and stay */}
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 text-[14px] sm:grid-cols-2">
        <div className="min-w-0">
          <Label>Billed to</Label>
          <p className="mt-1">{r.guest.name}</p>
          <p className="break-words text-ink-muted">{r.guest.email}</p>
        </div>
        <div>
          <Label>Booking</Label>
          <p className="mt-1">Reference <span className="font-semibold tabular">{r.stay.ref}</span></p>
          <p className="text-ink-muted">{plural(r.stay.guests, "guest")}, {plural(r.stay.nights, "night")}</p>
        </div>
        <div>
          <Label>Check-in</Label>
          <p className="mt-1">{formatDateUK(r.stay.checkIn)}</p>
          <p className="text-ink-muted">from {formatTime(r.stay.checkInFrom)}</p>
        </div>
        <div>
          <Label>Check-out</Label>
          <p className="mt-1">{formatDateUK(r.stay.checkOut)}</p>
          <p className="text-ink-muted">by {formatTime(r.stay.checkOutBy)}</p>
        </div>
      </div>

      {/* Lines */}
      <div className="mt-5 flex flex-col gap-2.5 border-y border-line py-4 text-[14px] tabular">
        {r.lines.map((l, i) => (
          <div key={i} className={`flex justify-between gap-4 ${l.amount < 0 ? "text-success" : ""}`}>
            <span className="min-w-0">{l.label}</span>
            <span className="shrink-0">{money(l.amount)}</span>
          </div>
        ))}
      </div>

      {/* Totals and payment */}
      <div className="mt-4 flex flex-col gap-2 text-[14px] tabular">
        <div className="flex justify-between gap-4 text-[17px] font-bold">
          <span>Total</span>
          <span>{money(r.total)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Paid by {r.payment.method}</span>
          <span className="shrink-0">{money(r.payment.amountPaid)}</span>
        </div>
        <p className="text-[12px] text-ink-subtle">
          {dateTime(r.payment.paidAt)}
          {r.payment.transactionCode && <> · SumUp transaction <span className="break-all">{r.payment.transactionCode}</span></>}
        </p>

        {r.refund && (
          <>
            <div className="mt-2 flex justify-between gap-4 text-error">
              <span>Refunded{r.refund.at ? ` on ${dateTime(r.refund.at)}` : ""}</span>
              <span className="shrink-0">{money(-r.refund.amount)}</span>
            </div>
            <div className="flex justify-between gap-4 font-bold">
              <span>Net paid</span>
              <span>{money(r.netPaid)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-line pt-4 text-[12px] text-ink-subtle">
        <p className="text-[13px] font-semibold text-navy-900">Thank you for booking direct.</p>
        {b.addressLines.length > 0 && <p className="mt-1">{b.addressLines.join(", ")}</p>}
        {[b.email, b.phone, b.website].some(Boolean) && <p>{[b.email, b.phone, b.website].filter(Boolean).join(" · ")}</p>}
        {r.note && <p className="mt-1">{r.note}</p>}
      </div>
    </div>
  );
}
