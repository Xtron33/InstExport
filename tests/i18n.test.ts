import { afterEach, expect, test } from 'vitest';
import i18n from '../src/i18n';
import { buildPlan } from '../src/geometry/plans';
import { Mode } from '../src/lib/types';

afterEach(async () => {
  await i18n.changeLanguage('en');
});

test('plan messages follow the selected language', async () => {
  const document = { id: 1, historyStateID: 1, name: 'photo.psd', width: 1000, height: 2000 };

  await i18n.changeLanguage('ru');
  expect(() => buildPlan(document, Mode.Panorama)).toThrow(/горизонтальное изображение/);

  await i18n.changeLanguage('en');
  expect(() => buildPlan(document, Mode.Panorama)).toThrow(/horizontal image/);
});
