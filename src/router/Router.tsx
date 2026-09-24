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

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    
    // Extract params from path
    const pathParts = path.split('/');
    const newParams: { [key: string]: string } = {};
    
    if (pathParts[1] === 'profile' && pathParts[2]) {
      newParams.userId = pathParts[2];
    }
    
    setParams(newParams);
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
