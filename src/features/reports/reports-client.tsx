"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatDate, formatTime, formatDuration } from "@/lib/date";

export interface ReportRow {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  status: string;
  checkInAt?: string;
  checkOutAt?: string;
  workedMinutes: number;
}

export function ReportsClient({
  rows,
  departments,
}: {
  rows: ReportRow[];
  departments: { id: string; name: string }[];
}) {
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (dept && r.department !== dept) return false;
      if (status && r.status !== status) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      return true;
    });
  }, [rows, dept, status, from, to]);

  function exportExcel() {
    const data = filtered.map((r) => ({
      Employee: r.employeeName,
      Department: r.department,
      Date: r.date,
      Status: r.status,
      "Check In": formatTime(r.checkInAt),
      "Check Out": formatTime(r.checkOutAt),
      Worked: formatDuration(r.workedMinutes),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="">All</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="early-exit">Early Exit</option>
                <option value="absent">Absent</option>
                <option value="leave">On Leave</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={exportExcel} className="flex-1">
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </Button>
              <Button variant="outline" onClick={() => window.print()} className="flex-1">
                <Printer className="h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Report
            <span className="tabular ml-2 text-sm font-normal text-muted-foreground">
              ({filtered.length} records)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No records match your filters" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Check In</th>
                    <th className="px-4 py-3 font-medium">Check Out</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{r.employeeName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.department}</td>
                      <td className="px-4 py-3">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">{formatTime(r.checkInAt)}</td>
                      <td className="px-4 py-3">{formatTime(r.checkOutAt)}</td>
                      <td className="px-4 py-3"><StatusBadge kind="attendance" value={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
