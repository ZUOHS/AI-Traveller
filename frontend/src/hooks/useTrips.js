import useSWR from 'swr';

import { getTrips } from '../services/tripService.js';

const fetcher = async () => getTrips();

export const useTrips = () => {
  const { data, error, isLoading, mutate } = useSWR('/trips', fetcher, {
    revalidateOnFocus: false
  });

  return {
    trips: data ?? [],
    isLoading,
    error,
    mutate
  };
};
