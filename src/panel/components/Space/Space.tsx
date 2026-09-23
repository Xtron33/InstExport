import { CSSProperties, FC } from 'react';

interface Props {
  h: CSSProperties['height'];
}

export const Space: FC<Props> = ({ h }) => {
  return <div style={{ height: h }} />;
};
