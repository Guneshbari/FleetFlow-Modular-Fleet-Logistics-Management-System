import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Fuel, Loader2, Truck, Users, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { useTheme } from '../context/ThemeContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export function AnalyticsPage() {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, vehiclesData] = await Promise.all([
          api.analytics.summary().catch(() => null),
          api.vehicles.list().catch(() => []),
        ]);
        setSummary(summaryData);
        const vList = Array.isArray(vehiclesData) ? vehiclesData : [];
        setVehicles(vList);
        if (vList.length > 0) {
          setSelectedVehicleId(vList[0].id);
        }
      } catch (e) {
        console.error('Analytics load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Fetch vehicle history when selected vehicle changes
  useEffect(() => {
    if (!selectedVehicleId) return;
    api.analytics.vehicleHistory(selectedVehicleId)
      .then(data => setVehicleHistory(data))
      .catch(() => setVehicleHistory(null));
  }, [selectedVehicleId]);

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#18181B' : '#FFFFFF',
    border: `1px solid ${theme === 'dark' ? '#27272A' : '#E2E8F0'}`,
    borderRadius: '8px',
    color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
  };

  const gridStroke = theme === 'dark' ? '#27272A' : '#E2E8F0';
  const axisStroke = theme === 'dark' ? '#A1A1AA' : '#64748B';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Map data from the updated backend response
  const kpis = summary?.kpis || {};
  const totalRevenue = summary?.revenue || 0;
  const fuelCost = summary?.costs?.fuel_cost || 0;
  const maintenanceCost = summary?.costs?.maintenance_cost || 0;
  const totalCost = summary?.costs?.total_operational_cost || 0;
  const profit = summary?.profit || 0;
  const utilization = kpis.utilization_rate_percent ?? 0;
  const completedTrips = kpis.completed_trips || 0;
  const totalVehicles = kpis.total_vehicles || 0;
  const onTrip = kpis.on_trip || 0;
  const totalDrivers = kpis.total_drivers || 0;

  // Fleet-wide monthly revenue trend
  const monthlyRevenueData = summary?.monthly_revenue?.map((m: any) => ({
    month: m.month,
    revenue: m.revenue,
    trips: m.trips,
  })) || [];

  // Vehicle-specific revenue trend
  const vehicleRevenueData = vehicleHistory?.monthly_revenue?.map((m: any) => ({
    month: m.month,
    revenue: m.revenue,
  })) || [];

  // Regional utilization for bar chart
  const regionalData = summary?.regional_metrics?.utilization?.map((r: any) => ({
    region: r.region,
    utilization: r.utilization_rate_percent || 0,
    vehicles: r.total_vehicles || 0,
  })) || [];

  // Financial report table
  const financialColumns = [
    { key: 'metric', label: 'Metric', width: '40%' },
    { key: 'value', label: 'Value', width: '60%' },
  ];

  const financialData = [
    { metric: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
    { metric: 'Total Fuel Cost', value: `$${fuelCost.toLocaleString()}` },
    { metric: 'Total Maintenance Cost', value: `$${maintenanceCost.toLocaleString()}` },
    { metric: 'Total Operational Cost', value: `$${totalCost.toLocaleString()}` },
    { metric: 'Net Profit', value: `$${profit.toLocaleString()}` },
    { metric: 'Completed Trips', value: `${completedTrips}` },
    { metric: 'Active Vehicles', value: `${totalVehicles} (${onTrip} on trip)` },
    { metric: 'Fleet Utilization', value: `${utilization.toFixed(1)}%` },
    { metric: 'Total Drivers', value: `${totalDrivers}` },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const csvText = await api.analytics.export();
      const blob = new Blob([csvText as unknown as string], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleetflow-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analytics & Financial Reports</h2>
          <p className="text-sm text-muted-foreground">Track performance and ROI across the fleet</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => window.print()}
            className="bg-secondary hover:bg-muted text-foreground font-semibold"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DollarSign className="w-4 h-4 mr-2" />}
          Download CSV Report
        </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: `${completedTrips} completed trips`, positive: true }}
          color="green"
        />
        <StatCard
          title="Net Profit"
          value={`$${profit.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: `${((profit / (totalRevenue || 1)) * 100).toFixed(0)}% margin`, positive: profit > 0 }}
          color={profit > 0 ? 'green' : 'yellow'}
        />
        <StatCard
          title="Operational Costs"
          value={`$${totalCost.toLocaleString()}`}
          icon={Fuel}
          trend={{ value: `Fuel: $${fuelCost.toLocaleString()} | Maint: $${maintenanceCost.toLocaleString()}`, positive: false }}
          color="yellow"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${utilization.toFixed(1)}%`}
          icon={Truck}
          trend={{ value: `${onTrip} of ${totalVehicles} on trip`, positive: utilization > 10 }}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Monthly Revenue Trend */}
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Revenue Trend</h3>
          {monthlyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" stroke={axisStroke} />
                <YAxis stroke={axisStroke} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" fill="#22C55E" radius={[8, 8, 0, 0]} name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Regional Utilization */}
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">Regional Fleet Distribution</h3>
          {regionalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="region" stroke={axisStroke} />
                <YAxis stroke={axisStroke} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="vehicles" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Vehicles" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No regional data available
            </div>
          )}
        </div>
      </div>

      {/* Vehicle-Specific Revenue Trend */}
      <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Vehicle Revenue Trend</h3>
          <select
            value={selectedVehicleId || ''}
            onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
            className="text-sm bg-background border border-border rounded-md px-3 py-1.5 text-foreground"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.license_plate} — {v.model}</option>
            ))}
          </select>
        </div>
        {vehicleRevenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vehicleRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" stroke={axisStroke} />
              <YAxis stroke={axisStroke} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="revenue" stroke="#A855F7" strokeWidth={2} dot={{ fill: '#A855F7', r: 4 }} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No historical data for this vehicle
          </div>
        )}
      </div>

      {/* Financial Table */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Financial Overview</h2>
          <p className="text-sm text-muted-foreground">Key financial metrics from your fleet</p>
        </div>

        <DataTable
          columns={financialColumns}
          data={financialData}
          renderCell={(column, row) => {
            if (column.key === 'value') {
              if (row.metric.includes('Profit') || row.metric.includes('Revenue')) {
                return <span className="text-[#22C55E] font-semibold">{row.value}</span>;
              }
              if (row.metric.includes('Cost')) {
                return <span className="text-[#EF4444]">{row.value}</span>;
              }
              return <span className="font-semibold text-foreground">{row.value}</span>;
            }
            return row[column.key];
          }}
        />
      </div>
    </div>
  );
}
