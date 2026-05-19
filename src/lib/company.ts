export interface CompanyConfig {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  taxNumber: string;
  registrationNumber: string;
  contractHeader: string;
  contractSubheader: string;
}

export const company: CompanyConfig = {
  name: 'Antilia Rent a Car',
  phone: '+30 28210 00000',
  email: 'info@antilia.com',
  address: 'Χανιά, Κρήτη',
  website: 'www.antilia.com',
  taxNumber: '000000000',
  registrationNumber: 'ΑΕ 00000',
  contractHeader: 'ANTILIA RENT A CAR',
  contractSubheader: 'Chania, Crete',
};
