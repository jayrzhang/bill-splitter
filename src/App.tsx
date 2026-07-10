import { BrowserRouter, Routes, Route, useParams, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { UIProvider } from './context/UIContext';
import AppShell from './components/app/AppShell';

function GroupRoute() {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get('readonly') === 'true';
  return <AppShell initialGroupId={groupId} readOnly={readOnly} />;
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <UIProvider>
          <AppProvider>
            <Routes>
              <Route path="/" element={<AppShell />} />
              <Route path="/group/:groupId" element={<GroupRoute />} />
            </Routes>
          </AppProvider>
        </UIProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
