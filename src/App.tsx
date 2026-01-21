import { AppProvider } from './presentation/context/AppContext';
import { HomePage } from './presentation/pages';

/**
 * Main App component
 * Wraps the application with providers following Clean Architecture
 */
function App() {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
}

export default App;
