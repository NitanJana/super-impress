# UI Component Architecture

DECISION STATUS: **PENDING**

## Overview

Super Impress uses a **three-layer component architecture** for building the user interface. This architecture provides clear separation of concerns while enabling rapid development and future flexibility.

**The Three Layers:**

1. **Primitive Layer** - Low-level, reusable UI components (Button, Input, Label, etc.)
2. **Composite Layer** - Mid-level composed components (FormField, Card, Dialog, etc.)
3. **Pattern Layer** - High-level, application-specific components (LoginForm, SearchBar, etc.)

**Progressive Enhancement Strategy:**
We're adopting a progressive enhancement approach where new features use the design system while existing code migrates opportunistically during feature work. The long-term vision is a fully opinionated design system where **no raw HTML elements or Tailwind/Daisy classes are allowed outside the primitive layer**.

## Three-Layer Architecture

### Primitive Layer

**Location:** `/frontend/src/lib/components/ui/`

**Purpose:** Low-level, highly reusable UI primitives that form the foundation of the design system.

**Characteristics:**

- Wrap Bits UI primitives OR enhance HTML elements
- Use CVA (Class Variance Authority) for type-safe variant management
- Apply Daisy UI classes for styling
- Export variant configurations for external use
- Support Svelte 5 runes (`$props()`, `$bindable()`)
- No business logic - only UI presentation

**Examples:** Button, Input, Label, Select, Checkbox, Radio, Textarea, Badge, Switch, Slider

**Current Primitives (3):**

- `button.svelte` - Wraps Bits UI Button.Root with Daisy btn classes
- `input.svelte` - Enhanced HTML input with proper TypeScript typing
- `label.svelte` - Wraps Bits UI Label.Root with Daisy label class

### Composite Layer

**Location:** `/frontend/src/lib/components/composite/`

**Purpose:** Mid-level components that compose primitives to create common UI patterns.

**Characteristics:**

- Built exclusively from primitive components
- Encapsulate repetitive composition patterns
- Handle internal state and layout
- Reduce boilerplate in feature code
- Still domain-agnostic (reusable across features)

**Examples:** FormField, Card, Dialog, Alert, DataTable, Popover, Dropdown, Tabs

**Status:** This layer does not exist yet. First composite will be FormField.

### Pattern Layer

**Location:** `/frontend/src/lib/features/{feature}/`

**Purpose:** High-level, application-specific components with feature/domain logic.

**Characteristics:**

- Compose primitives and composites
- Contain business logic and state management
- Feature-specific, not necessarily reusable
- Eventually should use zero raw HTML or classes

**Examples:** LoginForm, RegisterForm, SearchBar, UserProfileCard, DataTableWithFilters

**Current State:** Feature components (login.svelte, register.svelte) currently use raw HTML elements with Daisy classes directly. This is acceptable during migration but will be refactored to use composites.

## Library Rationale

### Bits UI (v2.14.3)

**Why Bits UI:**

- **Headless components**: Unstyled primitives provide full styling control
- **Accessibility built-in**: ARIA attributes, keyboard navigation, focus management
- **Svelte-first**: Designed specifically for Svelte with rune support
- **Flexible API**: Composable builders with context-based state management
- **No styling opinions**: We control 100% of the visual design
- **Active maintenance**: Regular updates, good documentation

**Usage Pattern:**

```svelte
import { Button as ButtonPrimitive } from 'bits-ui';

<ButtonPrimitive.Root class={ourStyles} {...props}>
  {content}
</ButtonPrimitive.Root>
```

**Why not alternatives:**

- **Melt UI**: Similar to Bits UI, but Bits has better DX with component-style API
- **Headless UI**: React-focused, not Svelte-native
- **Radix UI**: React-only, would require Svelte wrappers

### Daisy UI (v5.4.5)

**Why Daisy UI:**

- **Rapid MVP development**: Pre-styled components accelerate development
- **Semantic class names**: `btn`, `input`, `card` are intuitive and readable
- **Built-in theming**: Color schemes, dark mode support out of the box
- **Tailwind integration**: Works seamlessly with Tailwind CSS utilities
- **Consistent design**: Opinionated styles ensure visual consistency
- **Low effort, high polish**: Production-ready styles without custom CSS

**Usage Pattern:**

```svelte
<!-- Daisy classes applied in primitive components -->
<button class="btn btn-primary">Click me</button>
<input class="input input-bordered" />
```

**Trade-offs:**

