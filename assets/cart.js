

var money = '{{ settings.free_shipping_amounts }}'
document.querySelectorAll('.cart-item-selector button').forEach(button =>{
    button.addEventListener('click', async () => {
        const rootCartItem = button.closest('.cart-item');
        const keyItem = rootCartItem.getAttribute('data-line-item-key');
        const input = button.parentElement.querySelector('input');
        const value = Number(input.value);
        const isPlus = button.classList.contains('plus');
         if (isPlus){
            const newValue = value + 1;           
            input.value = newValue;
            changeItemQuanity(keyItem, newValue);
           
         } else if ( value > 1) {
            const newValue = value -1;
            input.value = newValue;                     
            changeItemQuanity(keyItem, newValue);           
         }        
    })
});

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

document.querySelector('[name="note"]').addEventListener('keyup', debounce((e)=>{
    console.log(e.target.value);
    axios.post('/cart/update.js', {
        note: e.target.value,
    });
},500)
);

function changeItemQuanity(key, quantity){   
    axios.post('/cart/change.js',{
        id: key,
        quantity,   
    }).then (res => {
       console.log(res);
        const format = document.querySelector('[data-money-format]').getAttribute('data-money-format');
        const totalDiscount = formatMoney(res.data.total_discount, format);
        const totalPrice = formatMoney(res.data.total_price, format);
        const item = res.data.items.find((item)=> item.key === key);
        const itemPrice = formatMoney(item.final_line_price, format);
        document.querySelector(`[data-line-item-key="${key}"] .cart_item_price`).textContent = itemPrice;
        document.querySelector('.cart_count').textContent = res.data.item_count;
        if(document.querySelector('.cart_total_discount')){
            document.querySelector('.cart_total_discount').textContent = totalDiscount;
        }
        document.querySelector('.cart_total').textContent = totalPrice;
        const freeAmount = Number(document.querySelector('.free-shipping-bar').getAttribute('data-freeshipping-amount'))*100;
        const percentage = ((res.data.total_price / freeAmount) * 100).toFixed(0);
        const shipping_percetage_fraction = formatMoney((freeAmount - res.data.total_price), format)
        document.querySelector('.bar').style.width = `${percentage}%`;
        document.querySelector('.shipping_value-left').textContent = shipping_percetage_fraction;            
    })
}

