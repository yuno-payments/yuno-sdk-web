export const disabledButton = ({ disabled }) => { 
  const payButton = document.querySelector('#button-pay')
  payButton.disabled = disabled
}

export const showButton = ({ show }) => {
  const payButton = document.querySelector('#button-pay')
  payButton.style.display = show ? 'block' : 'none'
}

export const enableLoadingButton = ({ loading, previousText }) => {
  const payButton = document.querySelector('#button-pay')
  payButton.disabled = loading
  payButton.innerHTML = loading ? 'Processing...' : previousText
}