- **Pro**: Fast MVP, consistent theming, no design decisions needed
- **Con**: Vendor lock-in, harder to customize deeply, Daisy's opinions
- **Mitigation**: Primitives abstract Daisy - can swap to custom styles later

**Path to Custom Design System:**
When we're ready to move away from Daisy:

1. Design custom theme tokens (colors, spacing, typography)
2. Update primitive components to use custom Tailwind classes
3. Remove Daisy UI dependency
4. **No changes needed to composite or pattern layers** - this is the key benefit

### Class Variance Authority (CVA v0.7.1)

**Why CVA:**

- **Type-safe variants**: Full TypeScript support with autocomplete
- **Composable configs**: Easy to extend and override variants
- **Clean API**: Intuitive syntax for defining component variations
- **Prevents conflicts**: Works with `tailwind-merge` to avoid class collisions
- **Industry standard**: Used by shadcn/ui and similar systems

**Usage Pattern:**

```svelte
<script lang="ts" module>
import { cva } from 'class-variance-authority';

export const buttonVariants = cva('btn', {
  variants: {
    variant: {
      default: 'btn-primary',
      ghost: 'btn-ghost',
      outline: 'btn-outline'
    },
    size: {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
});
</script>
```

**Benefits:**

- Variant props get full TypeScript inference
- Exported variants can be reused in other components
- Clear contract for component API

### Tailwind CSS v4

**Why Tailwind CSS v4:**

- **Utility-first**: Rapid UI development without context switching
- **Modern syntax**: `@import 'tailwindcss'` and `@plugin` directives
- **Performance**: Lightning-fast builds with Vite plugin
- **Excellent DX**: IntelliSense autocomplete, class sorting with Prettier
- **Tree-shakable**: Only used utilities included in bundle
- **Customizable**: Easy to extend with custom utilities and plugins

**Configuration:**

```css
/* frontend/src/app.css */
@import "tailwindcss";
@plugin 'daisyui';
```

**Why v4 over v3:**

- Simpler configuration (no tailwind.config.js needed)
- Faster builds with native Vite plugin
- Better CSS-first approach
- Future-proof for Tailwind's direction

## Component Implementation Patterns

### Primitive Component Example: Button

**File:** `frontend/src/lib/components/ui/button.svelte`

```svelte
<script lang="ts" module>
	import type { Button as ButtonPrimitiveTypes } from 'bits-ui';
	import { cva, type VariantProps } from 'class-variance-authority';

	export const buttonVariants = cva('btn', {
		variants: {
			variant: {
				default: 'btn-primary',
				neutral: 'btn-neutral',
				secondary: 'btn-secondary',
				accent: 'btn-accent',
				info: 'btn-info',
				success: 'btn-success',
				warning: 'btn-warning',
				error: 'btn-error',
				ghost: 'btn-ghost',
				link: 'btn-link',
				outline: 'btn-outline'
			},
			size: {
				default: '',
				xs: 'btn-xs',
				sm: 'btn-sm',
				md: 'btn-md',
				lg: 'btn-lg'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = ButtonPrimitiveTypes.RootProps & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button as ButtonPrimitive } from 'bits-ui';

	let {
		variant = 'default',
		size = 'default',
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<ButtonPrimitive.Root
	bind:ref
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children?.()}
</ButtonPrimitive.Root>
```

**Key Features:**

- Module script exports variant configuration and types
- Wraps Bits UI Button.Root for accessibility
- Uses CVA for variant management
- Applies Daisy UI classes
- Supports custom className via `cn()` utility
- Full TypeScript support

### Composite Component Example: FormField (Future)

**File:** `frontend/src/lib/components/composite/form-field.svelte` (to be created)

```svelte
<script lang="ts">
	import type { AnyFieldApi } from '@tanstack/svelte-form';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
	import Label from '$lib/components/ui/label.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { cn } from '$lib/utils/cn';

	type Props = {
		field: AnyFieldApi;
		label: string;
		type?: HTMLInputTypeAttribute;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLInputAttributes, 'type' | 'value' | 'class'>;

	let {
		field,
		label,
		type = 'text',
		class: className,
		children,
		...inputProps
	}: Props = $props();

	let hasError = $derived(field.state.meta.isTouched && !field.state.meta.isValid);
</script>

<div class={cn('form-control', className)}>
	<Label for={field.name}>{label}</Label>
	<Input
		id={field.name}
		name={field.name}
		value={field.state.value}
		{type}
		class={cn(hasError && 'input-error')}
		aria-invalid={hasError}
		onchange={(e) => {
			const target = e.target as HTMLInputElement;
			field.handleChange(target.value);
		}}
		{...inputProps}
	/>
	{#if hasError}
		{#each field.state.meta.errors as error}
			<em role="alert" class="text-error text-sm">{error}</em>
		{/each}
	{/if}
	{@render children?.()}
</div>
```

