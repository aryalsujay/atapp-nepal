// This route is a redirect alias — the main apply flow lives in opportunities/[id].tsx
// Kept here to satisfy the Tabs.Screen href:null declaration in _layout.tsx
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ApplyRedirect() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  useEffect(() => {
    router.replace(`/(server)/opportunities/${id}`);
  }, [id]);
  return null;
}
