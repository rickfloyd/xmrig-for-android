# Frontend Architecture

## Overview
XMRig for Android frontend architecture is designed as a cross-platform solution supporting both React Native mobile app and Next.js web dashboard. The architecture follows a modular approach with shared design tokens, utilities, and business logic.

## Architecture Layers

### 1. Shared Layer (`packages/ui-shared`)
- **Design Tokens**: Dark-first theme system with cross-platform color, spacing, typography definitions
- **Utilities**: Hashrate formatting, data transformation helpers
- **Hooks**: Reusable business logic for miner status, telemetry streaming
- **Components**: Basic UI components compatible with both React Native and React DOM

### 2. Mobile App (`apps/mobile` - Future)
- **Platform**: React Native
- **Purpose**: Primary user interface for Android mining app
- **Features**: Real-time dashboard, miner controls, configuration management
- **Integration**: Direct JSI bindings to native XMRig module

### 3. Web Dashboard (`apps/dashboard-web`)
- **Platform**: Next.js 14 with App Router
- **Purpose**: Remote monitoring and configuration interface
- **Features**: Analytics, policy management, configuration editor
- **Integration**: Future WebSocket/API connection to mobile app

## Package Structure

```
xmrig-for-android/
├── packages/
│   └── ui-shared/           # Shared UI components and utilities
│       ├── src/
│       │   ├── tokens.ts    # Design system tokens
│       │   ├── hooks/       # Business logic hooks
│       │   ├── components/  # Reusable UI components
│       │   └── format/      # Data formatting utilities
│       └── package.json
├── apps/
│   ├── mobile/              # React Native app (future migration)
│   └── dashboard-web/       # Next.js web dashboard
│       ├── src/app/         # App Router pages
│       ├── src/components/  # Web-specific components
│       └── package.json
├── schemas/                 # JSON schemas and UI metadata
└── docs/                   # Documentation
```

## Extension Phases

### FE-1 (Current): Foundation
- [x] Shared design tokens and theme system
- [x] Basic telemetry and miner status hooks
- [x] Web dashboard scaffold with placeholder components
- [x] Hashrate formatting utilities
- [x] JSON schema + UI metadata for configuration

### FE-2: Interactive Features
- [ ] Real-time charts (Victory Native & Recharts/Visx)
- [ ] Policy feed UI with decision reason codes
- [ ] Schema-driven configuration forms with diff preview
- [ ] WebSocket integration for real-time updates

### FE-3: Mobile Enhancement
- [ ] Advanced mobile dashboard with gesture controls
- [ ] Offline-first architecture with sync
- [ ] Push notifications for policy decisions
- [ ] Mobile-specific optimizations

### FE-4: Remote Control
- [ ] WebSocket server in mobile app
- [ ] Remote control API for web dashboard
- [ ] Multi-device configuration sync
- [ ] Security and authentication layer

### FE-5: Analytics & Insights
- [ ] Historical performance analytics
- [ ] Profitability tracking
- [ ] Hardware recommendation engine
- [ ] Advanced reporting and exports

## Technology Stack

### Shared
- **TypeScript**: Strict typing across all packages
- **React**: Component framework for both platforms
- **Design Tokens**: CSS-in-TS approach for theming

### Mobile (React Native)
- **React Native 0.68**: Mobile app framework
- **Victory Native**: Charts and data visualization
- **React Native UI Lib**: Component library
- **JSI Bindings**: Direct native module integration

### Web (Next.js)
- **Next.js 14**: Web application framework with App Router
- **Tailwind CSS**: Utility-first styling with design token integration
- **Recharts/Visx**: Web-optimized data visualization

## Integration Points

### Phase 2 Policy Engine
- Hook integration points marked with `TODO(PHASE2)`
- Telemetry stream ready for policy decision events
- UI components prepared for policy status display

### Native XMRig Integration
- Simulation mode during development
- Hook abstraction allows seamless native binding integration
- Platform-specific fallbacks for web dashboard

## State Management

### Current (FE-1)
- **React Context**: Lightweight state management for UI state
- **Hooks**: Encapsulated business logic with local state
- **Simulation**: Mock data for development and testing

### Future (FE-2+)
- **Zustand**: Lightweight state management for complex app state
- **React Query**: Server state management for remote data
- **Persistence**: Offline-first with background sync

## Development Workflow

### Scripts
- `yarn dev:web`: Start web dashboard development server
- `yarn dev:mobile`: Start React Native development server  
- `yarn build:frontend`: Build all frontend packages
- `yarn lint:frontend`: Lint all frontend code
- `yarn typecheck`: TypeScript validation across packages

### Testing Strategy
- **Unit Tests**: Jest for utilities and business logic
- **Component Tests**: React Testing Library for UI components
- **Integration Tests**: End-to-end scenarios with Playwright
- **Visual Tests**: Storybook for component documentation

## Design System

### Theme Philosophy
- **Dark-first**: Optimized for low-light mining environments
- **Performance-focused**: Minimal cognitive load for monitoring
- **Mobile-optimized**: Touch-friendly controls and readable text

### Color Palette
- **Primary**: Emerald green (#10b981) - crypto/mining theme
- **Status Colors**: Clear success/warning/error indication
- **Thermal Colors**: Temperature-based status indication
- **Battery Colors**: Charge level visualization

### Typography
- **System Fonts**: Platform-optimized font stacks
- **Monospace**: For hashrate, addresses, technical data
- **Clear Hierarchy**: Consistent font sizes and weights

## Future Considerations

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader optimization
- High contrast mode support
- Keyboard navigation

### Performance
- Bundle optimization and code splitting
- Image optimization and lazy loading
- Service worker for offline functionality
- Background sync for telemetry data

### Security
- Input validation and sanitization
- Secure configuration storage
- Network security for remote access
- Privacy-focused telemetry collection

## Contributing

### Code Organization
- Follow established patterns in existing packages
- Use TypeScript strict mode for all new code
- Implement responsive design from mobile-first perspective
- Add TODO markers for future phase integration points

### Documentation
- Update this document when adding new architectural components
- Document all public APIs and hook interfaces
- Provide examples for complex integrations
- Maintain changelog for breaking changes