import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const paymentMethods = ["Cash", "Card", "Bank Transfer", "Other"] as const;

// Zod schema describing the full payment form
const paymentFormSchema = z
  .object({
    // Read-only / fetched fields
    orderId: z.string(),
    customerName: z.string(),
    orderDate: z.string(),
    frameSubtotal: z.number(),
    lensesSubtotal: z.number(),
    repairsSubtotal: z.number(),
    totalOrderAmount: z.number(),
    paymentsMadeToDate: z.number(),
    balance: z.number(), // kept internal – not rendered as its own field

    // Editable fields
    amountPaidToday: z
      .coerce
      .number({ invalid_type_error: "Enter an amount" })
      .gt(0, "Amount must be greater than 0"),
    paymentMethod: z.enum(paymentMethods, {
      required_error: "Payment method is required",
    }),
    paymentMethodOther: z.string().optional(),
    paymentReferenceNumber: z.string().optional(),
    processedBy: z
      .string({ required_error: "Processed By is required" })
      .min(1, "Processed By is required"),
    paymentDate: z
      .string({ required_error: "Payment date is required" })
      .min(1, "Payment date is required"),
  })
  .superRefine((data, ctx) => {
    // Amount cannot exceed balance
    if (data.amountPaidToday > data.balance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountPaidToday"],
        message: "Amount cannot exceed balance",
      });
    }

    // Other (specify) required when payment method is Other
    if (data.paymentMethod === "Other") {
      if (!data.paymentMethodOther || data.paymentMethodOther.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paymentMethodOther"],
          message: "Please specify the other payment method",
        });
      }
    }

    // Payment reference required for Card / Bank Transfer
    if (
      (data.paymentMethod === "Card" || data.paymentMethod === "Bank Transfer") &&
      (!data.paymentReferenceNumber || data.paymentReferenceNumber.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentReferenceNumber"],
        message: "Payment reference is required for this method",
      });
    }
  });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const mockInitialValues: Omit<
  PaymentFormValues,
  | "amountPaidToday"
  | "paymentMethod"
  | "paymentMethodOther"
  | "paymentReferenceNumber"
  | "processedBy"
  | "paymentDate"
> = {
  orderId: "ORD-12345",
  customerName: "Jane Doe",
  orderDate: new Date().toISOString().slice(0, 10),
  frameSubtotal: 120,
  lensesSubtotal: 80,
  repairsSubtotal: 0,
  totalOrderAmount: 200,
  paymentsMadeToDate: 50,
  balance: 150,
};

const mockStaffOptions = [
  { id: "staff-1", label: "Alice" },
  { id: "staff-2", label: "Bob" },
  { id: "staff-3", label: "Chris" },
];

const OrderPaymentForm: React.FC = () => {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      ...mockInitialValues,
      amountPaidToday: 0,
      // Select fields must start with no preselected option
      // We achieve this by leaving paymentMethod and processedBy undefined
      paymentMethod: undefined as unknown as PaymentFormValues["paymentMethod"],
      paymentMethodOther: "",
      paymentReferenceNumber: "",
      processedBy: "",
      paymentDate: new Date().toISOString().slice(0, 10),
    },
    mode: "onBlur",
  });

  const paymentMethod = form.watch("paymentMethod");
  const balance = form.watch("balance");
  const amountPaidToday = form.watch("amountPaidToday") ?? 0;

  const remainingBalance = React.useMemo(() => {
    const safeAmount = isNaN(Number(amountPaidToday)) ? 0 : Number(amountPaidToday);
    const result = Number(balance) - safeAmount;
    return Number.isFinite(result) ? Math.max(result, 0) : 0;
  }, [balance, amountPaidToday]);

  const onSubmit = (values: PaymentFormValues) => {
    // Normalize numeric fields on submit (e.g., fixed decimals if needed)
    const normalized: PaymentFormValues = {
      ...values,
      amountPaidToday: Number(values.amountPaidToday),
    };

    // In a real app, replace this with an API call
    // eslint-disable-next-line no-console
    console.log("Submitted payment", normalized);
  };

  const renderReadOnlyInput = (label: string, value: string | number) => (
    <div className="flex flex-col gap-1">
      <FormLabel className="text-sm font-medium text-muted-foreground">
        {label}
      </FormLabel>
      <Input
        value={String(value)}
        readOnly
        className="bg-muted/60 cursor-not-allowed"
      />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Form title above the form */}
      <h1 className="text-2xl font-semibold tracking-tight">Order Payment Form</h1>

      {/* Outer parent card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Order Payment</CardTitle>
          <CardDescription>
            Record a payment against an existing order and update the account balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Card 1 – Order Details (separate card) */}
              <Card className="border bg-muted/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderReadOnlyInput(
                      "Order ID / Job Ticket ID",
                      mockInitialValues.orderId
                    )}
                    {renderReadOnlyInput(
                      "Customer Name",
                      mockInitialValues.customerName
                    )}
                    {renderReadOnlyInput(
                      "Order Date",
                      mockInitialValues.orderDate
                    )}
                    {renderReadOnlyInput(
                      "Frame Subtotal",
                      mockInitialValues.frameSubtotal.toFixed(2)
                    )}
                    {renderReadOnlyInput(
                      "Lenses Subtotal",
                      mockInitialValues.lensesSubtotal.toFixed(2)
                    )}
                    {renderReadOnlyInput(
                      "Repairs / Replacement Subtotal",
                      mockInitialValues.repairsSubtotal.toFixed(2)
                    )}
                    {renderReadOnlyInput(
                      "Total Order Amount",
                      mockInitialValues.totalOrderAmount.toFixed(2)
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card 2 – Account Summary (separate card) */}
              <Card className="border bg-muted/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Account Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Payments – Itemised by Date
                      </h3>
                      <table className="w-full text-sm border rounded-md overflow-hidden">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Remaining Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-2">2025-01-02</td>
                            <td className="p-2">$20</td>
                            <td className="p-2">$180</td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-2">2025-01-10</td>
                            <td className="p-2">$30</td>
                            <td className="p-2">$150</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {renderReadOnlyInput(
                        "Payments Made (To Date)",
                        mockInitialValues.paymentsMadeToDate.toFixed(2)
                      )}
                      {renderReadOnlyInput(
                        "Remaining Balance",
                        remainingBalance.toFixed(2)
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3 – Payment Entry (separate card) */}
              <Card className="border bg-muted/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Payment Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Amount Being Paid Today */}
                    <FormField
                      control={form.control}
                      name="amountPaidToday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount Being Paid Today</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Method */}
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method} value={method}>
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Method – Other (Specify) */}
                    {paymentMethod === "Other" && (
                      <FormField
                        control={form.control}
                        name="paymentMethodOther"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Payment Method – Other (Specify)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Payment Reference No. (Card / Bank Transfer) */}
                    {(paymentMethod === "Card" ||
                      paymentMethod === "Bank Transfer") && (
                      <FormField
                        control={form.control}
                        name="paymentReferenceNumber"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Payment Reference No.</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Processed By (Staff) */}
                    <FormField
                      control={form.control}
                      name="processedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Processed By (Staff)</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockStaffOptions.map((staff) => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    {staff.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Date */}
                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button type="submit">Submit Payment</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPaymentForm;
