import { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown, MoreVertical } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const vehicles = [
  { no: 1, plate: 'ABC-1234', model: 'Ford F-150', type: 'Truck', capacity: '2,000 kg', odometer: '45,230 km', status: 'available' },
  { no: 2, plate: 'XYZ-5678', model: 'Mercedes Sprinter', type: 'Van', capacity: '1,500 kg', odometer: '32,100 km', status: 'on-trip' },
  { no: 3, plate: 'DEF-9012', model: 'Toyota Hilux', type: 'Truck', capacity: '1,800 kg', odometer: '67,890 km', status: 'in-shop' },
  { no: 4, plate: 'GHI-3456', model: 'Ford Transit', type: 'Van', capacity: '1,200 kg', odometer: '28,450 km', status: 'available' },
  { no: 5, plate: 'JKL-7890', model: 'Isuzu D-Max', type: 'Truck', capacity: '2,200 kg', odometer: '54,320 km', status: 'on-trip' },
];

const columns = [
  { key: 'no', label: 'No', width: '8%' },
  { key: 'plate', label: 'Plate', width: '15%' },
  { key: 'model', label: 'Model', width: '20%' },
  { key: 'type', label: 'Type', width: '12%' },
  { key: 'capacity', label: 'Capacity', width: '15%' },
  { key: 'odometer', label: 'Odometer', width: '15%' },
  { key: 'status', label: 'Status', width: '10%' },
  { key: 'actions', label: 'Actions', width: '5%' },
];

export function VehicleRegistryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    type: '',
    capacity: '',
    odometer: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setFormData({ plate: '', model: '', type: '', capacity: '', odometer: '' });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
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

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">New Vehicle Registration</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  License Plate
                </label>
                <Input
                  placeholder="e.g., ABC-1234"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Model
                </label>
                <Input
                  placeholder="e.g., Ford F-150"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="trailer">Trailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Payload
                </label>
                <Input
                  placeholder="e.g., 2,000 kg"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Initial Odometer
                </label>
                <Input
                  placeholder="e.g., 45,230 km"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Save Vehicle
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

      {/* Vehicles Table */}
      <DataTable
        columns={columns}
        data={vehicles}
        renderCell={(column, row) => {
          if (column.key === 'status') {
            return <StatusBadge status={row.status as any} />;
          }
          if (column.key === 'actions') {
            return (
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            );
          }
          return row[column.key];
        }}
      />
    </div>
  );
}
