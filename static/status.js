function initStatus() {
  // start Yuno SDK
  const yuno = new Yuno()
    /**
     * configurations
     */
    const config = {
      /**
       * 
       * @param {{ status: 'CREATED' | 'READY_TO_PAY' | 'CREATED' | 'PAYED' | 'REJECTED' | 'CANCELLED' | 'ERROR' | 'DECLINED'}} data 
       */
      onStatus(data) {
        console.log('onStatus', data)
      },
    }

    yuno.mountStatus({ 
      // element where the SDK will be mount on
      element: '#root',
      config 
    })
}

window.addEventListener('load', initStatus)