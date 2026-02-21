import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DataTable } from '../components/DataTable';

const drivers = [
  { name: 'John Martinez', license: 'DL-4523-8901', expiry: '2027-06-15', completionRate: '98%', safetyScore: '9.5/10', complaints: '0' },
  { name: 'Sarah Chen', license: 'DL-6721-3456', expiry: '2026-11-22', completionRate: '95%', safetyScore: '9.2/10', complaints: '1' },
  { name: 'Michael Brown', license: 'DL-8934-5678', expiry: '2027-03-10', completionRate: '97%', safetyScore: '9.4/10', complaints: '0' },
  { name: 'Emma Wilson', license: 'DL-2145-7890', expiry: '2026-08-05', completionRate: '93%', safetyScore: '8.9/10', complaints: '2' },
  { name: 'David Kim', license: 'DL-5678-2341', expiry: '2027-12-18', completionRate: '99%', safetyScore: '9.8/10', complaints: '0' },
];

const columns = [
  { key: 'name', label: 'Name', width: '20%' },
  { key: 'license', label: 'License #', width: '18%' },
  { key: 'expiry', label: 'Expiry', width: '15%' },
  { key: 'completionRate', label: 'Completion Rate', width: '15%' },
  { key: 'safetyScore', label: 'Safety Score', width: '15%' },
  { key: 'complaints', label: 'Complaints', width: '12%' },
];

export function DriversPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Total Drivers</p>
          <p className="text-3xl font-bold text-foreground">127</p>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Active Today</p>
          <p className="text-3xl font-bold text-[#22C55E]">89</p>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Avg Safety Score</p>
          <p className="text-3xl font-bold text-foreground">9.3/10</p>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Expiring Soon</p>
          <p className="text-3xl font-bold text-[#FACC15]">3</p>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" className="bg-card border-border text-foreground hover:bg-secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" className="bg-card border-border text-foreground hover:bg-secondary">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Sort
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Driver Performance & Safety</h2>
        <p className="text-sm text-muted-foreground">Monitor driver metrics and compliance</p>
      </div>

      {/* Drivers Table */}
      <DataTable
        columns={columns}
        data={drivers}
        renderCell={(column, row) => {
          if (column.key === 'safetyScore') {
            const score = parseFloat(row.safetyScore);
            const color = score >= 9.5 ? 'text-[#22C55E]' : score >= 9.0 ? 'text-[#FACC15]' : 'text-foreground';
            return <span className={`font-semibold ${color}`}>{row.safetyScore}</span>;
          }
          if (column.key === 'complaints') {
            const count = parseInt(row.complaints);
            return (
              <span className={count === 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                {row.complaints}
              </span>
            );
          }
          if (column.key === 'completionRate') {
            const rate = parseInt(row.completionRate);
            const color = rate >= 98 ? 'text-[#22C55E]' : rate >= 95 ? 'text-foreground' : 'text-[#FACC15]';
            return <span className={color}>{row.completionRate}</span>;
          }
          return row[column.key];
        }}
      />
    </div>
  );
}
