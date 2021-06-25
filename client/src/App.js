import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Header from './component/header/Header';
import Home from './component/home/Home';
import Cart from './component/cart/Cart'
function App() {
  return (
    <BrowserRouter >

      <Header />
      <Switch>
        <Route exact path="/" component={Home} /> 
        <Route exact path="/cart" component={Cart} /> 
      </Switch>
    </BrowserRouter>
  );
}

export default App;
