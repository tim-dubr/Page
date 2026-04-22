$(document).ready(function () {
  const defaultLang = 'en';
  const basePath = window.location.pathname.includes("/dubrovsky/") ? "/dubrovsky/" : "/";

  // ----------------------------------------------------------------------
  // Универсальная функция обновления всех ссылок на скачивание
  function updateDownloadLinks(translations) {
    // Находим все ссылки с атрибутами data-book и data-type
    $('.book__download[data-book][data-type]').each(function() {
      const $link = $(this);
      const bookIndex = $link.data('book');
      const fileType = $link.data('type');

      // Формируем ключ: book_1_pdf, book_2_doc и т.д.
      const key = `book_${bookIndex}_${fileType}`;

      if (translations[key]) {
        $link.attr('href', translations[key]);
        console.log(`✅ Обновлена ссылка: ${key} -> ${translations[key]}`);
      } else {
        console.warn(`⚠️ Не найден ключ: ${key}`);
      }
    });
  }

  // ----------------------------------------------------------------------
  // Универсальная функция обновления всех текстов
  function updateAllTexts(translations) {
    // Обновляем все элементы с data-i18n-key
    $('[data-i18n-key]').each(function() {
      const $el = $(this);
      const key = $el.data('i18n-key');

      if (translations[key]) {
        if (Array.isArray(translations[key])) {
          $el.html(translations[key].join(''));
        } else {
          // Проверяем, не нужно ли сохранить вложенные элементы
          if ($el.children().length > 0 && !$el.hasClass('book__download')) {
            // Сохраняем HTML-структуру, обновляем только текст
            const textNodes = $el.contents().filter(function() {
              return this.nodeType === 3; // текстовые узлы
            });
            if (textNodes.length > 0) {
              textNodes.first().replaceWith(translations[key]);
            }
          } else {
            $el.text(translations[key]);
          }
        }

        // Обновляем title страницы
        if (key === 'page_title') {
          document.title = translations[key];
        }
      }
    });
  }

  // ----------------------------------------------------------------------
  // Универсальная функция установки языка
  async function setLanguage(lang) {
    try {
      console.log("🔄 Устанавливаю язык:", lang);

      const response = await fetch(`static/js/locales/${lang}.json`);
      if (!response.ok) {
        console.error(`❌ Не удалось загрузить ${lang}.json`);
        return;
      }

      const translations = await response.json();

      // Устанавливаем язык в HTML
      document.documentElement.lang = lang;

      // Обновляем все тексты
      updateAllTexts(translations);

      // Обновляем ссылки на скачивание
      updateDownloadLinks(translations);

      // Подсвечиваем активную кнопку
      $('.lang-btn').removeClass('active');
      $(`.lang-btn[data-lang="${lang}"]`).addClass('active');

      // Сохраняем в localStorage
      localStorage.setItem('lang', lang);

      // Обновляем URL и ссылки
      updateUrlLang(lang);
      updateAllLinksLanguage(lang);

    } catch (err) {
      console.error('❌ Ошибка при setLanguage:', err);
    }
  }

  // ----------------------------------------------------------------------
  // Обновляем URL браузера
  function updateUrlLang(lang) {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({ path: url.href }, '', url.href);
  }

  // ----------------------------------------------------------------------
  // Обновляем все ссылки на странице
  function updateAllLinksLanguage(lang) {
    $('a[href]').each(function() {
      const $link = $(this);
      let href = $link.attr('href');

      if (href && !href.startsWith('http') && !href.startsWith('#') &&
        !href.startsWith('mailto') && !href.startsWith('javascript')) {

        const hasDubrovsky = href.includes('/dubrovsky/');
        const cleanHref = href.replace(/^\/+/, '');
        const fullPath = hasDubrovsky ? cleanHref : basePath + cleanHref;

        try {
          const url = new URL(fullPath, window.location.origin);

          if ($link.attr('hash')) {
            url.hash = $link.attr('hash');
          }

          url.searchParams.set('lang', lang);
          $link.attr('href', url.pathname + url.search + url.hash);
        } catch(e) {
          console.warn('Ошибка при обновлении ссылки:', href, e);
        }
      }
    });
  }

  // ----------------------------------------------------------------------
  // Определение языка по браузеру
  function detectUserLang() {
    const browserLang = navigator.language || navigator.userLanguage;
    return (browserLang && browserLang.startsWith("ru")) ? "ru" : "en";
  }

  // ----------------------------------------------------------------------
  // Обработчики кликов по переключателю языка
  $('.language-switcher').on('click', '.lang-btn', function() {
    const newLang = $(this).data('lang');
    if (newLang) {
      console.log("🖱 Клик по языку:", newLang);
      setLanguage(newLang);
    }
  });

  // ----------------------------------------------------------------------
  // Инициализация языка при старте
  (async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    const langFromStorage = localStorage.getItem('lang');

    let userLang = langFromUrl || langFromStorage || detectUserLang() || defaultLang;

    console.log("🚀 Язык при старте:", userLang);
    await setLanguage(userLang);

    if (langFromUrl && langFromUrl !== langFromStorage) {
      localStorage.setItem('lang', langFromUrl);
    }
  })();

  // ----------------------------------------------------------------------
  // Модальные окна и другие функции
  $('.toggler').on('click', function(e) {
    e.preventDefault();
    const target = $(this).data('target');
    $('.modal').removeClass('_active');
    $('body').removeClass('_modal-open');
    $('.modal__backdrop').fadeOut();

    $(`#${target}`).toggleClass('_active');
    $('.modal__backdrop').fadeIn();
    $('body').toggleClass('_modal-open');
  });

  $('.modal__close, .modal__mask, .modal__backdrop').on('click', function(e) {
    e.preventDefault();
    $('.modal').removeClass('_active');
    $('.modal__backdrop').fadeOut();
    $('body').removeClass('_modal-open');
  });

  $(".book__item .more__link").on("click", function(e) {
    e.preventDefault();
    $(this).closest(".book__item").find(".book__more").slideToggle(500);
    $(this).toggleClass("open");
  });
});