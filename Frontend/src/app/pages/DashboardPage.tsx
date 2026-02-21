import { Truck, AlertTriangle, TrendingUp, Navigation } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';

const recentTrips = [
  { id: 'TRP-2401', vehicle: 'TRK-5023', driver: 'John Martinez', status: 'completed' },
  { id: 'TRP-2402', vehicle: 'VAN-3012', driver: 'Sarah Chen', status: 'on-trip' },
  { id: 'TRP-2403', vehicle: 'TRK-6145', driver: 'Michael Brown', status: 'on-trip' },
  { id: 'TRP-2404', vehicle: 'VAN-2098', driver: 'Emma Wilson', status: 'pending' },
  { id: 'TRP-2405', vehicle: 'TRK-7321', driver: 'David Kim', status: 'completed' },
];

const columns = [
  { key: 'id', label: 'Trip ID', width: '20%' },
  { key: 'vehicle', label: 'Vehicle', width: '20%' },
  { key: 'driver', label: 'Driver', width: '30%' },
  { key: 'status', label: 'Status', width: '30%' },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Fleet"
          value="247"
          icon={Truck}
          trend={{ value: '12% from last month', positive: true }}
          color="green"
        />
        <StatCard
          title="Maintenance Alerts"
          value="18"
          icon={AlertTriangle}
          trend={{ value: '3 critical', positive: false }}
          color="yellow"
        />
        <StatCard
          title="Utilization Rate"
          value="87%"
          icon={TrendingUp}
          trend={{ value: '5% increase', positive: true }}
          color="blue"
        />
      </div>

      {/* Recent Trips Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recent Trips</h2>
            <p className="text-sm text-muted-foreground">Latest trip activity across your fleet</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={recentTrips}
          renderCell={(column, row) => {
            if (column.key === 'status') {
              return <StatusBadge status={row.status as any} />;
            }
            return row[column.key];
          }}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Active Trips</h3>
              <p className="text-sm text-muted-foreground">Currently in progress</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">34</p>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Available Vehicles</h3>
              <p className="text-sm text-muted-foreground">Ready for dispatch</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">156</p>
        </div>
      </div>
    </div>
  );
}
