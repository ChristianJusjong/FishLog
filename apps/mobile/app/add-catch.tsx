import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Redirect to camera-first capture flow
export default function AddCatchRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/camera-capture');
  }, []);

  return null;
}
