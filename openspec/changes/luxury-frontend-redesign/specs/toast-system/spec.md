## ADDED Requirements

### Requirement: Toast store
A Zustand store at `src/stores/toast.ts` SHALL manage a queue of toast messages. Each toast SHALL have the following shape:

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  duration?: number; // ms, default 3000
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

The store SHALL expose:
- `toasts: Toast[]` — current toast queue
- `addToast(toast: Omit<Toast, 'id'>): string` — adds a toast, returns its id
- `removeToast(id: string): void` — removes a toast by id
- `clearToasts(): void` — removes all toasts

The toast SHALL auto-generate a unique id using `crypto.randomUUID()`.

#### Scenario: Toast is added to the store
- **WHEN** `addToast({ type: 'success', title: 'Added to cart', description: 'Product name' })` is called
- **THEN** a new toast SHALL appear in the `toasts` array
- **AND** it SHALL have a unique `id` property

#### Scenario: Toast is removed manually
- **WHEN** `removeToast(id)` is called
- **THEN** the toast with that id SHALL be removed from the `toasts` array
- **AND** other toasts SHALL remain unaffected

### Requirement: ToastContainer component
A `<ToastContainer>` component SHALL render at the root level (inside LayoutShell). It SHALL:
- Render as a fixed overlay at the top-right of the viewport (top: 24px, right: 24px)
- Have a z-index above all other elements (z-50 or higher)
- Render a list of active toasts from the store
- Each toast SHALL slide in from the right (GSAP slideToast animation, 400ms)
- Each toast SHALL auto-dismiss after its duration (default 3000ms) using the store's `removeToast`
- Each toast SHALL have a close button

#### Scenario: Toast appears on cart action
- **WHEN** a user adds an item to the cart
- **THEN** a success toast SHALL appear at the top-right
- **AND** it SHALL slide in from the right over 400ms
- **AND** it SHALL show "Added to cart" as the title

#### Scenario: Toast auto-dismisses
- **WHEN** a toast has been visible for its duration (default 3000ms)
- **THEN** it SHALL slide out to the right over 300ms
- **AND** SHALL be removed from the store

#### Scenario: Multiple toasts stack
- **WHEN** multiple toasts are added in quick succession
- **THEN** they SHALL stack vertically from top to bottom
- **AND** each subsequent toast SHALL appear below the previous one
- **AND** the stack SHALL NOT exceed 3 visible toasts (older ones SHALL be removed)

### Requirement: Toast visual styles
Each toast SHALL have:
- Background: white (#ffffff)
- Text: ink (#1a1a1a) for title, dark (#333333) for description
- Left border accent: 3px solid, coloured by type (success: #7d9b6e, error: #c96b6b, info: #c9a96e)
- Border radius: 0px
- Shadow: elevated shadow token
- Width: 360px
- Padding: 16px
- Close button: top-right, subtle, muted colour

#### Scenario: Toast types have distinct left borders
- **WHEN** a success toast renders
- **THEN** its left border SHALL be green (#7d9b6e)
- **WHEN** an error toast renders
- **THEN** its left border SHALL be red (#c96b6b)
- **WHEN** an info toast renders
- **THEN** its left border SHALL be brass gold (#c9a96e)

### Requirement: Integration with cart store
The cart store SHALL call `addToast` when items are added or removed:
- `addItem`: triggers success toast "Added to cart" with the product name
- `removeItem`: triggers info toast "Removed" with an "Undo" action button
- `clearCart`: triggers info toast "Cart cleared" (undo not required for full clear)

This SHALL be implemented by importing and calling the toast store from within the cart store actions, NOT by updating every component that calls the cart store.

#### Scenario: Cart add triggers toast
- **WHEN** a user adds a product to the cart
- **THEN** the cart store SHALL call `addToast` with type 'success' and title 'Added to cart'
- **AND** the description SHALL contain the product name

#### Scenario: Cart remove shows undo toast
- **WHEN** a user removes an item from the cart
- **THEN** the cart store SHALL call `addToast` with type 'info' and title 'Removed'
- **AND** the toast SHALL have an action button labelled 'Undo'
- **AND** clicking 'Undo' SHALL add the item back to the cart
