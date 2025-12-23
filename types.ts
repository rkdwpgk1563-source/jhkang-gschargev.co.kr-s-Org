
export type HolidayType = '설날' | '추석';
export type ClientCategory = 'A(VIP)' | 'B(일반)' | 'C(잠재)';

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface GiftCatalogItem {
  id: string;
  name: string;
  unitPrice: number;
  targetCategory: ClientCategory;
}

export interface GiftRecord {
  id: string;
  year: number;
  holiday: HolidayType;
  catalogItemId: string; 
  itemName: string;      
  quantity: number;      
  price: number;         
  status: '준비중' | '발송완료' | '배송중' | '수령확인';
  note?: string;         
}

export interface Client {
  id: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  postcode: string;
  address: string;
  addressDetail: string;
  category: ClientCategory;
  registeredBy: string;  
  registeredEmail: string; // 입력자 이메일 추적
  giftHistory: GiftRecord[];
}

export interface DashboardStats {
  totalClients: number;
  totalGifts: number;
  totalBudget: number;
  userStats: { [userName: string]: number }; 
}
