# Underrated Cart 

A React Native (Expo) e-commerce application using DummyJSON as the mock backend.


## Tech Stack

- **Expo** (React Native, TypeScript)
- **React Navigation** — native-stack + bottom-tabs
- **Axios** for API calls
- **React Context** for state (Auth, Cart, Filter) — no external state library was needed at this scale
- **expo-secure-store** for persisting the auth token/user id
- **@expo/vector-icons** (Ionicons)

## Getting Started

```bash
npm install
npx expo start -c
```

Scan the QR code with Expo Go, or run on an emulator.

**Test login credentials (DummyJSON):**
```
username: emilys
password: emilyspass
```

## Folder Structure

```
underrated-cart/
├── App.tsx
├── assets/
│   ├── cart-icon.png
│   └── avatar-placeholder.png
└── src/
    ├── api/            # Axios calls per resource (auth, products, cart)
    ├── components/      # Reusable UI (AppButton, AppInput, ProductCard, ...)
    ├── context/          # AuthContext, CartContext, FilterContext
    ├── navigation/       # RootNavigator, AuthStack, AppStack, HomeStack
    ├── screens/          # One folder per screen
    ├── theme/            # Colors, spacing, typography tokens
    ├── types/            # Shared TypeScript types
    └── utils/            # SecureStore wrapper, category icon mapping
```

## Features Implemented

### 1. Authentication & Session Management
- Login via `POST /auth/login`, token + user id persisted with `expo-secure-store`
- Session rehydration on app boot — `AuthContext` checks stored token before deciding whether to show the Auth flow or the main app (`RootNavigator`)
- Current-user check via `GET /auth/me` (used on the Profile screen to show the real logged-in username/avatar)
- Clean logout with confirmation modal, clears stored token and resets cart

### 2. Product Catalog, Search & Filtering
- Product list, categories, and category-based browsing (`/products`, `/products/categories`, `/products/category/{name}`)
- Debounced live search (`/products/search`)
- Sorting by price (asc/desc) and name, using `sortBy`/`order` query params on the list/category endpoints; search and filtered results are re-sorted client-side since DummyJSON's search endpoint doesn't reliably honor sort params
- A dedicated Filter screen (gender, brand — multi-select, price range) that filters a fetched product pool client-side, since DummyJSON has no server-side filter endpoint for these fields

### 3. Cart CRUD & Checkout
- **Add**: `POST /carts/add` — creates the mock cart and stores its id
- **Read**: `GET /carts/user/{userId}` — called on boot to satisfy the read requirement (see reflection below for why it isn't merged into the UI cart)
- **Update**: `PUT /carts/{cartId}` — fired whenever quantity changes or an item is added after the first
- **Delete**: `DELETE /carts/{cartId}` — fired when an order is placed (cart is cleared)
- Local Context state is the actual source of truth driving the UI (see reflection)
- Full checkout flow: Cart → Checkout (address + payment method UI, order summary) → Order Now → Success screen, which resets the navigation stack back to Home

## Engineering Reflection

*(Required by the assessment's Technical Documentation Note.)*

### Architectural Challenges Faced

**1. Mock state persistence synchronization (Cart).**
DummyJSON's cart write endpoints (`POST /carts/add`, `PUT /carts/{id}`, `DELETE /carts/{id}`) accept requests and return a plausible-looking response, but nothing is actually stored server-side between requests. Calling `GET /carts/user/{userId}` immediately after an add/update always returns DummyJSON's original seeded demo data for that user, never the item that was just added. This breaks the usual assumption that "the API response is the new truth" — if the UI had refetched the cart from the server after every write (as it would against a real backend), the user's own actions would appear to silently vanish and be replaced by unrelated seeded products.

**2. Cross-context data dependency.**
The cart write endpoints require a `userId`, which is only known after login. This meant `CartContext` couldn't be self-contained — it needed to read from `AuthContext`, which in turn dictated the provider nesting order in `App.tsx` (`AuthProvider` → `CartProvider` → `FilterProvider`) and meant `AuthContext` had to be extended to persist and expose `userId`, not just the access token.

**3. Race condition passing filtered results between screens.**
An early version of the Product Filter screen returned its results to Home via React Navigation route params (`navigation.navigate('HomeMain', { filteredProducts })`). In testing, the filtered list would flash on screen and then silently revert to the unfiltered list. Root cause: Home's initial product-list fetch (still in flight from when Home first mounted, before the user ever opened the Filter screen) would resolve *after* the filtered params were applied and unconditionally call `setProducts()` with the stale unfiltered data — overwriting the filter the user had just applied.

**4. Nested navigation for a single tab's multi-step flow.**
The Home tab needed a full push/pop flow of its own (Home → Product Filter → Product Details → Cart → Checkout → Success) while still living inside a bottom tab bar shared with Profile. A flat screen list per tab wasn't enough to model this.

### Engineering Solutions

**1. Local state as the single source of truth, API calls as a side effect.**
`CartContext` holds the actual cart (`items[]`) in React state and updates it synchronously and optimistically on every add/update/remove — the UI never waits on, or depends on, the DummyJSON response. The corresponding `/carts/*` API call is fired *after* the local update, purely to demonstrate the required integration; its result is intentionally never used to overwrite local state, and failures are caught and silently ignored since correctness of the UI never depended on them succeeding. The one required read call, `GET /carts/user/{userId}`, is made once on app boot to satisfy the requirement explicitly, but its (unrelated, pre-seeded) data is deliberately *not* merged into the visible cart — merging it would show the user items they never actually added, which is worse UX than simply not using that response.

**2. Explicit dependency flow between contexts, not a shared global store.**
Rather than reaching for a heavier state library, `AuthContext` was extended with a minimal `userId` field (persisted via `expo-secure-store` alongside the token), and `CartContext` reads it with `useAuth()`. This keeps each context's responsibility narrow and makes the dependency (`Cart` needs `Auth`) explicit and traceable in `App.tsx`'s provider order, rather than implicit and undocumented.

**3. Moved cross-screen data out of navigation entirely, into a dedicated context.**
Once the race condition was identified, filter results were moved out of route params into a small `FilterContext` that sits above the navigator. `ProductFilterScreen` calls `applyFilter(results, label)` and simply `goBack()`s; `HomeScreen` reads `filterResult` directly from context. This removed the dependency on navigation's params-merge and screen mount/remount timing entirely — the data no longer travels through, or is at the mercy of, the navigation lifecycle. As a second, defence-in-depth safety net, `HomeScreen` also tracks a `filterAppliedRef` that any in-flight background fetch checks before calling `setProducts()`, so even an unrelated stale request from a previous action can no longer clobber the most recent user-driven state.

**4. Nested stack navigator per tab.**
`HomeStack` (a native-stack navigator covering Home, Filter, Product Details, Cart, Checkout, and Success) is used as the component for the "Home" tab inside `AppStack` (a bottom-tabs navigator). This keeps the tab bar persistently visible during normal browsing while still allowing an ordinary push/pop stack — including a full stack reset (`CommonActions.reset`) on the Success screen — for the deeper checkout flow, without those screens needing their own tab bar entries.

## Known Limitations

- Color/size product filters shown in the design have no equivalent in DummyJSON's product data, so Size is shown as a static mock selector on the Product Details screen and Color was left out entirely.
- Payment method and delivery address on the Checkout screen are static UI (no real payment gateway or address form was in scope for this assessment).
- DummyJSON auth tokens expire after 60 minutes (`expiresInMins: 60`); there's no refresh-token flow implemented, so a long-idle session will need to log in again.
