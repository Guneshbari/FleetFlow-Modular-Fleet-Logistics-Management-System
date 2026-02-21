import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const maintenanceLogs = [
  { id: 'LOG-001', vehicle: 'TRK-5023', issue: 'Oil Change', date: '2026-02-15', cost: '$120', status: 'completed' },
  { id: 'LOG-002', vehicle: 'VAN-3012', issue: 'Brake Replacement', date: '2026-02-18', cost: '$450', status: 'pending' },
  { id: 'LOG-003', vehicle: 'TRK-6145', issue: 'Tire Rotation', date: '2026-02-10', cost: '$80', status: 'completed' },
  { id: 'LOG-004', vehicle: 'VAN-2098', issue: 'Engine Check', date: '2026-02-20', cost: '$200', status: 'on-trip' },
  { id: 'LOG-005', vehicle: 'TRK-7321', issue: 'Battery Replacement', date: '2026-02-12', cost: '$180', status: 'completed' },
];

const columns = [
  { key: 'id', label: 'Log ID', width: '15%' },
  { key: 'vehicle', label: 'Vehicle', width: '15%' },
  { key: 'issue', label: 'Issue/Service', width: '25%' },
  { key: 'date', label: 'Date', width: '15%' },
  { key: 'cost', label: 'Cost', width: '15%' },
  { key: 'status', label: 'Status', width: '15%' },
];

export function MaintenancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    issue: '',
    date: '',
    cost: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setFormData({ vehicle: '', issue: '', date: '', cost: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Maintenance & Service Logs</h2>
          <p className="text-sm text-muted-foreground">Track vehicle maintenance and repairs</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Service Log
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Service Log</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vehicle
                </label>
                <Select value={formData.vehicle} onValueChange={(value) => setFormData({ ...formData, vehicle: value })}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="TRK-5023">TRK-5023 - Ford F-150</SelectItem>
                    <SelectItem value="VAN-3012">VAN-3012 - Mercedes Sprinter</SelectItem>
                    <SelectItem value="TRK-6145">TRK-6145 - Toyota Hilux</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Issue/Service Description
                </label>
                <Input
                  placeholder="e.g., Oil Change, Brake Replacement"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Service Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cost ($)
                </label>
                <Input
                  placeholder="e.g., 120"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Log
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-transparent border-border text-foreground hover:bg-secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Maintenance Table */}
      <DataTable
        columns={columns}
        data={maintenanceLogs}
        renderCell={(column, row) => {
          if (column.key === 'status') {
            return <StatusBadge status={row.status as any} />;
          }
          return row[column.key];
        }}
      />
    </div>
  );
}
