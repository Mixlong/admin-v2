# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Vue 2.6 enterprise admin management system** (迪太云管理后台) with micro-frontend architecture using Wujie (无界). The system handles manufacturing, production management, device testing, quality control (IQC), and workflow automation for an industrial/IoT environment.

**Tech Stack:**
- Vue 2.6.10 + Vue Router + Vuex
- Element UI 2.15.12
- Wujie micro-frontend framework
- Vue CLI 4.4.4 with custom webpack optimization
- Node.js requirement: >=8.9 (main app uses Node 12.22.12)

## Development Commands

### Setup & Installation
```bash
# Install dependencies (recommended: use Taobao registry)
npm install --registry=https://registry.npm.taobao.org

# Update local IP for micro-frontend configuration
npm run update-ip
```

### Development Server
```bash
# Start development server (port 2025)
npm run dev
# or
npm start

# Start micro-frontend development environment (both main + sub apps)
./dev-start.sh
```

### Building
```bash
# Build for production
npm run build

# Build for development environment
npm run build:dev

# Build for test environment
npm run build:test

# Build for staging environment
npm run build:stage

# Analyze bundle size
npm run analyze
```

### Linting
```bash
# Lint and fix JavaScript and Vue files
npx eslint --fix src/**/*.{js,vue}
```

**Note:** Pre-commit hooks via Husky automatically run linting on staged files.

### Testing
This project uses Jest for unit testing (configured but test files need to be added):
```bash
# Run tests (when implemented)
npm run test:unit
```

## Architecture & Key Concepts

### Micro-Frontend Architecture

The system uses **Wujie (无界)** for seamless micro-frontend integration:

- **Configuration:** `src/config/microApps.js` - Defines micro app URLs with dynamic IP detection
- **Container Component:** `src/components/MicroAppContainer.vue` - Handles micro app lifecycle and communication
- **Route Format:** Micro apps use `micro:app-name:sub-path` format in route meta
- **Communication:** Uses Wujie's event bus for parent-child messaging and store synchronization

**Important:** The main app auto-detects local IP via `scripts/get-local-ip.js` and saves it to `src/config/local-ip.json`. This enables micro apps to connect correctly in development.

**Micro App Lifecycle:**
1. Route with `meta.microApp` triggers MicroAppContainer
2. Configuration parsed from `microApps.js` with environment-based URLs
3. Store data (user, token, permissions) synced to micro app via event bus
4. Micro app navigates to correct route using `subPath` parameter

### API Layer Organization

