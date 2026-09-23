import { useEffect, useState } from 'react';
import type { PreviewPlan } from '../../geometry/plans';
import { getPreviewDataUrl } from '../../photoshop/preview';

interface ImagePreviewState {
  dataUrl: string | null;
  error: string | null;
  loading: boolean;
}

export function useImagePreview(preview: PreviewPlan): ImagePreviewState {
  const [state, setState] = useState<ImagePreviewState>({
    dataUrl: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let current = true;
    setState({ dataUrl: null, error: null, loading: true });

    void getPreviewDataUrl(preview)
      .then((dataUrl) => {
        if (current) setState({ dataUrl, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (current) {
          setState({
            dataUrl: null,
            error: error instanceof Error ? error.message : String(error),
            loading: false,
          });
        }
      });

    return () => {
      current = false;
    };
  }, [preview]);

  return state;
}
