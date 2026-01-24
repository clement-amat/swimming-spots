export interface SpotLabel {
  emoji: string;
  title: string;
  subtitle: string;
}

export function getSpotLabel(score: number | undefined): SpotLabel {
  if (!score || score < 30) {
    return {
      emoji: '🗿',
      title: 'Épreuve de Koh-Lanta',
      subtitle: 'Accès difficile',
    };
  }
  if (score < 50) {
    return {
      emoji: '🌲',
      title: 'Pipi en nature',
      subtitle: '0% équipement, 100% sauvage.',
    };
  }
  if (score < 70) {
    return {
      emoji: '🎒',
      title: 'Le Spot du Dimanche',
      subtitle: 'Simple, basique.',
    };
  }
  if (score < 90) {
    return {
      emoji: '👌',
      title: 'La Valeur Sûre',
      subtitle: 'Idéal en famille',
    };
  }
  return {
    emoji: '👑',
    title: 'Le 5 Étoiles',
    subtitle: 'Tout confort',
  };
}