APIs are organized by business domain in `src/api/`:
- **device/**: Device testing and reporting APIs
- **production/**: Production scheduling and management
- **third/**: Third-party integrations (BOM, ECN, test scripts, samples)
- **system/**: System administration (users, roles, menus, config)
- **workflow/**: BPMN workflow engine APIs
- **iqc/**: Incoming Quality Control inspection
- **dut/**, **factory/**: Device Under Test and factory management

**Request Handler:** `src/utils/request.js` - Centralized axios instance with:
- JWT token authentication
- IAM integration via cookies
- Custom error code handling (401, 3001, 4003, 500)
- 180-second timeout
- Environment-based base URL

### State Management (Vuex)

Modularized store in `src/store/modules/`:
- **user**: Authentication, profile, permissions, roles
- **permission**: Dynamic route generation based on user roles
- **dict**: Dictionary data management
- **app**: Application state (sidebar, device type, size)
- **tagsView**: Tab navigation state
- **settings**: UI preferences
- **commonData**: Shared business data across components
- **socket**: WebSocket connections (available but currently commented out)

**Key Getters:** Defined in `src/store/getters.js` for convenient state access

### Permission System

**Three-Level Permission Control:**
1. **Route-level:** Dynamic routes generated in `src/permission.js` based on user roles
2. **Component-level:** Custom directives `v-hasPermi` and `v-hasRole`
3. **Button-level:** Fine-grained permission checks via `$auth` plugin

**Route Guard:** `src/permission.js` handles navigation guards, token validation, and dynamic menu generation

### Build Optimization Strategy

**Code Splitting (vue.config.js):**
- Vue core libraries (vue, vue-router, vuex) → separate chunk
- Element UI → `chunk-elementUI`
- Echarts → separate chunk for charts
- Common components (used 3+ times) → `chunk-commons`
- Third-party libraries → `chunk-libs`

**Production Optimizations:**
- Gzip compression for files >10KB
- Console statements removed in production
- Terser minification
- No source maps in production

**Performance:**
- Route-based lazy loading
- Keep-alive for cached components
- SVG sprite optimization

### Component Architecture

**Layout System:** `src/layout/`
- Main Layout container with nested components
- Navbar, Sidebar, TagsView (tabs), AppMain (content area)

**Reusable Components:** `src/components/`
- MicroAppContainer: Wujie micro-frontend wrapper
- Form builders, pagination, file upload, rich editors
- Data visualization components

**Business Components:** Organized by feature in `src/views/`

### Environment Configuration

Multiple environment files:
- `.env.development` - Development environment
- `.env.production` - Production environment  
- `.env.staging` - Staging environment
- `.env.test` - Test environment

**Key Variables:**
- `VUE_APP_BASE_API` - API base path for proxy
- `VUE_APP_BASE_URL` - Backend server URL
- `NODE_ENV` - Environment mode

**Dev Server:** Configured in `vue.config.js` with:
- Port 2025 (default)
- Host 0.0.0.0 (external access allowed)
- CORS headers enabled
- API proxy to backend

## Important Implementation Details

### Excel Export with Row Heights

The project uses `xlsx-style` which **requires manual patching after npm install**:

1. Navigate to `node_modules/xlsx-style/xlsx.js`
2. Find the `write_ws_xml_data` function
3. Replace it with the code provided in `README.md` (lines 47-92)

This patch enables proper row height handling in Excel exports.

**Reason:** The package has a bug that prevents correct row height rendering.

### ESLint Configuration

**Key Rules:**
- 2-space indentation
- Single quotes
- No semicolons
- Vue component names must be PascalCase
- No console statements in production (`no-debugger` only)

**Auto-fix on commit:** Husky runs `eslint --fix` on staged `.js` and `.vue` files

### Micro-Frontend IP Detection

Development workflow for micro apps:

1. Run `npm run update-ip` (or it runs automatically with `npm run dev`)
2. Script detects local network IP and saves to `src/config/local-ip.json`
3. Micro app URLs constructed as `http://{LOCAL_IP}:3002` in dev mode
4. In test/prod, uses configured domain URLs

**Fallback IP:** If detection fails, defaults to `192.168.2.15`

### Authentication Flow

1. User logs in → JWT token stored in cookies
2. Request interceptor adds `Authorization: Bearer {token}` header
3. Response interceptor handles:
   - 401/3001: Token expired → prompt re-login
   - 4003: Special auth error → show notification
   - 500: Server error → show error message

**Token Storage:** Managed by `src/utils/auth.js` using js-cookie

### Node Version Requirements

- **Main App:** Node 12.22.12 (specified in `.nvmrc`)
- **Micro Apps:** Node 20.18.0 (if using separate micro apps)
- **Minimum:** Node >=8.9, npm >= 3.0.0

Use `nvm` to switch between versions when developing both apps.

## Common Development Workflows

### Adding a New API Endpoint

1. Create/update API file in `src/api/{domain}/`
2. Import request utility: `import request from '@/utils/request'`
3. Export function that returns `request()` promise
4. Use in component via `this.$api.{domain}.{method}()` or direct import

### Adding a New Route

1. Add route configuration to `src/router/index.js` or let backend provide it
2. For micro-frontend routes, set `meta.microApp` with config object or string
3. For regular routes, create component in `src/views/`
4. Add permissions if needed: `permissions: ['system:user:list']`

### Adding a New Vuex Module

1. Create module file in `src/store/modules/{name}.js`
2. Import in `src/store/index.js` and add to modules
3. Add getters to `src/store/getters.js` if needed
4. Access via `this.$store.state.{module}` or `this.$store.getters.{getter}`

### Creating a Micro-Frontend Route

```javascript
{
  path: '/micro-route',
  component: MicroAppContainer,
  name: 'MicroRoute',
  hidden: true,
  meta: { 
    microApp: 'micro:ruoyi-admin:index' // Format: micro:{appName}:{subPath}
  }
}
```

### Working with Dictionary Data

The system uses a centralized dictionary management system:

1. Dictionaries loaded from backend and stored in Vuex `dict` module
2. Access via `this.dict.type.{dictType}` in components
3. Use `getDicts()` method to fetch dictionary data
4. Common dict types defined in business logic

## Project-Specific Patterns

### Request Error Handling

Custom error codes defined in `src/utils/errorCode.js`:
- Always check for 401, 3001, 4003 auth errors
- Display user-friendly messages via Element UI Message/Notification
- Network errors show "正在维护中" instead of technical details

### Dynamic Table Heights

Mixins in `src/mixins/dynamicTableHeight.js` calculate table heights based on viewport:
- Use this mixin for tables that need to fill available space
- Automatically adjusts on window resize

### File Upload Handling

Common upload component handles:
- File size limits
- File type restrictions  
- Progress tracking
- Multiple file uploads
- Preview for images

### Permission Directives

```vue
<!-- Hide button without permission -->
<el-button v-hasPermi="['system:user:add']">Add</el-button>

<!-- Hide button without role -->
<el-button v-hasRole="['admin']">Admin Only</el-button>
```

## Security Considerations

- JWT tokens encrypted with `jsencrypt` (RSA)
- Tokens stored in HTTP-only cookies when possible
- Request/response interceptors validate authentication
- Permission checks at multiple levels (route, component, button)
- CSRF protection via custom headers

## Performance Tips

- Use `v-if` for conditional rendering that rarely changes
- Use `v-show` for frequent toggles
- Leverage `keep-alive` for cached views (check route `meta.noCache`)
- Lazy-load heavy components with `() => import()`
- Use `Object.freeze()` for large read-only data arrays

## Debugging Tips

- Check browser console for Wujie micro-app logs (detailed logging enabled)
- Verify micro app IP configuration in `src/config/local-ip.json`
- Use Vue DevTools for Vuex state inspection
- Check Network tab for API request/response details
- ESLint errors shown in terminal during development
