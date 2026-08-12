/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
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
    const decrypted = localDecrypt(queryResult.data);
    if (decrypted === null) {
      // Decryption failure (likely due to HMR reload / key regeneration). Force refetch.
      setTimeout(() => {
        queryResult.refetch();
      }, 0);
      return undefined;
    }
    return decrypted;
  }, [queryResult.data, queryResult.refetch]);

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

  return new Proxy(queryClient, {
    get(target, prop, receiver) {
      if (prop === 'setSecureQueryData') {
        return (queryKey, updateFn) => {
          target.setQueryData(queryKey, (oldEncrypted) => {
            const oldDecrypted = localDecrypt(oldEncrypted);
            const updated = typeof updateFn === 'function' ? updateFn(oldDecrypted) : updateFn;
            return localEncrypt(updated);
          });
        };
      }
      if (prop === 'getSecureQueryData') {
        return (queryKey) => {
          const encrypted = target.getQueryData(queryKey);
          return localDecrypt(encrypted);
        };
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  });
}
