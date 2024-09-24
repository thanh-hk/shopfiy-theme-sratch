/* Money format function */
var formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};


/*  Lazy loading images */
function load(img) {
  const url = img.getAttribute('lazy-src')
  img.setAttribute('src', url);
}
function ready(){
  if('IntersectionObserver' in window){
    var lazyImgs = document.querySelectorAll('img[lazy-src]');
    
    let observer = new IntersectionObserver((entries) =>{
      entries.forEach(entry => {
        if (entry.isIntersecting){
          load(entry.target);
        }
      })

    });
     lazyImgs.forEach( img => {
         observer.observe(img);
     })
  }else {

  }
};
document.addEventListener('DOMContentLoaded', ready);



/* Filter */
const filterButton = document.querySelector('.filter-button-mobile');
const filterOverlay = document.querySelector('.filter-mobile-overlay');
if (filterButton){
  filterButton.addEventListener('click',()=>{
    filterButton.parentElement.classList.toggle('filter-active');
    header.classList.remove('z-30'); 
    header.classList.remove('z-10');     
  });
};

document.querySelectorAll('.filter-mobile-overlay, .close-button').forEach (button => {
  button.addEventListener('click', () => {
    filterButton.parentElement.classList.remove('filter-active');
    header.classList.add('z-10');  
  })
});


/* Cart-drawer */
function openDrawer() {
  if (document.querySelector('.drawer')){
    document.querySelector('.drawer').classList.add('drawer--active');  
  }
  
}

async function updateCartDrawer(){
  const res = await fetch('/?section_id=cart-drawer');
  const text = await res.text();
  const html = document.createElement('div');
  html.innerHTML = text;
  const newBox = html.querySelector('.cart-drawer').innerHTML;
  document.querySelector('.cart-drawer').innerHTML = newBox;
  addCartDrawerListner();
}

function updateCartCountItem (count){
   document.querySelectorAll('.cart_count').forEach ( e => {
    e.textContent = count;
   })
}

function addCartDrawerListner(){
  document.querySelectorAll('.cart-drawer-quantity-selector button').forEach (button => {
    button.addEventListener('click', async ()=>{
      //get line item key
      const rootItem = button.closest('.cart-drawer-item');
      const key = rootItem.getAttribute('data-line-item-key');
  
      //update quantity
      const inputItem = button.parentElement.querySelector('input');
      const currentQuantity = Number(inputItem.value);
      const isUp = button.classList.contains('cart-drawer-quantity-selector-plus');
      if (isUp){
        var newQuantity = currentQuantity + 1;           
        inputItem.value = newQuantity;
       
     } else {
        var newQuantity = currentQuantity -1;
        inputItem.value = newQuantity;
        
     }

     console.log({key, currentQuantity, newQuantity});
     
  
      //ajax update
      const res = await fetch('/cart/update/js', {
        method:"post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({updates: { [key]: newQuantity }}),     
      });
      const cart = await res.json();
      updateCartCountItem(cart.item_count);
      updateCartDrawer();
      
    })
  });

  
  document.querySelectorAll('.cart-drawer-item .remove_item').forEach (remove => {
    remove.addEventListener('click',(e)=>{
      e.preventDefault();
      const item = remove.closest('.cart-drawer-item');
      const key = item.getAttribute('data-line-item-key');
      axios.post('/cart/change.js',{
        id:key,
        quantity:0
      }).then(res => {
        console.log(res.data);
        const format = document.querySelector('[data-money-format]').getAttribute('data-money-format');
     
      item.remove();
        const totalPrice = formatMoney(res.data.total_price, format);
        document.querySelector('.cart_total_price').textContent = totalPrice;
        document.querySelector('.cart-drawer--item-count').textContent = res.data.item_count;
        const freeAmount = Number(document.querySelector('.free-shipping-bar').getAttribute('data-freeshipping-amount'))*100;
        const percentage = ((res.data.total_price / freeAmount) * 100).toFixed(0);
        const shipping_percetage_fraction = formatMoney((freeAmount - res.data.total_price), format)
        document.querySelector('.bar').style.width = `${percentage}%`;
        document.querySelector('.shipping_value-left').textContent = shipping_percetage_fraction; 
        
        if (res.data.items.length === 0){
          const html = document.createElement('div');
          html.classList.add('h-full','flex', 'justify-center', 'items-center')
          html.innerHTML = `<p class="text-center">Your cart is empty</p>`;
          document.querySelector('.message-container').appendChild(html);
        }       
      })     
    })
  });

   if (document.querySelector('.drawer-box')){
    document.querySelector('.drawer-box').addEventListener('click',(e)=> {
      e.stopPropagation(); 
    });
   }
 
}

