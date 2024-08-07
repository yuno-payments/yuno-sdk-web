class LoaderMessage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
          @keyframes toTransparentAnimationSubHeadingMobile {
          from {
            opacity: 1;
          }
        
          to {
            bottom: 90px;
            opacity: 0;
          }
        }
        
        @keyframes toTransparentAnimationSubHeading {
          from {
            opacity: 1;
          }
        
          to {
            bottom: 132px;
            opacity: 0;
          }
        }
        
        @keyframes toVisibleAnimationSubHeadingMobile {
          from {
            opacity: 0;
          }
        
          to {
            bottom: 90px;
            opacity: 1;
          }
        }
        
        @keyframes toVisibleAnimationSubHeading {
          from {
            opacity: 0;
          }
        
          to {
            bottom: 132px;
            opacity: 1;
          }
        }
        
        @keyframes toTransparentAnimationHeadingMobile {
          from {
            opacity: 1;
          }
        
          to {
            bottom: 62px;
            opacity: 0;
          }
        }
        
        @keyframes toTransparentAnimationHeading {
          from {
            opacity: 1;
          }
        
          to {
            bottom: 80px;
            opacity: 0;
          }
        }
        
        @keyframes toVisibleAnimationHeadingMobile {
          from {
            opacity: 0;
          }
        
          to {
            bottom: 34px;
            opacity: 1;
          }
        }
        
        @keyframes toVisibleAnimationHeading {
          from {
            opacity: 0;
          }
        
          to {
            bottom: 44px;
            opacity: 1;
          }
        }

        .animation {
          animation-iteration-count: 1;
          animation-delay: 0.8s;
          animation-duration: 0.6s;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }

        .loader__container {
          background: rgba(255, 255, 255, 1);
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 1500;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .loader__message {
          position: relative;
          max-width: 386px;
          width: 386px;
          height: 152px;
          margin: 32px;
          flex-grow: 0;
        }

        .loader__heading {
          font-size: 34px;
          letter-spacing: normal;
          font-weight: 700;
          font-family: Inter;
          box-sizing: border-box;
          line-height: 120%;
          margin: 0;
          color: #282A30;
          position: absolute;
        }

        .loader__heading-top {
          opacity: 1;
          bottom: 76px;
          animation-name: toTransparentAnimationHeading;
        }

        .loader__heading-bottom {
          opacity: 0;
          bottom: 40px;
          animation-name: toVisibleAnimationHeading;
        }

        .loader__subheading {
          position: absolute;
          font-size: 14px;
          letter-spacing: normal;
          font-weight: 400;
          font-family: Inter;
          box-sizing: border-box;
          line-height: 140%;
          margin: 0;
          color: #92959B;
          bottom: 44px;
          display: block;
        }

        .loader__subheading-top {
          opacity: 0;
          animation-name: toVisibleAnimationSubHeading;
        }

        .loader__subheading-bottom {
          opacity: 1;
          animation-name: toTransparentAnimationSubHeading;
        }

        .loader__loading-container {
          position: absolute;
          height: 4px;
          background: #ECEFF2;
          border-radius: 100px;
          bottom: 0;
          overflow: hidden;
          width: 100%;
        }

        @keyframes rotatingAnimation {
          from {
            left: -100px;
          }

          to {
            left: 100%;
          }
        }

        .loader__loading {
          position: absolute;
          height: 4px;
          width: 100px;
          background: #282A30;
          border-radius: 100px;
          left: -100px;

          animation-name: rotatingAnimation;
          animation-iteration-count: infinite;
          animation-delay: 0s;
          animation-duration: 1.5s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      
      </style>

      <div class="loader__container">
        <article class="loader__message">
          <span class="loader__heading loader__heading-top animation">
            One moment, please...
          </span>
          <span class="loader__heading loader__heading-bottom animation">
            We are processing your request...
          </span>
          <span class="loader__subheading loader__subheading-top animation">
            One moment, please...
          </span>
          <span class="loader__subheading loader__subheading-bottom animation">
            We are processing your request...
          </span>
          <div class="loader__loading-container">
            <div class="loader__loading"></div>
          </div>
        </article>
      </div>
    `
  }
}

customElements.define("loader-message", LoaderMessage);

document.addEventListener('yuno-loader-message', (event) => {
  var loader = document.getElementById('loader')
  if (event.detail) {
    loader.style.display = 'inline'
    document.body.style.overflow = 'hidden'
  }
  else {
    loader.style.display = 'none'
    document.body.style.overflow = 'auto'
  }
})

export const dispatchLoaderEvent = ({ showLoader }) => {
  const customEvent = new CustomEvent('yuno-loader-message', { detail: showLoader })
  document.dispatchEvent(customEvent)
}

