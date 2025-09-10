# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
```bash
# Start development server (default port 2025)
npm run dev

# Alternative start command
npm start

# Update local IP for micro frontend configuration
npm run update-ip
```

### Building
```bash
# Build for production
npm run build

# Build for development
npm run build:dev

# Build for test environment
npm run build:test

# Build for staging environment
npm run build:stage

# Analyze bundle size
npm run analyze
```

### Linting & Quality
This project uses ESLint with pre-commit hooks via Husky and lint-staged:
```bash
# Lint and fix JavaScript and Vue files
npx eslint --fix src/**/*.{js,vue}

# Pre-commit hook automatically runs linting on staged files
```

## Architecture Overview

### Project Type
This is a Vue 2.6 admin management system built with Element UI, featuring:
- **Micro Frontend Architecture**: Uses Wujie (无界) for micro frontend integration
- **Multi-Module Business System**: Handles manufacturing, production management, device testing, and workflow automation
- **Enterprise Configuration Management**: Complex parameter configuration and testing workflows

### Core Technology Stack
- **Frontend Framework**: Vue 2.6.10 with Vue Router and Vuex
- **UI Library**: Element UI 2.15.12 with custom theme
- **Micro Frontend**: Wujie (wujie-vue2) for seamless micro app integration
- **Build Tool**: Vue CLI 4.4.4 with custom webpack optimization
- **State Management**: Vuex with modularized stores (app, user, permission, dict, tagsView, settings, socket, commonData)

### Micro Frontend Architecture
The system uses Wujie for micro frontend integration with automatic IP detection:

**Configuration**: `src/config/microApps.js` 
- Dynamic IP resolution for development environments
- Environment-based URL switching (dev/test/prod)
- Micro app lifecycle management with `alive: true` for performance

**Container**: `src/components/MicroAppContainer.vue`
- Handles micro app routing and integration
- Supports both embedded and fullscreen micro apps

**Routes**: Full-screen micro apps configured in router with format `micro:app-name:sub-path`

### Key Architectural Patterns

#### API Layer Structure
- **Domain-based organization**: APIs grouped by business domains (device/, production/, system/, third/, workflow/)
- **Consistent request handling**: Centralized in `src/utils/request.js` with axios
- **Multi-environment support**: Environment-specific API base URLs

#### Component Architecture
- **Layout System**: Main layout in `src/layout/` with modular components (Navbar, Sidebar, TagsView, AppMain)
- **Business Components**: Domain-specific components in organized folders
- **Shared Components**: Reusable components (Pagination, Upload, Editor, etc.)

#### State Management Pattern
```javascript
// Modularized Vuex store structure
modules: {
  app,           // Application-level state (sidebar, device, size)
  dict,          // Dictionary data management
  user,          // User authentication and profile
  tagsView,      // Tab navigation state
  permission,    // Route permissions and menu
  settings,      // UI settings and preferences
  socket,        // WebSocket connections (commented but available)
  commonData     // Shared business data
}
```

#### Permission System
- **Route-level permissions**: Dynamic route generation based on user roles
- **Component-level permissions**: Custom directives `v-hasPermi` and `v-hasRole`
- **Menu generation**: Automatic sidebar menu from route configuration

### Build Optimization
The project includes sophisticated webpack optimization:

**Code Splitting Strategy**:
- Vue core libraries (vue, vue-router, vuex)
- Element UI separate chunk
- Chart libraries (echarts)
- Editor components bundle
- Utility libraries (lodash, moment, axios)
- Vendor code with size limits

**Performance Features**:
- Gzip compression for production (files >10KB)
- Bundle analysis tools
- Dynamic imports for route-based splitting
- SVG sprite optimization

### Business Domain Architecture

#### Manufacturing & Production
- **Device Management**: DUT (Device Under Test) configuration and factory setup
- **Production Scheduling**: Real-time production planning and monitoring
- **Quality Control**: Test result management and sample processing

#### Configuration Management  
- **Parameter Configuration**: Complex device parameter management system
- **File Configuration**: Document and configuration file handling
- **Version Management**: EPC/IDS version control systems

#### Testing & Validation
- **Test Automation**: Script-based testing workflows
- **Report Generation**: Automated test reporting and data analysis
- **Device Monitoring**: Real-time device status and alert management

#### Workflow Engine
- **Process Design**: BPMN-based workflow designer
- **Task Management**: Automated task assignment and tracking
- **Form Integration**: Dynamic form generation for workflows

## Important Notes

### Excel Operations
The project uses `xlsx-style` which requires manual patching after `npm install`:
- Locate `node_modules/xlsx-style/xlsx.js`
- Replace `write_ws_xml_data` function with the code provided in README.md
- This enables proper row height handling in Excel exports

### Environment Configuration
- **Development**: Auto-detects local IP via `scripts/get-local-ip.js`
- **Micro Apps**: Environment-specific URLs in `microApps.js`
- **Proxy Configuration**: API proxying configured in `vue.config.js`

### Security Considerations
- **Token Management**: JWT tokens with encryption via `jsencrypt`
- **Permission Guards**: Route-level and component-level access control  
- **API Security**: Request/response interceptors for authentication

### Performance Optimizations
- **Lazy Loading**: Route-based code splitting
- **Component Caching**: Keep-alive for frequently accessed components
- **Asset Optimization**: Image compression and SVG sprites
- **Bundle Analysis**: Built-in webpack bundle analyzer