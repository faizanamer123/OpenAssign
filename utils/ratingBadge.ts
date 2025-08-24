// Rating Badge System with Gem Calculations
// Bronze = 3 rubies (= 0.3 emerald)
// Copper = 7 rubies (= 0.7 emerald)
// Silver = 1 emerald (10 rubies)
// Gold = 3 emeralds (30 rubies)
// Platinum = 5 emeralds (50 rubies)

export interface RatingBadge {
  level: 'bronze' | 'copper' | 'silver' | 'gold' | 'platinum';
  className: string;
  rubies: number;
  emeralds: number;
  totalValue: number;
  displayText: string;
  icon: string;
}

export function getRatingBadge(rating: number): RatingBadge {
  if (rating >= 4.5) {
    return {
      level: 'platinum',
      className: 'rating-badge rating-badge-platinum',
      rubies: 0,
      emeralds: 5,
      totalValue: 50,
      displayText: 'PLATINUM',
      icon: '💎'
    };
  } else if (rating >= 4.0) {
    return {
      level: 'gold',
      className: 'rating-badge rating-badge-gold',
      rubies: 0,
      emeralds: 3,
      totalValue: 30,
      displayText: 'GOLD',
      icon: '💎'
    };
  } else if (rating >= 3.5) {
    return {
      level: 'silver',
      className: 'rating-badge rating-badge-silver',
      rubies: 0,
      emeralds: 1,
      totalValue: 10,
      displayText: 'SILVER',
      icon: '💎'
    };
  } else if (rating >= 3.0) {
    return {
      level: 'copper',
      className: 'rating-badge rating-badge-copper',
      rubies: 7,
      emeralds: 0,
      totalValue: 7,
      displayText: 'COPPER',
      icon: '🔴'
    };
  } else {
    return {
      level: 'bronze',
      className: 'rating-badge rating-badge-bronze',
      rubies: 3,
      emeralds: 0,
      totalValue: 3,
      displayText: 'BRONZE',
      icon: '🔴'
    };
  }
}

export function getGemDisplay(badge: RatingBadge): React.ReactNode {
  if (badge.emeralds > 0) {
    return `${badge.emeralds} 💎`;
  } else {
    return `${badge.rubies} 🔴`;
  }
}

// New function to get gem display with proper icons
export function getGemDisplayWithIcons(badge: RatingBadge): React.ReactNode {
  if (badge.emeralds > 0) {
    return `${badge.emeralds} 💎`;
  } else {
    return `${badge.rubies} 🔴`;
  }
}

export function getTotalGems(rating: number): { rubies: number; emeralds: number; totalValue: number } {
  const badge = getRatingBadge(rating);
  return {
    rubies: badge.rubies,
    emeralds: badge.emeralds,
    totalValue: badge.totalValue
  };
}
