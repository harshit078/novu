import { useQuery } from '@tanstack/react-query';
import { IApiKey } from '@novu/shared';
import { QueryKeys } from '../api/query.keys';
import { getApiKeys } from '../api/environment';
import { useEnvironment } from '../components/providers/EnvironmentProvider';

export function useApiKeys() {
  const { currentEnvId } = useEnvironment();

  return useQuery<IApiKey[]>([QueryKeys.getApiKeys, currentEnvId], getApiKeys);
}
