import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseUrl } from '../../utils/routeUtils';

export function useStudioNavigate() {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateInStudio = useCallback(
    /// TODO: Teach params to support numeric values as well
    (to: string, params: Record<string, string>) => {
      /*
       * The first part is ignored as it's an empty string as location starts with a slash.
       * For example: Splitting /studio/flows returns ['', 'studio', 'flows']
       */
      const [_, secondPart] = location.pathname.split('/');
      const finalPath = parseUrl(`/${secondPart}/${to.replace('/' + secondPart, '')}`, params);

      return navigate(finalPath);
    },
    [navigate, location]
  );

  return navigateInStudio;
}
