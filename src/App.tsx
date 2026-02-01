import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './i18n/LanguageContext';
import Home from './pages/Home';
import GroupDetail from './pages/GroupDetail';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/group/:groupId" element={<GroupDetail />} />
          </Routes>
        </AppProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
