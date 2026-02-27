import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';

const columns = [
  { key: 'id', label: 'ID', width: '6%' },
  { key: 'name', label: 'Name', width: '16%' },
  { key: 'license_type', label: 'License', width: '10%' },
  { key: 'license_expiry', label: 'Expiry', width: '13%' },
  { key: 'status', label: 'Status', width: '11%' },
  { key: 'completion_rate', label: 'Completion %', width: '11%' },
  { key: 'safety_score', label: 'Safety Score', width: '10%' },
  { key: 'license_valid', label: 'License Valid', width: '10%' },
  { key: 'actions', label: '', width: '13%' },
];

export function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driverAnalytics, setDriverAnalytics] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrivers = async () => {
    try {
      const driversData = await api.drivers.list().catch(() => []);
      const driversList = Array.isArray(driversData) ? driversData : [];
      setDrivers(driversList);

      // Fetch analytics for each driver (Manager only)
      const analyticsMap: Record<number, any> = {};
      await Promise.all(
        driversList.map(async (d: any) => {
          try {
            const analytics = await api.analytics.driver(d.id);
            analyticsMap[d.id] = analytics;
          } catch {
            // Dispatcher can't access analytics — that's OK
          }
        })
      );
      setDriverAnalytics(analyticsMap);
    } catch (e) {
      console.error('Failed to load drivers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compute stats
  const totalDrivers = drivers.length;
  const onDuty = drivers.filter(d => d.status === 'OnDuty').length;
  const onTrip = drivers.filter(d => d.status === 'OnTrip').length;
  const activeToday = onDuty + onTrip;

  const allScores = Object.values(driverAnalytics)
    .map((a: any) => a?.performance?.safety_score)
    .filter((s: any) => typeof s === 'number');
  const avgSafety = allScores.length > 0
    ? (allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length).toFixed(1)
    : '—';

  const today = new Date();
  const sixMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
  const expiringSoon = drivers.filter(d => {
    if (!d.license_expiry) return false;
    const exp = new Date(d.license_expiry);
    return exp <= sixMonthsFromNow && exp >= today;
  }).length;

  const filtered = drivers.filter(d =>
    !searchQuery || d.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Total Drivers</p>
          <p className="text-3xl font-bold text-foreground">{totalDrivers}</p>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Active Today</p>
          <p className="text-3xl font-bold text-[#22C55E]">{activeToday}</p>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Avg Safety Score</p>
          <p className="text-3xl font-bold text-foreground">{avgSafety}/100</p>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-6 transition-colors duration-300">
          <p className="text-sm text-muted-foreground mb-2">Expiring Soon</p>
          <p className="text-3xl font-bold text-[#FACC15]">{expiringSoon}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Driver Performance & Safety</h2>
        <p className="text-sm text-muted-foreground">Monitor driver metrics and compliance</p>
      </div>

      {/* Drivers Table */}
      <DataTable
        columns={columns}
        data={filtered.map(d => {
          const analytics = driverAnalytics[d.id];
          return {
            ...d,
            completion_rate: analytics?.performance?.completion_rate_percent ?? '—',
            safety_score: analytics?.performance?.safety_score ?? '—',
            license_valid: analytics?.compliance?.license_valid ?? (d.license_expiry && new Date(d.license_expiry) > today),
          };
        })}
        renderCell={(column, row) => {
          if (column.key === 'status') {
            return <StatusBadge status={row.status} />;
          }
          if (column.key === 'safety_score') {
            if (row.safety_score === '—') return '—';
            const s = Number(row.safety_score);
            const color = s >= 80 ? 'text-[#22C55E]' : s >= 60 ? 'text-[#FACC15]' : 'text-[#EF4444]';
            return <span className={`font-semibold ${color}`}>{s}/100</span>;
          }
          if (column.key === 'completion_rate') {
            if (row.completion_rate === '—') return '—';
            const r = Number(row.completion_rate);
            const color = r >= 95 ? 'text-[#22C55E]' : r >= 80 ? 'text-foreground' : 'text-[#FACC15]';
            return <span className={color}>{r.toFixed(0)}%</span>;
          }
          if (column.key === 'license_valid') {
            return row.license_valid ? (
              <span className="text-[#22C55E] font-medium">✓ Valid</span>
            ) : (
              <span className="text-[#EF4444] font-medium">✗ Expired</span>
            );
          }
          if (column.key === 'actions') {
            return (
              <div className="flex gap-1 justify-end">
                {row.status !== 'OnDuty' && row.status !== 'OnTrip' && (
                  <button
                    onClick={async () => {
                      await api.drivers.update(row.id, { status: 'OnDuty' });
                      await loadDrivers(); // Quick refresh for now
                    }}
                    className="text-xs px-2 py-1 rounded bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors"
                  >
                    On Duty
                  </button>
                )}
                {row.status !== 'OffDuty' && row.status !== 'OnTrip' && (
                  <button
                    onClick={async () => {
                      await api.drivers.update(row.id, { status: 'OffDuty' });
                      await loadDrivers();
                    }}
                    className="text-xs px-2 py-1 rounded bg-secondary text-foreground hover:bg-muted transition-colors"
                  >
                    Off Duty
                  </button>
                )}
                {row.status !== 'Suspended' && row.status !== 'OnTrip' && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to suspend driver ${row.name}?`)) return;
                      await api.drivers.update(row.id, { status: 'Suspended' });
                      await loadDrivers();
                    }}
                    className="text-xs px-2 py-1 rounded bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                  >
                    Suspend
                  </button>
                )}
              </div>
            );
          }
          return row[column.key] || '—';
        }}
      />
    </div>
  );
}
