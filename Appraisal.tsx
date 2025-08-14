import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Download, RefreshCcw, Save, Printer, Plus, Trash } from "lucide-react";

/**
 * OptometryAppraisalForm (No-Training Version)
 *
 * Adapted for an optometrist practice. All *training* items are removed from the
 * core form (that section is for nurses). If you need to track training, add it
 * later using the Custom Repeater Cards tab.
 *
 * Part C update (generic):
 *  - Registration & Accreditation made generic (no profession-specific labels)
 *  - Removed: equipment calibration, infection control, safeguarding, glaucoma,
 *    clinical governance, and non‑medical prescribing fields
 */

// ----------------------------- Types -----------------------------

type Objective = {
  title: string;
  milestones: string;
  reviewNotes6m?: string;
  reviewNotes12m?: string;
};

type DevelopmentNeed = {
  development: string;
  completionWhen: string; // ISO date
  reviewNotes6m?: string;
  reviewNotes12m?: string;
};

// ✅ Simplified & generic annual checks
 type AnnualChecks = {
  registrationBody?: string; // e.g., Regulator / Body name (optional)
  registrationNumber: string; // generic reg number
  registrationExpiry: string; // ISO date
  accreditationName?: string; // e.g., Scheme/Programme name (optional)
  accreditationExpiry?: string; // ISO date (optional)
  flexibleWorkingReview?: string; // kept as requested previously
  conflictsOfInterestConfirmed: boolean; // kept
};

type Wellbeing = {
  discussion?: string;
  additionalSupport?: string;
  hasDisability: "No" | "Prefer not to say" | "Yes";
  disabilityCategory?:
    | "Learning disability/difficulty"
    | "Long-standing illness"
    | "Mental health condition"
    | "Physical impairment"
    | "Sensory impairment";
  needsAdjustments: boolean;
  adjustments?: string;
};

// Generic repeater card — use for Training or any other ad‑hoc items
export type CustomCard = {
  id: string;
  category: "Training" | "Audit" | "Project" | "Goal" | "Other";
  title: string;
  details?: string;
  dueDate?: string; // ISO date
};

type AppraisalData = {
  appraiseeName: string;
  employeeNumber?: string;
  roleTitle: string;
  locationBranch?: string;
  appraiserName: string;
  lastObjectiveSettingDate?: string; // ISO date
  nextReviewDate?: string; // ISO date
  appraisalDate?: string; // ISO date

  // Part A – Role
  reviewLastYear?: string;
  practiceValuesDemo?: string; // Care, Clarity, Community
  notGoneSoWell?: string;
  futureSupport?: string;

  objectives: Objective[];
  developmentNeeds: DevelopmentNeed[];

  overallCommentsColleague?: string;
  overallCommentsAppraiser?: string;

  wellbeing: Wellbeing;
  annualChecks: AnnualChecks;

  // Ad‑hoc cards (e.g., Training via repeater)
  customCards: CustomCard[];

  signatures: {
    colleagueSigned: boolean;
    colleagueSignatureName?: string;
    colleagueSignatureDate?: string;
    managerSigned: boolean;
    managerSignatureName?: string;
    managerSignatureDate?: string;
  };
};

const EMPTY_OBJECTIVE: Objective = { title: "", milestones: "" };
const EMPTY_DEV: DevelopmentNeed = { development: "", completionWhen: "" };
const EMPTY_CARD = (): CustomCard => ({ id: crypto.randomUUID(), category: "Other", title: "" });

const STORAGE_KEY = "optometry_appraisal_draft_v3_generic_checks";

