/**
 * RSVP Form Component
 * Handles form submission and sends data to Telegram bot
 * @param {string} elementSelector - CSS selector for form container
 * @param {string} botToken - Telegram bot token
 * @param {string[]|string} chatId - Telegram chat ID(s)
 */
export class RSVPForm {
  constructor(elementSelector = '.rsvp-form', botToken = null, chatId = null) {
    this.element = document.querySelector(elementSelector);
    this.form = this.element?.querySelector('form');
    this.botToken = botToken;
    this.chatIds = Array.isArray(chatId)
      ? chatId
      : typeof chatId === 'string'
        ? chatId
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
        : [];
    this.isSubmitting = false;

    if (!this.element || !this.form) {
        console.warn(`Telegram: часть сообщений не отправилась (${result.failures}). IDs: ${result.failedIds.join(", ")}. Проверьте chat ID в .env.`);
      return;
    }

    if (!this.botToken || this.chatIds.length === 0) {
        console.warn(`Telegram: часть сообщений не отправилась (${result.failures}). IDs: ${result.failedIds.join(", ")}. Проверьте chat ID в .env.`);
      return;
    }

    this.init();
  }

  /**
   * Initialize form
   */
  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Get form data
   * @returns {Object} Form data
   */
  getFormData() {
    const attendance = this.form.querySelector('input[name="attendance"]:checked')?.value || '';
    const name = this.form.querySelector('input[name="name"]')?.value.trim() || '';
    const drinkPreferences = Array.from(this.form.querySelectorAll('input[name="drinks"]:checked')).map(
      (input) => input.value,
    );

    return {
      attendance,
      name,
      drinkPreferences,
    };
  }

  /**
   * Validate form data
   * @param {Object} data - Form data
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validateFormData(data) {
    const errors = [];

    if (!data.attendance) {
      errors.push('Пожалуйста, ответьте на вопрос о присутствии');
    }

    if (!data.name || data.name.length < 2) {
      errors.push('Пожалуйста, укажите ваше имя и фамилию');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format data for Telegram message
   * @param {Object} data - Form data
   * @returns {string} Formatted message
   */
  formatMessage(data) {
    const attendanceText =
      data.attendance === 'yes' ? 'Да, с удовольствием приду! 🎉' : 'К сожалению, не смогу присутствовать 😔';

    const drinksText = data.drinkPreferences.length > 0 ? data.drinkPreferences.join(', ') : 'Не указано';

    const message = `
📝 Новый RSVP ответ

👤 Имя: ${data.name}
✨ Присутствие: ${attendanceText}
🥂 Напитки: ${drinksText}
    `.trim();

    return message;
  }

  /**
   * Send message to Telegram
   * @param {string} message - Message to send
   * @returns {Promise}
   */
  async sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      const responses = await Promise.allSettled(
        this.chatIds.map(async (chatId) => {
          const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          };

          console.log('Sending message to Telegram', { url, payload });

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (!response.ok || !data.ok) {
            const err = data.description || response.statusText;
            // specific guidance for unauthorized
            if (response.status === 401) {
              console.error('401 Unauthorized – проверьте токен бота и убедитесь, что бот активен');
              throw new Error('Telegram API error 401: проверьте токен бота');
            }
            throw new Error(`Telegram API error: ${err}`);
          }

          return { chatId, data };
        }),
      );

      console.log('Telegram responses', responses);

      const successes = responses.filter((r) => r.status === 'fulfilled').length;
      const failures = responses.length - successes;
      const failedIds = responses
        .filter((r) => r.status === 'rejected')
        .map((r, index) => this.chatIds[index]);

      if (successes === 0) {
        throw new Error('Все отправки завершились ошибкой.');
      }

      return {
        responses,
        successes,
        failures,
        failedIds,
      };
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      // show user-friendly message in form if available
      if (this.form) {
        const msg = error.message.includes('401')
          ? 'Неправильный токен или бот не имеет доступа. Проверьте настройки Telegram.'
          : 'Ошибка при отправке – проверьте консоль.';
        this.showError(msg);
      }
      throw error;
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async handleSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) {
      return;
    }

    const data = this.getFormData();
    const validation = this.validateFormData(data);

    // Clear previous messages
    this.clearMessages();

    if (!validation.isValid) {
      this.showError(validation.errors.join('\n'));
      return;
    }

    try {
      this.isSubmitting = true;
      this.setSubmitButtonLoading(true);

      const message = this.formatMessage(data);
      const result = await this.sendToTelegram(message);

      this.showSuccess('Спасибо! Ваш ответ отправлен. 🎉');
      this.form.reset();

      // Optional: Scroll to success message
      this.scrollToMessage();

      if (result && result.failures > 0) {
        console.warn(`Telegram: часть сообщений не отправилась (${result.failures}). IDs: ${result.failedIds.join(", ")}. Проверьте chat ID в .env.`);
      }
    } catch (error) {
      this.showError('Ошибка при отправке. Пожалуйста, попробуйте позже.');
    } finally {
      this.isSubmitting = false;
      this.setSubmitButtonLoading(false);
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorElement = this.form.querySelector('.rsvp-form__error') || this.createErrorElement();
    errorElement.textContent = message;
    errorElement.classList.add('rsvp-form__error--visible');
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    const successElement = this.form.querySelector('.rsvp-form__success') || this.createSuccessElement();
    successElement.textContent = message;
    successElement.classList.add('rsvp-form__success--visible');
  }

  /**
   * Clear messages
   */
  clearMessages() {
    const errorElement = this.form.querySelector('.rsvp-form__error');
    const successElement = this.form.querySelector('.rsvp-form__success');

    if (errorElement) {
      errorElement.classList.remove('rsvp-form__error--visible');
    }
    if (successElement) {
      successElement.classList.remove('rsvp-form__success--visible');
    }
  }

  /**
   * Create error element
   * @returns {HTMLElement} Error element
   */
  createErrorElement() {
    const element = document.createElement('div');
    element.className = 'rsvp-form__error';
    this.form.appendChild(element);
    return element;
  }

  /**
   * Create success element
   * @returns {HTMLElement} Success element
   */
  createSuccessElement() {
    const element = document.createElement('div');
    element.className = 'rsvp-form__success';
    this.form.appendChild(element);
    return element;
  }

  /**
   * Set submit button loading state
   * @param {boolean} isLoading - Loading state
   */
  setSubmitButtonLoading(isLoading) {
    const button = this.form.querySelector('.rsvp-form__submit-btn');
    if (!button) return;

    button.disabled = isLoading;

    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<span class="rsvp-form__loading"></span>Отправка...';
    } else {
      button.textContent = button.dataset.originalText || 'Отправить';
    }
  }

  /**
   * Scroll to message
   */
  scrollToMessage() {
    const successElement = this.form.querySelector('.rsvp-form__success');
    if (successElement) {
      successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}












