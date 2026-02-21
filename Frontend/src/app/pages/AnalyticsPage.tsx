import { DollarSign, TrendingUp, Fuel } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { useTheme } from '../context/ThemeContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fuelEfficiencyData = [
  { month: 'Aug', efficiency: 8.2 },
  { month: 'Sep', efficiency: 8.5 },
  { month: 'Oct', efficiency: 8.3 },
  { month: 'Nov', efficiency: 8.7 },
  { month: 'Dec', efficiency: 8.9 },
  { month: 'Jan', efficiency: 9.1 },
  { month: 'Feb', efficiency: 9.3 },
];

const topCostlyVehicles = [
  { vehicle: 'TRK-5023', cost: 4200 },
  { vehicle: 'VAN-3012', cost: 3800 },
  { vehicle: 'TRK-6145', cost: 3600 },
  { vehicle: 'TRK-7321', cost: 3400 },
  { vehicle: 'VAN-2098', cost: 3100 },
];

const financialData = [
  { month: 'October', revenue: '$45,200', fuelCost: '$8,450', maintenance: '$3,200', netProfit: '$33,550' },
  { month: 'November', revenue: '$48,900', fuelCost: '$8,900', maintenance: '$2,800', netProfit: '$37,200' },
  { month: 'December', revenue: '$52,100', fuelCost: '$9,200', maintenance: '$3,500', netProfit: '$39,400' },
  { month: 'January', revenue: '$49,500', fuelCost: '$8,700', maintenance: '$2,900', netProfit: '$37,900' },
  { month: 'February', revenue: '$51,800', fuelCost: '$9,100', maintenance: '$3,100', netProfit: '$39,600' },
];

const columns = [
  { key: 'month', label: 'Month', width: '20%' },
  { key: 'revenue', label: 'Revenue', width: '20%' },
  { key: 'fuelCost', label: 'Fuel Cost', width: '20%' },
  { key: 'maintenance', label: 'Maintenance', width: '20%' },
  { key: 'netProfit', label: 'Net Profit', width: '20%' },
];

export function AnalyticsPage() {
  const { theme } = useTheme();

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#18181B' : '#FFFFFF',
    border: `1px solid ${theme === 'dark' ? '#27272A' : '#E2E8F0'}`,
    borderRadius: '8px',
    color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
  };

  const gridStroke = theme === 'dark' ? '#27272A' : '#E2E8F0';
  const axisStroke = theme === 'dark' ? '#A1A1AA' : '#64748B';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Fuel Cost"
          value="$48,340"
          icon={Fuel}
          trend={{ value: '8% from last month', positive: false }}
          color="yellow"
        />
        <StatCard
          title="Fleet ROI"
          value="142%"
          icon={TrendingUp}
          trend={{ value: '12% increase', positive: true }}
          color="green"
        />
        <StatCard
          title="Utilization Rate"
          value="87%"
          icon={DollarSign}
          trend={{ value: '5% from target', positive: true }}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency Trend */}
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">Fuel Efficiency Trend (km/L)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fuelEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" stroke={axisStroke} />
              <YAxis stroke={axisStroke} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ fill: '#22C55E', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Costly Vehicles */}
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Costliest Vehicles</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCostlyVehicles}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="vehicle" stroke={axisStroke} />
              <YAxis stroke={axisStroke} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="cost" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Reports */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Financial Reports</h2>
          <p className="text-sm text-muted-foreground">Monthly revenue and cost breakdown</p>
        </div>

        <DataTable
          columns={columns}
          data={financialData}
          renderCell={(column, row) => {
            if (column.key === 'netProfit') {
              return <span className="text-[#22C55E] font-semibold">{row[column.key]}</span>;
            }
            if (column.key === 'fuelCost' || column.key === 'maintenance') {
              return <span className="text-[#EF4444]">{row[column.key]}</span>;
            }
            if (column.key === 'revenue') {
              return <span className="text-foreground font-semibold">{row[column.key]}</span>;
            }
            return row[column.key];
          }}
        />
      </div>
    </div>
  );
}
