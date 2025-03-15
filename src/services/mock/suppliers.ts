import { SupplierStatus } from '@/types/enums';
import { Supplier } from '@/types/supplierTypes';

export const suppliers: Supplier[] = [
  {
    id: 1,
    name: 'Horween Leather',
    category: 'LEATHER',
    contactName: 'Michael Johnson',
    email: 'mjohnson@horween.com',
    phone: '(312) 226-2351',
    address: '2015 N Elston Ave, Chicago, IL 60614',
    website: 'www.horween.com',
    rating: 5,
    status: SupplierStatus.ACTIVE,
    notes:
      'Premium quality leather supplier. Known for Chromexcel and Shell Cordovan.',
    materialCategories: [
      'Vegetable Tanned',
      'Chrome Tanned',
      'Shell Cordovan',
      'Oil Tanned',
    ],
    logo: '/api/placeholder/100/100',
    lastOrderDate: 'Feb 2, 2025',
    paymentTerms: 'Net 30',
    minOrderAmount: '$250',
    leadTime: '3-4 weeks',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2025-02-05T14:22:00Z',
  },
  {
    id: 2,
    name: 'Wickett & Craig',
    category: 'LEATHER',
    contactName: 'Sarah Williams',
    email: 'sales@wickett-craig.com',
    phone: '(724) 867-5701',
    address: '120 Cooper Road Curwensville, PA 16833',
    website: 'www.wickett-craig.com',
    rating: 4,
    status: SupplierStatus.ACTIVE,
    notes:
      'Traditional American vegetable tanned leather. Great customer service.',
    materialCategories: ['Vegetable Tanned', 'Bridle Leather'],
    logo: '/api/placeholder/100/100',
    lastOrderDate: 'Feb 15, 2025',
    paymentTerms: 'Net 30',
    minOrderAmount: '$300',
    leadTime: '2-3 weeks',
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2025-02-18T11:45:00Z',
  },
  {
    id: 3,
    name: 'Buckle Guy',
    category: 'HARDWARE',
    contactName: 'Robert Clark',
    email: 'info@buckleguy.com',
    phone: '(866) 810-2110',
    address: 'P.O. Box 454 Rocky Point, NC 28457',
    website: 'www.buckleguy.com',
    rating: 5,
    status: SupplierStatus.ACTIVE,
    notes: 'Excellent selection of solid brass hardware. Fast shipping.',
    materialCategories: ['Buckles', 'Snaps', 'D-Rings', 'Rivets'],
    logo: '/api/placeholder/100/100',
    lastOrderDate: 'Jan 30, 2025',
    paymentTerms: 'Net 15',
    minOrderAmount: '$50',
    leadTime: '1 week',
    createdAt: '2024-03-05T15:20:00Z',
    updatedAt: '2025-01-31T16:10:00Z',
  },
  {
    id: 4,
    name: 'Rocky Mountain Leather',
    category: 'SUPPLIES',
    contactName: 'Daniel Hayes',
    email: 'support@rmleathersupply.com',
    phone: '(307) 438-9340',
    address: '251 Main Street, Lander, WY 82520',
    website: 'www.rmleathersupply.com',
    rating: 5,
    status: SupplierStatus.ACTIVE,
    notes: 'Great source for tools and supplies. Excellent customer service.',
    materialCategories: ['Thread', 'Adhesive', 'Edge Paint', 'Tools'],
    logo: '/api/placeholder/100/100',
    lastOrderDate: 'Mar 1, 2025',
    paymentTerms: 'Net 15',
    minOrderAmount: '$25',
    leadTime: '2-3 days',
    createdAt: '2024-01-10T08:45:00Z',
    updatedAt: '2025-03-02T13:30:00Z',
  },
  {
    id: 5,
    name: 'Tandy Leather',
    category: 'MIXED',
    contactName: 'Customer Service',
    email: 'customerservice@tandyleather.com',
    phone: '(800) 433-5566',
    address: '1900 SE Loop 820, Fort Worth, TX 76140',
    website: 'www.tandyleather.com',
    rating: 3,
    status: SupplierStatus.ACTIVE,
    notes: 'Wide selection of leathercraft supplies. Inconsistent quality.',
    materialCategories: ['Leather', 'Tools', 'Hardware', 'Dyes'],
    logo: '/api/placeholder/100/100',
    lastOrderDate: 'Jan 15, 2025',
    paymentTerms: 'Net 30',
    minOrderAmount: '$50',
    leadTime: '1 week',
    createdAt: '2023-11-25T11:00:00Z',
    updatedAt: '2025-01-17T09:20:00Z',
  },
  {
    id: 6,
    name: 'District Leather Supply',
    category: 'LEATHER',
    contactName: 'Thomas Reed',
    email: 'info@districtleathersupply.com',
    phone: '(202) 555-7890',
    address: '1234 Craft Ave, Washington, DC 20001',
    website: 'www.districtleathersupply.com',
    rating: 4,
    status: SupplierStatus.INACTIVE,
    notes: 'Temporarily closed for inventory. Reopening next month.',
    materialCategories: ['Vegetable Tanned', 'Pull-up Leather'],
    logo: '/api/placeholder/100/100',
    lastOrderDate: 'Dec 12, 2024',
    paymentTerms: 'Net 15',
    minOrderAmount: '$100',
    leadTime: '1-2 weeks',
    createdAt: '2024-06-15T14:30:00Z',
    updatedAt: '2024-12-15T10:10:00Z',
  },
];

export const getSupplierById = (id: number): Supplier | undefined => {
  return suppliers.find((supplier) => supplier.id === id);
};

export const filterSuppliers = (filters: {
  category?: string;
  status?: string;
  rating?: string;
  searchQuery?: string;
}): Supplier[] => {
  return suppliers.filter((supplier) => {
    // Filter by category
    if (filters.category && supplier.category !== filters.category) {
      return false;
    }

    // Filter by status
    if (filters.status && supplier.status !== filters.status) {
      return false;
    }

    // Filter by rating
    if (filters.rating && supplier.rating < parseInt(filters.rating)) {
      return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !supplier.name.toLowerCase().includes(query) &&
        !supplier.contactName.toLowerCase().includes(query) &&
        !supplier.materialCategories.some((category) =>
          category.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
    }

    return true;
  });
};
