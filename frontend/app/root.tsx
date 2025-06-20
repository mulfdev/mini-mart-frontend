import './app.css';

import type { Route } from './+types/root';

import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';
import { ConnectKitProvider } from 'connectkit';
import FcConnect from '~/components/FcConnect';

export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
export const BASE_RPC_URL = import.meta.env.VITE_BASE_RPC_URL;

const IS_PROD = import.meta.env.VITE_IS_PROD;

const frameConfig = {
    version: 'next',
    imageUrl: 'https://minimart.mulf.wtf/og-image.png',
    button: {
        title: 'List Now',
        action: {
            type: 'launch_frame',
            url: 'https://minimart.mulf.wtf',
            name: 'MiniMart',
            splashImageUrl: 'https://minimart.mulf.wtf/splash-img.png',
            splashBackgroundColor: '#6960d7',
        },
    },
};

const stringifiedConfig = JSON.stringify(frameConfig);

if (typeof ALCHEMY_API_KEY !== 'string') {
    throw new Error('ALCHEMY_API_KEY must be set');
}

if (typeof BASE_RPC_URL !== 'string') {
    throw new Error('BASE_RPC_URL must be set');
}

export const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(BASE_RPC_URL),
    },
    connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    },
];
export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="fc:frame" content={stringifiedConfig} />

                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>
                    <FcConnect />
                    <Outlet />
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
