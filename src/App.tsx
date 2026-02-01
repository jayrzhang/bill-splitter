import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './i18n/LanguageContext';
import Home from './pages/Home';
import GroupDetail from './pages/GroupDetail';

function AppContent() {
  const { currentGroupId } = useApp();

  return currentGroupId ? <GroupDetail /> : <Home />;
}

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
