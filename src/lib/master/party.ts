// lib/master/party.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BASE = `${API_URL}/party`;

export interface Party {
  party_id?: number;
  party_type?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string | null;
  contact_number?: string;
  email?: string;
  address?: string;
  national_id?: string;
  ssn?: string;
  version?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
  updated_at?: string | null;
  is_active?: boolean;
  // extra fields requested by UI
  effective_start_date?: string | null;
  effective_end_date?: string | null;
  status?: string;
  deleted_by?: string | null;
}

export async function getParties(): Promise<Party[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch parties');
  const json = await res.json();
  if (!Array.isArray(json.data)) throw new Error('Invalid response format');
  return json.data;
}

export async function createParty(payload: Party): Promise<Party> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create party');
  const json = await res.json();
  return json.data;
}

export async function updateParty(id: number, payload: Partial<Party>): Promise<Party> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update party');
  const json = await res.json();
  return json.data;
}

export async function deleteParty(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete party');
}