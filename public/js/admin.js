const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector('[name="productId"]').value;
  const csrfToken = btn.parentNode.querySelector('[name="_csrf"]').value;

  const productElement = btn.closest('.product-item')

  fetch(`/admin/product/${productId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrfToken
    }
  })
  .then(result => {
    productElement.remove();
  })
  .catch(err => console.log(err));
};