/**
 * FleetFlow API Service Layer
 * Central module for all backend API calls.
 * Uses JWT token from localStorage for authentication.
 */

const BASE = '/api';

// ── Token Management ──────────────────────────────────────
function getToken(): string {
  return localStorage.getItem('fleetflow_token') || '';
}

function setToken(token: string) {
  localStorage.setItem('fleetflow_token', token);
}

function clearToken() {
  localStorage.removeItem('fleetflow_token');
  localStorage.removeItem('fleetflow_user');
  localStorage.removeItem('fleetflow_role');
}

function getStoredUser(): { id: number; name: string; email: string; role: string } | null {
  const raw = localStorage.getItem('fleetflow_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function setStoredUser(user: { id: number; name: string; email: string; role: string }) {
  localStorage.setItem('fleetflow_user', JSON.stringify(user));
  localStorage.setItem('fleetflow_role', user.role);
}

export function setRole(role: string) {
  localStorage.setItem('fleetflow_role', role);
}

export function getStoredRole(): string {
  return localStorage.getItem('fleetflow_role') || '';
}

// ── HTTP Request Helper ──────────────────────────────────────
async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Attach JWT token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Fallback: attach role header for backward compat
  const role = getStoredRole();
  if (role) headers['x-role'] = role;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // For CSV export, return text
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    const text = await res.text();
    if (!res.ok) throw new ApiError(res.status, text);
    return text as unknown as T;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Auto-logout on 401
    if (res.status === 401) {
      clearToken();
    }
    throw new ApiError(res.status, data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ── Auth ──────────────────────────────────────
export const auth = {
  signup: async (data: { name: string; email: string; password: string; role: string }) => {
    const result = await request<{ token: string; user: any }>('POST', '/auth/signup', data);
    setToken(result.token);
    setStoredUser(result.user);
    return result;
  },
  login: async (data: { email: string; password: string }) => {
    const result = await request<{ token: string; user: any }>('POST', '/auth/login', data);
    setToken(result.token);
    setStoredUser(result.user);
    return result;
  },
  me: async () => {
    const result = await request<{ user: any }>('GET', '/auth/me');
    setStoredUser(result.user);
    return result;
  },
  logout: () => {
    clearToken();
  },
  getStoredUser,
  isLoggedIn: () => !!getToken(),
};

// ── Vehicles ──────────────────────────────────────
export const vehicles = {
  list: (filters?: { type?: string; status?: string; region?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.region) params.set('region', filters.region);
    const qs = params.toString();
    return request('GET', `/vehicles${qs ? '?' + qs : ''}`);
  },
  get: (id: number) => request('GET', `/vehicles/${id}`),
  create: (data: { model: string; type?: string; license_plate: string; max_capacity: number; odometer?: number; acquisition_cost?: number; region_id?: number }) =>
    request('POST', '/vehicles', data),
  update: (id: number, data: any) => request('PUT', `/vehicles/${id}`, data),
  delete: (id: number) => request('DELETE', `/vehicles/${id}`),
};

// ── Drivers ──────────────────────────────────────
export const drivers = {
  list: () => request('GET', '/drivers'),
  get: (id: number) => request('GET', `/drivers/${id}`),
  create: (data: { name: string; license_type?: string; license_expiry: string; region_id?: number }) =>
    request('POST', '/drivers', data),
  update: (id: number, data: any) => request('PUT', `/drivers/${id}`, data),
  delete: (id: number) => request('DELETE', `/drivers/${id}`),
};

// ── Trips ──────────────────────────────────────
export const trips = {
  list: () => request('GET', '/trips'),
  get: (id: number) => request('GET', `/trips/${id}`),
  create: (data: { vehicle_id: number; driver_id: number; cargo_weight: number; start_location?: string; end_location?: string; revenue?: number; origin_region_id?: number; destination_region_id?: number }) =>
    request('POST', '/trips', data),
  dispatch: (id: number) => request('PATCH', `/trips/${id}/dispatch`),
  complete: (id: number, data: { end_odometer: number; revenue?: number }) =>
    request('PATCH', `/trips/${id}/complete`, data),
  cancel: (id: number) => request('PATCH', `/trips/${id}/cancel`),
};

// ── Fuel Logs ──────────────────────────────────────
export const fuel = {
  list: () => request('GET', '/fuel'),
  byVehicle: (vehicleId: number) => request('GET', `/fuel/vehicle/${vehicleId}`),
  create: (data: { vehicle_id: number; trip_id?: number; liters: number; cost: number; odometer_reading?: number; date?: string }) =>
    request('POST', '/fuel', data),
};

// ── Maintenance Logs ──────────────────────────────────────
export const maintenance = {
  list: () => request('GET', '/maintenance'),
  byVehicle: (vehicleId: number) => request('GET', `/maintenance/vehicle/${vehicleId}`),
  create: (data: { vehicle_id: number; description: string; cost: number; date?: string }) =>
    request('POST', '/maintenance', data),
};

// ── Analytics ──────────────────────────────────────
export const analytics = {
  summary: () => request('GET', '/analytics/summary'),
  vehicle: (id: number) => request('GET', `/analytics/vehicle/${id}`),
  driver: (id: number) => request('GET', `/analytics/driver/${id}`),
  vehicleHistory: (id: number) => request('GET', `/analytics/vehicle/${id}/history`),
  export: () => request('GET', '/analytics/export'),
  notifications: () => request('GET', '/analytics/notifications'),
};

// ── Regions ──────────────────────────────────────
export const regions = {
  list: () => request('GET', '/regions'),
};

// ── Admin (Super Admin only) ──────────────────────────────────────
export const admin = {
  stats: () => request('GET', '/admin/stats'),
  listUsers: () => request('GET', '/admin/users'),
  changeRole: (userId: number, role: string) => request('PUT', `/admin/users/${userId}/role`, { role }),
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    request('POST', '/admin/users', data),
  deleteUser: (userId: number) => request('DELETE', `/admin/users/${userId}`),
  listPermissions: (userId: number) => request('GET', `/admin/users/${userId}/permissions`),
  grantPermission: (userId: number, permission: string) =>
    request('POST', `/admin/users/${userId}/permissions`, { permission }),
  revokePermission: (userId: number, permId: number) =>
    request('DELETE', `/admin/users/${userId}/permissions/${permId}`),
};

// Default export
const api = { auth, vehicles, drivers, trips, fuel, maintenance, analytics, regions, admin, setRole, getStoredRole, ApiError };
export default api;
