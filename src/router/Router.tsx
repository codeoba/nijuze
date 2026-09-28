import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Route {
  path: string;
  component: React.ComponentType<any>;
}

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: { [key: string]: string };
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const extractParams = (path: string): { [key: string]: string } => {
  const parts = path.split('/').filter(Boolean);
  const newParams: { [key: string]: string } = {};

  if (parts[0] === 'profile' && parts[1]) {
    newParams.userId = parts[1];
  }
  if ((parts[0] === 'post' || parts[0] === 'swali') && parts[1]) {
    newParams.postId = parts[1];
    newParams.id = parts[1];
  }
  return newParams;
};

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState<{ [key: string]: string }>(() =>
    extractParams(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setParams(extractParams(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setParams(extractParams(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
};

export const useParams = () => {
  const { params } = useRouter();
  return params;
};

export const Link: React.FC<{
  to: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({ to, children, className, style, onClick }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    if (onClick) onClick();
  };

  return (
    <a href={to} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
};
