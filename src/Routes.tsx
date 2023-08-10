import { useFlag } from '@unleash/proxy-client-react';
import * as React from 'react';
import { Route, RouteProps, Switch } from 'react-router';

import { CheckReadPermissions } from './components/CheckReadPermissions';
import { RedirectToDefaultBundle } from './components/RedirectToDefaultBundle';
import { ErrorPage } from './pages/Error/Page';
import { ConnectedIntegrationsListPage } from './pages/Integrations/List/Page';
import { SplunkSetupPage } from './pages/Integrations/SplunkSetup/SplunkSetupPage';
import { EventLogPage } from './pages/Notifications/EventLog/EventLogPage';
import { NotificationsListPage } from './pages/Notifications/List/Page';
import { NotificationsOverviewPage } from './pages/Notifications/Overview/Page';

interface Path {
    path: string;
    component: React.ComponentType;
}

export const linkTo = {
    overview: () => '/notifications',
    configureEvents: () => '/notifications/configure-events',
    integrations: () => '/integrations',
    notifications: (bundle: string) => `/notifications/${bundle}`,
    eventLog: (bundle?: string) => `/notifications/eventlog${bundle ? `?bundle=${bundle}` : ''}`,
    splunk: () => '/integrations/splunk-setup'
};

const EmptyPage: React.FunctionComponent = () => null;

const legacyRoutes: Path[] = [
    {
        path: '/',
        component: EmptyPage
    },
    {
        path: linkTo.integrations(),
        component: ConnectedIntegrationsListPage
    },
    {
        path: linkTo.eventLog(),
        component: EventLogPage
    },
    {
        path: linkTo.notifications(':bundleName'),
        component: NotificationsListPage
    },
    {
        path: linkTo.splunk(),
        component: SplunkSetupPage
    }
];

const routesOverhaul: Path[] = [
    {
        path: linkTo.overview(),
        component: NotificationsOverviewPage
    },
    {
        path: linkTo.configureEvents(),
        component: NotificationsListPage
    },
    {
        path: linkTo.eventLog(),
        component: EventLogPage
    }
];

type InsightsRouteProps = Omit<RouteProps, 'component'> & Pick<Path, 'component'>;

const InsightsRoute: React.FunctionComponent<InsightsRouteProps> = (props: InsightsRouteProps) => {
    const { component, ...restProps } = props;
    return (
        <ErrorPage>
            <Route { ...restProps }>
                <CheckReadPermissions>
                    <props.component />
                </CheckReadPermissions>
            </Route>
        </ErrorPage>
    );
};

export const Routes: React.FunctionComponent = () => {
    const notificationsOverhaul = useFlag('platform.notifications.overhaul');

    const pathRoutes = React.useMemo(() => notificationsOverhaul ? routesOverhaul : legacyRoutes, [ notificationsOverhaul ]);

    return (
        <Switch>
            { pathRoutes.map(pathRoute => (
                <InsightsRoute
                    key={ pathRoute.path }
                    component={ pathRoute.component }
                    path={ pathRoute.path }
                    exact={ true }
                />
            ))}
            {!notificationsOverhaul && <RedirectToDefaultBundle />}
        </Switch>
    );
};
