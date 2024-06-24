import * as Sentry from '@sentry/react';
import { IntercomProvider } from 'react-use-intercom';
import { Outlet } from 'react-router-dom';
import styled from '@emotion/styled';

// TODO: Move sidebar under layout folder as it belongs here
import { HeaderNav } from './v2/HeaderNav';
import { css } from '@novu/novui/css';

const AppShell = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  min-width: 1024px;
`;

const ContentShell = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  overflow: hidden; // for appropriate scroll
`;

export function LocalStudioPageLayout() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError, eventId }) => (
        <>
          Sorry, but something went wrong. <br />
          Our team has been notified and we are investigating.
          <br />
          <code>
            <small style={{ color: 'lightGrey' }}>
              Event Id: {eventId}.
              <br />
              {error.toString()}
            </small>
          </code>
        </>
      )}
    >
      <AppShell className={css({ '& *': { colorPalette: 'mode.local' } })}>
        <ContentShell>
          <Outlet />
        </ContentShell>
      </AppShell>
    </Sentry.ErrorBoundary>
  );
}
