import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import styles from './HeaderMobile.module.css';

export default function HeaderMobile() {
  const { data: user } = useQuery({
    queryKey: ['authMe'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data?.data || null;
      } catch (err) {
        return null;
      }
    },
    retry: false,
    enabled: typeof window !== 'undefined', // Client-only query execution to bypass Next.js SSR
  });

  return (
    <header className={styles.header}>
      <div className={styles.right}>
        {user ? (
          <div className={styles.profileCircle}>
            <img 
              src={user.profilePic || "/user-icon.png"} 
              alt="Profile" 
              className={styles.avatarImg} 
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
