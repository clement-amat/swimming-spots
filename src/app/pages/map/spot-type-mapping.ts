import { SwimmingSpotType } from '@app/shared/models/swimming-spot.model';

export const spotTypeMapping = {
  [SwimmingSpotType.LAKE]: {
    color: '#4a90e2',
  },
  [SwimmingSpotType.RIVER]: {
    color: '#50e3c2',
  },
  [SwimmingSpotType.COASTAL_WATER]: {
    color: '#0077be',
  },
  [SwimmingSpotType.TRANSITIONAL_WATER]: {
    color: '#7ed321',
  },
};
