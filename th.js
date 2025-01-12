function extractNumber(value) {
  if (typeof value === 'string') {
    
    const match = value.match(/-?\d+(\.\d+)?/); 
    return match ? parseFloat(match[0]) : 0; 
  }
  return typeof value === 'number' ? value : 0; 
}

function getProductHtml(product) {
  return `
    <div class="card" style="width: 18rem;">
      <img src="img/${product.image}" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title fw-bold fs-4 ">${product.title}</h5>
        <p class="card-text fs-5">${product.description}</p>
        <p class="card-text fw-bold fs-4 text-center">${product.price}</p>
        <button class="c-button cart-btn" data-product='${JSON.stringify(product)}'> To basket </button>
      </div>
    </div>
  `;
}

async function getProducts() {
  const response = await fetch('products.json');
  return await response.json();
}

getProducts().then(function (products) {
  const productsContainer = document.querySelector('.catalog');

  if (products) {
    products.forEach(function (product) {
      productsContainer.innerHTML += getProductHtml(product);
    });
  }
  const buyButtons = document.querySelectorAll('.cart-btn');

  if (buyButtons.length > 0) {
    buyButtons.forEach(function (button) {
      button.addEventListener('click', addToCart);
    });
  }
});

class Cart {
  constructor() {
    this.items = {};
    this.total = 0;
    this.loadCartToCookies();
  }

  addItem(item) {
    if (this.items[item.title]) {
      this.items[item.title].quantity += 1;
    } else {
      this.items[item.title] = item;
      this.items[item.title].quantity = 1;
    }
    this.saveCartToCookies();
  }

  saveCartToCookies() {
    const cartJSON = JSON.stringify(this.items);
    document.cookie = `cart=${cartJSON}; max-age=${60 * 60 * 24 * 7}; path=/`;
  }

  loadCartToCookies() {
    const cartCookies = getCookieValue('cart');

    if (cartCookies && cartCookies !== '') {
      this.items = JSON.parse(cartCookies);
    }
  }

  clearCart() {
    this.items = {};
    this.saveCartToCookies();
  }
}

let cart = new Cart();

function addToCart(event) {
  const productData = event.target.getAttribute('data-product');
  const product = JSON.parse(productData);

  cart.addItem(product);
  showCart(); 
}

function getCookieValue(cookieName) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function getCartProductHtml(item) {
  const price = extractNumber(item.price);
  const quantity = extractNumber(item.quantity);
  const itemTotal = price * quantity; 
  return `
    <div style="border: 1px solid black; display: flex; align-items: center; justify-content: space-between; padding: 10px;">
      <p>${item.title}</p>
      <p>Ціна: $ ${price.toFixed(2)} </p>
      <div>
        <button class="quantity-btn" data-title="${item.title}" data-action="decrease">-</button>
        <span>${quantity}</span>
        <button class="quantity-btn" data-title="${item.title}" data-action="increase">+</button>
      </div>
      <p>Сума: $ ${itemTotal.toFixed(2)} </p>
    </div>
  `;
}

function updateCartItem(event) {
  const button = event.target;
  const title = button.getAttribute('data-title');
  const action = button.getAttribute('data-action');

  if (cart.items[title]) {
    if (action === 'increase') {
      cart.items[title].quantity += 1;
    } else if (action === 'decrease' && cart.items[title].quantity > 1) {
      cart.items[title].quantity -= 1;
    } else if (action === 'decrease' && cart.items[title].quantity === 1) {
      delete cart.items[title]; 
    }
    cart.saveCartToCookies();
    showCart(); 
  }
}

function checkoutCart() {
  cart.clearCart();
  showCart(); 
  alert('Ваше замовлення оформлено!');
}

function showCart() {
  const cartContainer = document.querySelector('.cart-container');
  cartContainer.innerHTML = '';
  let totalSum = 0; 

  
  for (let key in cart.items) {
    const item = cart.items[key];
    const price = extractNumber(item.price);
    const quantity = extractNumber(item.quantity);

    totalSum += price * quantity;
    cartContainer.innerHTML += getCartProductHtml(item);
  }


  if (Object.keys(cart.items).length > 0) {
    cartContainer.innerHTML += `
      <div style="text-align: right; font-size: 1.5rem; font-weight: bold; margin-top: 10px;">
        Загальна сума: $ ${totalSum.toFixed(2)} 
      </div>
      <button class="checkout-btn">Оформити замовлення</button>
    `;
  } else {
    cartContainer.innerHTML = `<p style="text-align: center; font-size: 1.25rem;">Ваша корзина порожня</p>`;
  }

  
  const quantityButtons = document.querySelectorAll('.quantity-btn');
  quantityButtons.forEach(button => {
    button.addEventListener('click', updateCartItem);
  });

  const checkoutButton = document.querySelector('.checkout-btn');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', checkoutCart);
  }
}


showCart();
