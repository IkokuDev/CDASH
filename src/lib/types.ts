

export interface Asset {
    id: string;
    name: string;
    type: 'Software' | 'Hardware' | 'Connectivity' | 'Other';
    acquired: string;
    cost: number;
    currency: string;
    exchangeRate?: number;
    costInNaira?: number;
    status: 'Active' | 'Maintenance' | 'Decommissioned';
    summary: string;
    purpose: string;
    technicalDetails: string;
    subCategory: string;
    recurrentExpenditure?: number;
    recurrentCurrency?: string;
    recurrentExchangeRate?: number;
    recurrentInNaira?: number;
    aiSummary?: string;
    imageUrl?: string;
}

export interface Staff {
    id: string;
    name: string;
    position: string;
    joined: string;
    experience: string;
    salary: number | string;
    qualificationsScore: number;
    bio: string;
    avatar: string;
    role: string;
    email: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  organizationId?: string;
  role?: 'Admin' | 'Member';
}

export interface Organization {
  id: string;
  name: string;
  // other organization-specific fields
}

export interface AssetFormData {
    'asset-name': string;
    'asset-summary': string;
    'asset-date-acquired': string;
    'asset-cost': string;
    'asset-depreciation': string;
    'asset-purpose': string;
    'asset-owner': string;
    'recurrent-exp-prev': string;
    'recurrent-exp-curr': string;
    'asset-location': string;
    'asset-technical-details': string;
    'asset-type': 'Software' | 'Hardware' | 'Connectivity' | 'Other';
    'asset-subcategory-type': string;
    'asset-historical-cost': string;
    'asset-projected-cost': string;
    'asset-icon': FileList;
}

export interface StaffFormData {
  'staff-name': string;
  'staff-position': string;
  'staff-date-joined': string;
  'staff-experience': string;
  'staff-salary': string;
  'staff-qualifications-score': string;
  'staff-bio': string;
  'staff-role': string;
  'staff-email': string;
}

export interface Turnover {
  year: number;
  amount: number;
}

export interface OrganizationProfile {
  name: string;
  address: string;
  turnovers: Turnover[];
  logoUrl?: string;
}
