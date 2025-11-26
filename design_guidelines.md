# Portfolio Website Design Guidelines

## Design Approach

**Reference-Based Approach** - Drawing inspiration from developer-focused platforms:
- **Linear**: Clean typography, generous spacing, subtle interactions
- **Vercel**: Developer-centric minimalism, strong hierarchy
- **GitHub**: Technical credibility, card-based layouts
- **Stripe**: Professional restraint, clarity over decoration

**Design Principles**:
1. Professional credibility for DevOps engineer audience
2. Content-first approach - let work speak
3. Technical sophistication through simplicity
4. Scannable, hierarchical information architecture

## Typography

**Font Stack**:
- **Primary**: Inter (Google Fonts) - clean, modern, technical
- **Headings**: Inter Bold/Semibold
- **Body**: Inter Regular (400)
- **Code/Technical**: JetBrains Mono (for tech stack labels)

**Hierarchy**:
- Hero Name: text-5xl md:text-6xl font-bold
- Section Headers: text-3xl md:text-4xl font-semibold
- Card Titles: text-xl md:text-2xl font-semibold  
- Body: text-base md:text-lg leading-relaxed
- Metadata/Labels: text-sm font-medium uppercase tracking-wide

## Layout System

**Spacing Units**: Consistent use of Tailwind units 4, 6, 8, 12, 16, 20, 24
- Section padding: py-16 md:py-24
- Card spacing: gap-8 md:gap-12
- Component margins: mb-8 md:mb-12
- Container max-width: max-w-7xl

**Grid Strategy**:
- Skills: 3-4 columns on desktop (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
- Projects: 2-3 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Blog Posts: 2-3 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

## Public Portfolio Sections

### Hero Section
- Full-width container with max-w-7xl inner
- Two-column layout: Profile photo (left/top on mobile), Content (right)
- Profile photo: Rounded image, professional presentation
- Content: Name (large, bold), Title "DevOps Engineer", Brief intro (2-3 lines), Social icons row (GitHub, LinkedIn, Email)
- Primary CTA: "Download Resume" button with icon
- Responsive: Stack vertically on mobile, side-by-side on md+

### Skills Section
- Section header with subtle description
- Grid of skill cards (4 columns desktop, 2 mobile)
- Each card: Skill icon/logo placeholder, Skill name (semibold), Optional proficiency indicator (subtle)
- Cards with subtle borders, hover lift effect

### Projects Section  
- Grid layout (3 columns desktop, 1 mobile)
- Project cards with: Featured image (16:9 ratio), Project title (bold), Short description (2-3 lines), Tech stack badges (small pills), Action buttons row (GitHub icon + Live Demo icon)
- Cards with borders, hover effects

### Blog Section
- Grid layout (3 columns desktop, 1 mobile)  
- Blog cards: Title (bold), Date (small, muted), Excerpt (3-4 lines), "Read More →" link
- Clean card design with subtle borders

### Contact Section
- Two-column layout: Contact form (larger, left), Contact info sidebar (right)
- Form fields: Name, Email, Message (textarea) - all with clear labels
- Submit button (primary style)
- Sidebar: Email address, Social links, Response time info
- Responsive: Stack on mobile

### Footer
- Clean, minimal footer with: Copyright, Social icons, Quick links (if needed)

## Admin Panel Design

**Layout**: Sidebar navigation + main content area

**Sidebar**:
- Fixed left sidebar (w-64) 
- Logo/branding at top
- Navigation menu: Dashboard, Skills, Projects, Blog, Social Links, Messages, Resume, Logout
- Active state highlighting

**Content Area**:
- Page header with title + action button (e.g., "Add New Project")
- Data tables for list views: Clean borders, hover rows, action icons (edit, delete)
- Forms for add/edit: Single column, clearly labeled fields, validation states
- Dashboard: Stats cards (4 columns) showing total skills, projects, blog posts, messages

**Forms**:
- Clear field labels (font-medium, mb-2)
- Input styling: border, rounded, focus states
- File upload: Drag-drop area with preview
- Buttons: Primary (save), Secondary (cancel), Danger (delete)

## Component Library

**Buttons**:
- Primary: Solid, rounded-md, px-6 py-3, font-medium
- Secondary: Outlined, same padding
- Icon buttons: Smaller, square, icon-only
- Button groups: gap-4 for spacing

**Cards**:
- Border: subtle, rounded-lg
- Padding: p-6
- Shadow: subtle on hover (shadow-md)
- Transition: all elements smooth (transition-all duration-200)

**Forms**:
- Input fields: border, rounded-md, px-4 py-2, focus:ring effect
- Textareas: Same style, min-h-32
- File inputs: Custom styled dropzone
- Labels: font-medium, mb-2

**Navigation**:
- Public: Horizontal nav with logo (hidden on mobile, hamburger menu)
- Admin: Vertical sidebar with icons + text

**Badges/Pills**:
- Tech stack tags: Small, rounded-full, px-3 py-1, font-medium text-xs
- Status indicators: Colored dots with text

## Images

**Required Images**:
1. **Profile Photo** (Hero Section): Professional headshot, centered in hero, rounded styling, ~400x400px display size
2. **Project Images**: Featured images for each project card, 16:9 ratio, ~600x340px, professional screenshots or mockups
3. **Fallback**: Use placeholder with project initials if no image provided

**Image Optimization**: All images should be optimized, use loading="lazy" for below-fold images

## Responsive Behavior

**Breakpoints**:
- Mobile: base (< 768px) - single column layouts
- Tablet: md (768px+) - 2 columns for grids  
- Desktop: lg (1024px+) - 3-4 columns for grids

**Mobile Optimizations**:
- Hamburger menu for navigation
- Stack all multi-column layouts
- Larger touch targets (min 44px)
- Simplified admin sidebar (collapsible)

## Accessibility

- ARIA labels on all interactive elements
- Focus visible states on all inputs and buttons  
- Semantic HTML throughout
- Alt text on all images
- Form validation with clear error messages
- Keyboard navigation support

## Animations

**Minimal, purposeful only**:
- Card hover: Subtle lift (translateY(-4px)) + shadow
- Button hover: Slight scale or opacity shift
- Page transitions: Fade in content on load
- NO scroll animations, parallax, or excessive motion