import { Place } from '../components/PlaceMarker';

/**
 * Rank places by desirability for the "decide now" use case.
 *
 * Scoring (higher = better):
 * - Rating: 0-5 points (direct rating value)
 * - Has rating: +1 point (prefer rated over unrated)
 *
 * Future additions (when data available):
 * - Open now: +2 points
 * - Distance: inverse scoring
 * - Price match: +1 if matches preference
 */
export function rankPlaces(places: Place[]): Place[] {
  return [...places].sort((a, b) => {
    const scoreA = getScore(a);
    const scoreB = getScore(b);
    return scoreB - scoreA; // Higher score first
  });
}

function getScore(place: Place): number {
  let score = 0;

  // Rating score (0-5)
  if (place.rating) {
    score += place.rating;
    score += 1; // Bonus for having a rating
  }

  return score;
}
