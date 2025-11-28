import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const formSchema = z
  .object({
    lensSupply: z.enum(
      ["Left & Right Lenses", "Left Lens Only", "Right Lens Only"],
      {
        required_error: "Lens supply is required",
      }
    ),
    lensTreatment: z.enum(["Uncuts", "Edge & Fit", "Other"], {
      required_error: "Lens treatment is required",
    }),
    lensTreatmentOther: z.string().optional(),
    frame: z.enum(
      ["To Come", "Enclosed", "Lens Only", "Lab Supply", "Call", "Other"],
      {
        required_error: "Frame is required",
      }
    ),
    frameOther: z.string().optional(),
    otherInstructions: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.lensTreatment === "Other" && !data.lensTreatmentOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lensTreatmentOther"],
        message: "Please specify the lens treatment",
      });
    }

    if (data.frame === "Other" && !data.frameOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["frameOther"],
        message: "Please specify the frame option",
      });
    }
  });

export type OpticalLabOrderFormValues = z.infer<typeof formSchema>;

export default function OpticalLabOrderForm() {
  const form = useForm<OpticalLabOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lensSupply: "Left & Right Lenses",
      lensTreatment: "Uncuts",
      lensTreatmentOther: "",
      frame: "Lens Only",
      frameOther: "",
      otherInstructions: "",
    },
  });

  const lensTreatmentValue = form.watch("lensTreatment");
  const frameValue = form.watch("frame");

  const onSubmit = (values: OpticalLabOrderFormValues) => {
    // Replace this with your actual submit logic (API call, etc.)
    console.log("Submitted Optical Lab Order:", values);
  };

  const handleReset = () => {
    form.reset();
  };

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-4xl space-y-4">
        {/* Form title above the form */}
        <h1 className="text-2xl font-semibold tracking-tight">
          Optical Lab Order Form
        </h1>

        {/* Outer parent card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Inner nested card enclosing fields */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Responsive two-column layout on desktop */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Lens Supply */}
                      <FormField
                        control={form.control}
                        name="lensSupply"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lens Supply</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Left & Right Lenses">
                                  Left & Right Lenses
                                </SelectItem>
                                <SelectItem value="Left Lens Only">
                                  Left Lens Only
                                </SelectItem>
                                <SelectItem value="Right Lens Only">
                                  Right Lens Only
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Lens Treatment */}
                      <FormField
                        control={form.control}
                        name="lensTreatment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lens Treatment</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Uncuts">Uncuts</SelectItem>
                                <SelectItem value="Edge & Fit">
                                  Edge &amp; Fit
                                </SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Frame */}
                      <FormField
                        control={form.control}
                        name="frame"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frame</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="To Come">To Come</SelectItem>
                                <SelectItem value="Enclosed">Enclosed</SelectItem>
                                <SelectItem value="Lens Only">Lens Only</SelectItem>
                                <SelectItem value="Lab Supply">Lab Supply</SelectItem>
                                <SelectItem value="Call">Call</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Lens Treatment – Other (specify) */}
                      {lensTreatmentValue === "Other" && (
                        <FormField
                          control={form.control}
                          name="lensTreatmentOther"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>
                                Lens Treatment – Other (specify)
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Frame – Other (specify) */}
                      {frameValue === "Other" && (
                        <FormField
                          control={form.control}
                          name="frameOther"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Frame – Other (specify)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Other Instructions */}
                      <FormField
                        control={form.control}
                        name="otherInstructions"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Other Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="min-h-[120px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Actions: Submit Order & Reset */}
                    <CardFooter className="flex justify-end gap-3 px-0 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                      <Button type="submit">Submit Order</Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
