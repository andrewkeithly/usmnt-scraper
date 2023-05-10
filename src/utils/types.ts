export type ParsedImageData = Record<'placeholder' | 'source', string>;

export type ParsedRowData = Record<
  | 'number'
  | 'name'
  | 'position'
  | 'age'
  | 'birthdate'
  | 'height'
  | 'team'
  | 'internationalMatches'
  | 'marketValue',
  string
> & {
  images: ParsedImageData[];
};
