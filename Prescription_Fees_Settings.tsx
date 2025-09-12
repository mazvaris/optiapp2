import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// === Validation ===
const settingsSchema = z.object({
  adultFee: z
    .number({ invalid_type_error: "Please enter a number" })
    .min(0, "Must be zero or more"),
  childFee: z
    .number({ invalid_type_error: "Please enter a number" })
    .min(0, "Must be zero or more"),
});

export type DashboardSettings = z.infer<typeof settingsSchema>;

// === Component ===
export default function DashboardSettingsForm() {
  const form = useForm<DashboardSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      adultFee: 0,
      childFee: 0,
    },
    mode: "onBlur",
  });

  const [saving, setSaving] = React.useState(false);

  async function onSubmit(values: DashboardSettings) {
    setSaving(true);
    try {
      // TODO: Replace with your API call
      await new Promise((r) => setTimeout(r, 600));
      console.log("Settings saved:", values);
      // If you use shadcn toast, you can trigger it here.
      // toast({ title: "Saved", description: "Dashboard settings updated." });
      alert("Dashboard settings saved.\n\n" + JSON.stringify(values, null, 2));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-xl w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-muted">
            <DollarSign className="h-5 w-5" />
          </span>
          Dashboard Settings
        </CardTitle>
        <CardDescription>Configure fees used across your dashboard and reports.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Adult Fee */}
            <FormField
              control={form.control}
              name="adultFee"
              rules={{ valueAsNumber: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adult Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? NaN : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Amount charged per adult (e.g., 15.00).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Child Fee */}
            <FormField
              control={form.control}
              name="childFee"
              rules={{ valueAsNumber: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? NaN : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Amount charged per child (e.g., 7.50).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-2 gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Settings"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => form.reset()}>
                Reset
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

