import { Fragment, useEffect, type ReactNode } from 'react';
import { Uniwind } from 'uniwind'

const DEFAULT_THEME: 'system' | 'light' | 'dark' = 'system'

const WebOnlyColorSchemeUpdater = function ({ children }: { children?: ReactNode }) {
  useEffect(() => {
    Uniwind.setTheme(DEFAULT_THEME);
  }, []);

  return <Fragment>
    {children}
  </Fragment>
};

export {
  WebOnlyColorSchemeUpdater,
}
