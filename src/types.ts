export interface eSIM {
  id: string;
  country: string;
  data: string;
  validity: string;
  status: 'Active' | 'Expired';
  usage: number;
  total: number;
  expiry: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'country' | 'regional' | 'global';
  data: string; // e.g., '10GB', 'Unlimited'
  validity: string; // e.g., '30 Days'
  price: number;
  speed: string; // e.g., '5G', '4G'
  tags: string[]; // e.g., ['Popular', 'Best Value', 'New Arrival']
  coverage: string[]; // e.g., ['USA', 'France']
  network?: string;
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending';
}
