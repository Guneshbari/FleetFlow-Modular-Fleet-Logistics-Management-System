import { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const trips = [
  { id: 'TRP-2401', type: 'Truck', origin: 'New York, NY', destination: 'Boston, MA', status: 'completed' },
  { id: 'TRP-2402', type: 'Van', origin: 'Los Angeles, CA', destination: 'San Diego, CA', status: 'on-trip' },
  { id: 'TRP-2403', type: 'Truck', origin: 'Chicago, IL', destination: 'Detroit, MI', status: 'on-trip' },
  { id: 'TRP-2404', type: 'Van', origin: 'Houston, TX', destination: 'Austin, TX', status: 'pending' },
  { id: 'TRP-2405', type: 'Truck', origin: 'Phoenix, AZ', destination: 'Las Vegas, NV', status: 'on-trip' },
];

const columns = [
  { key: 'id', label: 'Trip ID', width: '15%' },
  { key: 'type', label: 'Fleet Type', width: '15%' },
  { key: 'origin', label: 'Origin', width: '25%' },
  { key: 'destination', label: 'Destination', width: '25%' },
  { key: 'status', label: 'Status', width: '20%' },
];

export function TripDispatcherPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: '',
    cargoWeight: '',
    origin: '',
    destination: '',
    fuelCost: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setFormData({ vehicle: '', driver: '', cargoWeight: '', origin: '', destination: '', fuelCost: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Active Trips</h2>
          <p className="text-sm text-muted-foreground">Manage and dispatch fleet trips</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Vehicle
                  </label>
                  <Select value={formData.vehicle} onValueChange={(value) => setFormData({ ...formData, vehicle: value })}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Choose vehicle" />
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
                    Select Driver
                  </label>
                  <Select value={formData.driver} onValueChange={(value) => setFormData({ ...formData, driver: value })}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Choose driver" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="john">John Martinez</SelectItem>
                      <SelectItem value="sarah">Sarah Chen</SelectItem>
                      <SelectItem value="michael">Michael Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cargo Weight (kg)
                </label>
                <Input
                  placeholder="e.g., 1,500"
                  value={formData.cargoWeight}
                  onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Origin Address
                </label>
                <Input
                  placeholder="e.g., 123 Main St, New York, NY"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Destination Address
                </label>
                <Input
                  placeholder="e.g., 456 Oak Ave, Boston, MA"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estimated Fuel Cost ($)
                </label>
                <Input
                  placeholder="e.g., 250"
                  value={formData.fuelCost}
                  onChange={(e) => setFormData({ ...formData, fuelCost: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Confirm & Dispatch
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

      {/* Trips Table */}
      <DataTable
        columns={columns}
        data={trips}
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
