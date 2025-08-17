import React from "react";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, Trash2, Calendar, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Attendance Log table for a given date.
 * Columns: Name, Time In, Time Out, Break
 * - Staff card pulls from STAFF (JSON) and populates the table on selection
 * - "Use Shop Times" checkbox fills all Time In/Out/Break from SHOP_TIMES (JSON)
 */

// --- Demo data (replace with API/DB later) ---
const STAFF = [
  { id: "s1", name: "Dr. Ndlovu" },
  { id: "s2", name: "Dr. Patel" },
  { id: "s3", name: "Ama – Optical Tech" },
  { id: "s4", name: "Tariro – Reception" },
  { id: "s5", name: "Kuda – Optometrist" },
];

const SHOP_TIMES = {
  timeIn: "08:00",
  timeOut: "17:00",
  breakDur: "00:30", // HH:MM
};

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Row = { id: number; staffId?: string; name: string; timeIn: string; timeOut: string; breakDur: string };

export default function AttendanceLogTable({ defaultDate }: { defaultDate?: string }) {
  const [date, setDate] = useState<string>(defaultDate || todayISO());
  const [nextId, setNextId] = useState(2);
  const [rows, setRows] = useState<Row[]>([{ id: 1, name: "", timeIn: "", timeOut: "", breakDur: "" }]);
  const [applyShopTimes, setApplyShopTimes] = useState<boolean>(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({}); // staffId -> checked

  // Map to quickly find row by staffId (for selected staff)
  const staffRowMap = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      if (r.staffId) map[r.staffId] = r.id;
    });
    return map;
  }, [rows]);

  const addRow = (partial?: Partial<Row>) => {
    setRows((r) => [...r, { id: nextId, name: "", timeIn: "", timeOut: "", breakDur: "", ...partial }]);
    setNextId((n) => n + 1);
  };

  const deleteRow = (id: number) => {
    setRows((r) => r.filter((row) => row.id !== id));
    // Also unselect staff if linked
    const linked = Object.entries(staffRowMap).find(([, rowId]) => rowId === id);
    if (linked) {
      const [staffId] = linked;
      setSelected((s) => ({ ...s, [staffId]: false }));
    }
  };

  const clearAll = () => {
    setRows([{ id: 1, name: "", timeIn: "", timeOut: "", breakDur: "" }]);
    setSelected({});
  };

  const updateRow = (id: number, key: keyof Row, value: string) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const applyDefaultsToAll = () => {
    setRows((r) =>
      r.map((row) => ({ ...row, timeIn: SHOP_TIMES.timeIn, timeOut: SHOP_TIMES.timeOut, breakDur: SHOP_TIMES.breakDur }))
    );
  };

  const removeDefaultsFromEmpty = () => {
    // When unchecking, we do not overwrite user-entered values; we only clear those that exactly match defaults
    setRows((r) =>
      r.map((row) => ({
        ...row,
        timeIn: row.timeIn === SHOP_TIMES.timeIn ? "" : row.timeIn,
        timeOut: row.timeOut === SHOP_TIMES.timeOut ? "" : row.timeOut,
        breakDur: row.breakDur === SHOP_TIMES.breakDur ? "" : row.breakDur,
      }))
    );
  };

  const toggleApplyShopTimes = (checked: boolean | string) => {
    const isChecked = Boolean(checked);
    setApplyShopTimes(isChecked);
    if (isChecked) applyDefaultsToAll();
    else removeDefaultsFromEmpty();
  };

  const onToggleStaff = (staffId: string, checked: boolean | string) => {
    const isChecked = Boolean(checked);
    setSelected((s) => ({ ...s, [staffId]: isChecked }));

    const staff = STAFF.find((s) => s.id === staffId)!;

    if (isChecked) {
      // If already has a row, do nothing
      const existingRowId = staffRowMap[staffId];
      if (existingRowId) return;
      addRow({
        staffId,
        name: staff.name,
        timeIn: applyShopTimes ? SHOP_TIMES.timeIn : "",
        timeOut: applyShopTimes ? SHOP_TIMES.timeOut : "",
        breakDur: applyShopTimes ? SHOP_TIMES.breakDur : "",
      });
    } else {
      // Remove their row if present
      const rowId = staffRowMap[staffId];
      if (rowId) {
        setRows((r) => r.filter((row) => row.id !== rowId));
      }
    }
  };

  const totals = useMemo(() => {
    const filled = rows.filter((r) => r.name || r.timeIn || r.timeOut || r.breakDur).length;
    return { count: rows.length, filled };
  }, [rows]);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Card */}
        <Card className="shadow-lg border rounded-2xl lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-xl">Staff</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Select staff to populate the attendance log.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STAFF.map((s) => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded-xl border hover:bg-muted/30">
                  <Checkbox
                    checked={Boolean(selected[s.id])}
                    onCheckedChange={(v) => onToggleStaff(s.id, v)}
                    aria-label={`Select ${s.name}`}
                  />
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="shadow-lg border rounded-2xl lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl sm:text-3xl">Attendance Log</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Record staff attendance for the selected date.</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Date</span>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[12.5rem]" />
              </label>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-muted-foreground">Rows: {totals.count} • Filled: {totals.filled}</div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={applyShopTimes} onCheckedChange={toggleApplyShopTimes} />
                  <span>Use Shop Times ({SHOP_TIMES.timeIn}–{SHOP_TIMES.timeOut}, break {SHOP_TIMES.breakDur})</span>
                </label>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => addRow()} className="rounded-2xl">
                    <Plus className="h-4 w-4 mr-1" /> Add Row
                  </Button>
                  <Button variant="ghost" onClick={clearAll} className="rounded-2xl">
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Name</TableHead>
                    <TableHead className="w-[20%]">Time In</TableHead>
                    <TableHead className="w-[20%]">Time Out</TableHead>
                    <TableHead className="w-[20%]">Break</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="border-b last:border-b-0"
                      >
                        <TableCell>
                          <Input
                            placeholder="e.g., Dr. Ndlovu"
                            value={row.name}
                            onChange={(e) => updateRow(row.id, "name", e.target.value)}
                            className="rounded-xl"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={row.timeIn}
                            onChange={(e) => updateRow(row.id, "timeIn", e.target.value)}
                            className="rounded-xl"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={row.timeOut}
                            onChange={(e) => updateRow(row.id, "timeOut", e.target.value)}
                            className="rounded-xl"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="HH:MM or minutes"
                            value={row.breakDur}
                            onChange={(e) => updateRow(row.id, "breakDur", e.target.value)}
                            className="rounded-xl"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete row"
                            onClick={() => deleteRow(row.id)}
                            className="rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

