import { Mode, WorkMode } from './types';
import { mdiImageSizeSelectLarge, mdiViewCarousel } from '@mdi/js';

export const MODES: WorkMode[] = [
  {
    id: Mode.Universal,
    title: 'modes.universal',
    description: 'modes.universalDescription',
    icon: mdiImageSizeSelectLarge,
  },
  {
    id: Mode.Panorama,
    title: 'modes.panorama',
    description: 'modes.panoramaDescription',
    icon: mdiViewCarousel,
  },
];