**Benefits:**

- Encapsulates Label + Input + error display pattern
- Integrates with Tanstack Form field API
- Reduces boilerplate in forms
- Consistent error handling across all forms
- Uses only primitive components (no raw HTML)

### Pattern Component Example: LoginForm

**Current State** (from `frontend/src/lib/features/auth/login/login.svelte:44-110`):

```svelte
<form onsubmit={...} class="my-4">
	<!-- Raw fieldset with Daisy classes -->
	<fieldset
		class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
		disabled={loginMutation.isPending}
	>
		<legend class="fieldset-legend">Log In to your account</legend>

		<!-- Repetitive pattern for each field -->
		<form.Field name="email">
			{#snippet children(field)}
				<Label for={field.name}>Email</Label>
				<Input
					id={field.name}
					name={field.name}
					value={field.state.value}
					type="email"
					class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
					aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
					autocomplete="email"
					onchange={(e) => field.handleChange(e.target.value)}
				/>
				<FieldInfo {field} />
			{/snippet}
		</form.Field>

		<form.Field name="password">
			{#snippet children(field)}
				<Label for={field.name}>Password</Label>
				<Input
					id={field.name}
					name={field.name}
					value={field.state.value}
					type="password"
					class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
					aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
					autocomplete="current-password"
					onchange={(e) => field.handleChange(e.target.value)}
				/>
				<FieldInfo {field} />
			{/snippet}
		</form.Field>

		<Button type="submit" class="mt-4">
			{loginMutation.isPending ? 'Logging in...' : 'Log in'}
		</Button>
	</fieldset>
</form>
```

**Issues with current approach:**

- Raw `<fieldset>` and `<legend>` HTML elements
- Daisy UI classes (`fieldset`, `rounded-box`, `border-base-300`) directly in feature code
- Repetitive boilerplate for each field (Label + Input + error handling)
- Inconsistent error display (FieldInfo vs inline error messages)

**Future State** (using composites):

```svelte
<script lang="ts">
	import Card from '$lib/components/composite/card.svelte';
	import CardHeader from '$lib/components/composite/card-header.svelte';
	import CardTitle from '$lib/components/composite/card-title.svelte';
	import CardContent from '$lib/components/composite/card-content.svelte';
	import FormField from '$lib/components/composite/form-field.svelte';
	import Button from '$lib/components/ui/button.svelte';
	// ... form setup code
</script>

<form onsubmit={...}>
	<Card variant="bordered" class="w-xs">
		<CardHeader>
			<CardTitle>Log In to your account</CardTitle>
		</CardHeader>
		<CardContent>
			<form.Field name="email">
				{#snippet children(field)}
					<FormField {field} label="Email" type="email" autocomplete="email" />
				{/snippet}
			</form.Field>

			<form.Field name="password">
				{#snippet children(field)}
					<FormField {field} label="Password" type="password" autocomplete="current-password" />
				{/snippet}
			</form.Field>

			<Button type="submit" class="mt-4">
				{loginMutation.isPending ? 'Logging in...' : 'Log in'}
			</Button>
		</CardContent>
	</Card>
</form>
```

**Benefits of future approach:**

- Zero raw HTML elements - all from design system
- No Daisy classes in feature code
- Less boilerplate - FormField handles Label + Input + errors
- Consistent patterns across all forms
- Easy to update styling by changing composites
- Clear component hierarchy

## Migration Guidelines

We're using a **progressive enhancement** strategy: new features use the design system while existing code migrates opportunistically during feature work. This avoids big-bang rewrites while steadily improving the codebase.

### Phase 1: Complete Primitive Layer (Immediate - Next Sprint)

**Goal:** Build a comprehensive set of primitive components.

**Tasks:**

- [ ] Audit existing UI needs from current feature components
- [ ] Create missing primitives:
  - [ ] Select (dropdown)
  - [ ] Checkbox
  - [ ] Radio
  - [ ] Textarea
  - [ ] Badge
  - [ ] Switch/Toggle
  - [ ] Avatar
  - [ ] Spinner/Loading
- [ ] Standardize CVA variant patterns across all primitives
- [ ] Document all primitives with usage examples
- [ ] Create component playground or Storybook

**Success Criteria:**

