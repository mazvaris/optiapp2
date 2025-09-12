import * as React from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Eye, Trash2, Filter } from "lucide-react";

/**
 * Types
 */
export type OrderStatus =
  | "Order Received"
  | "Sent to Lab"
  | "Ready - Lab"
  | "Uncuts - Lab"
  | "Patient Notified"
  | "Collected with Case"
  | "Collected without Case";

export type OrderItem = {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  customer: { name: string; email: string; phone?: string };
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  items: OrderItem[];
  notes?: string;
};

/**
 * Mock data
 */
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-1001",
    customer: { name: "Ada Lovelace", email: "ada@example.com", phone: "+44 20 7946 0958" },
    status: "Order Received",
    total: 129.99,
    currency: "USD",
    createdAt: "2025-09-01T09:35:00Z",
    updatedAt: "2025-09-01T09:35:00Z",
    items: [
      { sku: "SKU-1", name: "Mechanical Keyboard", qty: 1, unitPrice: 89.99 },
      { sku: "SKU-2", name: "USB-C Cable", qty: 2, unitPrice: 20 },
    ],
    notes: "Gift wrap, please.",
  },
  {
    id: "ORD-1002",
    customer: { name: "Grace Hopper", email: "grace@example.com", phone: "+1 231-555-0199" },
    status: "Sent to Lab",
    total: 59.0,
    currency: "USD",
    createdAt: "2025-09-02T12:12:00Z",
    updatedAt: "2025-09-02T12:25:00Z",
    items: [{ sku: "SKU-3", name: "Wireless Mouse", qty: 1, unitPrice: 59.0 }],
  },
];

/**
 * Filters form
 */
const FiltersSchema = z.object({
  query: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  created: z.string().optional().default(""),
});

type Filters = z.infer<typeof FiltersSchema>;

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className="rounded-full px-3 py-1 font-medium bg-gray-100 text-gray-800">
      {status}
    </Badge>
  );
}

function currencyFormat(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Order ID</div>
          <div className="font-semibold">{order.id}</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Status</div>
          <StatusBadge status={order.status} />
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Customer</div>
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-sm text-muted-foreground">{order.customer.phone ?? "—"}</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Created</div>
          <div className="font-medium">{new Date(order.createdAt).toLocaleString()}</div>
        </div>
      </div>
      <Separator />
    </div>
  );
}

export default function OrdersTableView({ initialData }: { initialData?: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialData ?? MOCK_ORDERS);
  const [page, setPage] = useState(1);
    const pageSize = 8;

  const form = useForm<Filters>({
    resolver: zodResolver(FiltersSchema),
    defaultValues: { query: "", status: "all", created: "" },
  });

  const filtered = useMemo(() => {
    const { query, status, created } = form.getValues();
    return orders.filter((o) => {
      const matchesQuery = (query ?? "").trim().length
        ? [o.id, o.customer.name, o.customer.phone ?? ""].some((field) =>
            field.toLowerCase().includes((query ?? "").toLowerCase())
          )
        : true;
      const matchesStatus = status && status !== "all" ? o.status === status : true;
      const matchesCreated = created ? o.createdAt.startsWith(created) : true;
      return matchesQuery && matchesStatus && matchesCreated;
    });
  }, [orders, form.watch("query"), form.watch("status"), form.watch("created")]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // selection state for bulk actions
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allOnPageSelected = paginated.length > 0 && paginated.every((o) => selected.has(o.id));
  const toggleAllOnPage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      paginated.forEach((o) => (checked ? next.add(o.id) : next.delete(o.id)));
      return next;
    });
  };
  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const [bulkStatus, setBulkStatus] = useState<OrderStatus | null>(null);
  const applyBulkStatus = () => {
    if (!bulkStatus || selected.size === 0) return;
    setOrders((prev) => prev.map((o) => (selected.has(o.id) ? { ...o, status: bulkStatus } : o)));
    setSelected(new Set());
  };

  function handleDelete(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Review and manage customer orders.</CardDescription>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters</span>
          </div>
          <form onSubmit={form.handleSubmit(() => undefined)} className="flex flex-1 md:flex-none items-center gap-2">
            <Input
              placeholder="Search id, customer, phone"
              {...form.register("query")}
              className="md:w-[260px]"
            />
            <Input
              type="date"
              {...form.register("created")}
              className="md:w-[180px]"
            />
            <Select value={form.watch("status") ?? "all"} onValueChange={(v) => form.setValue("status", v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Order Received">Order Received</SelectItem>
                <SelectItem value="Sent to Lab">Sent to Lab</SelectItem>
                <SelectItem value="Ready - Lab">Ready - Lab</SelectItem>
                <SelectItem value="Uncuts - Lab">Uncuts - Lab</SelectItem>
                <SelectItem value="Patient Notified">Patient Notified</SelectItem>
                <SelectItem value="Collected with Case">Collected with Case</SelectItem>
                <SelectItem value="Collected without Case">Collected without Case</SelectItem>
              </SelectContent>
            </Select>
          </form>
          <div className="flex items-center gap-2 md:ml-auto">
            <Select value={bulkStatus ?? undefined} onValueChange={(v) => setBulkStatus(v as OrderStatus)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Bulk set status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Order Received">Order Received</SelectItem>
                <SelectItem value="Sent to Lab">Sent to Lab</SelectItem>
                <SelectItem value="Ready - Lab">Ready - Lab</SelectItem>
                <SelectItem value="Uncuts - Lab">Uncuts - Lab</SelectItem>
                <SelectItem value="Patient Notified">Patient Notified</SelectItem>
                <SelectItem value="Collected with Case">Collected with Case</SelectItem>
                <SelectItem value="Collected without Case">Collected without Case</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={applyBulkStatus} disabled={!bulkStatus || selected.size === 0}>Apply</Button>
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
                <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[46px]">
                  <Checkbox checked={allOnPageSelected} onCheckedChange={(v) => toggleAllOnPage(Boolean(v))} aria-label="Select all on page" />
                </TableHead>
                <TableHead className="w-[160px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-[160px]">Status</TableHead>
                <TableHead className="w-[160px]">Created</TableHead>
                <TableHead className="w-[140px]" style={{textAlign:"right"}}>Total</TableHead>
                <TableHead className="w-[120px]" style={{textAlign:"right"}}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                                        <TableCell>
                      <Checkbox checked={selected.has(order.id)} onCheckedChange={(v) => toggleOne(order.id, Boolean(v))} aria-label={`Select ${order.id}`} />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer.phone ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      {currencyFormat(order.total, order.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Order {order.id}</DialogTitle>
                              <DialogDescription>Full order details</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] pr-4">
                              <OrderDetails order={order} />
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete order {order.id}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the order
                                and its data from your system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(order.id)}>
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

