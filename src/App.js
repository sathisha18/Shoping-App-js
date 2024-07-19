import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [clothingList, setClothingList] = useState([]);
  const [filteredClothingList, setFilteredClothingList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://cdn.shopify.com/s/files/1/0564/3685/0790/files/multiProduct.json');
        setClothingList(response.data.categories);
        setFilteredClothingList(response.data.categories);
      } catch (error) {
        console.error('Error ', error);
      }
    };

    fetchData();
  }, []);

  const addToCart = (productToAdd) => {
    const updatedCart = [...cart];
    const existingItemIndex = updatedCart.findIndex(item => item.product.id === productToAdd.id);

    if (existingItemIndex !== -1) {
      updatedCart[existingItemIndex].quantity++;
    } else {
      updatedCart.push({ product: productToAdd, quantity: 1 });
    }

    setCart(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    setCart(updatedCart);
  };

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart.map(item => {
      if (item.product.id === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const handleCartClick = () => {
    setCartVisible(!cartVisible);
  };

  const filterClothing = (categoryName) => {
    const filteredList = categoryName === 'all' ? clothingList : clothingList.filter(category => category.category_name === categoryName);
    applySearch(filteredList, searchTerm);
  };

  const applySearch = (list, term) => {
    const lowerCaseTerm = term.toLowerCase();
    const filteredList = list.reduce((acc, category) => {
      const matchingCategory = category.category_name.toLowerCase().includes(lowerCaseTerm);
      const matchingProducts = category.category_products.filter(product =>
        product.title.toLowerCase().includes(lowerCaseTerm) ||
        (product.vendor && product.vendor.toLowerCase().includes(lowerCaseTerm))
      );
      (matchingCategory || matchingProducts.length > 0) && acc.push(
        matchingCategory ? category : { ...category, category_products: matchingProducts }
      );
      return acc;
    }, []);
    setFilteredClothingList(filteredList);
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    applySearch(clothingList, term);
  };

  const totalPrice = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <div className="content">
      <h1>Shop App</h1>
      <div className="container">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
        <div className='cart' onClick={handleCartClick}>
  <span><i className='fas fa-cart-plus'></i></span>
  <span className='cart-quantity'>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
</div>

        <div className="buttons">
          <button onClick={() => filterClothing('Men')}>Men</button>
          <button onClick={() => filterClothing('Women')}>Women</button>
          <button onClick={() => filterClothing('Kids')}>Kids</button>
        </div>
      </div>

      {cartVisible && (
        <div className="cart-items">
          <div className="cart-grid">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.product.image} alt={item.product.title} />
                <div className="item-details">
                  <h4>{item.product.title}</h4>
                  <p>Price: ${item.product.price}</p>
                  <div className="quantity-controls">
                  <label>Quantity:</label>
                 <button className="decrease-btn" onClick={() => decreaseQuantity(item.product.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="increase-btn" onClick={() => increaseQuantity(item.product.id)}>+</button>
                      </div>

                  <button onClick={() => removeFromCart(item.product.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="total-price">
            <strong>Total Price: ${totalPrice.toFixed(2)}</strong>
          </div>
        </div>
      )}

      <div className="categories">
        {filteredClothingList.map((category) => (
          <div key={category.category_name} className="category">
            <div className="products">
              {category.category_products.map((product) => (
                <div className="product" key={product.id}>
                  <img src={product.image} alt={product.title} />
                  <h3>{product.title}</h3>
                  <p>Price: ${product.price}<br></br>Compare at Price: ${product.compare_at_price}</p>
                  <p>Vendor: {product.vendor}</p>
                  <button onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
