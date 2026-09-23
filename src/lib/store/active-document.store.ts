import { create } from 'zustand/react';
import { DocumentInformation } from '../types';
import { Photoshop } from '../../photoshop/types';

const ps = require('photoshop') as Photoshop;

const getActiveDocument = (): DocumentInformation | null => {
  if (!ps.app.documents.length) return null;
  const doc = ps.app.activeDocument;
  return {
    id: doc.id,
    historyStateID: doc.activeHistoryState.id,
    name: doc.name,
    width: doc.width,
    height: doc.height,
  };
};

type Store = {
  document: DocumentInformation | null;
  refresh: () => void;
};

export const useActiveDocument = create<Store>((set) => ({
  document: null,

  refresh: () => {
    const document = getActiveDocument();
    set((state) => {
      const previous = state.document;
      if (
        previous?.id === document?.id &&
        previous?.historyStateID === document?.historyStateID &&
        previous?.name === document?.name &&
        previous?.width === document?.width &&
        previous?.height === document?.height
      ) {
        return state;
      }
      return { document };
    });
  },
}));

void useActiveDocument.getState().refresh();

setInterval(() => {
  void useActiveDocument.getState().refresh();
}, 2000);
