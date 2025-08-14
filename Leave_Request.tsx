import React, { useMemo, useRef, useState } from "react";

/**
 * Leave Request Initiation
 *
 * A self-contained, production-ready React component that guides an employee through
 * initiating a leave/absence request (wizard-style):
 *  1) Select leave type
 *  2) Choose dates (supports partial days)
 *  3) Add notes / upload supporting docs
 *  4) Review summary
 *  5) Submit for manager approval
 *
 * Styling: TailwindCSS (no external UI deps)
 * No date libraries; weekend-aware duration calculation with half-days.
 */

const LEAVE_TYPES = [
  { value: "vacation", label: "Vacation" },
  { value: "sick", label: "Sick Leave" },
  { value: "training", label: "Training Day" },
  { value: "unpaid", label: "Unpaid Leave" },
];

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sun or Sat
}

function parseISODate(val) {
  // val expected as "YYYY-MM-DD"; returns Date at local noon (avoid TZ offset surprises)
  if (!val) return null;
  const [y, m, d] = val.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function diffBusinessDaysInclusive(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  if (endDate < startDate) return 0;
  let count = 0;
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    if (!isWeekend(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function StepHeader({ current }) {
  const steps = [
    { id: 1, name: "Leave Type" },
    { id: 2, name: "Dates" },
    { id: 3, name: "Notes & Docs" },
    { id: 4, name: "Review" },
  ];
  return (
    <ol className="mb-6 flex items-center justify-center gap-3 text-sm">
      {steps.map((step, idx) => {
        const isActive = current === idx + 1;
        const isDone = current > idx + 1;
        return (
          <li key={step.id} className="flex items-center">
            <div
              className={classNames(
                "flex items-center gap-2 rounded-full px-3 py-1",
                isActive
                  ? "bg-indigo-600 text-white shadow"
                  : isDone
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[11px] font-semibold">
                {step.id}
              </span>
              <span className="font-medium">{step.name}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="mx-3 h-[2px] w-6 bg-slate-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function LeaveRequestInitiation({ onSubmit, employeeName }) {
  const [step, setStep] = useState(1);

  // Form state
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfStart, setHalfStart] = useState(false);
  const [halfEnd, setHalfEnd] = useState(false);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]); // File[]
  const [agree, setAgree] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const start = useMemo(() => parseISODate(startDate), [startDate]);
  const end = useMemo(() => parseISODate(endDate), [endDate]);

  const businessDays = useMemo(() => diffBusinessDaysInclusive(start, end), [
    start,
    end,
  ]);

  const totalDays = useMemo(() => {
    let days = businessDays;
    if (days === 0) return 0;
    if (halfStart) days -= 0.5;
    if (halfEnd && startDate !== endDate) days -= 0.5;
    if (days < 0) days = 0;
    return days;
  }, [businessDays, halfStart, halfEnd, startDate, endDate]);

  // Validation helpers
  const basicValid = useMemo(() => {
    if (!leaveType) return false;
    if (!start || !end) return false;
    if (end < start) return false;
    if (businessDays <= 0) return false; // all-weekend range
    return true;
  }, [leaveType, start, end, businessDays]);

  const canReview = basicValid;
  const canSubmit = canReview && agree && !submitting;

  function handleNext() {
    if (step === 1 && !leaveType) {
      setError("Please select a leave type.");
      return;
    }
    if (step === 2 && !basicValid) {
      setError(
        end && end < start
          ? "End date cannot be before start date."
          : "Please choose a valid date range that includes at least one weekday."
      );
      return;
    }
    setError("");
    setStep((s) => Math.min(4, s + 1));
  }

  function handlePrev() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  function onFilesSelected(e) {
    const picked = Array.from(e.target.files || []);
    const deduped = [];
    const seen = new Set(files.map((f) => `${f.name}-${f.size}`));
    for (const f of picked) {
      if (seen.has(`${f.name}-${f.size}`)) continue;
      // 10 MB per file limit
      if (f.size > 10 * 1024 * 1024) {
        setError(`File too large: ${f.name} (max 10 MB per file).`);
        continue;
      }
      deduped.push(f);
    }
    if (deduped.length) setFiles((prev) => [...prev, ...deduped]);
    if (fileInputRef.current) fileInputRef.current.value = ""; // reset so same file can be re-added
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        employeeName: employeeName || "",
        leaveType,
        startDate,
        endDate,
        halfStart,
        halfEnd,
        totalDays,
        notes,
        attachments: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        submittedAt: new Date().toISOString(),
        status: "PENDING_MANAGER_APPROVAL",
      };

      // Hook: pass to parent or fallback to console
      if (typeof onSubmit === "function") {
        await onSubmit(payload, files);
      } else {
        // Simulate API call delay
        await new Promise((res) => setTimeout(res, 800));
        console.log("Submitted Leave Request", payload);
      }

      // Reset after submit
      setStep(1);
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setHalfStart(false);
      setHalfEnd(false);
      setNotes("");
      setFiles([]);
      setAgree(false);
      alert("Leave request submitted for manager approval.");
    } catch (e) {
      setError("Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Leave Request Initiation
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {employeeName ? `Employee: ${employeeName}` : "Please complete the steps below to submit your request."}
        </p>
      </div>

      <StepHeader current={step} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Step 1: Leave Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Leave type<span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="" disabled>
                    Select a type
                  </option>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Choose the leave category. Supporting documents may be required for Sick Leave.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Dates */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Start date<span className="text-red-500"> *</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  End date<span className="text-red-500"> *</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={halfStart}
                  onChange={(e) => setHalfStart(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Start day is a half-day
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={halfEnd}
                  onChange={(e) => setHalfEnd(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                End day is a half-day
              </label>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-slate-700">
                <span className="font-medium">Weekday days requested:</span> {totalDays || 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Weekends are excluded automatically. Half-days reduce the total by 0.5 each (where applicable).
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Notes & Documents */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes (optional)
              </label>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context for your manager (e.g., reason, coverage plan)."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                For sick leave, you can upload a medical certificate if required by policy.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Supporting documents (optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onFilesSelected}
                className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-900"
              />
              {files.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="min-w-0 truncate pr-3">
                        <p className="truncate font-medium text-slate-800">{f.name}</p>
                        <p className="truncate text-xs text-slate-500">{formatBytes(f.size)} · {f.type || "unknown"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Request Summary</h3>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Employee</dt>
                  <dd className="font-medium text-slate-800">{employeeName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Leave type</dt>
                  <dd className="font-medium capitalize text-slate-800">{leaveType || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Start date</dt>
                  <dd className="font-medium text-slate-800">{startDate || "—"} {halfStart ? "(Half-day)" : ""}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">End date</dt>
                  <dd className="font-medium text-slate-800">{endDate || "—"} {halfEnd && startDate !== endDate ? "(Half-day)" : ""}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Weekday days requested</dt>
                  <dd className="font-medium text-slate-800">{totalDays}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Attachments</dt>
                  <dd className="font-medium text-slate-800">{files.length} file(s)</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Notes</dt>
                  <dd className="whitespace-pre-wrap font-medium text-slate-800">{notes || "—"}</dd>
                </div>
              </dl>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                I confirm the information is accurate and understand this request will be routed to my manager for approval.
              </span>
            </label>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || submitting}
            className={classNames(
              "rounded-xl px-4 py-2 text-sm font-medium",
              step === 1 || submitting
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            )}
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {step < 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Next
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={submit}
                className={classNames(
                  "rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2",
                  canSubmit
                    ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400"
                    : "cursor-not-allowed bg-emerald-300"
                )}
              >
                {submitting ? "Submitting…" : "Submit for Approval"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper / Tips */}
      <div className="mt-4 text-center text-xs text-slate-500">
        Tip: Need to change something? Use Back to update any step before submitting.
      </div>
    </div>
  );
}

