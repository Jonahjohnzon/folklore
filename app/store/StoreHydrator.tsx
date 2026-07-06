// app/StoreHydrator.tsx
'use client';
import { useEffect } from 'react';
import { store } from '@/app/store/userStore';
import { AuthService } from '@/app/services/auth';

export default function StoreHydrator() {

  const Get = async () => {

    try {
      const res = await AuthService.me();
      if (res.success) {
        store._id = res.data.user._id;
        Object.assign(store, res.data.user);
      }

    }
    catch (err) {
      console.log(err);
    } finally {
      store.authChecked = true;
      store.hydrated = true;
    }
  }

  useEffect(() => {
    Get()
  }, []);

  return null;
}