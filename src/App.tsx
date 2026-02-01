import { AppProvider, useApp } from './context/AppContext';
import Home from './pages/Home';
import GroupDetail from './pages/GroupDetail';

function AppContent() {
  const { currentGroupId } = useApp();

  return currentGroupId ? <GroupDetail /> : <Home />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
