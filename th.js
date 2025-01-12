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
    `
  }
  getProductHtml

  async function getProducts() {
    const response = await fetch('products.json')
    return await response.json()
  }
  
  getProducts().then(function (products) {
    const productsContainer = document.querySelector('.catalog')
  
    if (products) {
      products.forEach(function (product) {
      productsContainer.innerHTML += getProductHtml(product)
      })
    }
    let buyButtons = document.querySelectorAll('.cart-btn')

if(buyButtons.length > 0) {
    buyButtons.forEach(function(button) {
        button.addEventListener('click', addToCart)
    })
}
  })
  

class Cart { 
  constructor( ) {
      this.items = {}
      this.total = 0
      this.loadCartToCookies()
  }

  addItem(item) {
      if(this.items[item.title]) {
          this.items[item.title].quantity += 1
      } else {
          this.items[item.title] = item
          this.items[item.title].quantity = 1
      }
      this.saveCartToCookies()
  }

  saveCartToCookies() {
      let cartJSON = JSON.stringify(this.items)
      document.cookie = `cart=${cartJSON}; max-age=${60 * 60 * 24 * 7}; path=/`

      console.log(document.cookie)
  }

  loadCartToCookies() {
      let cartCookies = getCookieValue('cart');

      if (cartCookies && cartCookies !== '') {
          this.items = JSON.parse(cartCookies)
      }
  }
}

let cart = new Cart();


function addToCart(event) {
  const productData = event.target.getAttribute('data-product')
  const product = JSON.parse(productData)

  cart.addItem(product)
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
  return `
      <div style="border: 1px solid black; display: flex; align-items: center; justify-content: space-between; padding: 10px;">
          <p>${item.title}</p>
          <p>${item.price}</p>
          <div>
              <button class="quantity-btn" data-title="${item.title}" data-action="decrease">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" data-title="${item.title}" data-action="increase">+</button>
          </div>
      </div>
  `;
}

function showCart() {
  const cartContainer = document.querySelector('.cart-container')
  console.log(cart.items)
  cartContainer.innerHTML = ''
  for (let key in cart.items) {
      cartContainer.innerHTML += getCartProductHtml(cart.items[key])
  }

  cart.loadCartToCookies()
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

function showCart() {
  const cartContainer = document.querySelector('.cart-container');
  cartContainer.innerHTML = '';
  for (let key in cart.items) {
      cartContainer.innerHTML += getCartProductHtml(cart.items[key]);
  }
  cart.loadCartToCookies();

 
  const quantityButtons = document.querySelectorAll('.quantity-btn');
  quantityButtons.forEach(button => {
      button.addEventListener('click', updateCartItem);
  });
}

showCart()