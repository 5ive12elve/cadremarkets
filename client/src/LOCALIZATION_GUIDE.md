# Localization Implementation Guide

This guide shows how to implement Arabic/English localization on any page in the `pages/` directory.

## ✨ Features Implemented

- **Language Toggle**: Arabic/English toggle in header (next to theme toggle)
- **RTL Support**: Automatic right-to-left text direction for Arabic
- **Arabic Fonts**: Amiri (headings) and Noto Sans Arabic (body text) based on design specification
- **Intelligent Font Switching**: `font-primary` and `font-secondary` classes automatically switch fonts based on language
- **Persistent Preference**: Language choice saved in localStorage

## 🎯 How to Add Localization to Any Page

### Step 1: Add Translations

Add your page translations to `client/src/locales/translations.js`:

```javascript
// In translations.js
export const translations = {
  // ... existing translations ...
  
  // Your Page Name
  yourpage: {
    en: {
      title: 'Your Page Title',
      subtitle: 'Your subtitle text',
      buttonText: 'Click Me',
      // Add all text that needs translation
    },
    ar: {
      title: 'عنوان صفحتك',
      subtitle: 'نص العنوان الفرعي',
      buttonText: 'اضغط هنا',
      // Arabic translations
    }
  },
};
```

### Step 2: Update Your Page Component

Import required modules and implement localization:

```jsx
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';

export default function YourPage() {
  // Get language context
  const { currentLang, direction } = useLanguage();
  const t = getPageTranslations('yourpage', currentLang);

  return (
    <div 
      className="font-primary" // This automatically switches fonts
      dir={direction} // This handles RTL/LTR
    >
      {/* Use translations with fallbacks */}
      <h1 className={`text-3xl font-bold ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
        {t.title || 'Fallback Title'}
      </h1>
      
      <p className={`${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
        {t.subtitle || 'Fallback subtitle'}
      </p>
      
      <button className="font-primary">
        {t.buttonText || 'Fallback Button'}
      </button>
    </div>
  );
}
```

## 🎨 Font Classes Available

### Automatic Font Switching
- `font-primary`: NT Voice (EN) → Amiri (AR)
- `font-secondary`: Instrument Sans (EN) → Noto Sans Arabic (AR)

### Manual Font Classes
- `font-amiri`: Always use Amiri (Arabic serif)
- `font-noto-arabic`: Always use Noto Sans Arabic
- `font-nt`: Always use NT Voice
- `font-instrument`: Always use Instrument Sans

## 📱 RTL Support Classes

Use conditional classes for proper RTL layout:

```jsx
// Text alignment
className={`${direction === 'rtl' ? 'text-right' : 'text-left'}`}

// Margins
className={`${direction === 'rtl' ? 'ml-4' : 'mr-4'}`}

// Padding
className={`${direction === 'rtl' ? 'pl-4' : 'pr-4'}`}

// Flexbox
className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
```

## 🔧 Language Toggle Usage

The language toggle is already implemented in the header. Users can:
- Click the toggle button (shows "ع" in English mode, "EN" in Arabic mode)
- Language preference is automatically saved
- Page direction and fonts change immediately

## 📋 Example Implementation

See `client/src/pages/About.jsx` for a complete working example.

## 🎯 Key Points

1. **Always provide fallbacks** in case translations are missing
2. **Use `direction` for RTL-specific styling**
3. **Apply `font-primary` for automatic font switching**
4. **Test both languages** to ensure proper layout
5. **Keep Arabic text authentic** - use proper Arabic typography

## 🚀 Pages Ready for Localization

All pages in the `pages/` directory can be localized using this pattern:
- Home.jsx
- About.jsx (✅ Done)
- Search.jsx  
- Cart.jsx
- Profile.jsx
- Services.jsx
- Projects.jsx
- SignIn.jsx
- SignUp.jsx
- And all others...

Just follow the steps above for each page you want to localize! 