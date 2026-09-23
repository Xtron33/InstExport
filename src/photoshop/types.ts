// Minimal boundary types for the API surface used by this plugin.
export interface Entry {
  name: string;
  isFile: boolean;
  nativePath: string;
  delete(): Promise<void>;
}
export interface FileEntry extends Entry {
  copyTo(folder: FolderEntry, options: { overwrite: boolean }): Promise<FileEntry>;
}
export interface FolderEntry extends Entry {
  getEntries(): Promise<Entry[]>;
  createFile(name: string, options?: { overwrite: boolean }): Promise<FileEntry>;
  createFolder(name: string): Promise<FolderEntry>;
}
export interface Layer {
  id: number;
  sendToBack(): void | Promise<void>;
}
export interface PsDocument {
  id: number;
  name: string;
  width: number;
  height: number;
  mode: string;
  bitsPerChannel: number;
  pixelAspectRatio: number;
  activeHistoryState: { id: number };
  backgroundLayer?: Layer;
  artboards: { length: number };
  readonly activeLayers: Layer[];
  activeChannels: unknown[];
  readonly componentChannels: unknown[];
  quickMaskMode: boolean;
  selection: { selectAll(): Promise<void>; deselect(): Promise<void> };
  duplicate(name?: string, mergeLayersOnly?: boolean): Promise<PsDocument>;
  changeMode(mode: string): Promise<void>;
  convertProfile(
    profile: string,
    intent: string,
    blackPoint: boolean,
    dither: boolean,
  ): Promise<void>;
  createPixelLayer(options: { name: string }): Promise<Layer>;
  flatten(): Promise<void>;
  resizeImage(width?: number, height?: number, resolution?: number, method?: string): Promise<void>;
  crop(bounds: { left: number; top: number; right: number; bottom: number }): Promise<void>;
  closeWithoutSaving(): void | Promise<void>;
  saveAs: {
    jpg(
      file: FileEntry,
      options: { quality: number; embedColorProfile: boolean; formatOptions: string },
      asCopy: boolean,
    ): Promise<void>;
  };
}
export interface ModalContext {
  isCancelled: boolean;
  hostControl: {
    registerAutoCloseDocument(id: number): Promise<void>;
    unregisterAutoCloseDocument(id: number): Promise<void>;
  };
}
export interface Photoshop {
  app: { activeDocument: PsDocument; documents: ArrayLike<PsDocument> };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- UXP enum groups contain both strings and numbers.
  constants: Record<string, Record<string, any>>;
  core: {
    executeAsModal<T>(
      callback: (context: ModalContext) => Promise<T>,
      options: { commandName: string },
    ): Promise<T>;
  };
  action: {
    batchPlay(
      commands: object[],
      options: object,
    ): Promise<Array<{ _obj?: string; message?: string; result?: number }>>;
  };
  imaging: {
    getPixels(options: {
      documentID: number;
      historyStateID: number;
      sourceBounds: { left: number; top: number; right: number; bottom: number };
      targetSize: { width: number; height: number };
      colorSpace: 'RGB';
      colorProfile: string;
      componentSize: 8;
      applyAlpha: true;
    }): Promise<{ imageData: PhotoshopImageData }>;
    encodeImageData(options: { imageData: PhotoshopImageData; base64: true }): Promise<string>;
  };
}
export interface PhotoshopImageData {
  dispose(): void;
}
export interface Uxp {
  entrypoints: { setup(config: object): void };
  storage: {
    localFileSystem: {
      getFolder(): Promise<FolderEntry | null>;
      getTemporaryFolder(): Promise<FolderEntry>;
    };
  };
}