- All common HTML form elements have primitive wrappers
- Consistent API patterns across primitives
- Full TypeScript support with exported types
- Documentation exists for each primitive

### Phase 2: Build Composite Layer (Short-term - 1-2 Months)

**Goal:** Create composite components that encapsulate common patterns.

**Priority 1 Composites (Build First):**

- [ ] **FormField** - Label + Input + error display (highest priority)
- [ ] **Card** family - Card, CardHeader, CardTitle, CardContent, CardFooter
- [ ] **Alert** - Success/error/warning/info messages

**Priority 2 Composites (Build Next):**

- [ ] **Dialog/Modal** - Overlay dialogs with close button
- [ ] **Dropdown** - Button + menu pattern
- [ ] **Tabs** - Tab navigation pattern
- [ ] **Table** - Data table with sorting/pagination

**Guidelines:**

- Composites must use only primitive components
- No raw HTML allowed in composites
- Proper TypeScript types with generics where needed
- Handle common state internally (open/close, active tab, etc.)
- Export sensible defaults while allowing customization

**Success Criteria:**

- FormField reduces form boilerplate by 50%+
- Card family used consistently for content grouping
- All composites have TypeScript types
- Documentation with before/after examples

### Phase 3: Migrate Pattern Components (Medium-term - 3-6 Months)

**Goal:** Refactor existing feature components to use composites.

**Migration Order (by feature):**

1. **Auth feature** (login.svelte, register.svelte)
   - Replace raw fieldset with Card composite
   - Replace Label + Input + FieldInfo with FormField composite
   - Remove Daisy classes from feature code
2. **Dashboard feature** (when built)
   - Use Card composites for data displays
   - Use Table composite for data tables
