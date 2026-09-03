import { UserDto } from './auth';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string; // Requires verification flow usually
  avatarUrl?: string;
}

export interface UserProfile extends UserDto {
  // meaningful profile extensions
  createdAt: string;
  updatedAt: string;
}
