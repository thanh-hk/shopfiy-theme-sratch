document.querySelectorAll('.product-grid-select').forEach(select => {
    select.addEventListener('change',(event)=> {
    const format = document.querySelector('[data-money-format]').getAttribute('data-money-format');
    var price = event.target.options[event.target.selectedIndex].dataset.price; 
    var priceCompare = event.target.options[event.target.selectedIndex].dataset.compareprice;
    var saving = (((priceCompare - price) / priceCompare) * 100).toFixed(0);
    var itemImg = event.target.options[event.target.selectedIndex].dataset.src;
    select.parentElement.parentElement.querySelector('.product-price').textContent = formatMoney(price, format );
    select.parentElement.parentElement.querySelector('.product-compare-price').textContent = formatMoney(priceCompare, format );
    select.parentElement.parentElement.closest('.product-item').querySelector('.main-img').setAttribute ('src', itemImg ); 
    select.parentElement.parentElement.closest('.product-item').querySelector('.product-grid-save-label').textContent = saving + " %";
    console.log(price, priceCompare, saving );
  })
  });