$(document).ready(function () {
  // const langSwitcher = document.getElementById('language-switcher');
  const langSwitcher = document.querySelectorAll('.language-switcher');
  const defaultLang = 'en';

  const basePath = window.location.pathname.includes("/dubrovsky/")
    ? "/dubrovsky/"
    : "/";

  // ----------------------------------------------------------------------
  // Обновляем все ссылки на странице (чтобы сохранялся ?lang=ru)
  function updateAllLinksLanguage(lang) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');

      if (
        href &&
        !href.startsWith('http') &&
        !href.startsWith('#') &&
        !href.startsWith('mailto') &&
        !href.startsWith('javascript')
      ) {
        // если ссылка уже содержит /dubrovsky/, не добавляем повторно
        const hasDubrovsky = href.includes('/dubrovsky/');

        // нормализуем путь (убираем лишние /)
        const cleanHref = href.replace(/^\/+/, '');

        // формируем базу — добавляем /dubrovsky/ только если его нет
        const fullPath = hasDubrovsky
          ? cleanHref
          : basePath + cleanHref;

        const url = new URL(fullPath, window.location.origin);

        // сохраняем hash (если был)
        if (link.hash) {
          url.hash = link.hash;
        }

        // сохраняем query из оригинальной ссылки (если был)
        const originalUrl = new URL(href, window.location.origin);
        originalUrl.searchParams.forEach((value, key) => {
          url.searchParams.set(key, value);
        });

        // добавляем lang
        url.searchParams.set('lang', lang);

        // применяем обновлённый href
        link.setAttribute('href', url.pathname + url.search + url.hash);

        // console.log(`🔗 Обновил ссылку: ${href} -> ${url.pathname + url.search + url.hash}`);
      }
    });
  }


  // ----------------------------------------------------------------------
  // Обновляем URL браузера (pushState)
  function updateUrlLang(lang) {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({ path: url.href }, '', url.href);
  }

  // ----------------------------------------------------------------------
  // Устанавливаем язык
  async function setLanguage(lang) {
    try {
      // console.log("🔄 Устанавливаю язык:", lang);

      const response = await fetch(`static/js/locales/${lang}.json`);
      if (!response.ok) {
        // console.error(`❌ Не удалось загрузить ${lang}.json. Статус: ${response.status}`);
        return;
      }

      const translations = await response.json();

      // обновляем lang в <html>
      document.documentElement.lang = lang;

      // применяем переводы
      document.querySelectorAll('[data-i18n-key]').forEach((element) => {
        const key = element.getAttribute('data-i18n-key');
        if (translations[key]) {
          if (Array.isArray(translations[key])) {
            // если массив → соединяем и вставляем как HTML
            element.innerHTML = translations[key].join("");
          } else {
            // если обычный текст → вставляем как текст
            element.innerText = translations[key];
          }

          if (key === 'page_title') {
            document.title = Array.isArray(translations[key])
              ? translations[key].join("")
              : translations[key];
          }
        }
      });

      // подсвечиваем активную кнопку
      document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });

      // сохраняем
      localStorage.setItem('lang', lang);
      // console.log("💾 localStorage.lang =", localStorage.getItem('lang'));

      // обновляем URL и ссылки
      updateUrlLang(lang);
      updateAllLinksLanguage(lang);
    } catch (err) {
      console.error('❌ Ошибка при setLanguage:', err);
    }
  }

  // ----------------------------------------------------------------------
  // Определение языка по браузеру
  function detectUserLang() {
    const browserLang = navigator.language || navigator.userLanguage;
    console.log("🌍 Язык браузера:", browserLang);

    return (browserLang && browserLang.startsWith("ru")) ? "ru" : "en";
  }

  // ----------------------------------------------------------------------
  // Обработчик кликов
  if (langSwitcher.length) {
    langSwitcher.forEach((switcher) => {
      switcher.addEventListener('click', (event) => {
        if (event.target.classList.contains('lang-btn')) {
          const newLang = event.target.getAttribute('data-lang');
          if (newLang) {
            console.log("🖱 Клик по языку:", newLang);
            setLanguage(newLang);
          }
        }
      });
    });
  }

  // ----------------------------------------------------------------------
  // Загружаем язык при старте
  (async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    const langFromStorage = localStorage.getItem('lang');

    let userLang = langFromUrl || langFromStorage;

    if (!userLang) {
      userLang = detectUserLang();
    }

    if (!userLang) {
      userLang = defaultLang;
    }

    console.log("🚀 Язык при старте:", userLang);
    setLanguage(userLang);

    // если был lang в URL → обновляем localStorage
    if (langFromUrl && langFromUrl !== langFromStorage) {
      localStorage.setItem('lang', langFromUrl);
      console.log("💾 Сохранил язык из URL в localStorage:", langFromUrl);
    }
  })();




//---modal
  $('.toggler').on('click', function (e) {
    e.preventDefault();
    var $this = $(e.currentTarget);
    var target = $this.data('target');
    $('.modal').removeClass('_active');
    $('body').removeClass('_modal-open');
    $('.modal__backdrop').fadeOut();

    $("#" + $(this).data("target")).toggleClass('_active');
    $('.modal__backdrop').fadeIn();
    $("#" + $(this).data("target")).closest('body').toggleClass('_modal-open');
  });

  $('.modal__close, .modal__mask, .modal__backdrop').on('click', function (e) {
    e.preventDefault();

    $('.modal').removeClass('_active');
    $('.modal__backdrop').fadeOut();
    $('body').removeClass('_modal-open');
  });
  // modal-sort


  $(".book__item .more__link").on("click", function (e) {
    e.preventDefault();
    $(this).closest(".book__item").find(".book__more").slideToggle(500);
    $(this).toggleClass("open");
  });



});
