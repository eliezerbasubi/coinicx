### Coinicx

A high-performance trading platform for digital assets, built with a focus on low-latency data rendering, real-time order book visualization, and modular frontend architecture.

---

It provides:

- Real-time order book and candlestick chart rendering via WebSocket streams
- Perpetual futures trading interface powered by the [Hyperliquid](https://hyperliquid.xyz/) L1
- Wallet connectivity through wagmi and RainbowKit
- Progressive Web App (PWA) support with offline-capable service workers via Serwist
- Feature-driven architecture with isolated state, hooks, and providers per domain

## Tech Stack

| Layer            | Technology                                                |
| ---------------- | --------------------------------------------------------- |
| Framework        | Next.js 15 (App Router), React 19, TypeScript             |
| Styling          | Tailwind CSS 4, Radix UI, class-variance-authority        |
| State Management | Zustand 5 (global stores), React Context (feature-scoped) |
| Data Fetching    | TanStack Query, TanStack React Table                      |
| Charting         | klinecharts, lightweight-charts, Konva (depth chart)      |
| Web3             | wagmi, RainbowKit, viem                                   |
| Trading API      | @nktkas/hyperliquid                                       |
| PWA              | Serwist (service worker + offline support)                |
| Dev Tooling      | Turbopack, ESLint 9, Prettier                             |

## Getting Started

### Prerequisites

- Node.js 18.18+ (LTS) or 20+
- npm, pnpm, or yarn

### Environment Variables

Create a `.env.local` at the project root:

```bash
# WalletConnect Cloud Project ID (required for RainbowKit/wagmi)
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id

# Network configuration: "mainnet" | "testnet" (defaults to "testnet")
NEXT_PUBLIC_WEB3_NETWORK=testnet
```

No secret server-side keys are required for local development.

### Install and Run

```bash
# install dependencies
npm install       # or pnpm install / yarn

# start dev server (http://localhost:3000)
npm run dev

# type-check and lint
npm run lint
npm run gen-types

# production build and start
npm run build
npm start
```

## Project Scripts

| Script      | Description                              |
| ----------- | ---------------------------------------- |
| `dev`       | Start the dev server with Turbopack      |
| `build`     | Production build                         |
| `start`     | Start the production server              |
| `lint`      | Run ESLint                               |
| `gen-types` | Generate Next.js types and run tsc check |

## Architecture

The codebase follows a **feature-driven** architecture. Each domain (trade, portfolio) owns its components, hooks, providers, utilities, and constants — keeping concerns isolated and easy to navigate.

```
src/
├── app/                        # Next.js App Router (routes + layouts)
│   ├── (trading)/
│   │   ├── trade/[[...slug]]/  # Trading interface (charts, orderbook, forms)
│   │   └── portfolio/          # Portfolio management
│   └── layout.tsx              # Root layout
│
├── features/                   # Feature modules (self-contained domains)
│   ├── trade/
│   │   ├── components/         # ChartArea, OrderBook, OrderForm, TickerOverview,
│   │   │                       # MarketArea, TradingAccountPanel, AccountTransact
│   │   ├── hooks/              # useOrderForm, usePlaceOrder, useCancelOrder,
│   │   │                       # useClosePosition, useTokenBalance, ...
│   │   ├── providers/          # TradingPair, TradingInstrument, UserTrade contexts
│   │   ├── utils/              # Order types, pricing, formatting, TWAP logic
│   │   ├── layouts/            # Responsive layout compositions
│   │   └── constants/          # Trade-specific constants
│   └── portfolio/
│       ├── components/
│       └── hooks/
│
├── components/                 # Shared UI layer
│   ├── ui/                     # Design system (button, input, tabs, dialog,
│   │                           # popover, datatable, skeleton, tooltip, ...)
│   ├── common/                 # App-wide components (Header, Sidebar, ConnectButton)
│   └── vectors/                # SVG icon components
│
├── store/                      # Zustand stores
│   ├── markets/                # Market data store + provider
│   └── trade/                  # Instrument, orderbook, order form,
│                               # user preferences, chart settings
│
├── services/                   # API clients and HTTP transport
├── providers/                  # App-level providers (Web3Provider)
├── config/                     # Chain definitions, wallet connectors, wagmi config
├── constants/                  # Routes, query keys, error codes
├── hooks/                      # Global hooks (useSubscription, useIsMobile)
├── types/                      # Shared TypeScript type definitions
└── utils/                      # Formatting (dates, numbers, addresses), debounce, cn
```

### Key Architectural Decisions

- **Feature modules** (`src/features/`) encapsulate domain logic. Hooks, context providers and component groups are all colocated.
- **Zustand stores** are split by domain (`markets`, `trade`) with dedicated slices for orderbook state, instrument data, order form state, user preferences, and chart settings.
- **Responsive design** uses adaptive components (`adaptive-dialog`, `adaptive-popover`, `adaptive-datatable`) that switch between desktop and mobile presentations.
- **Security headers** are configured in `next.config.ts` including CSP, HSTS, X-Frame-Options, and referrer policy.
- **Console stripping** removes `console.*` calls in production mainnet builds.

## Development Notes

- Real-time data flows through WebSocket subscriptions managed by a custom `useSubscription` hook.
- Wallet integration requires a valid `NEXT_PUBLIC_PROJECT_ID` from [WalletConnect Cloud](https://cloud.walletconnect.com/).
- The `@/*` path alias maps to `src/*` for clean imports.
- Charts support three rendering modes: klinecharts (candlestick + indicators), lightweight-charts (TradingView), and Konva (canvas-based depth visualization).

## Contributing

Contributions are welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for branching conventions, commit standards, and coding guidelines.

## License

MIT — see [`LICENSE`](./LICENSE) for details.
