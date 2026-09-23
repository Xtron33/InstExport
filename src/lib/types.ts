export enum Mode {
  Universal,
  Panorama,
}

export type WorkMode = {
  id: Mode;
  title: string;
  description: string;
  icon: string;
};

export type DocumentInformation = {
  id: number;
  historyStateID: number;
  name: string;
  width: number;
  height: number;
};