export default function OptometryAppraisalForm() {
  const [data, setData] = useState<AppraisalData>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try { return JSON.parse(cached) as AppraisalData; } catch {}
    }
    return {
      appraiseeName: "",
      employeeNumber: "",
      roleTitle: "Optometrist",
      locationBranch: "",
      appraiserName: "",
      objectives: [{ ...EMPTY_OBJECTIVE }],
      developmentNeeds: [{ ...EMPTY_DEV }],
      wellbeing: {
        hasDisability: "No",
        needsAdjustments: false,
      },
      annualChecks: {
        registrationBody: "",
        registrationNumber: "",
        registrationExpiry: "",
        accreditationName: "",
        accreditationExpiry: "",
        flexibleWorkingReview: "",
        conflictsOfInterestConfirmed: false,
      },
      customCards: [],
      signatures: {
        colleagueSigned: false,
        managerSigned: false,
      },
    };
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function update<K extends keyof AppraisalData>(key: K, value: AppraisalData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function validate(): boolean {
    const errs: string[] = [];
    if (!data.appraiseeName.trim()) errs.push("Appraisee name is required.");
    if (!data.appraiserName.trim()) errs.push("Appraiser name is required.");

    if (!data.annualChecks.registrationNumber.trim()) errs.push("Registration number is required.");
    if (!data.annualChecks.registrationExpiry) errs.push("Registration expiry date is required.");

    data.objectives.forEach((o, i) => {
      if (!o.title.trim()) errs.push(`Objective ${i + 1} title is required.`);
    });

    setErrors(errs);
    return errs.length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    console.log("Submitted appraisal:", data);
    alert("Appraisal validated. See console for payload. You can also Export JSON.");
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optometry-appraisal-${data.appraiseeName || "draft"}-${todayISO}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (!confirm("Clear the entire form and remove local draft?")) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  function addObjective() { update("objectives", [...data.objectives, { ...EMPTY_OBJECTIVE }]); }
  function removeObjective(idx: number) {
    const copy = [...data.objectives]; copy.splice(idx, 1);
    update("objectives", copy.length ? copy : [{ ...EMPTY_OBJECTIVE }]);
  }
  function addDev() { update("developmentNeeds", [...data.developmentNeeds, { ...EMPTY_DEV }]); }
  function removeDev(idx: number) {
    const copy = [...data.developmentNeeds]; copy.splice(idx, 1);
    update("developmentNeeds", copy.length ? copy : [{ ...EMPTY_DEV }]);
  }

  // Custom cards (use for Training, etc.)
  function addCard(preset?: Partial<CustomCard>) {
    update("customCards", [...data.customCards, { ...EMPTY_CARD(), ...preset } as CustomCard]);
  }
  function updateCard(id: string, patch: Partial<CustomCard>) {
    update("customCards", data.customCards.map(c => c.id === id ? { ...c, ...patch } : c));
  }
  function removeCard(id: string) {
    update("customCards", data.customCards.filter(c => c.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Optometry Appraisal Form</h1>
          <p className="text-sm text-muted-foreground">Annual colleague appraisal for optometrist practice — no training fields in core form.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export JSON
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" /> Save / Validate
          </Button>
        </div>
      </header>

      {errors.length > 0 && (
        <Card className="mb-6 border-destructive/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive">Please fix the following</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {errors.map((e, i) => (<li key={i}>{e}</li>))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="about">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="role">Role Review</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
          <TabsTrigger value="checks">Annual Checks</TabsTrigger>
          <TabsTrigger value="custom">Custom Cards</TabsTrigger>
        </TabsList>

        {/* About */}
        <TabsContent value="about">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Colleague & Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appraiseeName">Name (Appraisee)</Label>
                  <Input id="appraiseeName" value={data.appraiseeName} onChange={(e) => update("appraiseeName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="employeeNumber">Employee Number (optional)</Label>
                  <Input id="employeeNumber" value={data.employeeNumber} onChange={(e) => update("employeeNumber", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="roleTitle">Role Title</Label>
                  <Input id="roleTitle" value={data.roleTitle} onChange={(e) => update("roleTitle", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="locationBranch">Branch / Location</Label>
                  <Input id="locationBranch" value={data.locationBranch} onChange={(e) => update("locationBranch", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="appraiserName">Appraiser / Line Manager</Label>
                  <Input id="appraiserName" value={data.appraiserName} onChange={(e) => update("appraiserName", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-1 md:col-span-2">
                  <div>
                    <Label htmlFor="lastObjDate">Date of objective setting / last appraisal</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input id="lastObjDate" type="date" value={data.lastObjectiveSettingDate || ""} onChange={(e) => update("lastObjectiveSettingDate", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nextReviewDate">Date of next review</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input id="nextReviewDate" type="date" value={data.nextReviewDate || ""} onChange={(e) => update("nextReviewDate", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="appraisalDate">Date of appraisal</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input id="appraisalDate" type="date" value={data.appraisalDate || ""} onChange={(e) => update("appraisalDate", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Review */}
        <TabsContent value="role">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Part A — Your Job Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reviewLastYear">1. Review against last year’s objectives</Label>
                <Textarea id="reviewLastYear" placeholder="Achievements, new skills, service changes, redeployment." value={data.reviewLastYear || ""} onChange={(e) => update("reviewLastYear", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="practiceValuesDemo">2. How have you demonstrated practice values (Care, Clarity, Community)?</Label>
                <Textarea id="practiceValuesDemo" placeholder="Examples: kindness to patients/colleagues; clear communication; nurturing relationships; supporting colleagues to thrive." value={data.practiceValuesDemo || ""} onChange={(e) => update("practiceValuesDemo", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notGoneSoWell">3. What has not gone so well? Any opportunities for change? External factors?</Label>
                <Textarea id="notGoneSoWell" value={data.notGoneSoWell || ""} onChange={(e) => update("notGoneSoWell", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="futureSupport">4. Thinking about the future, how can we support your career aspirations?</Label>
                <Textarea id="futureSupport" value={data.futureSupport || ""} onChange={(e) => update("futureSupport", e.target.value)} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overallCommentsColleague">Overall role performance comments — colleague</Label>
                  <Textarea id="overallCommentsColleague" value={data.overallCommentsColleague || ""} onChange={(e) => update("overallCommentsColleague", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="overallCommentsAppraiser">Overall role performance comments — appraiser</Label>
                  <Textarea id="overallCommentsAppraiser" value={data.overallCommentsAppraiser || ""} onChange={(e) => update("overallCommentsAppraiser", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objectives */}
        <TabsContent value="objectives">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Objectives (SMART)</CardTitle>
              <p className="text-sm text-muted-foreground">Finalise during the appraisal meeting. Include key milestones & dates.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.objectives.map((obj, idx) => (
                <div key={idx} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Objective {idx + 1}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => removeObjective(idx)}>
                        <Trash className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Objective</Label>
                    <Input value={obj.title} onChange={(e) => {
                      const copy = [...data.objectives];
                      copy[idx] = { ...copy[idx], title: e.target.value };
                      update("objectives", copy);
                    }} placeholder="E.g., Reduce average patient wait time by 10% by March 31." />
                  </div>
                  <div>
                    <Label>Key milestones with dates</Label>
                    <Textarea value={obj.milestones} onChange={(e) => {
                      const copy = [...data.objectives];
                      copy[idx] = { ...copy[idx], milestones: e.target.value };
                      update("objectives", copy);
                    }} placeholder="Triage script (Jan 15); new pre-test flow (Feb 15); review (Mar 31)." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>6-month review notes</Label>
                      <Textarea value={obj.reviewNotes6m || ""} onChange={(e) => {
                        const copy = [...data.objectives];
                        copy[idx] = { ...copy[idx], reviewNotes6m: e.target.value };
                        update("objectives", copy);
                      }} />
                    </div>
                    <div>
                      <Label>12-month review notes</Label>
                      <Textarea value={obj.reviewNotes12m || ""} onChange={(e) => {
                        const copy = [...data.objectives];
                        copy[idx] = { ...copy[idx], reviewNotes12m: e.target.value };
                        update("objectives", copy);
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button variant="outline" onClick={addObjective}><Plus className="mr-1 h-4 w-4"/> Add Objective</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Development */}
        <TabsContent value="development">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Development Plan (next 12 months)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.developmentNeeds.map((dev, idx) => (
                <div key={idx} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Development item {idx + 1}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => removeDev(idx)}>
                        <Trash className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Development</Label>
                    <Input value={dev.development} onChange={(e) => {
                      const copy = [...data.developmentNeeds];
                      copy[idx] = { ...copy[idx], development: e.target.value };
                      update("developmentNeeds", copy);
                    }} placeholder="E.g., OCT interpretation workshop; contact lens complex fits." />
                  </div>
                  <div>
                    <Label>When will it be completed</Label>
                    <Input type="date" value={dev.completionWhen} onChange={(e) => {
                      const copy = [...data.developmentNeeds];
                      copy[idx] = { ...copy[idx], completionWhen: e.target.value };
                      update("developmentNeeds", copy);
                    }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>6-month review notes</Label>
                      <Textarea value={dev.reviewNotes6m || ""} onChange={(e) => {
                        const copy = [...data.developmentNeeds];
                        copy[idx] = { ...copy[idx], reviewNotes6m: e.target.value };
                        update("developmentNeeds", copy);
                      }} />
                    </div>
                    <div>
                      <Label>12-month review notes</Label>
                      <Textarea value={dev.reviewNotes12m || ""} onChange={(e) => {
                        const copy = [...data.developmentNeeds];
                        copy[idx] = { ...copy[idx], reviewNotes12m: e.target.value };
                        update("developmentNeeds", copy);
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button variant="outline" onClick={addDev}><Plus className="mr-1 h-4 w-4"/> Add Development</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wellbeing */}
        <TabsContent value="wellbeing">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Part B — Health & Wellbeing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wb1">Is there anything you’d like to discuss about your wellbeing and how this impacts you at work?</Label>
                <Textarea id="wb1" value={data.wellbeing.discussion || ""} onChange={(e) => update("wellbeing", { ...data.wellbeing, discussion: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="wb2">Is there anything that would support your wellbeing which we’ve not already discussed?</Label>
                <Textarea id="wb2" value={data.wellbeing.additionalSupport || ""} onChange={(e) => update("wellbeing", { ...data.wellbeing, additionalSupport: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Do you consider yourself to have a disability?</Label>
                  <Select value={data.wellbeing.hasDisability} onValueChange={(v: Wellbeing["hasDisability"]) => update("wellbeing", { ...data.wellbeing, hasDisability: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category (if applicable)</Label>
                  <Select value={data.wellbeing.disabilityCategory || undefined} onValueChange={(v) => update("wellbeing", { ...data.wellbeing, disabilityCategory: v as Wellbeing["disabilityCategory"] })}>
                    <SelectTrigger><SelectValue placeholder="Only select one" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Learning disability/difficulty">Learning disability/difficulty</SelectItem>
                      <SelectItem value="Long-standing illness">Long-standing illness</SelectItem>
                      <SelectItem value="Mental health condition">Mental health condition</SelectItem>
                      <SelectItem value="Physical impairment">Physical impairment</SelectItem>
                      <SelectItem value="Sensory impairment">Sensory impairment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="needsAdj" checked={data.wellbeing.needsAdjustments} onCheckedChange={(v) => update("wellbeing", { ...data.wellbeing, needsAdjustments: Boolean(v) })} />
                <Label htmlFor="needsAdj">I require workplace adjustments to carry out my role</Label>
              </div>
              <div>
                <Label htmlFor="adjustments">Record reasonable adjustments (actions, owners, dates)</Label>
                <Textarea id="adjustments" value={data.wellbeing.adjustments || ""} onChange={(e) => update("wellbeing", { ...data.wellbeing, adjustments: e.target.value })} placeholder="Detail actions, who will do what, by when." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Checks (generic) */}
        <TabsContent value="checks">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Part C — Annual Checks (Generic)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regBody">Registration body (optional)</Label>
                  <Input id="regBody" value={data.annualChecks.registrationBody || ""} onChange={(e) => update("annualChecks", { ...data.annualChecks, registrationBody: e.target.value })} placeholder="e.g., Regulator / Council" />
                </div>
                <div>
                  <Label htmlFor="regNumber">Registration number</Label>
                  <Input id="regNumber" value={data.annualChecks.registrationNumber} onChange={(e) => update("annualChecks", { ...data.annualChecks, registrationNumber: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="regExpiry">Registration expiry</Label>
                  <Input id="regExpiry" type="date" value={data.annualChecks.registrationExpiry} onChange={(e) => update("annualChecks", { ...data.annualChecks, registrationExpiry: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="accName">Accreditation (optional)</Label>
                  <Input id="accName" value={data.annualChecks.accreditationName || ""} onChange={(e) => update("annualChecks", { ...data.annualChecks, accreditationName: e.target.value })} placeholder="e.g., Scheme / Programme" />
                </div>
                <div>
                  <Label htmlFor="accExpiry">Accreditation expiry (optional)</Label>
                  <Input id="accExpiry" type="date" value={data.annualChecks.accreditationExpiry || ""} onChange={(e) => update("annualChecks", { ...data.annualChecks, accreditationExpiry: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="flexwork">Flexible working / work pattern review (optional)</Label>
                  <Textarea id="flexwork" value={data.annualChecks.flexibleWorkingReview || ""} onChange={(e) => update("annualChecks", { ...data.annualChecks, flexibleWorkingReview: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="coi" checked={data.annualChecks.conflictsOfInterestConfirmed} onCheckedChange={(v) => update("annualChecks", { ...data.annualChecks, conflictsOfInterestConfirmed: Boolean(v) })} />
                  <Label htmlFor="coi">Conflicts of interest reviewed/confirmed</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Repeater Cards (use for Training, etc.) */}
        <TabsContent value="custom">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Custom Cards (Repeater)</CardTitle>
              <p className="text-sm text-muted-foreground">Add any ad‑hoc items (e.g., <em>Training</em> for nurses), audits, projects, or goals.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={() => addCard({ category: "Training", title: "" })}>
                  <Plus className="mr-1 h-4 w-4" /> Add Training Card
                </Button>
                <Button variant="outline" onClick={() => addCard({ category: "Audit", title: "" })}>
                  <Plus className="mr-1 h-4 w-4" /> Add Audit Card
                </Button>
                <Button variant="outline" onClick={() => addCard({ category: "Project", title: "" })}>
                  <Plus className="mr-1 h-4 w-4" /> Add Project Card
                </Button>
              </div>

              {data.customCards.length === 0 && (
                <p className="text-sm text-muted-foreground">No custom cards yet. Use the buttons above to add one.</p>
              )}

              <div className="space-y-4">
                {data.customCards.map((card) => (
                  <div key={card.id} className="rounded-2xl border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Label>Category</Label>
                        <Select value={card.category} onValueChange={(v) => updateCard(card.id, { category: v as CustomCard["category"] })}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Training">Training</SelectItem>
                            <SelectItem value="Audit">Audit</SelectItem>
                            <SelectItem value="Project">Project</SelectItem>
                            <SelectItem value="Goal">Goal</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => removeCard(card.id)}>
                        <Trash className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input value={card.title} onChange={(e) => updateCard(card.id, { title: e.target.value })} placeholder="E.g., Safeguarding refresher; Dry eye pathway audit; OCT project." />
                    </div>
                    <div>
                      <Label>Details</Label>
                      <Textarea value={card.details || ""} onChange={(e) => updateCard(card.id, { details: e.target.value })} placeholder="Notes, links, actions, outcomes." />
                    </div>
                    <div>
                      <Label>Due date</Label>
                      <Input type="date" value={card.dueDate || ""} onChange={(e) => updateCard(card.id, { dueDate: e.target.value })} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


