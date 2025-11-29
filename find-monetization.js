// JavaScript to run in browser console to find monetization section
// This searches for monetization-related elements

const searchTerms = ['monetiz', 'pricing', 'tier', 'discount', 'ppe', 'ppr', 'pay per'];
const found = [];

// Search all elements
document.querySelectorAll('*').forEach(el => {
  const text = (el.textContent || '').toLowerCase();
  const id = (el.id || '').toLowerCase();
  const className = (el.className || '').toLowerCase();
  
  searchTerms.forEach(term => {
    if (text.includes(term) || id.includes(term) || className.includes(term)) {
      if (!found.includes(el)) {
        found.push(el);
        console.log('Found element:', {
          tag: el.tagName,
          id: el.id,
          class: el.className,
          text: el.textContent?.substring(0, 100),
          element: el
        });
      }
    }
  });
});

// Scroll to first found element
if (found.length > 0) {
  found[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  console.log('Scrolled to monetization section');
} else {
  console.log('No monetization elements found. Try scrolling down manually.');
}