document.querySelectorAll('form[action="/cart/add"').forEach(form =>{
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    //submit with ajax
    await fetch('/cart/add.js', {
      method:"post",
      body: new FormData(form)
    });

    const res = await fetch('/cart.js');
    const cart = await res.json();
    console.log(cart);
       
    //open cart drawer

    await updateCartDrawer();
    updateCartCountItem(cart.item_count);
    openDrawer();
  })
});

addCartDrawerListner();

document.querySelector('.cart-drawer').addEventListener('click',()=>{
  document.querySelector('.cart-drawer').classList.remove('drawer--active')
});

document.querySelector('.cart-drawer-close').addEventListener('click',()=>{
  document.querySelector('.cart-drawer-close').closest('.cart-drawer').classList.remove('drawer--active')
});

document.querySelectorAll('a[href="/cart"]').forEach( a => {
  a.addEventListener('click',(e)=>{
    e.preventDefault();
    openDrawer();
  })
})

/* Slide */
const slider = function () {
  const sliders = document.querySelectorAll('.slides').forEach(slider => {      
  const slides = slider.querySelectorAll('.slide');
  const btnLeft = slider.parentElement.querySelector('.slider__btn--left');
  const btnRight = slider.parentElement.querySelector('.slider__btn--right');
  let curSlide = 0;
  const maxSlide = slides.length;
  const goToSlide = function (slide) {
  slides.forEach(
    (s, i) => {
      s.style.transform = `translateX(${100 * (i - slide)}%)`;  
    });

  };
  goToSlide(0);
 
 // Next slide
const nextSlide = function () {
  if (curSlide === maxSlide - 1) {
    curSlide = 0;
  } else {
    curSlide++;
  }

  goToSlide(curSlide);
  };

  const prevSlide = function () {
      if (curSlide === 0) {
      curSlide = maxSlide - 1;
      } else {
      curSlide--;
      }
      goToSlide(curSlide);
  };

  
 if( btnRight || btnLeft ){
 btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide); 
 }
 
});
};




/* tab */
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
if(tabsContainer) {
  tabsContainer.addEventListener('click', function (e) {   
    const clicked = e.target.closest('.operations__tab');
  
    // Guard clause
    if (!clicked) return;
  
    // Remove active classes
    tabs.forEach(t => t.classList.remove('operations__tab--active'));
    tabsContent.forEach(c => c.classList.remove('operations__content--active'));
  
    // Activate tab
     clicked.classList.add('operations__tab--active');
  
    // Activate content area
    document
      .querySelector(`.operations__content--${clicked.dataset.tab}`)
      .classList.add('operations__content--active');     
  });
}

slider();

/* filter arrow rotate */
document.querySelectorAll('details').forEach(detail => {
  detail.addEventListener('click',()=>{
    detail.querySelector('svg').classList.toggle('rotate-180');
  })
})

/* dynamic section*/
document.querySelectorAll('.button-dynamic').forEach(button =>{
  button.addEventListener('click',()=>{
    const key = button.getAttribute('data-section-name');
    const wrapper = button.closest('body');
    wrapper.querySelector(`.${key}`).classList.add('drawer--active');
  })
});

/* collapse and expand*/
const mobileItems = document.querySelectorAll('.sub-nav-item-mobile');
mobileItems.forEach(item => {
  item.addEventListener('click', ()=>{
    const isItemOpen = item.classList.contains('open');
    mobileItems.forEach(item => item.classList.remove('open'));
    if (!isItemOpen){
      item.classList.toggle('open');
    }
  });
})

if (document.querySelector('.drawer-box')){
  document.querySelector('.drawer-box').addEventListener('click',(e)=> {
    e.stopPropagation(); 
    
  });
 }





