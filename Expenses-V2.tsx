import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export default function PettyCashForm() {
  const [form, setForm] = useState({
    date: "",
    category: "",
    payeeName: "",
    payeeSignature: "",
    authorisedBy: "",
    authorisedByOther: "",
    expenses: [{ description: "", amount: "" }],
    uploadedFiles: [],
  });

  const [showSignature, setShowSignature] = useState(false);
  const sigPadRef = useRef(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, date: today }));
  }, []);

  const saveSignature = () => {
    if (sigPadRef.current) {
      const dataURL = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");
      setForm((prev) => ({ ...prev, payeeSignature: dataURL }));
    }
  };

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setForm((prev) => ({ ...prev, payeeSignature: "" }));
    }
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...form.expenses];
    updatedExpenses[index][field] = value;
    setForm({ ...form, expenses: updatedExpenses });
  };

  const addExpense = () => {
    setForm({ ...form, expenses: [...form.expenses, { description: "", amount: "" }] });
  };

  const removeExpense = (index) => {
    setForm((prev) => {
      const updated = [...prev.expenses];
      updated.splice(index, 1);
      return { ...prev, expenses: updated };
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setForm((prev) => {
      const combined = [...prev.uploadedFiles, ...files];
      const seen = new Set();
      const deduped = [];
      for (const f of combined) {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(f);
        }
      }
      return { ...prev, uploadedFiles: deduped };
    });
    e.target.value = "";
  };

  const removeFile = (index) => {
    setForm((prev) => {
      const updated = [...prev.uploadedFiles];
      updated.splice(index, 1);
      return { ...prev, uploadedFiles: updated };
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold">Expense</h2>

          <label className="block font-medium">Date</label>
          <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />

          <label className="block font-medium">Category</label>
          <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Office Supplies">Office Supplies</SelectItem>
              <SelectItem value="Staff Amenities">Staff Amenities</SelectItem>
              <SelectItem value="Cleaning & Hygiene">Cleaning & Hygiene</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Travel & Parking">Travel & Parking</SelectItem>
              <SelectItem value="Postage & Courier">Postage & Courier</SelectItem>
              <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>

          <label className="block font-medium">Payee Name</label>
          <Input value={form.payeeName} onChange={e => setForm({ ...form, payeeName: e.target.value })} />

          <label className="block font-medium cursor-pointer text-blue-600" onClick={() => setShowSignature(!showSignature)}>
            Payee Signature {showSignature ? "▲" : "▼"}
          </label>
          {showSignature && (
            <div className="space-y-2">
              <SignatureCanvas
                ref={sigPadRef}
                penColor="black"
                canvasProps={{ className: "border w-full h-32 bg-white" }}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={saveSignature}>Save</Button>
                <Button type="button" variant="destructive" onClick={clearSignature}>Clear</Button>
              </div>
              {form.payeeSignature && (
                <img src={form.payeeSignature} alt="Payee Signature" className="border mt-2 max-h-32" />
              )}
            </div>
          )}

          <label className="block font-medium">Authorised By</label>
          <Select value={form.authorisedBy} onValueChange={(value) => setForm({ ...form, authorisedBy: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Authorised Person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mr. Oscar Mazvarirwofa">Mr. Oscar Mazvarirwofa</SelectItem>
              <SelectItem value="Auntie Emma">Auntie Emma</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {form.authorisedBy === "Other" && (
            <Input placeholder="Specify Other" value={form.authorisedByOther} onChange={e => setForm({ ...form, authorisedByOther: e.target.value })} />
          )}

          <label className="block font-medium">Expenses</label>
          <div className="space-y-2">
            {form.expenses.map((expense, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input className="flex-1" placeholder="Description" value={expense.description} onChange={e => handleExpenseChange(index, "description", e.target.value)} />
                <Input type="number" className="w-32" placeholder="Amount" value={expense.amount} onChange={e => handleExpenseChange(index, "amount", e.target.value)} />
                <Trash2 className="h-5 w-5 text-red-500 cursor-pointer" onClick={() => removeExpense(index)} />
              </div>
            ))}
            <Button variant="outline" onClick={addExpense}>+ Add Item</Button>
          </div>

          <label className="block font-medium mt-4">Upload Attachments</label>
          <Input type="file" multiple onChange={handleFileUpload} />
          {form.uploadedFiles.length > 0 && (
            <ul className="space-y-2">
              {form.uploadedFiles.map((file, idx) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 border rounded-lg p-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeFile(idx)}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

