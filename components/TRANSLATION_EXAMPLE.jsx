// Example Component: How to Use Translations
// Copy this template to create new components with bilingual support

'use client';
import { useLanguage } from '../src/contexts/LanguageContext';

const ExampleComponent = () => {
  // Get the translation function and current language
  const { t, language, isEnglish, isBangla } = useLanguage();

  return (
    <div className="container mx-auto p-6">
      {/* Basic translation usage */}
      <h1 className="text-3xl font-bold mb-4">
        {t('common.schoolName')}
      </h1>

      {/* Navigation links with translations */}
      <nav className="mb-6">
        <a href="/about" className="mr-4">{t('nav.aboutUs')}</a>
        <a href="/academics" className="mr-4">{t('nav.academics')}</a>
        <a href="/contact">{t('nav.contact')}</a>
      </nav>

      {/* Conditional rendering based on language */}
      <div className="mb-6">
        {isEnglish && <p>This content is only shown in English</p>}
        {isBangla && <p>এই বিষয়বস্তু শুধুমাত্র বাংলায় দেখানো হয়</p>}
        
        <p className="text-sm text-gray-600">
          Current language: {language === 'en' ? 'English' : 'বাংলা'}
        </p>
      </div>

      {/* Using nested translation keys */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t('dashboard.welcome')}</h2>
        <ul>
          <li>{t('dashboard.students')}</li>
          <li>{t('dashboard.teachers')}</li>
          <li>{t('dashboard.classes')}</li>
        </ul>
      </section>

      {/* Button with translation */}
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        {t('common.submit')}
      </button>
    </div>
  );
};

export default ExampleComponent;

/* 
  HOW TO ADD NEW TRANSLATIONS:

  1. Open client/src/locales/en.json
  2. Add your key-value pair:
     {
       "mySection": {
         "myText": "Hello World"
       }
     }

  3. Open client/src/locales/bn.json
  4. Add the same key with Bangla translation:
     {
       "mySection": {
         "myText": "হ্যালো ওয়ার্ল্ড"
       }
     }

  5. Use in your component:
     {t('mySection.myText')}
*/
