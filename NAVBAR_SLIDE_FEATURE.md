# Navbar Slide Animation Feature

## Feature Description
Implemented an auto-hiding navbar that slides up when scrolling down and slides back down when scrolling up, creating a cleaner browsing experience with more screen space.

## Behavior

### When Scrolling DOWN ⬇️
- Navbar slides **UP** (hides) after scrolling past 100px
- Gives users more screen space to view content
- Smooth slide-up animation (300ms)

### When Scrolling UP ⬆️
- Navbar slides **DOWN** (shows) immediately
- Makes navigation always accessible when needed
- Smooth slide-down animation (300ms)

### Always Visible
- When at the **top of the page** (< 100px scroll)
- Navbar remains visible and accessible

## Technical Implementation

### New State Variables
```typescript
const [visible, setVisible] = useState(true)        // Controls visibility
const [lastScrollY, setLastScrollY] = useState(0)   // Tracks scroll position
```

### Scroll Logic
```typescript
if (currentScrollY < lastScrollY || currentScrollY < 100) {
  // Scrolling UP or near TOP → Show navbar
  setVisible(true)
} else if (currentScrollY > lastScrollY && currentScrollY > 100) {
  // Scrolling DOWN and past 100px → Hide navbar
  setVisible(false)
}
```

### CSS Animation
```typescript
className={`${visible ? "translate-y-0" : "-translate-y-full"}`}
style={{ transition: "transform 0.3s ease-in-out" }}
```

- Uses Tailwind's `translate-y` utility
- `translate-y-0`: Normal position (visible)
- `-translate-y-full`: Moved up by its full height (hidden)
- Smooth 300ms cubic-bezier transition

## Design Principles Maintained

✅ **No color changes** - All existing color patterns preserved
✅ **No styling changes** - Only animation behavior added
✅ **Smooth transitions** - Professional ease-in-out animation
✅ **User-friendly** - Always accessible when scrolling up
✅ **Performance** - Uses CSS transforms (GPU accelerated)
✅ **Passive scroll listener** - Better scroll performance

## Browser Compatibility
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ GPU-accelerated transforms for smooth 60fps animation

## Files Modified
- `components/header.tsx`

## User Experience Benefits
1. **More screen space** - Content is the focus when scrolling down
2. **Quick access** - Navigation appears instantly when needed
3. **Modern feel** - Common pattern in contemporary web design
4. **Non-intrusive** - Doesn't interrupt reading flow
5. **Always accessible** - Just scroll up slightly to reveal navbar
