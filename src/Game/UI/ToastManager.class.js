export default class ToastManager {
  constructor() {
    this.toastContainer = null;
    this.activeToasts = [];
    this.init();
  }

  init() {
    this.createToastContainer();
  }

  createToastContainer() {
    // Create toast container
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 10000;
      pointer-events: none;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // Ensure document.body exists
    if (document.body) {
      document.body.appendChild(this.toastContainer);
    } else {
      // Wait for DOM to be ready
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(this.toastContainer);
      });
    }
  }

  showMusicToast(trackName) {
    // Remove any existing music toasts
    this.clearMusicToasts();

    const toast = document.createElement('div');
    toast.className = 'music-toast';

    // New styling with #ede8e4 background and black text
    toast.style.cssText = `
      background: #ede8e4;
      color: rgba(0, 0, 0, 0.9);
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.025em;
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(-320px);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 240px;
      min-width: 170px;
      position: relative;
      overflow: hidden;
    `;

    // Create music icon with gradient styling
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(0, 0, 0, 0.1);
    `;

    const icon = document.createElement('i');
    icon.className = 'fas fa-music';
    icon.style.cssText = `
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    `;

    iconContainer.appendChild(icon);

    // Create text content with better typography
    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    `;

    const label = document.createElement('div');
    label.textContent = 'Now Playing';
    label.style.cssText = `
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      margin-bottom: 2px;
    `;

    const title = document.createElement('div');
    title.textContent = trackName;
    title.style.cssText = `
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.9);
      font-weight: 500;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;

    // Add progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%);
      width: 0%;
      transition: width 4s linear;
    `;

    textContent.appendChild(label);
    textContent.appendChild(title);

    toast.appendChild(iconContainer);
    toast.appendChild(textContent);
    toast.appendChild(progressBar);

    // Find the insertion point - after season and day/night toasts
    const existingToasts = Array.from(this.toastContainer.children);
    let insertAfter = null;

    // Look for the last season or day/night toast
    for (let i = existingToasts.length - 1; i >= 0; i--) {
      const existingToast = existingToasts[i];
      if (
        existingToast.className === 'season-toast' ||
        existingToast.className === 'daynight-toast'
      ) {
        insertAfter = existingToast;
        break;
      }
    }

    // Insert the music toast after season/day-night toasts
    if (insertAfter) {
      this.toastContainer.insertBefore(toast, insertAfter.nextSibling);
    } else {
      // If no season/day-night toasts exist, append at the end
      this.toastContainer.appendChild(toast);
    }

    this.activeToasts.push(toast);

    // Force reflow to ensure initial state is applied
    toast.offsetHeight;

    // Animate in with proper timing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';

        // Start progress bar animation
        setTimeout(() => {
          progressBar.style.width = '100%';
        }, 100);
      });
    });

    // Auto hide after 4 seconds
    setTimeout(() => {
      this.hideToast(toast);
    }, 4000);

    return toast;
  }

  hideToast(toast) {
    if (!toast || !toast.parentNode) return;

    toast.style.transform = 'translateX(-320px)';
    toast.style.opacity = '0';

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.activeToasts = this.activeToasts.filter((t) => t !== toast);
    }, 500);
  }

  clearMusicToasts() {
    const musicToasts = this.activeToasts.filter(
      (toast) => toast.className === 'music-toast'
    );

    musicToasts.forEach((toast) => this.hideToast(toast));
  }

  showDayNightToast(timeOfDay) {
    // Remove any existing day/night toasts
    this.clearDayNightToasts();

    const toast = document.createElement('div');
    toast.className = 'daynight-toast';

    // Get appropriate icon gradient colors based on time of day
    let icon, iconGradient;
    if (timeOfDay === 'day') {
      icon = 'fas fa-sun';
      iconGradient = 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)';
    } else {
      icon = 'fas fa-moon';
      iconGradient = 'linear-gradient(135deg, #5c6bc0 0%, #3f51b5 100%)';
    }

    toast.style.cssText = `
      background: #ede8e4;
      color: rgba(0, 0, 0, 0.9);
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.025em;
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(-320px);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 240px;
      min-width: 170px;
      position: relative;
      overflow: hidden;
    `;

    // Create icon container with gradient
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background: ${iconGradient};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      // border: 1px solid rgba(0, 0, 0, 0.1);
    `;

    const iconElement = document.createElement('i');
    iconElement.className = icon;
    iconElement.style.cssText = `
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    `;

    iconContainer.appendChild(iconElement);

    // Create text content
    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    `;

    const label = document.createElement('div');
    label.textContent = 'Time Changed';
    label.style.cssText = `
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      margin-bottom: 2px;
    `;

    const title = document.createElement('div');
    title.textContent = timeOfDay === 'day' ? 'Daytime' : 'Nighttime';
    title.style.cssText = `
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.9);
      font-weight: 500;
      line-height: 1.3;
    `;

    textContent.appendChild(label);
    textContent.appendChild(title);
    toast.appendChild(iconContainer);
    toast.appendChild(textContent);

    this.toastContainer.appendChild(toast);
    this.activeToasts.push(toast);

    // Animate in
    toast.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideToast(toast);
    }, 3000);

    return toast;
  }

  showSeasonToast(season) {
    // Remove any existing season toasts
    this.clearSeasonToasts();

    const toast = document.createElement('div');
    toast.className = 'season-toast';

    // Get appropriate icon and gradient colors based on season
    let icon, iconGradient;
    switch (season) {
      case 'spring':
        icon = 'fas fa-seedling';
        iconGradient = 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)';
        break;
      case 'summer':
        icon = 'fas fa-sun';
        iconGradient = 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)';
        break;
      case 'autumn':
      case 'fall':
        icon = 'fas fa-leaf';
        iconGradient = 'linear-gradient(135deg, #ff8a65 0%, #ff5722 100%)';
        break;
      case 'winter':
        icon = 'fas fa-snowflake';
        iconGradient = 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)';
        break;
      default:
        icon = 'fas fa-cloud-rain';
        iconGradient = 'linear-gradient(135deg, #757575 0%, #424242 100%)';
    }

    toast.style.cssText = `
      background: #ede8e4;
      color: rgba(0, 0, 0, 0.9);
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.025em;
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(-320px);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 240px;
      min-width: 170px;
      position: relative;
      overflow: hidden;
    `;

    // Create icon container with gradient
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background: ${iconGradient};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(0, 0, 0, 0.1);
    `;

    const iconElement = document.createElement('i');
    iconElement.className = icon;
    iconElement.style.cssText = `
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    `;

    iconContainer.appendChild(iconElement);

    // Create text content
    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    `;

    const label = document.createElement('div');
    label.textContent = 'Season Changed';
    label.style.cssText = `
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      margin-bottom: 2px;
    `;

    const title = document.createElement('div');
    title.textContent = season.charAt(0).toUpperCase() + season.slice(1);
    title.style.cssText = `
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.9);
      font-weight: 500;
      line-height: 1.3;
    `;

    textContent.appendChild(label);
    textContent.appendChild(title);
    toast.appendChild(iconContainer);
    toast.appendChild(textContent);

    this.toastContainer.appendChild(toast);
    this.activeToasts.push(toast);

    // Animate in
    toast.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideToast(toast);
    }, 3000);

    return toast;
  }

  clearDayNightToasts() {
    const dayNightToasts = this.activeToasts.filter(
      (toast) => toast.className === 'daynight-toast'
    );

    dayNightToasts.forEach((toast) => this.hideToast(toast));
  }

  clearSeasonToasts() {
    const seasonToasts = this.activeToasts.filter(
      (toast) => toast.className === 'season-toast'
    );

    seasonToasts.forEach((toast) => this.hideToast(toast));
  }

  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let backgroundColor, textColor, borderColor;

    // Special handling for music disabled toast
    if (message === 'Music disabled') {
      backgroundColor = 'rgba(0, 0, 0, 0.9)';
      textColor = 'rgba(255, 255, 255, 0.95)';
      borderColor = 'rgba(255, 255, 255, 0.1)';
    } else {
      // Default styling for other toasts
      switch (type) {
        case 'success':
          backgroundColor = '#ede8e4';
          textColor = 'rgba(0, 0, 0, 0.9)';
          borderColor = 'rgba(0, 0, 0, 0.1)';
          break;
        case 'error':
          backgroundColor = 'rgba(239, 68, 68, 0.9)';
          textColor = 'rgba(255, 255, 255, 0.95)';
          borderColor = 'rgba(239, 68, 68, 0.3)';
          break;
        case 'warning':
          backgroundColor = 'rgba(245, 158, 11, 0.9)';
          textColor = 'rgba(255, 255, 255, 0.95)';
          borderColor = 'rgba(245, 158, 11, 0.3)';
          break;
        default:
          backgroundColor = '#ede8e4';
          textColor = 'rgba(0, 0, 0, 0.9)';
          borderColor = 'rgba(0, 0, 0, 0.1)';
      }
    }

    toast.style.cssText = `
      background: ${backgroundColor};
      color: ${textColor};
      padding: 12px 16px;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.3px;
      transform: translateX(-320px);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      border: 1.5px solid ${borderColor};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: fit-content !important;
      border-radius: 8px;
    `;

    toast.textContent = message;

    this.toastContainer.appendChild(toast);
    this.activeToasts.push(toast);

    // Force reflow to ensure initial state is applied
    toast.offsetHeight;

    // Animate in with proper timing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    // Auto hide
    setTimeout(() => {
      this.hideToast(toast);
    }, duration);

    return toast;
  }

  destroy() {
    if (this.toastContainer && this.toastContainer.parentNode) {
      this.toastContainer.parentNode.removeChild(this.toastContainer);
    }
    this.activeToasts = [];
  }
}
