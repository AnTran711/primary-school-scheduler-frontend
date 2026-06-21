import type { UserRole } from './auth';

export interface UserRecord {
  id: string;
  username: string;
  roles: UserRole[];
}
