import axios from 'axios';
import { Asset, DashboardStats, HolderInfo, OwnershipRecord } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function fetchAssetsAPI(): Promise<Asset[]> {
  const response = await api.get('/assets');
  return response.data;
}

export async function fetchAssetDetailsAPI(id: number): Promise<Asset> {
  const response = await api.get(`/assets/${id}`);
  return response.data;
}

export async function fetchDashboardStatsAPI(): Promise<DashboardStats> {
  const response = await api.get('/dashboard');
  return response.data;
}

export async function fetchHistoryAPI(id: number): Promise<OwnershipRecord[]> {
  const response = await api.get(`/history/${id}`);
  return response.data;
}

export async function fetchTopHoldersAPI(): Promise<HolderInfo[]> {
  const response = await api.get('/top-holders');
  return response.data;
}

export async function fetchTransactionsAPI(): Promise<OwnershipRecord[]> {
  const response = await api.get('/transactions');
  return response.data;
}

export async function fetchHealthAPI() {
  const response = await api.get('/health');
  return response.data;
}
