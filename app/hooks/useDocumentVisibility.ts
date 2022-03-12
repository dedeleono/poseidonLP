import React from 'react';

import useEventListener from './useEventListener';

function getVisibilityPropertyNames() {
  // Opera 12.10 and Firefox 18 and later support
  if (typeof window !== 'undefined' && typeof document.hidden !== 'undefined') {
    return ['hidden', 'visibilitychange'];
  }

  // @ts-ignore
  if (typeof window !== 'undefined' && typeof document.msHidden !== 'undefined') {
    return ['msHidden', 'msvisibilitychange'];
  }

  // @ts-ignore
  if (typeof window !== 'undefined' && typeof document.webkitHidden !== 'undefined') {
    return ['webkitHidden', 'webkitvisibilitychange'];
  }

  return ['hidden', 'visibilitychange'];
}

const [hidden, visibilityChange] = getVisibilityPropertyNames();

function isDocumentHidden() {
  // @ts-ignore
  return document[hidden];
}

export function useDocumentVisibilityChange(callback:any) {
  const onChange = React.useCallback(() => {
    callback(isDocumentHidden());
  }, [callback]);

  useEventListener(visibilityChange, onChange, document);
}

export function useDocumentVisibility() {
  const [isHidden, setHidden] = React.useState(isDocumentHidden());

  const onChange = React.useCallback(state => setHidden(state), [setHidden]);

  useDocumentVisibilityChange(onChange);

  return isHidden;
}
