import React from "react";
import { useForm } from "react-hook-form";
import { Glasses, Save } from "lucide-react";

// ----- Types -----
type FormValues = {
  lensStyle: string;
  lensTreatment: string;
  lensMaterial: string;
  lensCoating: string; // NEW
  arCoating: boolean;  // NEW
  lensOptions: string;
  lensColour: string;
  frame: string;
  otherInstructions: string;
  // Generic catch-alls for potential "Other" option notes if added later
  lensStyleOther?: string;
  lensTreatmentOther?: string;
  lensMaterialOther?: string;
  lensOptionsOther?: string;
  lensColourOther?: string;
  frameOther?: string;
};

// ----- Utilities -----
const ddRequired = (label: string) => ({
  required: `${label} is required`,
  validate: (v: string) => (!!v && v !== "Select") || `${label} is required`,
});

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border p-5">
    <h2 className="text-lg font-semibold mb-4 text-slate-800">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </section>
);

// ----- Component -----
export default function LensOrderForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      lensStyle: "",
      lensTreatment: "",
      lensMaterial: "",
      lensCoating: "",   // NEW
      arCoating: false,    // NEW
      lensOptions: "",
      lensColour: "",
      frame: "",
      otherInstructions: "",
    },
    mode: "onTouched",
  });

  const values = watch();

  const onSubmit = async (data: FormValues) => {
    // Simulate async submit
    await new Promise((r) => setTimeout(r, 600));
    alert("Submitted! Check console for payload.");
    console.log("Form payload", data);
  };

  // Helper to show an \"Other\" text box if the selected value equals "Other"
  const MaybeOther: React.FC<{ name: keyof FormValues; label: string }> = ({ name, label }) => {
    const selected = (values[name] as string) || "";
    if (selected !== "Other") return null;
    const regName = (name + "Other") as keyof FormValues;
    return (
      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label} – Other (specify)</label>
        <input
          type="text"
          className="w-full rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          {...register(regName as any, { required: `Please specify Other for ${label}` })}
          placeholder={`Enter custom ${label.toLowerCase()}`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-sky-100 text-sky-700"><Glasses className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-bold">Lens Order Form</h1>
            <p className="text-sm text-slate-600">Built with React Hook Form + Tailwind + TypeScript</p>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Section title="Prescription Lenses">
            {/* Lens Style */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lens Style</label>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                defaultValue=""
                {...register("lensStyle", ddRequired("Lens Style"))}
              >
                <option value="">Select</option>
                <option>Single Vision</option>
                <option>Bifocal 28</option>
                <option>Bifocal 35</option>
                <option>Bifocal Executive</option>
                <option>Progressive</option>
                <option>Other</option>
              </select>
              {errors.lensStyle && (
                <p className="mt-1 text-sm text-red-600">{errors.lensStyle.message}</p>
              )}
            </div>

            {/* Lens Treatment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lens Treatment</label>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                defaultValue=""
                {...register("lensTreatment", ddRequired("Lens Treatment"))}
              >
                <option value="">Select</option>
                <option>Uncuts</option>
                <option>Edge and Fit</option>
                <option>Other</option>
              </select>
              {errors.lensTreatment && (
                <p className="mt-1 text-sm text-red-600">{errors.lensTreatment.message}</p>
              )}
            </div>

            {/* Lens Material */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lens Material</label>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                defaultValue=""
                {...register("lensMaterial", ddRequired("Lens Material"))}
              >
                <option value="">Select</option>
                <option>CR39 Plastic</option>
                <option>Glass</option>
                <option>Polycarbonate</option>
                <option>1.60</option>
                <option>1.67</option>
                <option>1.74</option>
                <option>Other</option>
              </select>
              {errors.lensMaterial && (
                <p className="mt-1 text-sm text-red-600">{errors.lensMaterial.message}</p>
              )}
            </div>

            {/* Lens Coating - NEW */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lens Coating</label>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                defaultValue=""
                {...register("lensCoating", ddRequired("Lens Coating"))}
              >
                <option value="">Select</option>
                <option>UC</option>
                <option>HMC</option>
                <option>HC</option>
              </select>
              {errors.lensCoating && (
                <p className="mt-1 text-sm text-red-600">{errors.lensCoating.message}</p>
              )}
            </div>

            {/* AR Coating - NEW checkbox (after Lens Coating) */}
            <div className="flex items-center gap-2">
              <input
                id="arCoating"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                {...register("arCoating")}
              />
              <label htmlFor="arCoating" className="text-sm font-medium text-slate-700">AR Coating</label>
            </div>

            {/* Lens Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lens Options</label>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                defaultValue=""
                {...register("lensOptions", ddRequired("Lens Options"))}
              >
                <option value="">Select</option>
                <option>Clear</option>
                <option>Transitions</option>
                <option>Other</option>
              </select>
              {errors.lensOptions && (
                <p className="mt-1 text-sm text-red-600">{errors.lensOptions.message}</p>
              )}
            </div>

            {/* Lens Colour */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lens Colour</label>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                defaultValue=""
                {...register("lensColour", ddRequired("Lens Colour"))}
              >
                <option value="">Select</option>
                <option>Clear</option>
                <option>Blue Block</option>
                <option>Transition Grey</option>
                <option>Transition Brown</option>
                <option>Other</option>
              </select>
              {errors.lensColour && (
                <p className="mt-1 text-sm text-red-600">{errors.lensColour.message}</p>
              )}
            </div>

            {/* Frame */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frame</label>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                defaultValue=""
                {...register("frame", ddRequired("Frame"))}
              >
                <option value="">Select</option>
                <option>To Come</option>
                <option>Enclosed</option>
                <option>Lens Only</option>
                <option>Lab Supply</option>
                <option>Call</option>
                <option>Other</option>
              </select>
              {errors.frame && (
                <p className="mt-1 text-sm text-red-600">{errors.frame.message}</p>
              )}
            </div>

            {/* Conditionally render any \"Other (specify)\" inputs */}
            <MaybeOther name="lensStyle" label="Lens Style" />
            <MaybeOther name="lensTreatment" label="Lens Treatment" />
            <MaybeOther name="lensMaterial" label="Lens Material" />
            <MaybeOther name="lensOptions" label="Lens Options" />
            <MaybeOther name="lensColour" label="Lens Colour" />
            <MaybeOther name="frame" label="Frame" />
          </Section>

          <Section title="Other Instructions">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Other Instructions</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Add any special notes, measurements, or handling instructions"
                {...register("otherInstructions")}
              />
            </div>
          </Section>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 text-white px-5 py-2.5 shadow-sm hover:bg-sky-700 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit Order"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-2xl border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </form>

        {/* SANITY = TRUE: Live JSON state preview */}
        <div className="bg-black text-green-300 rounded-2xl p-4 font-mono text-sm overflow-auto">
          <div className="text-xs uppercase tracking-wider text-green-400 mb-2">Live JSON State</div>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </div>

        <footer className="text-xs text-slate-500">
          <p>
            Notes: Dropdowns default to "Select". If an option "Other" is selected, a companion text input appears to capture specifics.
          </p>
        </footer>
      </div>
    </div>
  );
}

