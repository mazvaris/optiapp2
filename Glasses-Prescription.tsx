"use client";

import React from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";

// Types
type PDMode = "single" | "split";

type SimplePrescriptionForm = {
  od: { sphere: string; cylinder: string; axis: string; add: string };
  os: { sphere: string; cylinder: string; axis: string; add: string };
  // Distance PD
  pdMode: PDMode;
  pd?: string; // binocular
  pdRight?: string; // monocular OD
  pdLeft?: string; // monocular OS
  // Near PD
  nearPdMode: PDMode;
  nearPd?: string; // binocular
  nearPdRight?: string; // monocular OD
  nearPdLeft?: string; // monocular OS
  notes: string;
};

// --- Option helpers (simple + safe) ---
const sphereOptions = (() => {
  const opts: string[] = [];
  for (let i = -10; i <= -0.25 + 1e-9; i += 0.25) opts.push(i.toFixed(2));
  opts.push("0.00", "PLANO");
  for (let i = 0.25; i <= 10 + 1e-9; i += 0.25) opts.push(`+${i.toFixed(2)}`);
  return opts;
})();

const cylinderOptions = (() => {
  const opts: string[] = ["0.00"];
  for (let i = -0.25; i >= -6 - 1e-9; i -= 0.25) opts.push(i.toFixed(2));
  return opts;
})();

const axisOptions = Array.from({ length: 180 }, (_, i) => String(i + 1));
const addOptions = Array.from({ length: 16 }, (_, i) => `+${((i + 1) * 0.25).toFixed(2)}`); // +0.25 to +4.00
const pdOptions = Array.from({ length: 31 }, (_, i) => String(50 + i));

// Small helper for selects with placeholder option
function Select({
  register,
  name,
  options,
  placeholder = "Select",
  className = "border rounded p-2 w-full",
}: {
  register: ReturnType<typeof useForm>["register"];
  name: any;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  // Do NOT set defaultValue here; let RHF defaultValues control it
  return (
    <select className={className} {...register(name)}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}

function PDFields() {
  const { register, watch } = useFormContext<SimplePrescriptionForm>();
  const distMode = watch("pdMode");
  const nearMode = watch("nearPdMode");
  const showNear = Boolean(watch("od.add")) || Boolean(watch("os.add"));

  return (
    <div className="space-y-6">
      {/* Distance PD */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Distance PD Mode</legend>
        <div className="flex items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="radio" value="single" {...register("pdMode")} /> Single PD
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" value="split" {...register("pdMode")} /> Split PD
          </label>
        </div>
        {distMode === "single" ? (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">PD (Binocular)</label>
            <Select register={register} name="pd" options={pdOptions} placeholder="Select PD" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">PD Right (OD)</label>
              <Select register={register} name="pdRight" options={pdOptions} placeholder="Select PD Right" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PD Left (OS)</label>
              <Select register={register} name="pdLeft" options={pdOptions} placeholder="Select PD Left" />
            </div>
          </div>
        )}
      </fieldset>

      {/* Near PD */}
      {showNear && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Near PD Mode</legend>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="single" {...register("nearPdMode")} /> Single Near PD
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="split" {...register("nearPdMode")} /> Split Near PD
            </label>
          </div>
          {nearMode === "single" ? (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Near PD (Binocular)</label>
              <Select register={register} name="nearPd" options={pdOptions} placeholder="Select Near PD" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Near PD Right (OD)</label>
                <Select register={register} name="nearPdRight" options={pdOptions} placeholder="Select Near PD Right" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Near PD Left (OS)</label>
                <Select register={register} name="nearPdLeft" options={pdOptions} placeholder="Select Near PD Left" />
              </div>
            </div>
          )}
        </fieldset>
      )}
    </div>
  );
}

export default function SimpleGlassesPrescriptionForm() {
  const methods = useForm<SimplePrescriptionForm>({
    mode: "onSubmit",
    defaultValues: {
      // 1) SPH and CYL default to 0.00
      od: { sphere: "0.00", cylinder: "0.00", axis: "", add: "" },
      os: { sphere: "0.00", cylinder: "0.00", axis: "", add: "" },
      // distance PD defaults
      pdMode: "single",
      pd: "",
      // near PD defaults (independent toggle)
      nearPdMode: "single",
      nearPd: "",
      notes: "",
    },
  });

  const { register, watch } = methods;
  // 3) Show Axis only when corresponding CYL is selected (not 0.00)
  const cylOD = watch("od.cylinder");
  const cylOS = watch("os.cylinder");
  const shouldShowAxisOD = cylOD && cylOD !== "0.00";
  const shouldShowAxisOS = cylOS && cylOS !== "0.00";

  const onSubmit = (data: SimplePrescriptionForm) => {
    alert("Submitted prescription:\n\n" + JSON.stringify(data, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto p-6 space-y-6 border rounded-2xl shadow-sm"
      >
        <h2 className="text-2xl font-semibold">Simple Glasses Prescription</h2>

        {/* Table header */}
        <div className="grid grid-cols-5 gap-3 text-sm font-medium">
          <div className="col-span-1" />
          <div className="text-center">Sphere</div>
          <div className="text-center">Cylinder</div>
          <div className="text-center">Axis</div>
          <div className="text-center">Add</div>
        </div>

        {/* OD Row */}
        <div className="grid grid-cols-5 gap-3 items-center">
          <label className="font-medium">Right (OD)</label>
          <Select register={register} name="od.sphere" options={sphereOptions} placeholder="Select" />
          <Select register={register} name="od.cylinder" options={cylinderOptions} placeholder="Select" />
          <div>
            {shouldShowAxisOD ? (
              <Select register={register} name="od.axis" options={axisOptions} placeholder="Select Axis" />
            ) : (
              <input
                disabled
                className="border rounded p-2 w-full bg-gray-50 text-gray-400"
                placeholder="Axis (N/A)"
              />
            )}
          </div>
          <Select register={register} name="od.add" options={addOptions} placeholder="Select" />
        </div>

        {/* OS Row */}
        <div className="grid grid-cols-5 gap-3 items-center">
          <label className="font-medium">Left (OS)</label>
          <Select register={register} name="os.sphere" options={sphereOptions} placeholder="Select" />
          <Select register={register} name="os.cylinder" options={cylinderOptions} placeholder="Select" />
          <div>
            {shouldShowAxisOS ? (
              <Select register={register} name="os.axis" options={axisOptions} placeholder="Select Axis" />
            ) : (
              <input
                disabled
                className="border rounded p-2 w-full bg-gray-50 text-gray-400"
                placeholder="Axis (N/A)"
              />
            )}
          </div>
          <Select register={register} name="os.add" options={addOptions} placeholder="Select" />
        </div>

        {/* PD section with distance + near modes */}
        <PDFields />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Optional"
            {...register("notes")}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-xl border shadow-sm hover:bg-gray-50">
            Submit
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl border shadow-sm hover:bg-gray-50"
            onClick={() => methods.reset()}
          >
            Reset
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

