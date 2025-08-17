import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ShiftCreatorForm() {
  const [shifts, setShifts] = useState([
    { name: '', color: '#000000', startTime: '09:00', endTime: '17:00' },
  ]);

  const handleShiftChange = (index, field, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index][field] = value;
    setShifts(updatedShifts);
  };

  const addShift = () => {
    setShifts([...shifts, { name: '', color: '#000000', startTime: '09:00', endTime: '17:00' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const shiftData = {
      shifts,
    };
    console.log('Shift Schedule Created:', shiftData);
    alert('Shifts created! Check console for details.');
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-2xl font-bold">Create Shift Schedule</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {shifts.map((shift, index) => (
              <div key={index} className="border rounded-xl p-4 space-y-4">
                <h4 className="font-semibold">Shift {index + 1}</h4>
                <div>
                  <Label htmlFor={`name-${index}`}>Shift Name</Label>
                  <Input
                    id={`name-${index}`}
                    type="text"
                    value={shift.name}
                    onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
                    placeholder="Morning Shift"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`color-${index}`}>Color Code</Label>
                  <Input
                    id={`color-${index}`}
                    type="color"
                    value={shift.color}
                    onChange={(e) => handleShiftChange(index, 'color', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`start-${index}`}>Start Time</Label>
                    <Input
                      id={`start-${index}`}
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${index}`}>End Time</Label>
                    <Input
                      id={`end-${index}`}
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" onClick={addShift} variant="outline">
              + Add Another Shift
            </Button>

            <Button type="submit" className="w-full">
              Create Shift Schedule
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

