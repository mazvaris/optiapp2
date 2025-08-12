import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// -------------------------------------
// Styling helpers
// -------------------------------------
const inputClass =
  "w-full border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 p-2";
const textareaClass =
  "w-full border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 min-h-[100px]";
const selectClass = inputClass + " appearance-none";

// -------------------------------------
// Schema & Types
// -------------------------------------
const personSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["Patient", "Staff", "Visitor", "Other"]).optional().or(z.literal("")),
  personPhone: z
    .string()
    .optional()
    .refine((v) => !v || /[0-9+()\-\s]{7,}/.test(v), {
      message: "Enter a valid phone number",
    }),
  personEmail: z
    .string()
    .optional()
    .refine((v) => !v || /.+@.+\..+/.test(v), { message: "Enter a valid email" }),
});

const witnessSchema = z.object({
  name: z.string().min(1, "Witness name is required"),
  phone: z.string().optional(),
  email: z.string().optional(),
});

const formSchema = z
  .object({
    // 1. General
    dateOfIncident: z.string().min(1, "Date is required"),
    timeOfIncident: z.string().min(1, "Time is required"),
    location: z.string().min(1, "Location is required"),

    // 2. Person Reporting
    reportedByFirstName: z.string().min(1, "First name is required"),
    reportedByLastName: z.string().min(1, "Last name is required"),
    reportedByRole: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().optional(),

    // 3. Persons Involved
    persons: z.array(personSchema).min(1, "Add at least one person"),

    // 4. Incident Details
    incidentType: z
      .enum([
        "Patient Fall",
        "Equipment Malfunction",
        "Medication/Prescription Error",
        "Contact Lens/Fitting Error",
        "Eye Exam Issue",
        "Staff Injury",
        "Property Damage",
        "Security/Privacy Breach",
        "Other",
      ])
      .optional()
      .or(z.literal("")),
    incidentDescription: z.string().min(1, "Please describe the incident"),

    wasInjured: z.enum(["Yes", "No"]).optional().or(z.literal("")),
    injuryDescription: z.string().optional(),
    firstAid: z.enum(["Yes", "No"]).optional().or(z.literal("")),
    medicalTreatment: z.enum(["Yes", "No"]).optional().or(z.literal("")),
    treatedBy: z.string().optional(),

    // 5. Witnesses
    witnesses: z.array(witnessSchema).optional().default([]),

    // 6. Immediate Actions
    immediateActions: z.string().optional(),

    // 7. Reporting & Follow-Up
    reportedTo: z.string().optional(),
    dateReported: z.string().optional(),
    actionsPlanned: z.string().optional(),

    followUp: z.enum(["Yes", "No"]).optional().or(z.literal("")),
    followUpBy: z.string().optional(),

    // 8. Attachments
    attachments: z.any().optional(),
  })
  .refine(
    (data) => {
      if (data.wasInjured === "Yes") {
        return !!data.injuryDescription && data.injuryDescription.trim().length > 0;
      }
      return true;
    },
    { message: "Describe the injury", path: ["injuryDescription"] }
  )
  .refine(
    (data) => {
      if (data.firstAid === "Yes" || data.medicalTreatment === "Yes") {
        return !!data.treatedBy && data.treatedBy.trim().length > 0;
      }
      return true;
    },
    { message: "Specify who provided care", path: ["treatedBy"] }
  )
  .refine(
    (data) => {
      if (data.followUp === "Yes") {
        return !!data.followUpBy && data.followUpBy.trim().length > 0;
      }
      return true;
    },
    { message: "Add follow-up owner/date", path: ["followUpBy"] }
  );

export type IncidentReportFormValues = z.infer<typeof formSchema>;

