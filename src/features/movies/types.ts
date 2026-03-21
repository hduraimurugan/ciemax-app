export type MovieTab = 'now_showing' | 'coming_soon';

export interface MovieFilterState {
  activeTab: MovieTab;
  selectedGenre: string | null;
  selectedLanguage: string | null;
}
