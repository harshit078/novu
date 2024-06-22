import { useState } from 'react';

import { Select, IconConstruction, IconRocketLaunch } from '@novu/design-system';

import { css } from '@novu/novui/css';
import { navSelectStyles } from '../NavSelect.styles';
import { EnvironmentPopover } from './EnvironmentPopover';
import { useEnvironment } from '../../../components/providers/EnvironmentProvider';
import { ROUTES } from '../../../constants/routes';
import { BaseEnvironmentEnum } from '../../../constants/BaseEnvironmentEnum';

export function EnvironmentSelect() {
  const [isPopoverOpened, setIsPopoverOpened] = useState<boolean>(false);
  const { environment, environments, isLoading, switchEnvironment, switchToDevelopmentEnvironment } = useEnvironment();

  async function handlePopoverLinkClick(e) {
    e.preventDefault();
    await switchToDevelopmentEnvironment(ROUTES.CHANGES);
  }

  const onChange = async (value) => {
    if (typeof value !== 'string') {
      return;
    }

    await switchEnvironment(value);
  };

  return (
    // TODO: Restore the popover logic
    <EnvironmentPopover
      isPopoverOpened={isPopoverOpened}
      setIsPopoverOpened={setIsPopoverOpened}
      handlePopoverLinkClick={handlePopoverLinkClick}
    >
      <Select
        className={navSelectStyles}
        data-test-id="environment-switch"
        allowDeselect={false}
        loading={isLoading}
        value={environment?._id}
        data={(environments || []).map(({ _id: value, name: label }) => ({ label, value }))}
        onChange={onChange}
        icon={
          !isLoading && (
            <span
              className={css({
                p: '50',
                // TODO: use design system values when available
                borderRadius: '8px',
                bg: 'surface.page',
                '& svg': {
                  fill: 'typography.text.main',
                },
                _after: {
                  width: '100',
                },
              })}
            >
              {environment?.name === BaseEnvironmentEnum.DEVELOPMENT ? <IconConstruction /> : <IconRocketLaunch />}
            </span>
          )
        }
      />
    </EnvironmentPopover>
  );
}
