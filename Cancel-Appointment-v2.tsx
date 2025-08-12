import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AppointmentCancellationForm() {
  const { register, handleSubmit, setValue, watch, control } = useForm({
    mode: "onChange",
    defaultValues: {
      reasonOther: {
        checked: false,
        text: "",
      },
      reschedule: undefined,
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const reasons = [
    "Personal reasons",
    "Illness or health concern",
    "Schedule conflict",
    "Found another provider",
  ];

  const rescheduleValue = watch("reschedule");
  const showNowFields = rescheduleValue === "yes_now";

  const otherChecked = watch("reasonOther.checked") === true;

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold">Appointment Cancellation Form</h2>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="appointment">Select Appointment</Label>
              <Input id="appointment" {...register("appointment", { required: true })} placeholder="e.g., Dentist - June 30, 2025" />
            </div>

            <div>
              <Label>Reason for Cancellation (optional)</Label>
              <div className="space-y-2">
                {reasons.map((reason, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {/* These basic checkboxes are optional reasons; if you need them saved as booleans reliably with shadcn, switch them to Controller as well. */}
                    <Checkbox id={`reason-${index}`} {...register(`reasons.${index}`)} />
                    <Label htmlFor={`reason-${index}`}>{reason}</Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Controller
                    name="reasonOther.checked"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="reason-other"
                        checked={!!field.value}
                        onCheckedChange={(val) => field.onChange(Boolean(val))}
                      />
                    )}
                  />
                  <Label htmlFor="reason-other">Other</Label>
                </div>
                {otherChecked && (
                  <Input placeholder="Please specify..." {...register("reasonOther.text", { shouldUnregister: true })} />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Would you like to reschedule?</Label>
              <Select onValueChange={(value) => setValue("reschedule", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_now">Yes - Now</SelectItem>
                  <SelectItem value="yes_later">Yes - Later</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="not_sure">Not Sure</SelectItem>
                </SelectContent>
              </Select>

              {showNowFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="appointmentDate">Appointment Date</Label>
                    <Input id="appointmentDate" type="date" {...register("appointmentDate", { required: showNowFields })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="appointmentTime">Appointment Time</Label>
                    <Input id="appointmentTime" type="time" step="60" {...register("appointmentTime", { required: showNowFields })} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea id="comments" {...register("comments")} placeholder="Any additional details..." />
            </div>

            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

