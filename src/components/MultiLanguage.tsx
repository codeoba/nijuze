import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'sw' | 'en' | 'fr';

interface Translation {
  [key: string]: {
    sw: string;
    en: string;
    fr: string;
  };
}

const translations: Translation = {
  // Header
  'app.name': { sw: 'Nijuze', en: 'Nijuze', fr: 'Nijuze' },
  'header.search': { sw: 'Tafuta maswali, majibu, watu...', en: 'Search questions, answers, people...', fr: 'Rechercher des questions, réponses, personnes...' },
  'header.ask': { sw: 'Uliza Swali', en: 'Ask Question', fr: 'Poser une Question' },
  'header.login': { sw: 'Ingia', en: 'Login', fr: 'Connexion' },
  'header.register': { sw: 'Jiunga', en: 'Register', fr: "S'inscrire" },
  'header.logout': { sw: 'Ondoka', en: 'Logout', fr: 'Déconnexion' },
  
  // Navigation
  'nav.home': { sw: 'Nyumbani', en: 'Home', fr: 'Accueil' },
  'nav.explore': { sw: 'Gundua', en: 'Explore', fr: 'Explorer' },
  'nav.trending': { sw: 'Trending', en: 'Trending', fr: 'Tendances' },
  'nav.bookmarks': { sw: 'Bookmarks', en: 'Bookmarks', fr: 'Signets' },
  'nav.communities': { sw: 'Jamii', en: 'Communities', fr: 'Communautés' },
  'nav.messages': { sw: 'Ujumbe', en: 'Messages', fr: 'Messages' },
  'nav.analytics': { sw: 'Analytics', en: 'Analytics', fr: 'Analytiques' },
  'nav.settings': { sw: 'Mipangilio', en: 'Settings', fr: 'Paramètres' },
  
  // Posts
  'post.pinned': { sw: 'Pinned', en: 'Pinned', fr: 'Épinglé' },
  'post.verified': { sw: 'Verified', en: 'Verified', fr: 'Vérifié' },
  'post.readMore': { sw: 'Soma zaidi', en: 'Read more', fr: 'Lire la suite' },
  'post.views': { sw: 'views', en: 'views', fr: 'vues' },
  'post.answers': { sw: 'majibu', en: 'answers', fr: 'réponses' },
  'post.share': { sw: 'Shiriki', en: 'Share', fr: 'Partager' },
  'post.bookmark': { sw: 'Hifadhi', en: 'Save', fr: 'Enregistrer' },
  'post.copyLink': { sw: 'Nakili Link', en: 'Copy Link', fr: 'Copier le lien' },
  'post.report': { sw: 'Ripoti', en: 'Report', fr: 'Signaler' },
  'post.follow': { sw: 'Fuata', en: 'Follow', fr: 'Suivre' },
  
  // Comments
  'comment.write': { sw: 'Andika jibu lako...', en: 'Write your answer...', fr: 'Écrivez votre réponse...' },
  'comment.send': { sw: 'Tuma', en: 'Send', fr: 'Envoyer' },
  'comment.bestAnswer': { sw: 'Jibu Bora', en: 'Best Answer', fr: 'Meilleure Réponse' },
  'comment.reply': { sw: 'Jibu', en: 'Reply', fr: 'Répondre' },
  
  // Categories
  'category.technology': { sw: 'Teknolojia', en: 'Technology', fr: 'Technologie' },
  'category.business': { sw: 'Biashara', en: 'Business', fr: 'Affaires' },
  'category.science': { sw: 'Sayansi', en: 'Science', fr: 'Science' },
  'category.art': { sw: 'Sanaa', en: 'Art', fr: 'Art' },
  'category.sports': { sw: 'Michezo', en: 'Sports', fr: 'Sports' },
  
  // Filters
  'filter.latest': { sw: 'Mpya', en: 'Latest', fr: 'Récent' },
  'filter.trending': { sw: 'Trending', en: 'Trending', fr: 'Tendances' },
  'filter.top': { sw: 'Bora', en: 'Top', fr: 'Meilleur' },
  'filter.unanswered': { sw: 'Haijajibiwa', en: 'Unanswered', fr: 'Sans réponse' },
  
  // Common
  'common.cancel': { sw: 'Ghairi', en: 'Cancel', fr: 'Annuler' },
  'common.submit': { sw: 'Tuma', en: 'Submit', fr: 'Soumettre' },
  'common.save': { sw: 'Hifadhi', en: 'Save', fr: 'Enregistrer' },
  'common.delete': { sw: 'Futa', en: 'Delete', fr: 'Supprimer' },
  'common.edit': { sw: 'Hariri', en: 'Edit', fr: 'Modifier' },
  'common.close': { sw: 'Funga', en: 'Close', fr: 'Fermer' },
  'common.loading': { sw: 'Inapakia...', en: 'Loading...', fr: 'Chargement...' },
  'common.success': { sw: 'Imefanikiwa!', en: 'Success!', fr: 'Succès!' },
  'common.error': { sw: 'Kuna hitilafu', en: 'Error', fr: 'Erreur' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'sw';
  });

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'sw' as Language, label: 'Kiswahili', flag: '🇹🇿' },
    { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
    { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: 4,
      borderRadius: 12,
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(51, 65, 85, 0.3)',
    }}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => {
            setLanguage(lang.code);
            localStorage.setItem('language', lang.code);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            background: language === lang.code ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: 'none',
            color: language === lang.code ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          title={lang.label}
        >
          <span>{lang.flag}</span>
          <span className="hidden md:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
};
