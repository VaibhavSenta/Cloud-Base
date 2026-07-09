'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { localEncrypt, localDecrypt } from './localCrypto';

export { localEncrypt, localDecrypt };

/**
 * useSecureQuery Hook
 * Standard useQuery wrapper that automatically encrypts cached in-memory query data
 * and decrypts it on-the-fly during component render.
 */
export function useSecureQuery(options) {
  const { queryKey, queryFn, ...restOptions } = options;

  // Wrap the original queryFn to encrypt its output before React Query stores it
  const secureQueryFn = async (context) => {
    const rawData = await queryFn(context);
    return localEncrypt(rawData);
  };

  const queryResult = useQuery({
    ...restOptions,
    queryKey,
    queryFn: secureQueryFn
  });

  // Decrypt data in-memory for the rendering component
  const decryptedData = useMemo(() => {
    if (!queryResult.data) return undefined;
    return localDecrypt(queryResult.data);
  }, [queryResult.data]);

  return {
    ...queryResult,
    data: decryptedData
  };
}

/**
 * useSecureQueryClient Hook
 * Wrapper around useQueryClient to handle automatic decryption/encryption of in-memory cache data.
 */
export function useSecureQueryClient() {
  const queryClient = useQueryClient();

  return {
    ...queryClient,
    
    /**
     * Update cache data securely
     */
    setSecureQueryData: (queryKey, updateFn) => {
      queryClient.setQueryData(queryKey, (oldEncrypted) => {
        const oldDecrypted = localDecrypt(oldEncrypted);
        // Compute updated value
        const updated = typeof updateFn === 'function' ? updateFn(oldDecrypted) : updateFn;
        return localEncrypt(updated);
      });
    },

    /**
     * Retrieve cache data securely
     */
    getSecureQueryData: (queryKey) => {
      const encrypted = queryClient.getQueryData(queryKey);
      return localDecrypt(encrypted);
    }
  };
}