3. **Other features** (as they're touched)
   - Opportunistic migration during feature work
   - Always use design system for new code

**Migration Process for Each Component:**

1. Identify raw HTML and direct Daisy class usage
2. Determine which composites to use (or create new ones)
3. Refactor component to use composites
4. Test thoroughly (visual regression, accessibility, functionality)
5. Remove unused imports and helper components
6. Document any new patterns discovered

**Success Criteria:**

- Auth feature has zero raw HTML outside primitives
- Auth feature has zero Daisy classes outside primitives
- New features start with design system by default
- Reduced code duplication across features

### Phase 4: Enforce Design System (Long-term - 6+ Months)

**Goal:** Prevent future violations and ensure design system compliance.

**Enforcement Mechanisms:**

- [ ] **ESLint rule**: Warn/error on raw HTML elements in `/features/` directory
  - Allow: imports, scripts, text content
  - Disallow: `<div>`, `<button>`, `<input>`, `<fieldset>`, etc.
- [ ] **Stylelint rule**: Warn on Tailwind classes in feature code
  - Allow: classes on imported components
  - Disallow: `class="bg-blue-500"` etc. in features
- [ ] **PR review checklist**: Design system compliance check
- [ ] **Documentation**: Onboarding guide for new developers
- [ ] **Component gallery**: Searchable component documentation

**Success Criteria:**

- ESLint catches design system violations in CI
- PR template includes design system checklist
- New developers can find components easily
- Zero raw HTML in feature code (enforced)

## Future Opinionated Design System

### Vision

The long-term goal is a **fully opinionated design system** where:

- ✅ Zero raw HTML elements outside the primitive layer
- ✅ Zero Tailwind/Daisy classes outside the primitive layer
- ✅ All UI comes from composed design system components
- ✅ Consistent visual language across the entire application
- ✅ Easy to swap styling libraries by updating only primitives
- ✅ Automated enforcement via linting and CI
- ✅ Self-documenting component gallery

### Benefits

**For Developers:**

- No design decisions needed - components enforce consistency
- Faster feature development with less boilerplate
- Autocomplete guides to available components
- Easy to onboard new team members

**For Users:**

- Consistent, polished UI across all features
- Reliable accessibility (built into primitives)
- Consistent keyboard navigation and interactions

**For Maintenance:**

- Single source of truth for UI patterns
- Visual changes happen in one place (primitives)
- Easy to swap design libraries (only change primitives)
- Reduced CSS bundle size (no duplicate styles)

### Enforcement Strategy

**Progressive Enhancement (Current):**

- New features MUST use design system components
- Old code migrates opportunistically during feature work
- No hard deadlines - steady progress over time

**Automated Enforcement (Future):**

```js
// .eslintrc.js (future)
{
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXElement[name.name="button"]',
        message: 'Use <Button> from $lib/components/ui/button.svelte instead of <button>'
      },
      {
        selector: 'JSXElement[name.name="input"]',
        message: 'Use <Input> from $lib/components/ui/input.svelte instead of <input>'
      }
      // ... more HTML elements
    ]
  }
}
```

**PR Review Guidelines:**

- [ ] Does this PR use raw HTML in feature code? → Request changes
- [ ] Does this PR add Daisy/Tailwind classes in features? → Request changes
- [ ] Does this PR need a new component not in the design system? → Discuss
- [ ] Are all new components properly typed and documented? → Verify

### Path to Custom Design System

Currently using Daisy UI for rapid MVP development. When we're ready to build a custom design system:

**Step 1: Design Phase**

- Define design tokens (colors, spacing, typography, shadows, etc.)
- Create Figma design system with all components
- Document component states and variants

**Step 2: Migration Phase**

- Update primitive components to use custom Tailwind classes
- Remove Daisy UI plugin from Tailwind config
- Test all components visually

**Step 3: Cleanup Phase**

- Remove Daisy UI dependency from package.json
- Update documentation
- Celebrate independence from Daisy!

**Critical Insight:**
Because composites and patterns only use primitives, **we only need to update the primitive layer** (3 files currently, maybe 15-20 files eventually). The entire app updates automatically.

## File Organization

```
frontend/src/lib/
├── components/
│   ├── ui/                          # Primitive layer (15-20 components)
│   │   ├── button.svelte            # ✅ Exists
│   │   ├── input.svelte             # ✅ Exists
│   │   ├── label.svelte             # ✅ Exists
│   │   ├── select.svelte            # ⏳ To be created
│   │   ├── checkbox.svelte          # ⏳ To be created
│   │   ├── radio.svelte             # ⏳ To be created
│   │   ├── textarea.svelte          # ⏳ To be created
│   │   ├── badge.svelte             # ⏳ To be created
│   │   ├── switch.svelte            # ⏳ To be created
│   │   ├── avatar.svelte            # ⏳ To be created
│   │   ├── spinner.svelte           # ⏳ To be created
│   │   └── ...                      # More primitives as needed
│   └── composite/                   # Composite layer (10-15 components)
│       ├── form-field.svelte        # ⏳ Priority 1
│       ├── card.svelte              # ⏳ Priority 1
│       ├── card-header.svelte       # ⏳ Priority 1
│       ├── card-title.svelte        # ⏳ Priority 1
│       ├── card-content.svelte      # ⏳ Priority 1
│       ├── card-footer.svelte       # ⏳ Priority 1
│       ├── alert.svelte             # ⏳ Priority 1
│       ├── dialog.svelte            # ⏳ Priority 2
│       ├── dropdown.svelte          # ⏳ Priority 2
│       ├── tabs.svelte              # ⏳ Priority 2
│       ├── table.svelte             # ⏳ Priority 2
│       └── ...                      # More composites as needed
├── features/                        # Pattern layer (feature-specific)
│   ├── auth/
│   │   ├── login/
│   │   │   ├── login.svelte         # Pattern component
│   │   │   └── api.ts
│   │   ├── register/
│   │   │   ├── register.svelte      # Pattern component
│   │   │   └── api.ts
│   │   └── field-info.svelte        # ⚠️ Will be replaced by FormField composite
│   └── dashboard/
│       └── ...
├── layouts/
│   └── auth-layout.svelte
└── utils/
    └── cn.ts                        # tailwind-merge utility
```

**Legend:**

- ✅ Exists
- ⏳ To be created
- ⚠️ Will be replaced

## Implementation Checklist

### Immediate (Next Sprint)

**Primitive Layer:**

- [x] Button primitive (exists)
- [x] Input primitive (exists)
- [x] Label primitive (exists)
- [ ] Select primitive
- [ ] Checkbox primitive
- [ ] Radio primitive
- [ ] Textarea primitive
- [ ] Badge primitive

**Documentation:**

- [ ] Document existing primitives with usage examples
- [ ] Create component playground or Storybook setup
- [ ] Standardize CVA variant patterns

### Short-term (1-2 Months)

**Composite Layer:**

- [ ] FormField composite (highest priority)
- [ ] Card composite family (Card, CardHeader, CardTitle, CardContent, CardFooter)
- [ ] Alert composite
- [ ] Dialog composite

**Feature Migration:**

- [ ] Migrate login.svelte to use FormField and Card composites
- [ ] Migrate register.svelte to use FormField and Card composites
- [ ] Remove field-info.svelte (replaced by FormField)

### Medium-term (3-6 Months)

**Remaining Composites:**

- [ ] Dropdown composite
- [ ] Tabs composite
- [ ] Table composite with sorting/pagination
- [ ] Popover composite

**Feature Development:**

- [ ] All new features use design system by default
- [ ] Dashboard feature built with design system
- [ ] No new raw HTML in feature code

### Long-term (6+ Months)

**Enforcement:**

- [ ] ESLint rule: no raw HTML in features
- [ ] Stylelint rule: warn on Tailwind classes in features
- [ ] PR review checklist for design system compliance
- [ ] Automated visual regression testing

**Design System Evolution:**

- [ ] Component gallery/documentation site
- [ ] Design custom theme tokens
- [ ] Evaluate migrating from Daisy UI to custom primitives
- [ ] Full design system documentation

## Known Limitations & Trade-offs

### Current State

**Limitations:**

- Only 3 primitives exist (Button, Input, Label)
- No composite layer exists yet
- Feature code uses raw HTML with Daisy classes directly
- No enforcement of architecture boundaries
- No component documentation or gallery

**Technical Debt:**

- `field-info.svelte` is a one-off component that should be part of FormField
- Inconsistent error handling patterns across forms
- Direct Daisy class usage in feature code couples us to Daisy

### Trade-offs

#### Daisy UI Dependency

**Pro:**

- Rapid MVP development without custom design
- Consistent, polished UI out of the box
- Built-in theming and dark mode
- Active maintenance and community

**Con:**

- Vendor lock-in to Daisy's design opinions
- Harder to deeply customize styles
- Coupling to Daisy's class names
- Adds bundle size

**Mitigation:**
Primitive layer abstracts Daisy UI. When ready, we can migrate to custom styles by updating only primitives (~15-20 components) without touching composites or patterns.

#### Three-Layer Complexity

**Pro:**

- Clear separation of concerns
- Better code reusability
- Easier to maintain and update
- Enforces consistent patterns

**Con:**

- More files and indirection
- Steeper learning curve for new developers
- More boilerplate initially
- Requires discipline to maintain boundaries

**Mitigation:**
Start simple (only create composites when patterns repeat 3+ times). Document architecture clearly. Provide examples.

#### Progressive Enhancement

**Pro:**

- No big-bang rewrite - less risky
- Incremental value delivery
- Team learns the system gradually
- Old code still works during migration

**Con:**

- Inconsistent patterns during migration period
- Mixed old and new approaches in codebase
- Requires developer discipline
- Takes longer to realize full benefits

**Mitigation:**
Clear migration plan with priorities. Always use design system for new features. Opportunistic migration during feature work.

### Future Risks

**Bits UI Breaking Changes:**

- Risk: Major version updates could break primitives
- Mitigation: Pin versions, test thoroughly before upgrading, primitives abstract most breaking changes

**CVA Bundle Size:**

- Risk: Many variants could bloat bundle size
- Mitigation: Tree-shaking helps, use variants judiciously, measure bundle size

**Tailwind v4 Changes:**

- Risk: v4 is still evolving, breaking changes possible
- Mitigation: Pin version, follow Tailwind changelog, test upgrades carefully

**Over-abstraction:**

- Risk: Creating too many composites/primitives for rare use cases
- Mitigation: Only create components when pattern repeats 3+ times

## References & Resources

### Documentation

- [Bits UI Documentation](https://bits-ui.com) - Headless component primitives
- [Daisy UI Components](https://daisyui.com/components/) - Pre-styled component library
- [CVA Documentation](https://cva.style/docs) - Class Variance Authority
- [Tailwind CSS v4](https://tailwindcss.com) - Utility-first CSS framework
- [Tailwind Merge](https://github.com/dcastil/tailwind-merge) - Utility for merging Tailwind classes

### Inspiration

- [shadcn/ui](https://ui.shadcn.com) - Original component architecture pattern (React)
- [shadcn-svelte](https://shadcn-svelte.com) - Svelte adaptation of shadcn/ui
- [Melt UI](https://melt-ui.com) - Alternative headless primitives for Svelte
- [Ark UI](https://ark-ui.com) - Headless components (multi-framework)

### Internal References

- `/decisions/tech/1-svelte.md` - Why we chose Svelte
- `/decisions/tech/6-authentication.md` - Authentication implementation
- `/frontend/src/lib/components/ui/button.svelte` - Example primitive component
- `/frontend/src/lib/features/auth/login/login.svelte` - Current pattern usage (to be migrated)
