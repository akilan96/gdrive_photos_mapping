import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useStudioStore } from '../stores/useStudioStore';

export const App: React.FC = () => {
  const theme = useStudioStore((s) => s.settings.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  return <RouterProvider router={router} />;
};

export default App;