// -------------------------------------
// Component
// -------------------------------------
const IncidentReportForm: React.FC = () => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncidentReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOfIncident: "",
      timeOfIncident: "",
      location: "",

      reportedByFirstName: "",
      reportedByLastName: "",
      reportedByRole: "",
      contactPhone: "",
      contactEmail: "",

      persons: [
        { firstName: "", lastName: "", role: "", personPhone: "", personEmail: "" },
      ],

      incidentType: "",
      incidentDescription: "",
      wasInjured: "",
      injuryDescription: "",
      firstAid: "",
      medicalTreatment: "",
      treatedBy: "",

      witnesses: [],
      immediateActions: "",

      reportedTo: "",
      dateReported: "",
      actionsPlanned: "",
      followUp: "",
      followUpBy: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "persons" });
  const {
    fields: witnessFields,
    append: appendWitness,
    remove: removeWitness,
  } = useFieldArray({ control, name: "witnesses" });

  const wasInjured = watch("wasInjured") === "Yes";
  const firstAid = watch("firstAid") === "Yes";
  const medicalTreatment = watch("medicalTreatment") === "Yes";
  const followUp = watch("followUp") === "Yes";

  const onSubmit = (data: IncidentReportFormValues) => {
    console.log("Incident Report Submitted:", data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* 1. General Information */}
      <Card className="rounded-2xl p-4">
        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold">1. General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <Label htmlFor="dateOfIncident">Date of Incident</Label>
              <Input id="dateOfIncident" type="date" className={inputClass} {...register("dateOfIncident")} aria-invalid={!!errors.dateOfIncident} />
              {errors.dateOfIncident && <p className="text-red-600 text-sm mt-1">{errors.dateOfIncident.message}</p>}
            </div>
            <div className="flex flex-col">
              <Label htmlFor="timeOfIncident">Time of Incident</Label>
              <Input id="timeOfIncident" type="time" className={inputClass} {...register("timeOfIncident")} aria-invalid={!!errors.timeOfIncident} />
              {errors.timeOfIncident && <p className="text-red-600 text-sm mt-1">{errors.timeOfIncident.message}</p>}
            </div>
            <div className="flex flex-col md:col-span-2">
              <Label htmlFor="location">Location (Room/Area)</Label>
              <Input id="location" className={inputClass} {...register("location")} aria-invalid={!!errors.location} />
              {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Person Reporting */}
      <Card className="rounded-2xl p-4">
        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold">2. Person Reporting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <Label htmlFor="reportedByFirstName">First Name</Label>
              <Input id="reportedByFirstName" className={inputClass} {...register("reportedByFirstName")} aria-invalid={!!errors.reportedByFirstName} />
              {errors.reportedByFirstName && <p className="text-red-600 text-sm mt-1">{errors.reportedByFirstName.message}</p>}
            </div>
            <div className="flex flex-col">
              <Label htmlFor="reportedByLastName">Last Name</Label>
              <Input id="reportedByLastName" className={inputClass} {...register("reportedByLastName")} aria-invalid={!!errors.reportedByLastName} />
              {errors.reportedByLastName && <p className="text-red-600 text-sm mt-1">{errors.reportedByLastName.message}</p>}
            </div>
            <div className="flex flex-col">
              <Label htmlFor="reportedByRole">Role</Label>
              <Input id="reportedByRole" className={inputClass} {...register("reportedByRole")} />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="contactPhone">Phone/Mobile Number</Label>
              <Input id="contactPhone" inputMode="tel" className={inputClass} {...register("contactPhone")} />
            </div>
            <div className="flex flex-col md:col-span-2">
              <Label htmlFor="contactEmail">Email Address</Label>
              <Input id="contactEmail" type="email" className={inputClass} {...register("contactEmail")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Person(s) Involved */}
      {fields.map((item, index) => (
        <Card key={item.id} className="rounded-2xl p-4">
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">3. Person(s) Involved #{index + 1}</h2>
              <Button type="button" variant="destructive" onClick={() => remove(index)} disabled={fields.length === 1}>
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label htmlFor={`persons.${index}.firstName`}>First Name</Label>
                <Input id={`persons.${index}.firstName`} className={inputClass} {...register(`persons.${index}.firstName` as const)} aria-invalid={!!errors.persons?.[index]?.firstName} />
                {errors.persons?.[index]?.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.persons?.[index]?.firstName?.message}</p>
                )}
              </div>
              <div className="flex flex-col">
                <Label htmlFor={`persons.${index}.lastName`}>Last Name</Label>
                <Input id={`persons.${index}.lastName`} className={inputClass} {...register(`persons.${index}.lastName` as const)} aria-invalid={!!errors.persons?.[index]?.lastName} />
                {errors.persons?.[index]?.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.persons?.[index]?.lastName?.message}</p>
                )}
              </div>
              <div className="flex flex-col">
                <Label htmlFor={`persons.${index}.role`}>Role</Label>
                <select id={`persons.${index}.role`} className={selectClass} {...register(`persons.${index}.role` as const)}>
                  <option value="">Select role</option>
                  <option value="Patient">Patient</option>
                  <option value="Staff">Staff</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col">
                <Label htmlFor={`persons.${index}.personPhone`}>Phone/Mobile Number</Label>
                <Input id={`persons.${index}.personPhone`} className={inputClass} {...register(`persons.${index}.personPhone` as const)} />
              </div>
              <div className="flex flex-col md:col-span-2">
                <Label htmlFor={`persons.${index}.personEmail`}>Email Address</Label>
                <Input id={`persons.${index}.personEmail`} type="email" className={inputClass} {...register(`persons.${index}.personEmail` as const)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex gap-2">
        <Button type="button" onClick={() => append({ firstName: "", lastName: "", role: "", personPhone: "", personEmail: "" })}>
          Add Person
        </Button>
      </div>

      {/* 4. Incident Details */}
      <Card className="rounded-2xl p-4">
        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold">4. Incident Details</h2>
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="incidentType">Type of Incident</Label>
              <select id="incidentType" className={selectClass} {...register("incidentType")}>
                <option value="">Select incident type</option>
                <option value="Patient Fall">Patient Fall</option>
                <option value="Equipment Malfunction">Equipment Malfunction</option>
                <option value="Medication/Prescription Error">Medication/Prescription Error</option>
                <option value="Contact Lens/Fitting Error">Contact Lens/Fitting Error</option>
                <option value="Eye Exam Issue">Eye Exam Issue</option>
                <option value="Staff Injury">Staff Injury</option>
                <option value="Property Damage">Property Damage</option>
                <option value="Security/Privacy Breach">Security/Privacy Breach</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <Label htmlFor="incidentDescription">Description of Incident</Label>
              <Textarea id="incidentDescription" className={textareaClass} {...register("incidentDescription")} aria-invalid={!!errors.incidentDescription} />
              {errors.incidentDescription && <p className="text-red-600 text-sm mt-1">{errors.incidentDescription.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label htmlFor="wasInjured">Was anyone injured?</Label>
                <select id="wasInjured" className={selectClass} {...register("wasInjured")}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              {wasInjured && (
                <div className="flex flex-col">
                  <Label htmlFor="injuryDescription">If yes, describe the injury</Label>
                  <Input id="injuryDescription" className={inputClass} {...register("injuryDescription")} aria-invalid={!!errors.injuryDescription} />
                  {errors.injuryDescription && <p className="text-red-600 text-sm mt-1">{errors.injuryDescription.message}</p>}
                </div>
              )}
              <div className="flex flex-col">
                <Label htmlFor="firstAid">Was first aid administered?</Label>
                <select id="firstAid" className={selectClass} {...register("firstAid")}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <Label htmlFor="medicalTreatment">Was medical treatment required?</Label>
                <select id="medicalTreatment" className={selectClass} {...register("medicalTreatment")}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              {(firstAid || medicalTreatment) && (
                <div className="flex flex-col md:col-span-2">
                  <Label htmlFor="treatedBy">By whom</Label>
                  <Input id="treatedBy" className={inputClass} {...register("treatedBy")} aria-invalid={!!errors.treatedBy} />
                  {errors.treatedBy && <p className="text-red-600 text-sm mt-1">{errors.treatedBy.message}</p>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Witnesses (optional, multi) */}
      <Card className="rounded-2xl p-4">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">5. Witnesses (if any)</h2>
            <Button type="button" onClick={() => appendWitness({ name: "", phone: "", email: "" })}>Add Witness</Button>
          </div>

          {witnessFields.length === 0 && (
            <p className="text-sm text-gray-600">No witnesses added.</p>
          )}

          {witnessFields.map((wf, i) => (
            <div key={wf.id} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <Label htmlFor={`witnesses.${i}.name`}>Name</Label>
                <Input id={`witnesses.${i}.name`} className={inputClass} {...register(`witnesses.${i}.name` as const)} />
                {errors.witnesses && // @ts-ignore index-safe optional chain
                  errors.witnesses[i]?.name && (
                    <p className="text-red-600 text-sm mt-1">{/* @ts-ignore */ errors.witnesses[i]?.name?.message}</p>
                  )}
              </div>
              <div className="flex flex-col">
                <Label htmlFor={`witnesses.${i}.phone`}>Phone</Label>
                <Input id={`witnesses.${i}.phone`} className={inputClass} {...register(`witnesses.${i}.phone` as const)} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor={`witnesses.${i}.email`}>Email</Label>
                <div className="flex items-center gap-2">
                  <Input id={`witnesses.${i}.email`} type="email" className={inputClass} {...register(`witnesses.${i}.email` as const)} />
                  <Button type="button" variant="destructive" onClick={() => removeWitness(i)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 6. Immediate Actions Taken */}
      <Card className="rounded-2xl p-4">
        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold">6. Immediate Actions Taken</h2>
          <div className="flex flex-col">
            <Label htmlFor="immediateActions">Describe actions taken immediately after the incident</Label>
            <Textarea id="immediateActions" className={textareaClass} {...register("immediateActions")} />
          </div>
        </CardContent>
      </Card>

      {/* 7. Reporting & Follow-Up */}
      <Card className="rounded-2xl p-4">
        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold">7. Reporting & Follow-Up</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <Label htmlFor="reportedTo">Incident Reported To (Manager/Supervisor)</Label>
              <Input id="reportedTo" className={inputClass} {...register("reportedTo")} />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="dateReported">Date Reported</Label>
              <Input id="dateReported" type="date" className={inputClass} {...register("dateReported")} />
            </div>
            <div className="flex flex-col md:col-span-2">
              <Label htmlFor="actionsPlanned">Actions Planned/Taken to Prevent Recurrence</Label>
              <Textarea id="actionsPlanned" className={textareaClass} {...register("actionsPlanned")} />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="followUp">Follow-Up Required?</Label>
              <select id="followUp" className={selectClass} {...register("followUp")}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {followUp && (
              <div className="flex flex-col md:col-span-1">
                <Label htmlFor="followUpBy">If yes, by whom and when</Label>
                <Input id="followUpBy" className={inputClass} {...register("followUpBy")} aria-invalid={!!errors.followUpBy} />
                {errors.followUpBy && <p className="text-red-600 text-sm mt-1">{errors.followUpBy.message}</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 8. Attachments */}
      <Card className="rounded-2xl p-4">
        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold">8. Attachments</h2>
          <div className="flex flex-col">
            <Label htmlFor="attachments">Upload Files</Label>
            <Input id="attachments" type="file" multiple className={inputClass} {...register("attachments")} />
            <p className="text-xs text-gray-500 mt-1">Supported: images, PDFs, docs (size limits may apply).</p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
};

export default IncidentReportForm;

