import axios from 'axios';

export interface EnsData {
  ens: string;
  address: string;
}

export const fetchEnsAddresses = async (base: string = 'ETH') => {
  const result = await axios('https://ens.melon.network/');
  return result.data as EnsData[];
};
