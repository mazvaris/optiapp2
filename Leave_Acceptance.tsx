import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, FileText, X, User, Building2 } from "lucide-react";

/**
 * LeaveAcceptanceForm
 * A production-ready, self-contained React component for approving/accepting
 * an employee leave request. Designed to complement a prior "Leave Request" form.
 *
 * - Tailwind + shadcn/ui + lucide-react + framer-motion
 * - Minimal validation and accessible labels
 * - Accepts initialData from an existing request
 * - Emits a structured payload via onSubmit
 *
 * Usage:
 * <LeaveAcceptanceForm
 *    companyName="Acme Ltd"
 *    initialData={{
 *      requestId: "REQ-2025-0142",
 *      employeeName: "Jane Doe",
 *      employeeId: "E-1029",
 *      department: "Engineering",
 *      leaveType: "Annual",
 *      startDate: "2025-08-20",
 *      endDate: "2025-08-28",
 *      daysRequested: 7,
 *    }}
 *    onSubmit={(data) => console.log(data)}
 *    onCancel={() => console.log("cancel")}
 *  />
 */
export default function LeaveAcceptanceForm({
  companyName = "",
  initialData = {},
  onSubmit = (payload) => alert(JSON.stringify(payload, null, 2)),
  onCancel = () => {},
}) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [form, setForm] = useState({
    requestId: initialData.requestId || "",
    employeeName: initialData.employeeName || "",
    employeeId: initialData.employeeId || "",
    department: initialData.department || "",
    leaveType: initialData.leaveType || "Annual",
    startDate: initialData.startDate || "",
    endDate: initialData.endDate || "",
    daysRequested: initialData.daysRequested || "",
    daysApproved: initialData.daysApproved || initialData.daysRequested || "",
    paidLeave: initialData.paidLeave ?? true,
    approverName: initialData.approverName || "",
    approverTitle: initialData.approverTitle || "",
    approvalDate: initialData.approvalDate || todayIso,
    conditions: initialData.conditions || "",
    coverPerson: initialData.coverPerson || "",
    handoverNotes: initialData.handoverNotes || "",
    notifyHR: initialData.notifyHR ?? true,
    notifyManager: initialData.notifyManager ?? true,
    acknowledgementChecked: false,
    referenceNote: initialData.referenceNote || "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.requestId) e.requestId = "Required";
    if (!form.employeeName) e.employeeName = "Required";
    if (!form.employeeId) e.employeeId = "Required";
    if (!form.department) e.department = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    if (!form.daysApproved || isNaN(Number(form.daysApproved))) e.daysApproved = "Enter a number";
    if (!form.approverName) e.approverName = "Required";
    if (!form.approvalDate) e.approvalDate = "Required";
    if (!form.acknowledgementChecked) e.acknowledgementChecked = "You must confirm acceptance";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      companyName,
      type: "LEAVE_ACCEPTANCE",
      status: "APPROVED",
      issuedAt: new Date().toISOString(),
      ...form,
    };
    try {
      await Promise.resolve(onSubmit(payload));
    } finally {
      setSubmitting(false);
    }
  };

  const SummaryRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Form */}
      <motion.form
        layout
        onSubmit={handleSubmit}
        className="lg:col-span-3 space-y-4"
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Leave Acceptance</CardTitle>
            </div>
            <CardDescription>
              {companyName ? `${companyName} • ` : ""}Approve and issue an acceptance for an existing leave request.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="requestId">Request ID</Label>
                <Input
                  id="requestId"
                  value={form.requestId}
                  onChange={(e) => update("requestId", e.target.value)}
                  placeholder="REQ-2025-0001"
                />
                {errors.requestId && (
                  <p className="text-xs text-red-500 mt-1">{errors.requestId}</p>
                )}
              </div>
              <div>
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={form.leaveType}
                  onValueChange={(v) => update("leaveType", v)}
                >
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Sick">Sick</SelectItem>
                    <SelectItem value="Family Responsibility">Family Responsibility</SelectItem>
                    <SelectItem value="Maternity">Maternity</SelectItem>
                    <SelectItem value="Paternity">Paternity</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="daysApproved">Days Approved</Label>
                <Input
                  id="daysApproved"
                  type="number"
                  min={0}
                  value={form.daysApproved}
                  onChange={(e) => update("daysApproved", e.target.value)}
                />
                {errors.daysApproved && (
                  <p className="text-xs text-red-500 mt-1">{errors.daysApproved}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="startDate" className="flex items-center gap-1"><Calendar className="h-4 w-4"/>Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate" className="flex items-center gap-1"><Calendar className="h-4 w-4"/>End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
              <div>
                <Label htmlFor="paidLeave" className="mb-1">Paid Leave</Label>
                <div className="flex h-10 items-center gap-3 rounded-md border px-3">
                  <Switch
                    id="paidLeave"
                    checked={!!form.paidLeave}
                    onCheckedChange={(v) => update("paidLeave", v)}
                  />
                  <span className="text-sm">{form.paidLeave ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="employeeName" className="flex items-center gap-1"><User className="h-4 w-4"/>Employee Name</Label>
                <Input
                  id="employeeName"
                  value={form.employeeName}
                  onChange={(e) => update("employeeName", e.target.value)}
                  placeholder="Full name"
                />
                {errors.employeeName && (
                  <p className="text-xs text-red-500 mt-1">{errors.employeeName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={form.employeeId}
                  onChange={(e) => update("employeeId", e.target.value)}
                  placeholder="E-1234"
                />
                {errors.employeeId && (
                  <p className="text-xs text-red-500 mt-1">{errors.employeeId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="department" className="flex items-center gap-1"><Building2 className="h-4 w-4"/>Department</Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                  placeholder="e.g., Finance"
                />
                {errors.department && (
                  <p className="text-xs text-red-500 mt-1">{errors.department}</p>
                )}
              </div>
              <div>
                <Label htmlFor="coverPerson">Coverage During Leave</Label>
                <Input
                  id="coverPerson"
                  value={form.coverPerson}
                  onChange={(e) => update("coverPerson", e.target.value)}
                  placeholder="Name of covering colleague"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="approverName">Approver Name</Label>
                <Input
                  id="approverName"
                  value={form.approverName}
                  onChange={(e) => update("approverName", e.target.value)}
                  placeholder="Manager name"
                />
                {errors.approverName && (
                  <p className="text-xs text-red-500 mt-1">{errors.approverName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="approverTitle">Approver Title</Label>
                <Input
                  id="approverTitle"
                  value={form.approverTitle}
                  onChange={(e) => update("approverTitle", e.target.value)}
                  placeholder="e.g., HR Business Partner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="approvalDate">Approval Date</Label>
                <Input
                  id="approvalDate"
                  type="date"
                  value={form.approvalDate}
                  onChange={(e) => update("approvalDate", e.target.value)}
                />
                {errors.approvalDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.approvalDate}</p>
                )}
              </div>
              <div>
                <Label htmlFor="referenceNote">Reference / Notes (internal)</Label>
                <Input
                  id="referenceNote"
                  value={form.referenceNote}
                  onChange={(e) => update("referenceNote", e.target.value)}
                  placeholder="e.g., policy ref, ticket #"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <Label htmlFor="conditions">Conditions / Acceptance Notes</Label>
                <Textarea
                  id="conditions"
                  value={form.conditions}
                  onChange={(e) => update("conditions", e.target.value)}
                  placeholder="Specify any conditions (e.g., reachable hours, equipment return, etc.)"
                  className="min-h-[90px]"
                />
              </div>
              <div>
                <Label htmlFor="handoverNotes">Handover Summary</Label>
                <Textarea
                  id="handoverNotes"
                  value={form.handoverNotes}
                  onChange={(e) => update("handoverNotes", e.target.value)}
                  placeholder="Briefly describe handover / coverage plan"
                  className="min-h-[90px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="notifyHR"
                  checked={!!form.notifyHR}
                  onCheckedChange={(v) => update("notifyHR", v)}
                />
                <Label htmlFor="notifyHR">Notify HR</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="notifyManager"
                  checked={!!form.notifyManager}
                  onCheckedChange={(v) => update("notifyManager", v)}
                />
                <Label htmlFor="notifyManager">Notify Line Manager</Label>
              </div>
            </div>

            <div className="mt-2 flex items-start gap-3 rounded-xl border p-3">
              <input
                id="ack"
                type="checkbox"
                className="mt-1"
                checked={form.acknowledgementChecked}
                onChange={(e) => update("acknowledgementChecked", e.target.checked)}
              />
              <Label htmlFor="ack" className="text-sm leading-relaxed">
                I confirm that this leave request is <span className="font-semibold">ACCEPTED</span> under the terms specified above and in accordance with company leave policies.
              </Label>
            </div>
            {errors.acknowledgementChecked && (
              <p className="text-xs text-red-500 -mt-2">{errors.acknowledgementChecked}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{form.leaveType || "Leave"}</Badge>
              {form.paidLeave ? (
                <Badge variant="default">Paid</Badge>
              ) : (
                <Badge variant="outline">Unpaid</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="gap-1"
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-1"
              >
                <Check className="h-4 w-4" /> {submitting ? "Submitting…" : "Approve & Issue"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.form>

      {/* Live Summary */}
      <motion.div layout className="lg:col-span-2 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Acceptance Summary</CardTitle>
            <CardDescription>Auto-updates as you fill the form.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className="text-xs" variant={form.acknowledgementChecked ? "default" : "secondary"}>
                {form.acknowledgementChecked ? "Ready to Issue" : "Needs Confirmation"}
              </Badge>
            </div>
            <SummaryRow label="Request ID" value={form.requestId} />
            <SummaryRow label="Employee" value={`${form.employeeName || ""}${form.employeeId ? ` • ${form.employeeId}` : ""}`} />
            <SummaryRow label="Department" value={form.department} />
            <SummaryRow label="Type" value={form.leaveType} />
            <SummaryRow label="Dates" value={form.startDate && form.endDate ? `${form.startDate} → ${form.endDate}` : ""} />
            <SummaryRow label="Days (approved)" value={form.daysApproved} />
            <SummaryRow label="Paid" value={form.paidLeave ? "Yes" : "No"} />
            <SummaryRow label="Coverage" value={form.coverPerson} />
            <SummaryRow label="Approver" value={`${form.approverName || ""}${form.approverTitle ? `, ${form.approverTitle}` : ""}`} />
            <SummaryRow label="Approval Date" value={form.approvalDate} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Acceptance Preview</CardTitle>
            <CardDescription>Plain-text preview of the letter content.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm leading-6">
{`${companyName ? companyName + "\n" : ""}Leave Acceptance Letter
Request ID: ${form.requestId || "—"}

Dear ${form.employeeName || "[Employee]"},

Your request for ${form.leaveType} leave from ${form.startDate || "[start]"} to ${form.endDate || "[end]"} 
(${form.daysApproved || "[n]"} working day(s)) has been approved. ${form.paidLeave ? "This period will be treated as PAID leave." : "This period will be treated as UNPAID leave."}

Coverage during your absence: ${form.coverPerson || "[Coverage person]"}.

Conditions:
${form.conditions || "-"}

Handover Summary:
${form.handoverNotes || "-"}

Approved by: ${form.approverName || "[Approver]"}${form.approverTitle ? ", " + form.approverTitle : ""}
Date: ${form.approvalDate || "[date]"}

Please keep this letter for your records.
`}
            </pre>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const text = document.querySelector("pre").innerText;
                const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${form.requestId || "leave-acceptance"}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="gap-1"
            >
              <FileText className="h-4 w-4"/> Export Preview (.txt)
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

