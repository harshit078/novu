import { useState } from 'react';
import { useClipboard } from '@mantine/hooks';

import { useApiKeys } from '../../../hooks';
import { useRegenerateApiKeyModal } from './useRegenerateApiKeyModal';

const CLIPBOARD_TIMEOUT_MS = 2000;

export const useApiKeysPage = () => {
  const clipboardApiKey = useClipboard({ timeout: CLIPBOARD_TIMEOUT_MS });
  const clipboardEnvironmentIdentifier = useClipboard({ timeout: CLIPBOARD_TIMEOUT_MS });
  const clipboardEnvironmentId = useClipboard({ timeout: CLIPBOARD_TIMEOUT_MS });
  const { data: apiKeys } = useApiKeys();

  const apiKey = apiKeys?.length ? apiKeys[0].key : '';

  const [isApiKeyMasked, setIsApiKeyMasked] = useState<boolean>(true);

  const toggleApiKeyVisibility = () => setIsApiKeyMasked((prevHidden) => !prevHidden);

  const regenerationModalProps = useRegenerateApiKeyModal();

  return {
    apiKey,
    isApiKeyMasked,
    toggleApiKeyVisibility,
    clipboardApiKey,
    clipboardEnvironmentIdentifier,
    clipboardEnvironmentId,
    regenerationModalProps,
  };
};
