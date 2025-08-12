import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const intervalOptions = [
  { label: "Days", value: "days" },
  { label: "Weeks", value: "weeks" },
  { label: "Months", value: "months" },
];

function addInterval(date, amount, unit) {
  const d = new Date(date);
  if (unit === "days") d.setDate(d.getDate() + amount);
  if (unit === "weeks") d.setDate(d.getDate() + amount * 7);
  if (unit === "months") d.setMonth(d.getMonth() + amount);
  return d;
}

export default function EyePrescriptionFollowUpPreview() {
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      followUp: false,
      followUpIntervalValue: "",
      followUpIntervalUnit: "",
      provisionalFollowUpDate: null,
    },
  });

  const followUpNeeded = watch("followUp");
  const intervalValue = watch("followUpIntervalValue");
  const intervalUnit = watch("followUpIntervalUnit");
  const [showProvisional, setShowProvisional] = useState(false);
  const provisionalFollowUpDate = watch("provisionalFollowUpDate");

  // Calculate provisional date
  const computedProvisionalDate = useMemo(() => {
    const value = parseInt(intervalValue);
    if (showProvisional && value && intervalUnit) {
      return addInterval(new Date(), value, intervalUnit);
    }
    return null;
  }, [intervalValue, intervalUnit, showProvisional]);

  // Sync the provisionalFollowUpDate when computedProvisionalDate changes or user selects a date
  React.useEffect(() => {
    if (showProvisional && computedProvisionalDate && !provisionalFollowUpDate) {
      setValue("provisionalFollowUpDate", computedProvisionalDate);
    }
  }, [showProvisional, computedProvisionalDate, setValue, provisionalFollowUpDate]);

  const onSubmit = (data) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 500, margin: "2rem auto", padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" id="followUp" {...register("followUp")}/>
        <label htmlFor="followUp"><b>Follow-up Needed?</b></label>
      </div>

      {followUpNeeded && (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="followUpIntervalValue">Follow-up In</label>
              <input
                type="number"
                id="followUpIntervalValue"
                placeholder="e.g. 2"
                {...register("followUpIntervalValue")}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="followUpIntervalUnit">&nbsp;</label>
              <select {...register("followUpIntervalUnit")}
                defaultValue="">
                <option value="" disabled>Select</option>
                {intervalOptions.map((opt) => (
                  <option value={opt.value} key={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {intervalValue && intervalUnit && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
              <input
                type="checkbox"
                id="setProvisional"
                checked={showProvisional}
                onChange={() => setShowProvisional(v => !v)}
              />
              <label htmlFor="setProvisional">Set provisional follow-up date</label>
            </div>
          )}

          {showProvisional && (
            <div style={{ margin: "16px 0" }}>
              <label><b>Provisional Follow-up Date</b></label>
              <Controller
                control={control}
                name="provisionalFollowUpDate"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value || computedProvisionalDate}
                    onChange={date => field.onChange(date)}
                    dateFormat="PPP"
                    className="input"
                    style={{ width: "100%" }}
                  />
                )}
              />
            </div>
          )}
        </>
      )}

      <button type="submit" style={{ marginTop: 18, padding: "8px 20px", borderRadius: 6, background: "#3465a4", color: "white", border: 0 }}>Submit</button>
    </form>
  );
}

