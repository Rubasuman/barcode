import './App.css';
import Sticker from './pages/Sticker';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo"> Barcode Sticker</h1>
          <ul className="nav-menu">
            <li></li>
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        <Sticker />
      </main>
    </div>
  );
}

export default App;
