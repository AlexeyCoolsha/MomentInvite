/**
 * Countdown Component
 * Calculates and updates the time remaining until a specified event date
 * @param {string|Date} targetDate - Target date for countdown (can be any date)
 * @param {string} elementSelector - CSS selector for countdown container
 */
export class Countdown {
  constructor(targetDate, elementSelector = '.countdown') {
    this.targetDate = new Date(targetDate);
    this.element = document.querySelector(elementSelector);
    this.intervalId = null;

    if (!this.element) {
      console.warn(`Countdown element not found: ${elementSelector}`);
      return;
    }

    // Validate date
    if (isNaN(this.targetDate.getTime())) {
      console.error('Invalid target date provided to Countdown');
      return;
    }

    this.init();
  }

  /**
   * Initialize countdown
   */
  init() {
    this.update();
    // Update every 1000ms (1 second)
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  /**
   * Calculate time difference
   * @returns {Object} Object with days, hours, minutes, seconds
   */
  calculateTimeRemaining() {
    const now = new Date().getTime();
    const target = this.targetDate.getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  /**
   * Update countdown display
   */
  update() {
    const { days, hours, minutes, seconds } = this.calculateTimeRemaining();

    const daysElement = this.element.querySelector('.countdown__value--days');
    const hoursElement = this.element.querySelector('.countdown__value--hours');
    const minutesElement = this.element.querySelector('.countdown__value--minutes');
    const secondsElement = this.element.querySelector('.countdown__value--seconds');

    const daysLabelElement = this.element.querySelector('[data-label="days"]');
    const hoursLabelElement = this.element.querySelector('[data-label="hours"]');
    const minutesLabelElement = this.element.querySelector('[data-label="minutes"]');
    const secondsLabelElement = this.element.querySelector('[data-label="seconds"]');

    // Update numbers (without leading zeros for days, with for others)
    if (daysElement) daysElement.textContent = String(days);
    if (hoursElement) hoursElement.textContent = this.padZeroTwo(hours);
    if (minutesElement) minutesElement.textContent = this.padZeroTwo(minutes);
    if (secondsElement) secondsElement.textContent = this.padZeroTwo(seconds);

    // Update labels with correct Russian forms
    if (daysLabelElement) {
      daysLabelElement.textContent = this.getCorrectForm(days, {
        singular: 'день',
        dual: 'дня',
        plural: 'дней',
      });
    }
    if (hoursLabelElement) {
      hoursLabelElement.textContent = this.getCorrectForm(hours, {
        singular: 'час',
        dual: 'часа',
        plural: 'часов',
      });
    }
    if (minutesLabelElement) {
      minutesLabelElement.textContent = this.getCorrectForm(minutes, {
        singular: 'минута',
        dual: 'минуты',
        plural: 'минут',
      });
    }
    if (secondsLabelElement) {
      secondsLabelElement.textContent = this.getCorrectForm(seconds, {
        singular: 'секунда',
        dual: 'секунды',
        plural: 'секунд',
      });
    }

    // Check if countdown is finished
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      this.stop();
      this.element.classList.add('countdown--finished');
    }
  }

  /**
   * Get correct Russian word form based on number
   * @param {number} num - Number
   * @param {Object} forms - Object with forms: {singular: 'день', dual: 'дня', plural: 'дней'}
   * @returns {string} Correct word form
   */
  getCorrectForm(num, forms) {
    const mod10 = num % 10;
    const mod100 = num % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return forms.singular;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return forms.dual;
    } else {
      return forms.plural;
    }
  }

  /**
   * Pad number with zero (2 digits)
   * @param {number} num - Number to pad
   * @returns {string} Padded number
   */
  padZeroTwo(num) {
    return String(num).padStart(2, '0');
  }

  /**
   * Stop countdown
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Restart countdown with new date
   * @param {string|Date} newDate - New target date
   */
  restart(newDate) {
    this.stop();
    this.targetDate = new Date(newDate);
    this.element.classList.remove('countdown--finished');
    this.init();
  }

  /**
   * Destroy countdown
   */
  destroy() {
    this.stop();
  }
}

// Auto-initialize all countdown elements with data-date attribute
document.addEventListener('DOMContentLoaded', () => {
  const countdownElements = document.querySelectorAll('[data-countdown]');
  countdownElements.forEach((element) => {
    const targetDate = element.getAttribute('data-countdown');
    new Countdown(targetDate, `[data-countdown="${targetDate}"]`);
  });
});
