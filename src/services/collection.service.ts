import api from "./api";
import type {
  Customer,
  CreateCustomerPayload,
  MonthlyEntry,
  SaveMonthlyEntryPayload,
  CustomerHistoryResponse,
  YearGridResponse,
} from "../types/collection.types";

export const collectionService = {
  // Fetch customers with their entry status for a given month
  getCustomers: async (month?: string, search?: string): Promise<{ data: Customer[]; count: number }> => {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (search) params.append("search", search);

    const response = await api.get(`/customers?${params.toString()}`);
    return response.data;
  },

  // Fetch full year 12-month grid for all customers
  getYearGrid: async (year: string, search?: string): Promise<YearGridResponse> => {
    const params = new URLSearchParams({ year });
    if (search) params.append("search", search);

    const response = await api.get<YearGridResponse>(`/customers?${params.toString()}`);
    return response.data;
  },

  // Create a new customer
  createCustomer: async (payload: CreateCustomerPayload): Promise<{ data: Customer; message: string }> => {
    const response = await api.post("/customers", payload);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: string, payload: Partial<Customer>): Promise<{ data: Customer }> => {
    const response = await api.put(`/customers/${id}`, payload);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Save or update a single monthly entry for customer + month
  saveMonthlyEntry: async (
    payload: SaveMonthlyEntryPayload
  ): Promise<{ data: MonthlyEntry; isExisting: boolean; message: string }> => {
    const response = await api.post("/monthly-entries", payload);
    return response.data;
  },

  // Delete a single monthly entry
  deleteMonthlyEntry: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/monthly-entries/${id}`);
    return response.data;
  },

  // Get full payment history for a customer
  getCustomerHistory: async (customerId: string): Promise<CustomerHistoryResponse> => {
    const response = await api.get(`/monthly-entries/customer/${customerId}`);
    return response.data;
  },

  // Get specific monthly entry
  getSingleMonthEntry: async (customerId: string, month: string): Promise<{ data: MonthlyEntry | null }> => {
    const response = await api.get(`/monthly-entries/customer/${customerId}/month/${month}`);
    return response.data;
  },
};

export default collectionService;
