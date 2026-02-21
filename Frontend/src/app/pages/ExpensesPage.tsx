import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const expenses = [
  { tripId: 'TRP-2401', driver: 'John Martinez', distance: '245 km', fuel: '$120', misc: '$35', status: 'completed' },
  { tripId: 'TRP-2402', driver: 'Sarah Chen', distance: '182 km', fuel: '$95', misc: '$20', status: 'on-trip' },
  { tripId: 'TRP-2403', driver: 'Michael Brown', distance: '320 km', fuel: '$165', misc: '$50', status: 'completed' },
  { tripId: 'TRP-2404', driver: 'Emma Wilson', distance: '156 km', fuel: '$80', misc: '$15', status: 'pending' },
  { tripId: 'TRP-2405', driver: 'David Kim', distance: '278 km', fuel: '$140', misc: '$40', status: 'on-trip' },
];

const columns = [
  { key: 'tripId', label: 'Trip ID', width: '15%' },
  { key: 'driver', label: 'Driver', width: '20%' },
  { key: 'distance', label: 'Distance', width: '15%' },
  { key: 'fuel', label: 'Fuel Expense', width: '15%' },
  { key: 'misc', label: 'Misc Expense', width: '15%' },
  { key: 'status', label: 'Status', width: '20%' },
];

export function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tripId: '',
    driver: '',
    fuelCost: '',
    miscExpense: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setFormData({ tripId: '', driver: '', fuelCost: '', miscExpense: '' });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Fuel Costs</p>
              <p className="text-2xl font-bold text-foreground">$8,450</p>
              <p className="text-xs text-[#22C55E] mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-[#FACC15]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#FACC15]" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Misc Expenses</p>
              <p className="text-2xl font-bold text-foreground">$1,230</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">$9,680</p>
              <p className="text-xs text-[#EF4444] mt-1">+8% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#EF4444]" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Trip & Expense Logging</h2>
          <p className="text-sm text-muted-foreground">Record fuel and operational expenses</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Trip ID
                </label>
                <Select value={formData.tripId} onValueChange={(value) => setFormData({ ...formData, tripId: value })}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select trip" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="TRP-2401">TRP-2401</SelectItem>
                    <SelectItem value="TRP-2402">TRP-2402</SelectItem>
                    <SelectItem value="TRP-2403">TRP-2403</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Driver
                </label>
                <Input
                  placeholder="Driver name"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fuel Cost ($)
                </label>
                <Input
                  placeholder="e.g., 120"
                  value={formData.fuelCost}
                  onChange={(e) => setFormData({ ...formData, fuelCost: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Misc Expense ($)
                </label>
                <Input
                  placeholder="e.g., 35"
                  value={formData.miscExpense}
                  onChange={(e) => setFormData({ ...formData, miscExpense: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Expense
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

      {/* Expenses Table */}
      <DataTable
        columns={columns}
        data={expenses}
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
