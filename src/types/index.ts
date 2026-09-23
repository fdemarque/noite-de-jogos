export type UserProfile = 'Filipe' | 'Duda';

export interface PrendaItem {
  id: string;
  text: string;
  color: string;
  active: boolean;
  weight: number; // Peso/porcentagem relativa (ex: de 1 a 100)
}

export type RouletteItem = PrendaItem;

export type ChallengeType = 'mimica' | 'desenho';

export interface ChallengeModifier {
  type: ChallengeType;
  title: string;
  icon: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export interface CinemaMedia {
  id: string;
  title: string;
  type: 'Filme' | 'Série';
  year?: number;
  emoji: string;
  genre: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}
