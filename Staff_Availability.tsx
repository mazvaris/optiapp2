import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const initialRow = {
  name: "",
  role: "",
  availability: {
    Mon: "",
    Tue: "",
    Wed: "",
    Thu: "",
    Fri: "",
    Sat: "",
  },
};

export default function StaffAvailabilityForm() {
  const [rows, setRows] = useState([structuredClone(initialRow)]);

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    if (field in newRows[index]) {
      newRows[index][field] = value;
    } else {
      newRows[index].availability[field] = value;
    }
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, structuredClone(initialRow)]);
  };

  return (
    <Card className="p-4 max-w-6xl mx-auto mt-6">
      <CardContent>
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span>👥</span> Staff Availability Input
        </h2>
        <p className="text-sm mb-4">
          Please indicate available shifts for each staff member below.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-100 text-sm text-left">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Role</th>
                {days.map((day) => (
                  <th key={day} className="p-2 border">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">
                    <Input
                      value={row.name}
                      onChange={(e) => handleChange(idx, "name", e.target.value)}
                      placeholder="Name"
                    />
                  </td>
                  <td className="p-2 border">
                    <Input
                      value={row.role}
                      onChange={(e) => handleChange(idx, "role", e.target.value)}
                      placeholder="Role"
                    />
                  </td>
                  {days.map((day) => (
                    <td key={day} className="p-2 border">
                      <Input
                        value={row.availability[day]}
                        onChange={(e) => handleChange(idx, day, e.target.value)}
                        placeholder="Shift"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-4">
          <Button onClick={addRow}>Add Staff Member</Button>
          <Button variant="secondary" onClick={() => console.log(rows)}>
            Log Availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

