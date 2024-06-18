import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { IEnvironment } from '@novu/shared';

import { useAuth, useEnvironments } from './index';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { IS_DOCKER_HOSTED } from '../config/index';
import { BaseEnvironmentEnum } from '../constants/BaseEnvironmentEnum';

export type EnvironmentName = BaseEnvironmentEnum | IEnvironment['name'];

const LOCAL_STORAGE_LAST_ENVIRONMENT_ID = 'novu_last_environment_id';

function saveEnvironmentId(environmentId: string | null) {
  if (environmentId) {
    localStorage.setItem(LOCAL_STORAGE_LAST_ENVIRONMENT_ID, environmentId);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_LAST_ENVIRONMENT_ID);
  }
}

function getEnvironmentId(): string {
  return localStorage.getItem(LOCAL_STORAGE_LAST_ENVIRONMENT_ID) || '';
}

export const useEnvironment = (options: UseQueryOptions<IEnvironment, any, IEnvironment> = {}, bridge = false) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [currentEnvId, setCurrentEnvId] = useState<string>();
  const { data: environments, isLoading, refetch: refetchEnvironments } = useEnvironments();

  const switchEnvironment = useCallback(
    async (environmentId: string, redirectUrl?: string) => {
      saveEnvironmentId(environmentId);
      setCurrentEnvId(environmentId);

      /*
       * TODO: Replace this revalidation by ensuring all query Keys in react-query contain the environmentId
       * This call creates an avalance of HTTP requests and also causes flakiness in the e2e suite.
       */
      await queryClient.invalidateQueries();

      if (redirectUrl) {
        await navigate(redirectUrl);
      }
    },
    [navigate, queryClient, setCurrentEnvId]
  );

  const switchToProductionEnvironment = useCallback(
    async (redirectUrl?: string) => {
      const envId = environments?.find((env) => env.name === BaseEnvironmentEnum.PRODUCTION)?._id;

      if (envId) {
        await switchEnvironment(envId, redirectUrl);
      }
    },
    [environments, switchEnvironment]
  );

  const switchToDevelopmentEnvironment = useCallback(
    async (redirectUrl?: string) => {
      const envId = environments?.find((env) => env.name === BaseEnvironmentEnum.DEVELOPMENT)?._id;

      if (envId) {
        await switchEnvironment(envId, redirectUrl);
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
    const lastEnvironmentId = getEnvironmentId();
    if (lastEnvironmentId) {
      e = environments.find((env) => env._id === lastEnvironmentId);
    }

    // Or pick the development environment
    if (!e) {
      e = environments.find((env) => env.name === BaseEnvironmentEnum.DEVELOPMENT);
    }

    return e;
  }, [environments, currentEnvId]);

  useEffect(() => {
    if (environment) {
      saveEnvironmentId(environment._id);
    } else {
      saveEnvironmentId('');
    }
  }, [environment]);

  return {
    environment,
    environments,
    refetchEnvironments,
    switchEnvironment,
    switchToDevelopmentEnvironment,
    switchToProductionEnvironment,
    readonly: environment?._parentId !== undefined || (!IS_DOCKER_HOSTED && bridge),
    // @deprecated use bridge instead
    chimera: !IS_DOCKER_HOSTED && bridge,
    bridge: !IS_DOCKER_HOSTED && bridge,
    isLoading,
  };
};
