export const createPaymentOption = (paymentMethod, id) => {
  const div = document.createElement("div");
  div.classList.add("payment-item");
  div.innerHTML = `
      <label class="payment-option" for="${id}">
        <img src="${paymentMethod.icon}" alt="${paymentMethod.name}" class="payment-icon">
        <span>${paymentMethod.name}</span>
        <input 
          type="radio" 
          id="${id}" 
          name="payment" 
          value="${id}" 
          class="payment-radio"
        >
      </label>
      <div class="payment-form" id="form-${id}-content">
        <div class="form-content" id="form-${id}"></div>
        <div class="loading" id="loading-${id}">
          loading ....
        </div>
      </div>
  `;
  return div;
}

export const createListPaymentMethods = (paymentMethodsList, loadChekoutLite) => {
  const listContent = document.getElementById("payment-methods")
  paymentMethodsList.forEach((paymentMethod, index) => {
    const optionId = paymentMethod.type + "-" + index + '-' + paymentMethod.vaulted_token
    const paymentOption = createPaymentOption(paymentMethod, optionId)
    listContent.appendChild(paymentOption)
    paymentOption.querySelector(`#${optionId}`).addEventListener("click", () => {
      loadChekoutLite(paymentMethod, optionId)
    })
  })
}

export const showContent = (id) => {
  const ContentId = `#form-${id}-content`
  const Content = document.querySelector(ContentId)
  Content.style.display = 'block'
}

export const hideContent = (id) => {
  const ContentId = `#form-${id}-content`
  const Content = document.querySelector(ContentId)
  Content.style.display = 'none'
}

export const showFormContent = (id) => {
  const formContentId = `#form-${id}`
  const formContent = document.querySelector(formContentId)
  formContent.style.display = 'block'
}

export const hideormContent = (id) => {
  const formContentId = `#form-${id}`
  const formContent = document.querySelector(formContentId)
  formContent.style.display = 'none'
}

export const hideLoader = (id) => {
  const loaderId = `#loading-${id}`
  const loader = document.querySelector(loaderId)
  loader.style.display = 'none'
}

export const showLoader = (id) => {
  const loaderId = `#loading-${id}`
  const loader = document.querySelector(loaderId)
  loader.style.display = 'block'
}

export const resetStateList = (paymentMethodsList)=>{
  paymentMethodsList.forEach((paymentMethod, index) => {
    const optionId = paymentMethod.type + "-" + index + '-' + paymentMethod.vaulted_token
    hideContent(optionId)
    hideormContent(optionId)
    showLoader(optionId)
  })
}