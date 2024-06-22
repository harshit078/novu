import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQuery,
  useQueryClient,
  type QueryObserverResult,
  type RefetchOptions,
  type RefetchQueryFilters,
} from '@tanstack/react-query';
import { IEnvironment } from '@novu/shared';
import { QueryKeys } from '../../api/query.keys';
import { getEnvironments } from '../../api/environment';
import { createContextAndHook } from '../../hooks/createContextandHook';
import { IS_DOCKER_HOSTED } from '../../config/index';
import { BaseEnvironmentEnum } from '../../constants/BaseEnvironmentEnum';

export type EnvironmentName = BaseEnvironmentEnum | IEnvironment['name'];

const LOCAL_STORAGE_LAST_ENVIRONMENT_ID = 'novu_last_environment_id';

function saveEnvironmentId(environmentId: string) {
  localStorage.setItem(LOCAL_STORAGE_LAST_ENVIRONMENT_ID, environmentId);
}

function getEnvironmentId(): string {
  return localStorage.getItem(LOCAL_STORAGE_LAST_ENVIRONMENT_ID) || '';
}

type EnvironmentContextValue = {
  currentEnvId: string;
  environment?: IEnvironment;
  environments?: IEnvironment[];
  refetchEnvironments: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<IEnvironment[], unknown>>;
  switchEnvironment: (environmentId: string, redirectUrl?: string) => Promise<void>;
  switchToDevelopmentEnvironment: (redirectUrl?: string) => Promise<void>;
  switchToProductionEnvironment: (redirectUrl?: string) => Promise<void>;
  isLoading: boolean;
  readOnly: boolean;
};

const [EnvironmentCtx, useEnvironmentCtx] = createContextAndHook<EnvironmentContextValue>('Environment Context');

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: environments,
    isLoading,
    refetch: refetchEnvironments,
  } = useQuery<IEnvironment[]>([QueryKeys.myEnvironments], getEnvironments, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  const [currentEnvId, setCurrentEnvId] = useState<string>(getEnvironmentId());

  const switchEnvironment = useCallback(
    async (environmentId: string, redirectUrl?: string) => {
      saveEnvironmentId(environmentId);
      setCurrentEnvId(environmentId);

      /*
       * TODO: Replace this revalidation by moving environment ID or name to the URL.
       * This call creates an avalance of HTTP requests as the more you navigate across the app in a
       * single environment the more invalidations will be triggered on environment switching.
       */
      await queryClient.invalidateQueries();

      if (redirectUrl) {
        await navigate(redirectUrl);
      }
    },
    [queryClient, navigate]
  );

  const switchToProductionEnvironment = useCallback(
    async (redirectUrl?: string) => {
      const envId = environments?.find((env) => env.name === BaseEnvironmentEnum.PRODUCTION)?._id;

      if (envId) {
        await switchEnvironment(envId, redirectUrl);
      } else {
        throw new Error('Production environment not found');
      }
    },
    [environments, switchEnvironment]
  );

  const switchToDevelopmentEnvironment = useCallback(
    async (redirectUrl?: string) => {
      const envId = environments?.find((env) => env.name === BaseEnvironmentEnum.DEVELOPMENT)?._id;

      if (envId) {
        await switchEnvironment(envId, redirectUrl);
      } else {
        throw new Error('Development environment not found');
      }
    },
    [environments, switchEnvironment]
  );

  const environment = useMemo(() => {
    let e: IEnvironment | undefined;

    if (!environments) {
      return e;
    }

    // Find the environment based on the current user's last environment
    e = environments.find((env) => env._id === currentEnvId);

    // Or pick the development environment
    if (!e) {
      e = environments.find((env) => env.name === BaseEnvironmentEnum.DEVELOPMENT);
    }

    return e;
  }, [environments, currentEnvId]);

  const value = {
    currentEnvId,
    environment,
    environments,
    refetchEnvironments,
    switchEnvironment,
    switchToDevelopmentEnvironment,
    switchToProductionEnvironment,
    isLoading,
    readOnly: environment?._parentId !== undefined,
  };

  return <EnvironmentCtx.Provider value={{ value }}>{children}</EnvironmentCtx.Provider>;
}

export function useEnvironment({ bridge }: { bridge?: boolean } = {}) {
  const { readOnly, ...rest } = useEnvironmentCtx();

  return {
    ...rest,
    readOnly: readOnly || (!IS_DOCKER_HOSTED && bridge) || false,
    // @deprecated use bridge instead
    chimera: !IS_DOCKER_HOSTED && bridge,
    bridge: !IS_DOCKER_HOSTED && bridge,
  };
}
