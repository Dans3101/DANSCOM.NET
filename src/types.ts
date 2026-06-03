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
  tag: string;
  name: string;
  data: string;
  validity: string;
  price: number;
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending';
}
