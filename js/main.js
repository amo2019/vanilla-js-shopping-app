if ('serviceWorker' in navigator) {
    // Register a service worker hosted at the root of the site
    navigator.serviceWorker.register('../sw_cached_site.js', {
      scope: '/'
  }).then(function(reg) {
    console.log("Service worker registered")
   }).catch(function(err) {
    console.log(err);
    });
  } else {
    console.log('Service workers are not supported.');
  }
      if ('serviceWorker' in navigator) {
   
        navigator.serviceWorker
          .register('../sw_cached_pages.js')
          .then(reg => console.log('Service Worker Registered'))
          .catch(err => console.log(`Service Worker Error: ${err}`));
      
    }
      const CART = {
        KEY: 'bkasjbdfkjasdkfjhaksdfjskd',
        contents: [],
        init() {
          //check localStorage and initialize the contents of CART.contents
          let _contents = localStorage.getItem(CART.KEY);
          if (_contents) {
            CART.contents = JSON.parse(_contents);
          } else {
            //dummy test data
            CART.contents = [
              { id: 1, title: 'Iron', qty: 5, itemPrice: 23.45 },
              { id: 2, title: 'Washing Machine', qty: 3, itemPrice: 411.34 },
              { id: 3, title: 'Watch', qty: 8, itemPrice: 143.21 },
            ];
            CART.sync();
          }
        },
        async sync() {
          let _cart = JSON.stringify(CART.contents);
          await localStorage.setItem(CART.KEY, _cart);
        },
        find(id) {
          //find an item in the cart by it's id
          let match = CART.contents.filter((item) => {
            if (item.id == id) return true;
          });
          if (match && match[0]) return match[0];
        },
        add(id) {
          //add a new item to the cart
          //check that it is not in the cart already
          if (CART.find(id)) {
            CART.increase(id, 1);
          } else {
            let arr = PRODUCTS.filter((product) => {
              if (product.id == id) {
                return true;
              }
            });
            if (arr && arr[0]) {
              let obj = {
                id: arr[0].id,
                title: arr[0].title,
                qty: 1,
                itemPrice: arr[0].price,
              };
              CART.contents.push(obj);
              //update localStorage
              CART.sync();
            } else {
              //product id does not exist in products data
              console.error('Invalid Product');
            }
          }
        },
      
        increase(id, qty = 1) {
          //increase the quantity of an item in the cart
          CART.contents = CART.contents.map((item) => {
            if (item.id === id && qty === 1) {
              item.qty = item.qty + qty;
            } else 
                  if (item.id === id && qty > 1) {
                  item.qty = qty;
                }

            return item;
          });
          //update localStorage
          CART.sync();
        },
        reduce(id, qty = 1) {
          //reduce the quantity of an item in the cart
          CART.contents = CART.contents.map((item) => {
            if (item.id === id) item.qty = item.qty - qty;
            return item;
          });
          CART.contents.forEach(async (item) => {
            if (item.id === id && item.qty === 0) await CART.remove(id);
          });
          //update localStorage
          CART.sync();
        },
        remove(id) {
          //remove an item entirely from CART.contents based on its id
          CART.contents = CART.contents.filter((item) => {
            if (item.id !== id) return true;
          });
          //update localStorage
          CART.sync();
        },
        empty() {
          //empty whole cart
          CART.contents = [];
          //update localStorage
          CART.sync();
        },
        sort(field = 'title') {
          //sort by field - title, price
          //return a sorted shallow copy of the CART.contents array
          let sorted = CART.contents.sort((a, b) => {
            if (a[field] > b[field]) {
              return 1;
            } else if (a[field] < a[field]) {
              return -1;
            } else {
              return 0;
            }
          });
          return sorted;
          //NO impact on localStorage
        },
        logContents(prefix) {
          console.log(prefix, CART.contents);
        },
      };

      let PRODUCTS = [];

      document.addEventListener('DOMContentLoaded', () => {
        //when the page is ready
        getProducts(showProducts, errorMessage);
        //get the cart items from localStorage
        CART.init();
        //load the cart items
        showCart();
      });

      function showCart() {
        let cartSection = document.getElementById('cart');
        cart.innerHTML = '';
        let s = CART.sort('qty');
        let total = 0;
        s.forEach((item) => {
          let cartitem = document.createElement('div');
          cartitem.className = 'cart-item';

          let title = document.createElement('h3');
          title.textContent = item.title;
          title.className = 'title';
          cartitem.appendChild(title);

          let controls = document.createElement('div');
          controls.className = 'controls';
          cartitem.appendChild(controls);

          let plus = document.createElement('span');
          plus.textContent = '+';
          plus.setAttribute('data-id', item.id);
          controls.appendChild(plus);
          plus.addEventListener('click', incrementCart);

          let qty = document.createElement('input');
          qty.value = item.qty;
          qty.setAttribute('data-id', item.id);
          controls.appendChild(qty);
          qty.addEventListener('change', quantityChanged);

          let minus = document.createElement('span');
          minus.textContent = '-';
          minus.setAttribute('data-id', item.id);
          controls.appendChild(minus);
          minus.addEventListener('click', decrementCart);

          let price = document.createElement('div');
          price.className = 'price';
          let cost = new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
          }).format(item.qty * item.itemPrice);
          price.textContent = cost;
          cartitem.appendChild(price);

          //add the button to the card
          let btn = document.createElement('button');
          btn.className = 'btn';
          btn.textContent = 'Delete Item';
          btn.setAttribute('data-id', item.id);
          btn.addEventListener('click', deleteItem);
          cartitem.appendChild(btn);

          total = total + item.qty * item.itemPrice;

          cartSection.appendChild(cartitem);
        });
       
        let totalPrice = document.createElement('span');
        totalPrice.className = 'totalPrice';
        let cost = new Intl.NumberFormat('en-CA', {
          style: 'currency',
          currency: 'CAD',
        }).format(total);
        totalPrice.textContent = `Total: ${cost}`;
        //totalPrice.innerText = '£' + cost;
        cart.appendChild(totalPrice);

        //cartSection.appendChild(cartitem);
      }

      function incrementCart(ev) {
        ev.preventDefault();
        let id = parseInt(ev.target.getAttribute('data-id'));
        CART.increase(id, 1);
        let controls = ev.target.parentElement;
        let qty = controls.querySelector('input');
        let item = CART.find(id);
        if (item) {
          qty.textContent = item.qty;
        } else {
          document.getElementById('cart').removeChild(controls.parentElement);
        }
        // console.log('Plus clicked');
        showCart();
      }

      function decrementCart(ev) {
        ev.preventDefault();
        let id = parseInt(ev.target.getAttribute('data-id'));
        // console.log('id dec:', id);
        CART.reduce(id, 1);
        let controls = ev.target.parentElement;
        let qty = controls.querySelector('input');
        let item = CART.find(id);
        if (item) {
          qty.textContent = item.qty;
        } else {
          document.getElementById('cart').removeChild(controls.parentElement);
        }
        // console.log('Minus clicked');
        showCart();
      }

      function deleteItem(ev) {
        ev.preventDefault();
        let controls = ev.target.parentElement;
        let qty = controls.querySelector('input');

        let id = parseInt(ev.target.getAttribute('data-id'));

        let item = CART.find(id);

        CART.reduce(id, item.qty);

        showCart();
      }

      function quantityChanged(ev) {
        let qty = parseInt(ev.target.value);
        // console.log('qty', qty);
        if (isNaN(qty) || qty <= 0) {
          qty = 1;
        }

        let id = parseInt(ev.target.getAttribute('data-id'));
        // console.log(ev);

        CART.increase(id, qty);

        showCart();

      }

      function getProducts(success, failure) {
        //request the list of products from the "server"
        const URL = 'https://amo2019.github.io/media-sample-files/products.json?';
          //'./products.json';
        fetch(URL, {
          method: 'GET',
          mode: 'cors',
        })
          .then((response) => response.json())
          .then(showProducts)
          .catch((err) => {
            errorMessage(err.message);
          });
      }

      function showProducts(products) {
        PRODUCTS = products;
        //take data.products and display inside <section id="products">
        let imgPath = 'https://amo2019.github.io/media-sample-files/';
        //'./media-sample-files/';
        let productSection = document.getElementById('products');
        productSection.innerHTML = '';
        products.forEach((product) => {
          let card = document.createElement('div');
          card.className = 'card';
          //add the image to the card
          let img = document.createElement('img');
          img.alt = product.title;
          img.src = imgPath + product.img;
          card.appendChild(img);
          //add the price
          let price = document.createElement('p');
          let cost = new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
          }).format(product.price);
          price.textContent = cost;
          price.className = 'price';
          card.appendChild(price);

          //add the title to the card
          let title = document.createElement('h2');
          title.textContent = product.title;
          card.appendChild(title);
          //add the description to the card
          let desc = document.createElement('p');
          desc.textContent = product.desc;
          card.appendChild(desc);
          //add the button to the card
          let btn = document.createElement('button');
          btn.className = 'btn';
          btn.textContent = 'Add Item';
          btn.setAttribute('data-id', product.id);
          btn.addEventListener('click', addItem);
          card.appendChild(btn);
          //add the card to the section
          productSection.appendChild(card);
        });
      }

      function addItem(ev) {
        ev.preventDefault();
        let id = parseInt(ev.target.getAttribute('data-id'));
        // console.log('add to cart item', id);
        CART.add(id, 1);
        showCart();
      }

      function errorMessage(err) {
        //display the error message to the user
        console.error(err);
      }

      // Make sure sw are supported


  //   if ('serviceWorker' in navigator) {
//     navigator.serviceWorkerContainer
//         .register('../sw_cached_pages.js')
//         .then(reg => console.log('Service Worker: Registered (Pages)'))
//         .catch(err => console.log(`Service Worker: Error: ${err}`));
    
//   }
