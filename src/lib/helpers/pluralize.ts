const pluralRules = new Intl.PluralRules('ru-RU');

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>;

export const pluralize = (count: number, forms: PluralForms) => {
  const category = pluralRules.select(count);

  return forms?.[category] ?? forms.other ?? forms.many;
};
