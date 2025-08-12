### Coinicx
A high-performance, crypto-native trading platform designed for next-generation traders. Built for speed, transparency, and scalability, CoinicX empowers users to trade digital assets with confidence — beyond the limits of traditional exchanges.

> **⚠️ Development Notice**  
> This project is currently under active development. Some features may not work as expected, and the codebase is subject to frequent changes. More updates and improvements are coming soon!

> **🎯 Project Purpose**  
> This is a demonstration project showcasing the architecture and design patterns of a High-Frequency Trading (HFT) platform. It's designed to illustrate best practices in building scalable, real-time trading systems.

---

A modern, open-source crypto trading interface built with Next.js App Router. It provides:

- Real‑time market data (order book and kline candles) via Binance WebSocket streams
- Spot trading UI with charts, order book, ticker overview, and order forms
- Wallet connection powered by wagmi and RainbowKit
- Clean, extensible component architecture and state management with Zustand and TanStack Query

## Tech Stack

- Next.js 15 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query for data fetching and caching
- Zustand for local state
- wagmi + RainbowKit for wallet connectivity
- klinecharts / lightweight-charts for charting

## Getting Started

### Prerequisites

- Node.js 18.18+ (LTS) or 20+
- npm, pnpm, or yarn

### Environment variables

Create a `.env.local` at the project root and set:

```bash
# WalletConnect Cloud Project ID for RainbowKit/wagmi
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id

# Select the network configuration ("mainnet" | "testnet"). Defaults to "testnet" if omitted.
NEXT_PUBLIC_WEB3_NETWORK=testnet
```

Notes:

- Market data streams are read from Binance public WebSocket endpoints directly in the client for order book and kline data.
- No secret server-side keys are required for local development.

### Install and run

```bash
# install
npm install
# or
pnpm install
# or
yarn

# develop (http://localhost:3000)
npm run dev

# type-check, lint, and build
npm run lint
npm run build

# production start (after build)
npm start
```

## Project Scripts

- `dev`: Start the Next.js dev server (with Turbopack)
- `build`: Production build
- `start`: Start the production server
- `lint`: Run ESLint

## Folder Structure

High-level overview of `src/`:

- `src/app/`: Next.js App Router routes and layouts
  - `crypto/[[...slug]]`: Crypto market pages (listing/details)
  - `trade/[[...slug]]`: Trading pages (charts, orderbook, forms)
- `src/components/`: UI and feature components
  - `common/`: Shared UI primitives (header, input formatters, tooltips)
  - `crypto/`: Crypto-specific components, hooks, provider, utils
  - `trade/`: Trading feature (chart, orderbook, order form, providers, hooks)
  - `ui/`: Design system primitives (button, checkbox, tabs, tooltip, etc.)
  - `vectors/`: SVG/React icons
- `src/config/`: Chain and wallet configuration (chains, connectors, wagmi)
- `src/constants/`: App-wide constants (routes, query keys)
- `src/lib/`: Library helpers and mocks (e.g., fiat data)
- `src/providers/`: App-level providers (e.g., Web3)
- `src/services/`: Client-side services for markets and trade API calls
- `src/store/`: Zustand stores and providers (markets, trade/orderbook)
- `src/types/`: Shared TypeScript types
- `src/utils/`: Utilities (formatting, debounce, etc.)

This structure is component- and feature-driven, making it easy to extend markets, trading, and UI primitives independently.

## Development Notes

- Charts and order book data are consumed from Binance WebSocket streams for real-time updates.
- Wallet integration uses RainbowKit and wagmi; ensure `NEXT_PUBLIC_PROJECT_ID` is configured.
- State and data:
  - Zustand stores live under `src/store/**`
  - Server and client fetching via `src/services/**` and React Query

## Contributing

Contributions are welcome! Please read the contributing guidelines in [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details on the workflow, coding style, and how to run checks locally.

## License

This project is licensed under the MIT License — see [`LICENSE`](./LICENSE) for details.
