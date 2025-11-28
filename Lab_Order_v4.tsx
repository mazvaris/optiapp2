"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Zod schema for the form
const lensOrderSchema = z
  .object({
    // Card 1 - Prescription Details (autopopulated, text only)
    rightOdSph: z.string().optional(),
    rightOdCyl: z.string().optional(),
    rightOdAxis: z.string().optional(),
    leftOsSph: z.string().optional(),
    leftOsCyl: z.string().optional(),
    leftOsAxis: z.string().optional(),
    add: z.string().optional(),

    // Card 2 - Lens Specification (autopopulated)
    lensType: z.string().optional(),
    lensMaterial: z.string().optional(),
    lensThickness: z.string().optional(),
    lensColour: z.string().optional(),
    lensCoating: z.string().optional(),
    lensUse: z.string().optional(),
    arCoating: z.enum(["Yes", "No"]).optional(),

    // Card 3 - Supply & Frame Details (user input)
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
      [
        "To Come",
        "Enclosed",
        "Lens Only",
        "Lab Supply",
        "Call",
        "Other",
      ],
      {
        required_error: "Frame selection is required",
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
        message: "Please specify the lens treatment.",
      });
    }

    if (data.frame === "Other" && !data.frameOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["frameOther"],
        message: "Please specify the frame.",
      });
    }
  });

export type LensOrderFormValues = z.infer<typeof lensOrderSchema>;

interface LensOrderFormProps {
  /**
   * Autopopulated values fetched from `glasses_orders`.
   * These will be used mainly for the prescription and lens specification fields.
   */
  initialData?: Partial<LensOrderFormValues>;
  onSubmit?: (data: LensOrderFormValues) => void;
}

export default function OphthalmicLensOrderForm({
  initialData,
  onSubmit,
}: LensOrderFormProps) {
  // Prepare default values; dummy autopopulated values for testing
  const defaultValues: Partial<LensOrderFormValues> = {
    // Dummy autopopulated prescription values
    rightOdSph: "-1.25",
    rightOdCyl: "-0.50",
    rightOdAxis: "120",
    leftOsSph: "-1.00",
    leftOsCyl: "-0.25",
    leftOsAxis: "85",
    add: "+2.00",

    // Dummy autopopulated lens specifications
    lensType: "Single Vision",
    lensMaterial: "Polycarbonate",
    lensThickness: "1.59 Index",
    lensColour: "Clear",
    lensCoating: "Hard Coat",
    lensUse: "Distance",
    arCoating: "Yes",

    // Defaults for selects in Card 3
    lensSupply: "Left & Right Lenses",
    lensTreatment: "Uncuts",
    frame: "Lens Only",

    ...initialData,
  };

  const form = useForm<LensOrderFormValues>({
    resolver: zodResolver(lensOrderSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const lensTreatmentWatch = form.watch("lensTreatment");
  const frameWatch = form.watch("frame");

  const handleSubmit = (values: LensOrderFormValues) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      console.log("Ophthalmic lens order submitted", values);
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Form title above everything */}
      <h1 className="text-2xl font-semibold tracking-tight">
        Ophthalmic Lens Order
      </h1>

      <Card className="shadow-sm border border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Ophthalmic Lens Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Three separate inner cards */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Card 1: Prescription Details */}
              <Card className="border border-border/60 bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Prescription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Right Eye */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm mb-2">
                        Right Eye (OD)
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="rightOdSph"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SPH</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="rightOdCyl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CYL</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="rightOdAxis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>AXIS</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Left Eye */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm mb-2">
                        Left Eye (OS)
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="leftOsSph"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SPH</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="leftOsCyl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CYL</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="leftOsAxis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>AXIS</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ADD field full width */}
                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="add"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ADD</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Lens Specification */}
              <Card className="border border-border/60 bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Lens Specification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="lensType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Type</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lensMaterial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Material</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lensThickness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Thickness</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lensColour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Colour</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lensCoating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Coating</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lensUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Use</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* AR Coating - read-only, autopopulated */}
                    <FormField
                      control={form.control}
                      name="arCoating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AR Coating</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Supply & Frame Details */}
              <Card className="border border-border/60 bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Supply &amp; Frame Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="lensSupply"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Supply</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Left & Right Lenses">
                                  Left &amp; Right Lenses
                                </SelectItem>
                                <SelectItem value="Left Lens Only">
                                  Left Lens Only
                                </SelectItem>
                                <SelectItem value="Right Lens Only">
                                  Right Lens Only
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lensTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lens Treatment</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Uncuts">Uncuts</SelectItem>
                                <SelectItem value="Edge & Fit">
                                  Edge &amp; Fit
                                </SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {lensTreatmentWatch === "Other" && (
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

                    <FormField
                      control={form.control}
                      name="frame"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frame</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="To Come">To Come</SelectItem>
                                <SelectItem value="Enclosed">Enclosed</SelectItem>
                                <SelectItem value="Lens Only">Lens Only</SelectItem>
                                <SelectItem value="Lab Supply">Lab Supply</SelectItem>
                                <SelectItem value="Call">Call</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {frameWatch === "Other" && (
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

                    <FormField
                      control={form.control}
                      name="otherInstructions"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Other Instructions</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button type="submit">Submit Order</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
