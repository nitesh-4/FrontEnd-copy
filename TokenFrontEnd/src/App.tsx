import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/NavBar';
import Home from '@/pages/Home';


const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;