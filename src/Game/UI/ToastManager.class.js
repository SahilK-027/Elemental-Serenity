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
      bottom: 20px;
      left: 20px;
      z-index: 10000;
      pointer-events: none;
      font-family: 'Inter', sans-serif;
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

    // Professional styling with better visual hierarchy
    toast.style.cssText = `
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%);
      color: rgba(255, 255, 255, 0.95);
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.025em;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      transform: translateX(-320px);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      max-width: 240px;
      min-width: 170px;
      position: relative;
      overflow: hidden;
    `;

    // Add subtle animated background gradient
    const backgroundOverlay = document.createElement('div');
    backgroundOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%);
      animation: shimmer 3s ease-in-out infinite;
      pointer-events: none;
    `;

    // Create music icon with better styling
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    const icon = document.createElement('i');
    icon.className = 'fas fa-music';
    icon.style.cssText = `
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.9);
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
      color: rgba(255, 255, 255, 0.65);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      margin-bottom: 2px;
    `;

    const title = document.createElement('div');
    title.textContent = trackName;
    title.style.cssText = `
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.95);
      font-weight: 500;
      line-height: 1.3;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
      width: 0%;
      transition: width 4s linear;
    `;

    textContent.appendChild(label);
    textContent.appendChild(title);

    toast.appendChild(backgroundOverlay);
    toast.appendChild(iconContainer);
    toast.appendChild(textContent);
    toast.appendChild(progressBar);

    // Add shimmer animation keyframes to document if not already added
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes shimmer {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `;
      document.head.appendChild(style);
    }

    this.toastContainer.appendChild(toast);
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

  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let backgroundColor, textColor, borderColor;
    switch (type) {
      case 'success':
        backgroundColor = 'rgba(34, 197, 94, 0.9)';
        textColor = 'rgba(255, 255, 255, 0.95)';
        borderColor = 'rgba(34, 197, 94, 0.3)';
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
        backgroundColor = 'rgba(0, 0, 0, 0.9)';
        textColor = 'rgba(255, 255, 255, 0.95)';
        borderColor = 'rgba(255, 255, 255, 0.1)';
    }

    toast.style.cssText = `
      background: ${backgroundColor};
      color: ${textColor};
      padding: 12px 16px;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
      transform: translateX(-320px);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      border: 1.5px solid ${borderColor};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
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
