/* ===================== 1. UTM / SAuid cookies ===================== */

document.addEventListener("DOMContentLoaded", function () {
  (function () {
    function c(e) {
      var d = RegExp("[?&]" + e + "=([^&]*)").exec(window.location.search);
      return d && decodeURIComponent(d[1].replace(/\+/g, " "));
    }
    function a(f, g) {
      var e = new Date(new Date().getTime() + 1000 * 3600 * 24 * 30);
      var domain = window.location.hostname.replace(/^(www\.)?(.+)$/i, "$2");
      document.cookie =
        f +
        "=" +
        g +
        "; domain=." +
        domain +
        "; path=/; expires=" +
        e.toUTCString();
    }
    function b() {
      if (window.location.href) {
        var d = c("utm_source");
        var e = c("SAuid");
        if (d != null && d.length) a("utm_source", d);
        if (e != null && e.length) a("SAuid", e);
      }
    }
    b();
  })();
});

/* ===================== 3. Facebook Pixel + CAPI ===================== */

(function () {
  // =========================================================================
  // 1. НАСТРОЙКИ И ИНИЦИАЛИЗАЦИЯ ПИКСЕЛЯ
  // =========================================================================
  var PIXEL_ID = "532077894118910";
  var CAPI_URL = "https://payment-handler.site/fb_capi_service/api/fb/";
  var GOOGLE_URL = "https://payment-handler.site/fb_capi_service/api/google/";

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
  );

  fbq("init", PIXEL_ID);

  if (window.fbq && window.fbq._isIntercepted) return;
  var originalFbq = window.fbq;

  var map_content_ids = {
    "00-00000114": "556889836181",
    "00-00000024": "503191444192",
    "00-00000026": "491614839172",
    "00-00000195": "829909190692",
    "00-00000196": "538222566772",
    "00-00000603": "131139448602",
    "00-00000197": "310348745282",
    "00-00000117": "209565419861",
    "00-00000204": "619174279971",
    "00-00000205": "544541218652",
    "00-00000206": "542455976412",
    "00-00000207": "534778232452",
    "00-00000605": "424863986752",
    "00-00000208": "236162840232",
    "00-00000088": "413707892991",
    "00-00000085": "948686175392",
    "00-00000089": "651924546462",
    "00-00000013": "239094177591",
    "00-00000198": "909812003182",
    "00-00000200": "352336375072",
    "00-00000103": "835597282412",
    "00-00000025": "497607469412",
    "00-00000101": "624323780862",
    "00-00000102": "446193110672",
    "00-00000100": "505001562522",
    "00-00000020": "794774402791",
    "00-00000037": "571167342521",
    "00-00000093": "942636082012",
    "00-00000076": "649814181142",
    "00-00000093": "680472011582",
    "00-00000076": "827709950862",
    "00-00000078": "333692312741",
    "00-00000078": "461817883112",
    "00-00000078": "529183644792",
    "00-00000077": "931790046321",
    "00-00000077": "390918189862",
    "00-00000077": "123594655332",
    "00-00000074": "125411414841",
    "00-00000175": "542221407911",
    "00-00000074": "505236807312",
    "00-00000175": "313818793592",
    "00-00000033": "567504993151",
    "00-00000033": "663262224272",
    "00-00000033": "586331472362",
    "00-00000032": "851649488531",
    "00-00000032": "931024551392",
    "00-00000032": "920235416552",
    "00-00000064": "705134421872",
    "00-00000023": "993337920222",
    "00-00003447": "213692931442",
    "00-00000038": "857010826932",
    "00-00000038": "842345944232",
    "00-00000017": "516450418172",
    "00-00000017": "314107995432",
    "00-00000029": "841655979411",
    "00-00000029": "276610184872",
    "00-00000108": "193806475052",
    "00-00000108": "622416358582",
    "00-00000022": "365054045312",
    "00-00000018": "457399131532",
    "00-00000018": "438513527422",
    "00-00000021": "230320967922",
    "00-00000098": "741402171492",
    "00-00000099": "971040557842",
    "00-00002556": "357979175422",
    "00-00002556": "440622966132",
    "00-00002556": "247375941742",
    "00-00002555": "903901889922",
    "00-00002555": "954283204172",
    "00-00002554": "952425012182",
    "00-00002553": "714021338212",
    "00-00002552": "333551494662",
    "00-00000082": "944701541962",
    "00-00000082": "723268353112",
    "00-00000002": "231325661692",
    "00-00000003": "814044459622",
    "00-00000003": "814804764652",
    "00-00003246": "991012571252",
    "00-00000001": "271212206752",
    "00-00002549": "166558435362",
    "00-00000120": "630908112712",
    "00-00002550": "684948354052",
    "00-00000080": "794718671332",
    "00-00000080": "702116260042",
    "00-00000079": "896488751502",
    "00-00000079": "167610055232",
    "00-00000006": "265458519502",
    "00-00000008": "582868608712",
    "00-00000008": "426245546652",
    "00-00000007": "229874527802",
    "00-00000009": "207531471402",
    "00-00000010": "704990764962",
    "00-00000010": "299483988572",
    "00-00000010": "547618513132",
    "00-00000220": "197253366962",
    "00-00000220": "685519470842",
    "00-00002524": "818647196762",
    "00-00002526": "857800697002",
    "00-00002526": "309171457132",
    "00-00002525": "446709245792",
    "00-00002523": "943775441262",
    "00-00002523": "544823460602",
    "00-00002527": "914538270982",
    "00-00000222": "353422803702",
    "00-00000222": "469724832252",
    "00-00000222": "932752988012",
    "00-00000222": "431792047532",
    "00-00000202": "700922247062",
    "00-00000202": "667320575742",
    "00-00000202": "814017912312",
    "00-00000202": "142868497602",
    "00-00002530": "317610299122",
    "00-00002530": "515837234692",
    "00-00002530": "224240567102",
    "00-00002533": "360533654942",
    "00-00002558": "441103754012",
    "00-00000596": "511253760122",
    "00-00000595": "714753318802",
    "00-00000598": "860829398982",
    "00-00000598": "683794614002",
    "00-00000734": "965583490282",
    "00-00000774": "437571504132",
    "00-00000602": "550854739792",
    "00-00002531": "335845811324",
    "00-00002528": "394285528132",
    "00-00002063": "841166203262",
    "00-00002040": "914222195554",
    "00-00002011": "667183539452",
    "00-00002041": "907210930632",
    "00-00002534": "521408201732",
    "00-00002536": "624341789722",
    "00-00002537": "993224509052",
    "00-00002538": "811279262472",
    "00-00002539": "298865237662",
    "00-00002044": "287587772892",
    "00-00002186": "196009602572",
    "00-00002183": "125582560152",
    "00-00002181": "393942464952",
    "00-00002184": "729918472852",
    "00-00002182": "783059467422",
    "00-00002185": "223275033932",
    "00-00002215": "562668093052",
    "00-00002216": "270609746012",
    "00-00002540": "463110989282",
    "00-00002542": "605464724392",
    "00-00002541": "940170870082",
    "00-00002543": "553266157292",
    "00-00002544": "841089129092",
    "00-00002293": "261485930812",
    "00-00002296": "824829693442",
    "00-00002546": "391102346342",
    "00-00002292": "212546773372",
    "00-00002295": "917973296002",
    "00-00002547": "360603941152",
    "00-00002294": "106984730402",
    "00-00002297": "489785459652",
    "00-00002548": "182890729782",
    "00-00002609": "201715861974",
    "00-00002611": "312222321994",
    "00-00002610": "891009586994",
    "00-00002572": "124202106742",
    "00-00002574": "346467527772",
    "00-00002607": "254734692132",
    "00-00002614": "267911545332",
    "00-00002623": "692348237012",
    "00-00002624": "940246165832",
    "00-00002625": "734368498872",
    "00-00002626": "377661761132",
    "00-00003079": "651519501322",
    "00-00003086": "584762254362",
    "00-00003113": "694245873222",
    "00-00002110": "437536271832",
    "00-00002111": "859337164982",
    "00-00002113": "731848384832",
    "00-00002112": "931592293072",
    "00-00002114": "265644413992",
    "00-00002115": "546382946332",
    "00-00003244": "436812235274",
    "00-00003351": "907229947994",
    "00-00003243": "725809781604",
    "00-00003661": "331376376534",
    "00-00003242": "538175096604",
    "00-00003403": "839144944974",
    "00-00003241": "997047369464",
    "00-00003487": "829534658724",
    "00-00003113": "643302860924",
    "00-00003113": "439681700564",
    "00-00003113": "582701226804",
    "00-00002536": "295050245394",
    "00-00002536": "533585108994",
    "00-00002536": "181040562504",
    "00-00003660": "443496223164",
    "00-00003257": "899642914484",
  };
  // =========================================================================
  // 2. ГЛОБАЛЬНЫЕ ФУНКЦИИ-ПОМОЩНИКИ (HELPERS)
  // =========================================================================

  // Генератор ID
  var generateEventId = (prefix) =>
    `${prefix}_${Math.floor(Date.now() / 1000)}_${Math.floor(Math.random() * 100000)}`;

  var getCookie = (name) => {
    var match = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)",
      ),
    );
    return match ? decodeURIComponent(match[1]) : null;
  };

  var getExternalId = (phone) => {
    if (!phone) return undefined;
    var digits = String(phone).replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
  };

  // Единая функция отправки на сервер CAPI
  var sendToCapi = (endpoint, payload) => {
    fetch(CAPI_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((err) => console.error(`[CAPI Error - ${endpoint}]`, err));
  };

  // Та же подія в TikTok, з тим самим event_id (секція 4). Секція 4 стоїть у
  // файлі нижче, але всі виклики відбуваються вже після завантаження файлу.
  var sendToTikTok = (eventName, data, opts) => {
    try {
      if (window.rbTikTok) window.rbTikTok.track(eventName, data, opts);
    } catch (e) {}
  };

  // Кошик Тільди -> contents для TikTok (ті самі номери товарів, що й у Meta).
  var tikTokContents = (parsedCart) =>
    parsedCart.ga_items.map((it) => ({
      content_id: it.item_id,
      content_name: it.item_name,
      price: it.price,
      quantity: it.quantity,
    }));

  var dispatchEvent = (method, eventName, params, options) => {
    if (window.fbq.callMethod)
      return window.fbq.callMethod.call(
        window.fbq,
        method,
        eventName,
        params,
        options,
      );
    return originalFbq(method, eventName, params, options);
  };

  // Единый сборщик данных пользователя
  var getUserDataFromStorage = () => {
    var email = null,
      phone = null;
    try {
      var udCart = JSON.parse(localStorage.getItem("user_data_cart") || "{}");
      email = udCart.email || null;
      phone = udCart.phone || null;

      if (!email || !phone) {
        var basket = JSON.parse(
          localStorage.getItem("basket_data_with_date") || "{}",
        );
        if (!email) email = basket.email || null;
        if (!phone) phone = basket.phone || null;
      }
    } catch (e) {
      console.warn("[Storage Parse Error]", e);
    }

    return {
      email,
      phone,
      fbc: getCookie("_fbc"),
      fbp: getCookie("_fbp"),
      client_user_agent: navigator.userAgent,
    };
  };

  // Единый парсер корзины Тильды (устраняет дублирование кода для IC и Purchase)
  var parseTildaCartData = (cartObj) => {
    var result = {
      content_ids: [],
      contents: [],
      ga_items: [],
      num_items: 0,
      value: Number(cartObj.prodamount) || 0,
      currency: "UAH",
    };
    if (!cartObj || !cartObj.products) return result;

    cartObj.products.forEach((elem) => {
      if (elem.name === "empty" || elem.id === "delivery" || !elem.name) return;

      var id = elem.uid;
      if (!id) {
        var match = elem.name.match(/(?:\[sku:|\()([0-9-]+)(?:\]|\))/);
        if (match && match[1]) id = map_content_ids[match[1]] || match[1];
      }

      if (id) {
        var qty = Number(elem.quantity) || 1;
        var itemPrice = Number(elem.price) || (Number(elem.amount) || 0) / qty;

        // Очищаем название для Google (отрезаем всё начиная с [sku: или =)
        var cleanName = elem.name.split(/(?:\[sku:|\(|(?:=\d+$))/)[0].trim();

        result.content_ids.push(String(id));
        result.contents.push({
          id: String(id),
          quantity: qty,
          item_price: itemPrice,
        });

        result.ga_items.push({
          item_id: String(id),
          item_name: cleanName,
          currency: "UAH",
          price: itemPrice,
          quantity: qty,
        });

        result.num_items += qty;
      }
    });
    return result;
  };

  // --- GOOGLE ХЕЛПЕР ---
  var getGaClientId = () => {
    var gaCookie = getCookie("_ga");
    if (!gaCookie) return "unknown";
    var parts = gaCookie.split(".");
    return parts.length >= 4 ? parts.slice(2).join(".") : gaCookie;
  };

  var sendToGoogle = (endpoint, payload) => {
    fetch(GOOGLE_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((err) => console.error(`[Google Server Error]`, err));
  };

  // --- GOOGLE: view_item_list (каталог: season-sale или products?tfc…) ---
  var shouldSendViewItemList = () => {
    var u = window.location.href.toLowerCase();
    if (u.indexOf("season-sale") !== -1) return true;
    return u.indexOf("products") !== -1 && u.indexOf("tfc") !== -1;
  };

  /** item_list_id из data-elem-id, item_list_name из .tn-atom у активной вкладки (.activechange) */
  // var getViewItemListMetaFromDom = () => {
  //   var el = document.querySelector(
  //     ".t396__elem.tn-elem.activechange[data-elem-id]",
  //   );
  //   if (!el) {
  //     return { item_list_id: "sales", item_list_name: "sales" };
  //   }
  //   var listId = el.getAttribute("data-elem-id") || "sales";
  //   var atom = el.querySelector(".tn-atom");
  //   var listName = atom ? atom.textContent.trim() : "sales";
  //   if (!listName) listName = "sales";
  //   return { item_list_id: String(listId), item_list_name: listName };
  // };

  var getViewItemListMetaFromDom = () => {
    // Берем ID, который мы поймали в MutationObserver, или дефолтное значение
    var listId = lastActiveListId || "sales";

    // Ищем название в словаре. Если ID неизвестен — ставим "Other" или "sales"
    var listName = map_category_names[listId] || "sales";

    return {
      item_list_id: String(listId),
      item_list_name: listName,
    };
  };

  /** Карточки витрины Tilda: data-product-uid / SKU / название / цена */
  var collectStoreCardItemsForGa = () => {
    var items = [];
    var seen = {};
    var cards = document.querySelectorAll(".js-product.t-store__card");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var uid =
        card.getAttribute("data-product-uid") ||
        card.getAttribute("data-product-lid") ||
        null;
      var skuEl = card.querySelector(".js-store-prod-sku, .js-product-sku");
      var skuRaw = skuEl ? skuEl.textContent : "";
      var skuMatch = String(skuRaw).match(/00-[\d-]+/);
      var sku = skuMatch ? skuMatch[0] : String(skuRaw).replace(/\s/g, "");

      var itemId = uid;
      if (!itemId && sku) {
        itemId = map_content_ids[sku] || sku;
      }
      if (!itemId) continue;

      var nameEl = card.querySelector(".js-store-prod-name, .js-product-name");
      var itemName = nameEl ? nameEl.textContent.trim() : "Product";

      var priceEl = card.querySelector(
        ".js-product-price, .js-store-prod-price-val",
      );
      var price = 0;
      if (priceEl) {
        var def = priceEl.getAttribute("data-product-price-def");
        if (def != null && def !== "") {
          price = Number(def) || 0;
        } else {
          var num = String(priceEl.textContent)
            .replace(/\s/g, "")
            .replace(",", ".");
          price = parseFloat(num) || 0;
        }
      }

      var key = String(itemId);
      if (seen[key]) continue;
      seen[key] = true;
      items.push({
        item_id: String(itemId),
        item_name: itemName,
        currency: "UAH",
        price: price,
        quantity: 1,
      });
    }
    return items;
  };

  var viewItemListDebounceTimer = null;
  var sendViewItemListToGoogle = () => {
    if (!shouldSendViewItemList()) return;
    var listMeta = getViewItemListMetaFromDom();
    var gaItems = collectStoreCardItemsForGa();
    if (gaItems.length === 0) return;
    var vilEventId = generateEventId("vil");
    // var listValue = gaItems.reduce(function (acc, it) {
    //   return acc + (Number(it.price) || 0);
    // }, 0);
    sendToGoogle("view_item_list", {
      client_id: getGaClientId(),
      event_id: vilEventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      action_source: "website",
      events: [
        {
          name: "view_item_list",
          params: {
            item_list_id: listMeta.item_list_id,
            item_list_name: listMeta.item_list_name,
            currency: "UAH",
            // value: listValue,
            items: gaItems,
          },
        },
      ],
    });
  };

  var scheduleViewItemList = () => {
    if (viewItemListDebounceTimer) {
      clearTimeout(viewItemListDebounceTimer);
    }
    viewItemListDebounceTimer = setTimeout(function () {
      viewItemListDebounceTimer = null;
      sendViewItemListToGoogle();
    }, 450);
  };

  var lastActiveListId = null; // Золотой стандарт: храним состояние (State) текущей вкладки
  var IGNORED_LIST_IDS = ["1721642533373", "1721642511756"]; // Базовые категории для исключения
  // Словарь категорий (Золотой стандарт: маппинг ID в названия)
  var map_category_names = {
    1721642633278: "обличчя",
    1721642633273: "обличчя",
    1721642670170: "сироватки",
    1721642670168: "сироватки",
    1721642670166: "крема",
    1721642670161: "крема",
    1721642652768: "під очі",
    1721642652766: "під очі",
    1721642652763: "Очищення та тонізація",
    1721642652759: "Очищення та тонізація",
    1721643384182: "НАБОРИ",
    1721643384178: "НАБОРИ",
    1721642670177: "тіло",
    1721642670176: "тіло",
    1721642823200: "скраби",
    1721642823197: "скраби",
    1721642823213: "антицелюліт",
    1721642823211: "антицелюліт",
    1721642823208: "зволоження",
    1721642823207: "зволоження",
    1721643384186: "сяйво",
    1721643384184: "сяйво",
    1721642823205: "Засмага",
    1721642823203: "Засмага",
    1721642670174: "волосся",
    1721642670172: "волосся",
  };
  /** Смена активной категории (класс activechange на вкладке T396) */
  var setupViewItemListActiveObserver = () => {
    if (!shouldSendViewItemList()) return;

    var obs = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        var mu = mutations[m];
        if (mu.type !== "attributes" || mu.attributeName !== "class") {
          continue;
        }
        var t = mu.target;

        // Ловим элемент, который получил класс активности
        if (
          t &&
          t.classList &&
          t.classList.contains("t396__elem") &&
          t.classList.contains("tn-elem") &&
          t.classList.contains("activechange")
        ) {
          var currentListId = t.getAttribute("data-elem-id");

          // Проверяем: есть ли ID, изменился ли он с прошлого раза и не входит ли он в черный список
          if (
            currentListId &&
            currentListId !== lastActiveListId &&
            !IGNORED_LIST_IDS.includes(currentListId)
          ) {
            lastActiveListId = currentListId; // Запоминаем новую категорию

            // scheduleViewItemList использует debounce на 450мс.
            // Это нужно, чтобы дать скриптам Тильды время удалить старые товары из DOM и отрендерить новые.
            scheduleViewItemList();
          }
          return;
        }
      }
    });

    obs.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  };

  // =========================================================================
  // 3. ПЕРЕХВАТЧИК PIXEL (INTERCEPTOR)
  // =========================================================================
  window.fbq = function (...args) {
    var [method, eventName, data = {}] = args;

    if (method === "track" && eventName === "AddToCart") {
      var content_id = null;
      if (data.content_ids) {
        var rawId = Array.isArray(data.content_ids)
          ? String(data.content_ids[0])
          : String(data.content_ids);
        var match = rawId.match(/(?:\[sku:|\()([0-9-]+)(?:\]|\))/);
        content_id = /^\d+$/.test(rawId)
          ? rawId
          : match
            ? map_content_ids[match[1]] || null
            : null;
      }

      var itemValue = Number(data.value) || 0;
      var eventId = generateEventId("atc");

      sendToCapi("add_to_cart", {
        event_name: "AddToCart",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: window.location.href,
        action_source: "website",
        user_data: getUserDataFromStorage(),
        custom_data: {
          currency: "UAH",
          value: itemValue,
          content_type: "product",
          content_ids: content_id ? [content_id] : [],
          contents: content_id
            ? [{ id: content_id, quantity: 1, item_price: itemValue }]
            : [],
        },
      });

      var atcUser = getUserDataFromStorage();
      sendToTikTok(
        "AddToCart",
        {
          contents: content_id
            ? [
                {
                  content_id: content_id,
                  content_name: data.content_name || "",
                  price: itemValue,
                  quantity: 1,
                },
              ]
            : [],
          value: itemValue,
          currency: "UAH",
        },
        {
          eventId: eventId,
          user: { email: atcUser.email, phone: atcUser.phone },
          server: true,
        },
      );

      return dispatchEvent(
        "track",
        "AddToCart",
        {
          content_type: "product",
          content_ids: content_id ? [content_id] : [],
          contents: content_id
            ? [{ id: content_id, quantity: 1, item_price: itemValue }]
            : [],
          value: itemValue,
          currency: "UAH",
        },
        { eventID: eventId },
      );
    }

    // Блокируем стандартный Lead и InitiateCheckout, так как мы обрабатываем его сами через Vanilla JS
    if (method === "track" && eventName === "Lead") return;
    if (method === "track" && eventName === "InitiateCheckout") return;

    if (window.fbq.callMethod)
      return window.fbq.callMethod.apply(window.fbq, args);
    return originalFbq.apply(this, args);
  };

  for (var prop in originalFbq) {
    if (Object.prototype.hasOwnProperty.call(originalFbq, prop))
      window.fbq[prop] = originalFbq[prop];
  }
  window.fbq._isIntercepted = true;

  // =========================================================================
  // 4. ОСНОВНЫЕ СОБЫТИЯ СТРАНИЦЫ (DOMContentLoaded)
  // =========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    var serverUserData = getUserDataFromStorage();

    // --- PAGEVIEW ---
    var pvEventId = generateEventId("pv");
    dispatchEvent("track", "PageView", {}, { eventID: pvEventId });
    sendToCapi("page_view", {
      event_name: "PageView",
      event_time: Math.floor(Date.now() / 1000),
      event_id: pvEventId,
      event_source_url: window.location.href,
      action_source: "website",
      user_data: serverUserData,
    });

    if (shouldSendViewItemList()) {
      setTimeout(function () {
        sendViewItemListToGoogle();
        setupViewItemListActiveObserver();
      }, 800);
    }

    // --- VIEWCONTENT ---
    var isProductPage = () => {
      var url = window.location.href.toLowerCase();
      if (window.location.pathname === "/" || window.location.pathname === "")
        return false;
      var excludes = [
        "products?",
        "gift-certificates",
        "b2b-partners",
        "about-us",
        "season-sale",
        "morning",
        "test",
        "footer1",
        "header",
        "thanks",
        "thx-claude",
        "showtockers",
      ];
      return !excludes.some((ex) => url.includes(ex));
    };

    if (isProductPage()) {
      setTimeout(() => {
        var id = null;
        var price = 0;
        var itemName = "Unknown Product";

        var orderBtn = document.querySelector('a[href^="#order:"]');
        if (orderBtn) {
          var mainPart = orderBtn
            .getAttribute("href")
            .split("#order:")[1]
            ?.split(":::")[0];
          if (mainPart) {
            var lastEq = mainPart.lastIndexOf("=");
            if (lastEq !== -1)
              price = Number(mainPart.substring(lastEq + 1)) || 0;

            var match = mainPart.match(/(?:\[sku:|\()([0-9-]+)(?:\]|\))/);
            var rawSku = match && match[1] ? match[1] : null;
            if (rawSku) id = map_content_ids[rawSku] || rawSku;

            var extractedName = mainPart.split(/(?:\[sku:|\()/)[0].trim();
            if (extractedName) itemName = extractedName;
          }
        }

        // вариант для лендов с новым типом добавления в корзину
        if (!id) {
          var container766 = document.querySelector(".t766__container");
          if (container766) {
            // Имя
            var nameEl = container766.querySelector(".js-product-name");
            if (nameEl) itemName = nameEl.textContent.trim();

            // SKU + Маппинг
            var skuEl = container766.querySelector(".js-product-sku");
            if (skuEl) {
              var rawSku2 = skuEl.textContent.trim();
              id = map_content_ids[rawSku2] || rawSku2;
            }

            // Цена (приоритет у атрибута data-product-price-def, запасной вариант - очистка текста)
            var priceEl = container766.querySelector(".js-product-price");
            if (priceEl) {
              var defPrice = priceEl.getAttribute("data-product-price-def");
              if (defPrice) {
                price = Number(defPrice) || 0;
              } else {
                price =
                  parseFloat(
                    priceEl.textContent.replace(/\s/g, "").replace(",", "."),
                  ) || 0;
              }
            }
          }
        }

        var contentIds = id ? [String(id)] : [];
        var vcEventId = generateEventId("vc");

        dispatchEvent(
          "track",
          "ViewContent",
          {
            content_type: "product",
            content_ids: contentIds,
            value: price,
            currency: "UAH",
          },
          { eventID: vcEventId },
        );

        sendToCapi("view_content", {
          event_name: "ViewContent",
          event_time: Math.floor(Date.now() / 1000),
          event_id: vcEventId,
          event_source_url: window.location.href, // Не забудьте здесь (и ниже) использовать getCurrentUrl() если функция добавлена!
          action_source: "website",
          user_data: serverUserData,
          custom_data: {
            currency: "UAH",
            value: price,
            content_type: "product",
            content_ids: contentIds,
          },
        });

        if (id) {
          sendToTikTok(
            "ViewContent",
            {
              contents: [
                {
                  content_id: String(id),
                  content_name: itemName,
                  price: price,
                  quantity: 1,
                },
              ],
              value: price,
              currency: "UAH",
            },
            { eventId: vcEventId },
          );
        }

        // --- Отправка Google view_item ---
        var gViEventId = generateEventId("gvi");
        sendToGoogle("view_item", {
          client_id: getGaClientId(),
          event_id: gViEventId,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: window.location.href,
          action_source: "website",
          events: [
            {
              name: "view_item",
              params: {
                currency: "UAH",
                value: price,
                items: [
                  {
                    item_id: String(id), // Отправится "null", если товар не найден (соответствует fallback-логике)
                    item_name: itemName,
                    currency: "UAH",
                    price: price,
                    quantity: 1,
                  },
                ],
              },
            },
          ],
        });
      }, 500);
    }

    // --- INITIATE CHECKOUT (Focus Event) ---
    var handleCheckoutFocus = (e) => {
      if (localStorage.getItem("fb_capi_initial_checkout") === "true") return;
      if (e.target.closest(".t706__orderform")) {
        try {
          var cart = JSON.parse(localStorage.getItem("tcart") || "{}");
          if (!cart.products || cart.products.length === 0) return;

          localStorage.setItem("fb_capi_initial_checkout", "true");
          document.removeEventListener("focusin", handleCheckoutFocus);

          var parsedCart = parseTildaCartData(cart);
          if (parsedCart.content_ids.length === 0) {
            localStorage.removeItem("fb_capi_initial_checkout");
            return;
          }

          var icEventId = generateEventId("ic");
          var payload = {
            content_type: "product",
            content_ids: parsedCart.content_ids,
            contents: parsedCart.contents,
            value: parsedCart.value,
            currency: parsedCart.currency,
            num_items: parsedCart.num_items,
          };

          dispatchEvent("track", "InitiateCheckout", payload, {
            eventID: icEventId,
          });
          sendToCapi("initiate_checkout", {
            event_name: "InitiateCheckout",
            event_time: Math.floor(Date.now() / 1000),
            event_id: icEventId,
            event_source_url: window.location.href,
            action_source: "website",
            user_data: serverUserData,
            custom_data: payload,
          });

          sendToTikTok(
            "InitiateCheckout",
            {
              contents: tikTokContents(parsedCart),
              value: parsedCart.value,
              currency: parsedCart.currency,
            },
            {
              eventId: icEventId,
              user: {
                email: serverUserData.email,
                phone: serverUserData.phone,
              },
              server: true,
            },
          );

          // GOOGLE begin_checkout
          var gBcEventId = generateEventId("gbc");
          sendToGoogle("begin_checkout", {
            client_id: getGaClientId(),
            event_id: gBcEventId,
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: window.location.href,
            action_source: "website",
            events: [
              {
                name: "begin_checkout",
                params: {
                  currency: parsedCart.currency,
                  value: parsedCart.value,
                  items: parsedCart.ga_items,
                },
              },
            ],
          });
        } catch (error) {
          localStorage.removeItem("fb_capi_initial_checkout");
        }
      }
    };
    document.addEventListener("focusin", handleCheckoutFocus);

    // --- GOOGLE VIEW_CART (Оптимальное решение: наблюдение за <body>) ---
    var isCartOpen = false;
    var bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          var hasCartClass = document.body.classList.contains(
            "t706__body_cartwinshowed",
          );

          if (hasCartClass && !isCartOpen) {
            isCartOpen = true; // Корзина открылась

            setTimeout(() => {
              // Ждем 300мс для финального обновления localStorage 'tcart'
              var cart = JSON.parse(localStorage.getItem("tcart") || "{}");
              if (!cart.products || cart.products.length === 0) return;
              var parsedCart = parseTildaCartData(cart);

              var gVcEventId = generateEventId("gvcart");
              sendToGoogle("view_cart", {
                client_id: getGaClientId(),
                event_id: gVcEventId,
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: window.location.href,
                action_source: "website",
                events: [
                  {
                    name: "view_cart",
                    params: {
                      currency: "UAH",
                      value: parsedCart.value,
                      items: parsedCart.ga_items,
                    },
                  },
                ],
              });
            }, 300);
          } else if (!hasCartClass && isCartOpen) {
            isCartOpen = false; // Корзина закрылась
          }
        }
      });
    });
    // Наблюдаем только за атрибутами <body> (0% нагрузки на процессор)
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // --- ФИНАЛИЗАЦИЯ PURCHASE ---
    // Заказ с оплатой при получении: Purchase уходит на странице thanks, как и
    // раньше. Заказ с онлайн-оплатой: только после того, как бэкенд подтвердил,
    // что оплаченный заказ дошёл (секция 9) — иначе Purchase получали и те, кто
    // вернулся с платёжной страницы, не заплатив (8.5% событий в сентябре 2026).
    var onThanksPage =
      window.location.href.includes("thanks") ||
      window.location.href.includes("thx-claude");

    var firePendingPurchase = function (data) {
      try {
        var parsedCart = parseTildaCartData(data.cart);

        // Advanced Matching
        var pixelUserDataPurchase = {};
        if (data.external_id)
          pixelUserDataPurchase.external_id = data.external_id;
        if (data.phoneInput)
          pixelUserDataPurchase.ph = data.phoneInput.replace(/\D/g, "");
        if (data.emailInput)
          pixelUserDataPurchase.em = data.emailInput.toLowerCase().trim();
        if (data.firstNameInput)
          pixelUserDataPurchase.fn = data.firstNameInput.toLowerCase().trim();
        if (data.lastNameInput)
          pixelUserDataPurchase.ln = data.lastNameInput.toLowerCase().trim();
        if (data.cityInput)
          pixelUserDataPurchase.ct = data.cityInput.toLowerCase().trim();

        if (Object.keys(pixelUserDataPurchase).length > 0) {
          fbq("init", PIXEL_ID, pixelUserDataPurchase);
        }

        var payload = {
          content_type: "product",
          content_ids: parsedCart.content_ids,
          contents: parsedCart.contents,
          value: parsedCart.value,
          currency: parsedCart.currency,
          num_items: parsedCart.num_items,
        };

        dispatchEvent("track", "Purchase", payload, {
          eventID: data.eventId,
        });

        sendToCapi("purchase", {
          event_name: "Purchase",
          event_time: data.event_time,
          event_id: data.eventId,
          event_source_url: data.event_source_url,
          action_source: "website",
          user_data: {
            first_name: data.firstNameInput,
            last_name: data.lastNameInput,
            city: data.cityInput,
            email: data.emailInput,
            phone: data.phoneInput,
            fbc: data.fbc,
            fbp: data.fbp,
            client_user_agent: data.client_user_agent,
          },
          cart: data.cart,
        });

        sendToTikTok(
          "Purchase",
          {
            contents: tikTokContents(parsedCart),
            value: parsedCart.value,
            currency: parsedCart.currency,
          },
          {
            eventId: data.eventId,
            eventTime: data.event_time,
            pageUrl: data.event_source_url,
            user: { email: data.emailInput, phone: data.phoneInput },
            server: true,
          },
        );
      } catch (error) {
        console.error("Purchase processing error:", error);
      } finally {
        localStorage.removeItem("rb_meta_pending");
        localStorage.removeItem("fb_capi_initial_checkout");
      }
    };

    var pendingDataStr = localStorage.getItem("rb_meta_pending");
    if (pendingDataStr) {
      var pendingData = null;
      try {
        pendingData = JSON.parse(pendingDataStr);
      } catch (error) {
        localStorage.removeItem("rb_meta_pending");
      }

      var gate = window.rbPaidGate;
      var paidOnline =
        pendingData && pendingData.payment && pendingData.payment !== "cash";

      if (pendingData && (!paidOnline || !gate)) {
        // Наложенный платёж, запись старого формата или секция 9 не загрузилась.
        if (onThanksPage) firePendingPurchase(pendingData);
      } else if (pendingData && gate.isExpired(pendingData.ts)) {
        localStorage.removeItem("rb_meta_pending");
      } else if (pendingData) {
        gate.whenPaid(pendingData.orderId, function () {
          // Другая вкладка могла отправить это же событие, пока шла проверка.
          if (localStorage.getItem("rb_meta_pending") !== pendingDataStr) return;
          firePendingPurchase(pendingData);
        });
      }
    }
  });

  // =========================================================================
  // 5. ГЛОБАЛЬНЫЙ СЛУШАТЕЛЬ ФОРМ ТИЛЬДЫ (ДЕЛЕГИРОВАНИЕ)
  // =========================================================================
  // Работает без jQuery, ловит всплывающие события от любых форм
  document.addEventListener("tildaform:aftersuccess", (e) => {
    var form = e.target;
    if (!form) return;

    // А. ЛОГИКА PURCHASE (Сохранение корзины)
    if (form.closest(".t706__orderform")) {
      try {
        var cart = JSON.parse(localStorage.getItem("tcart") || "{}");

        // Ищем ID транзакции в DataLayer
        var dl = window.dataLayer || [];
        var txId = null;
        for (let i = dl.length - 1; i >= 0; i--) {
          var x = dl[i] || {};
          txId =
            x?.ecommerce?.purchase?.actionField?.id ||
            x?.ecommerce?.transaction_id ||
            x?.transaction_id;
          if (txId) break;
        }

        var fallbackUuid =
          window.crypto && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now());
        var eventId =
          (txId ? String(txId) : cart.orderid || fallbackUuid) + "_purchase";

        var phoneInput = form.querySelector("[type=tel]")?.value || "";

        var dataObj = {
          cart,
          eventId,
          // Для проверки оплаты на странице thanks (секция 9).
          orderId: txId ? String(txId) : "",
          payment: String(
            form.querySelector('[name="paymentsystem"]:checked')?.value || "",
          ).toLowerCase(),
          ts: Date.now(),
          phoneInput: phoneInput,
          firstNameInput: form.querySelector("[name=name]")?.value || "",
          lastNameInput: form.querySelector("[name=surname]")?.value || "",
          cityInput: form.querySelector("[name=city]")?.value || "",
          emailInput: form.querySelector("[type=email]")?.value || "",
          event_time: Math.floor(Date.now() / 1000),
          fbc: getCookie("_fbc"),
          fbp: getCookie("_fbp"),
          event_source_url: window.location.href,
          client_user_agent: navigator.userAgent,
          external_id: getExternalId(phoneInput), // Безопасный вызов (phoneInput уже объявлен)
        };

        localStorage.setItem("rb_meta_pending", JSON.stringify(dataObj));
      } catch (err) {
        console.error("[Purchase save error]", err);
      }

      // Попытка оформления закончилась — следующая снова даст InitiateCheckout.
      // Раньше флаг снимал только firePendingPurchase, а с секцией 9 он для
      // онлайн-оплаты срабатывает лишь после подтверждённой оплаты: кто вернулся
      // с WayForPay не заплатив, больше никогда не попадал в InitiateCheckout.
      localStorage.removeItem("fb_capi_initial_checkout");
    }

    // Б. ЛОГИКА LEAD (Только на страницах b2b-partners)
    else if (
      window.location.href.includes("b2b-partners") ||
      window.location.href.includes("showtockers")
    ) {
      if (form.dataset.leadSent) return;
      form.dataset.leadSent = "true";

      var phoneInput =
        form.querySelector(".js-phonemask-result")?.value ||
        form.querySelector('[name="Phone"]')?.value ||
        "";
      var nameInput =
        form.querySelector(
          'input[name="name"], input[name="Name"], input[name="Input"]',
        )?.value || "";

      var leadPhone = phoneInput.replace(/\D/g, "");
      var leadName = nameInput.trim().toLowerCase();
      var leadEventId = generateEventId("l");

      var pixelUserDataLead = {};
      if (leadPhone) pixelUserDataLead.ph = leadPhone;
      if (leadName) pixelUserDataLead.fn = leadName;

      if (Object.keys(pixelUserDataLead).length > 0)
        fbq("init", PIXEL_ID, pixelUserDataLead);
      dispatchEvent("track", "Lead", {}, { eventID: leadEventId });

      var serverPayload = {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: leadEventId,
        event_source_url: window.location.href,
        action_source: "website",
        user_data: getUserDataFromStorage(),
      };
      if (leadPhone) serverPayload.user_data.phone = leadPhone;
      if (leadName) serverPayload.user_data.fn = leadName;

      sendToCapi("lead", serverPayload);
    }
  });
})();

/* ===================== 4. TikTok Pixel ===================== */

!(function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = (w[t] = w[t] || []);
  ((ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent",
  ]),
    (ttq.setAndDefer = function (t, e) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    }));
  for (var i = 0; i < ttq.methods.length; i++)
    ttq.setAndDefer(ttq, ttq.methods[i]);
  ((ttq.instance = function (t) {
    for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
      ttq.setAndDefer(e, ttq.methods[n]);
    return e;
  }),
    (ttq.load = function (e, n) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js",
        o = n && n.partner;
      ((ttq._i = ttq._i || {}),
        (ttq._i[e] = []),
        (ttq._i[e]._u = r),
        (ttq._t = ttq._t || {}),
        (ttq._t[e] = +new Date()),
        (ttq._o = ttq._o || {}),
        (ttq._o[e] = n || {}));
      n = document.createElement("script");
      ((n.type = "text/javascript"),
        (n.async = !0),
        (n.src = r + "?sdkid=" + e + "&lib=" + t));
      e = document.getElementsByTagName("script")[0];
      e.parentNode.insertBefore(n, e);
    }));

  ttq.load("CVSFT93C77UF96PLUHKG");
  ttq.page();
})(window, document, "ttq");

/* TikTok events ride on section 3: every TikTok event is sent from the spot
   where the matching Meta event is sent, at the same moment and with the same
   event_id. So Purchase inherits the section 9 payment check — cash on the
   thank-you page, online only after the backend confirmed the paid order —
   instead of firing at cart submit for every order, paid or not, as the old
   Tilda block rec1285753511 did.

   AddToCart, InitiateCheckout and Purchase also get a server copy through the
   relay on our VPS (/var/www/webhooks/tiktok_capi/tt_capi.php, which holds the
   Events API token). TikTok merges the two copies by event_id. ViewContent is
   browser-only: it is the high-volume one and nobody optimises on it.

   GTM tag «ATC_TT» skips itself once `window.rbTikTok` exists. */
(function () {
  var RELAY_URL =
    "https://payment-handler.site/webhooks/tiktok_capi/tt_capi.php";

  var sha256 = function (str) {
    try {
      if (!str || !window.crypto || !crypto.subtle) return Promise.resolve("");
      return crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(str))
        .then(function (buf) {
          return Array.from(new Uint8Array(buf))
            .map(function (b) {
              return b.toString(16).padStart(2, "0");
            })
            .join("");
        })
        .catch(function () {
          return "";
        });
    } catch (e) {
      return Promise.resolve("");
    }
  };

  var normEmail = function (email) {
    var s = String(email || "")
      .trim()
      .toLowerCase();
    return s.indexOf("@") > 0 ? s : "";
  };

  /* TikTok wants E.164. Customers type 0671234567 or 380671234567. */
  var normPhone = function (phone) {
    var d = String(phone || "").replace(/\D/g, "");
    if (d.length === 10 && d.charAt(0) === "0") d = "38" + d;
    else if (d.length === 9) d = "380" + d;
    return d.length >= 11 ? "+" + d : "";
  };

  var getCookie = function (name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : undefined;
  };

  var hashUser = function (user) {
    user = user || {};
    return Promise.all([
      sha256(normEmail(user.email)),
      sha256(normPhone(user.phone)),
    ]).then(function (h) {
      return { email: h[0], phone: h[1] };
    });
  };

  /* data:  { contents: [{ content_id, content_name, price, quantity }],
              value, currency }
     opts:  { eventId, user: { email, phone } (plain), server, eventTime,
              pageUrl } */
  var track = function (event, data, opts) {
    data = data || {};
    opts = opts || {};
    var contents = (data.contents || []).filter(function (c) {
      return c && c.content_id;
    });
    var currency = data.currency || "UAH";
    var eventTime = opts.eventTime || Math.floor(Date.now() / 1000);
    var pageUrl = opts.pageUrl || window.location.href;

    return hashUser(opts.user)
      .then(function (hashed) {
        var identity = {};
        if (hashed.email) identity.email = hashed.email;
        if (hashed.phone) identity.phone_number = hashed.phone;
        if (identity.email || identity.phone_number) ttq.identify(identity);

        var props = { contents: contents, currency: currency };
        if (contents.length) props.content_type = "product";
        if (typeof data.value === "number" && data.value >= 0) {
          props.value = data.value;
        }
        ttq.track(event, props, { event_id: opts.eventId });

        if (!opts.server) return;
        // The relay sums value from contents and reads currency per item.
        fetch(RELAY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: event,
            event_id: opts.eventId,
            event_time: eventTime,
            context: {
              page: { url: pageUrl },
              user_agent: navigator.userAgent,
            },
            user: {
              email: hashed.email || undefined,
              phone: hashed.phone || undefined,
              ttp: getCookie("_ttp"),
            },
            contents: contents.map(function (c) {
              return {
                content_id: String(c.content_id),
                content_name: c.content_name || "",
                price: Number(c.price) || 0,
                quantity: Number(c.quantity) || 1,
                currency: currency,
              };
            }),
          }),
          keepalive: true,
        }).catch(function () {});
      })
      .catch(function (e) {
        console.error("[TikTok]", event, e);
      });
  };

  window.rbTikTok = { track: track };
})();

/* ===================== 5. Save basket and user data ===================== */

(function () {
  var LS_KEY = "user_purchase_info";
  var TCART_KEY = "tcart";
  /** Основна корзина сайту (суфікс form…). */
  var MAIN_CART_FORM_NUMID = "665507684";
  /** Допродаж: сторінка з фрагментом у pathname; UTM ігноруються. */
  var UPSELL_PAGE_PATH_SNIPPETS = ["/thanks", "/thx-claude"];
  /** Форма окремої корзини допродажу (суфікс id="form…"). */
  var UPSELL_CART_FORM_NUMID = "2235408313";

  /* ===== UTILS ===== */
  function safeParse(s) {
    try {
      return JSON.parse(s);
    } catch (e) {
      return null;
    }
  }
  function deepClone(o) {
    if (!o || typeof o !== "object") return null;
    try {
      return JSON.parse(JSON.stringify(o));
    } catch (e) {
      return null;
    }
  }
  function shallowExtend(target, src) {
    if (!target) target = {};
    if (src) {
      for (var k in src) {
        if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
      }
    }
    return target;
  }
  function escName(name) {
    return String(name || "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');
  }

  /* ===== STORAGE ===== */
  function readBundle() {
    var raw = safeParse(localStorage.getItem(LS_KEY));
    return raw && typeof raw === "object" ? raw : {};
  }
  function readTcart() {
    return safeParse(localStorage.getItem(TCART_KEY));
  }
  function notifyUpdated() {
    try {
      document.dispatchEvent(new CustomEvent("upi:user_purchase_updated"));
    } catch (e) {}
  }
  //   временная функция для тех у кого уже сохранено в локальном хранилище способ оплаты (добавлено 22.05.26)
  function migrateRemovePaymentOption() {
    try {
      var b = readBundle();
      if (b.user_info && "payment_option" in b.user_info) {
        delete b.user_info.payment_option;
        localStorage.setItem(LS_KEY, JSON.stringify(b));
      }
    } catch (e) {}
  }

  /* ===== TRANSACTION ID =====
     Беремо з dataLayer останній покупковий ID.
     Формат від нашого GTM: "123456:0123456789".
     Фолбек — tcart.orderid. */
  function getGtmTransactionId() {
    try {
      var dl = window.dataLayer || [];
      for (var i = dl.length - 1; i >= 0; i--) {
        var x = dl[i];
        if (!x || typeof x !== "object") continue;
        var eco = x.ecommerce;
        var id =
          (eco &&
            eco.purchase &&
            eco.purchase.actionField &&
            eco.purchase.actionField.id) ||
          (eco && eco.transaction_id) ||
          (eco && eco.transactionId) ||
          x.transaction_id ||
          x.transactionId;
        if (
          String(x.event || "").toLowerCase() === "purchase" &&
          eco &&
          eco.transaction_id
        ) {
          id = eco.transaction_id;
        }
        if (id) return String(id);
      }
    } catch (e) {}
    return "";
  }
  function buildOrderMeta(tcart) {
    var txFull =
      getGtmTransactionId() ||
      (tcart && tcart.orderid ? String(tcart.orderid) : "");
    var orderIdVisible = "";
    if (txFull) {
      var parts = txFull.split("-");
      orderIdVisible = parts.length > 1 ? parts[1] : parts[0];
    }
    return { transaction_id: txFull, order_id_visible: orderIdVisible };
  }

  /* ===== DOM ENRICHMENT =====
     tcart не містить img/url, тому докручуємо їх з відкритої корзини
     на момент aftersuccess: знаходимо рядок за SKU (в назві в [sku:…]). */
  function extractSkuFromTitle(text) {
    if (!text || typeof text !== "string") return "";
    var m = text.match(/\[sku:\s*([^\]]+)\]/i);
    return m && m[1] ? String(m[1]).trim() : "";
  }
  function parseBgImageUrl(style) {
    if (!style || typeof style !== "string") return "";
    var m = style.match(/background-image\s*:\s*url\s*\(\s*['"]?([^'")]+)/i);
    return m && m[1]
      ? String(m[1])
          .replace(/^['"]|['"]$/g, "")
          .trim()
      : "";
  }
  function extractRecid(href) {
    if (!href || typeof href !== "string") return "";
    var m = href.match(/#rec(\d+)/i) || href.match(/[?&#]rec[=:/]?(\d+)/i);
    return m && m[1] ? m[1] : "";
  }
  function collectMainCartDomRows() {
    var box = document.querySelector(".t706__cartwin-products");
    if (!box) return [];
    var nodes = box.querySelectorAll(".t706__product");
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var row = nodes[i];
      var a = row.querySelector(".t706__product-title a[href]");
      var imgEl = row.querySelector(".t706__product-imgdiv");
      var href = a ? (a.getAttribute("href") || "").trim() : "";
      var title = a ? String(a.textContent || "").trim() : "";
      var img = "";
      if (imgEl) {
        img = parseBgImageUrl(imgEl.getAttribute("style") || "");
        if (!img) img = (imgEl.getAttribute("data-original") || "").trim();
      }
      out.push({
        url: href,
        img: img,
        title: title,
        sku: extractSkuFromTitle(title),
      });
    }
    return out;
  }
  function mergeRow(product, dom) {
    if (!product) return product;
    var p = deepClone(product) || product;
    if (!dom) return p;
    if (dom.img) p.img = dom.img;
    if (dom.url) {
      p.url = dom.url;
      var rid = extractRecid(dom.url);
      if (rid) p.recid = rid;
    }
    if (dom.title && !p.name) p.name = dom.title;
    return p;
  }
  function enrichProductsInfo(productsInfo) {
    if (
      !productsInfo ||
      !productsInfo.products ||
      !productsInfo.products.length
    )
      return productsInfo;
    var rows = collectMainCartDomRows();
    if (!rows.length) return productsInfo;
    var merged = deepClone(productsInfo);
    if (!merged || !merged.products) return productsInfo;
    var used = {};
    for (var i = 0; i < merged.products.length; i++) {
      var p = merged.products[i];
      var sku = extractSkuFromTitle(p.name);
      var idx = -1;
      if (sku) {
        for (var j = 0; j < rows.length; j++) {
          if (!used[j] && rows[j].sku === sku) {
            idx = j;
            break;
          }
        }
      }
      if (idx < 0) {
        for (var k = 0; k < rows.length; k++) {
          if (!used[k]) {
            idx = k;
            break;
          }
        }
      }
      if (idx >= 0) {
        used[idx] = true;
        merged.products[i] = mergeRow(p, rows[idx]);
      }
    }
    return merged;
  }

  /* ===== FORM READ ===== */
  function getField(form, name) {
    var sel = '[name="' + escName(name) + '"]';
    var els = form.querySelectorAll(sel);
    if (!els.length) return "";
    var el = els[0];
    if (el.type === "radio") {
      var c = form.querySelector(sel + ":checked");
      return c ? (c.value || "").trim() : "";
    }
    if (el.type === "checkbox") {
      var out = [];
      var boxes = form.querySelectorAll(sel + ":checked");
      for (var i = 0; i < boxes.length; i++) out.push(boxes[i].value);
      return out.join(", ");
    }
    return (el.value || "").trim();
  }
  function buildUserInfo(form) {
    if (!form) return null;
    var callOpt = getField(form, "CallOption");
    var cityEl = form.querySelector('[name="city"]');
    var addrEl = form.querySelector('[name="address"]');
    return {
      name: getField(form, "name"),
      surname: getField(form, "surname"),
      city: getField(form, "city"),
      city_ref: cityEl ? cityEl.getAttribute("data-ref") || "" : "",
      post_office: getField(form, "address"),
      post_office_ref: addrEl ? addrEl.getAttribute("data-ref") || "" : "",
      email: getField(form, "Email"),
      phone: getField(form, "phone"),
      call_user: callOpt.indexOf("Передзвоніть") !== -1,
    };
  }

  /* ===== PERSIST =====
     Запис відбувається лише після завершеного замовлення основної корзини. */
  function saveOrder(userInfo, productsInfo, orderMeta) {
    var prev = readBundle();
    var hasLines =
      productsInfo && productsInfo.products && productsInfo.products.length > 0;

    var next = {
      user_info: shallowExtend(
        shallowExtend({}, prev.user_info || {}),
        userInfo || {},
      ),
      last_purchase: deepClone(prev.last_purchase) || null,
    };

    if (hasLines) {
      next.last_purchase = {
        savedAt: new Date().getTime(),
        products_info: productsInfo,
        transaction_id: (orderMeta && orderMeta.transaction_id) || "",
        order_id_visible: (orderMeta && orderMeta.order_id_visible) || "",
      };
      next.products_info = deepClone(productsInfo);
    } else if (next.last_purchase && orderMeta) {
      next.last_purchase.transaction_id =
        orderMeta.transaction_id || next.last_purchase.transaction_id || "";
      next.last_purchase.order_id_visible =
        orderMeta.order_id_visible || next.last_purchase.order_id_visible || "";
    }

    localStorage.setItem(LS_KEY, JSON.stringify(next));
    notifyUpdated();
  }

  function isMainForm(form) {
    if (!form || form.tagName !== "FORM") return false;
    if (form.id === "form" + MAIN_CART_FORM_NUMID) return true;
    return false;
  }
  function mainForm() {
    return document.getElementById("form" + MAIN_CART_FORM_NUMID);
  }
  function resolveForm(e, jqData) {
    var d = e && e.detail && typeof e.detail === "object" ? e.detail : {};
    if (jqData && typeof jqData === "object")
      d = shallowExtend(shallowExtend({}, d), jqData);
    var fid = d.formId || d.formid || d.id || "";
    if (fid) {
      var byId = document.getElementById(
        "form" + String(fid).replace(/^form/i, ""),
      );
      if (byId) return byId;
    }
    if (e && e.target && e.target.closest) {
      var f = e.target.closest("form");
      if (f) return f;
    }
    return mainForm();
  }

  function pathnameLc() {
    try {
      return String(location.pathname || "").toLowerCase();
    } catch (e) {
      return "";
    }
  }
  function isThanksUpsellPage() {
    var p = pathnameLc();
    for (var i = 0; i < UPSELL_PAGE_PATH_SNIPPETS.length; i++) {
      var frag = String(UPSELL_PAGE_PATH_SNIPPETS[i] || "").toLowerCase();
      if (frag && p.indexOf(frag) !== -1) return true;
    }
    return false;
  }
  function isUpsellCartForm(form) {
    if (!form || form.tagName !== "FORM") return false;
    return form.id === "form" + UPSELL_CART_FORM_NUMID;
  }

  var _lastUpsellMergeAt = 0;
  var _lastUpsellMergeSig = "";

  /** Для допродажу — лише поточний tcart (останнє допзамовлення), без підмішування старих рядків. */
  function snapshotUpsellCartOnly() {
    var tc = deepClone(readTcart());
    if (!tc || !tc.products || !tc.products.length) return null;
    return enrichProductsInfo(tc);
  }

  function fingerprintProducts(products) {
    if (!products || !products.length) return "";
    var chunks = [];
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      chunks.push(
        String(p.name || "") +
          "|" +
          String(p.quantity != null ? p.quantity : 1) +
          "|" +
          String(p.amount != null ? p.amount : "") +
          "|" +
          String(p.price != null ? p.price : ""),
      );
    }
    return chunks.join("#");
  }

  /** Обʼєднати два products_info (рядики з addon додаються в хвіст), перерахувати суми та total. */
  function mergeUpsellIntoBase(basePi, addonPi) {
    var merged = deepClone(basePi);
    if (!merged) merged = {};
    var list =
      merged.products && merged.products.length
        ? deepClone(merged.products)
        : [];
    var add = addonPi && addonPi.products ? addonPi.products : [];
    for (var i = 0; i < add.length; i++) {
      var row = deepClone(add[i]);
      if (row) list.push(row);
    }
    merged.products = list;

    var t = 0;
    var j;
    for (j = 0; j < list.length; j++) {
      var pr = list[j];
      var q = pr.quantity != null ? Number(pr.quantity) : 1;
      if (isNaN(q) || q < 1) q = 1;
      var lineAmt = pr.amount != null ? Number(pr.amount) : NaN;
      if (isNaN(lineAmt)) lineAmt = pr.price != null ? Number(pr.price) * q : 0;
      if (isNaN(lineAmt)) lineAmt = 0;
      t += lineAmt;
    }
    merged.prodamount = t;
    merged.amount = t;
    merged.total = list.length;
    merged.updated = Math.floor(Date.now() / 1000);

    if (addonPi) {
      if (addonPi.currency) merged.currency = addonPi.currency;
      if (addonPi.currency_txt) merged.currency_txt = addonPi.currency_txt;
      if (addonPi.currency_txt_r)
        merged.currency_txt_r = addonPi.currency_txt_r;
      if (addonPi.currency_txt_l)
        merged.currency_txt_l = addonPi.currency_txt_l;
      if (addonPi.currency_sep) merged.currency_sep = addonPi.currency_sep;
      if (addonPi.currency_dec != null)
        merged.currency_dec = addonPi.currency_dec;
      if (addonPi.currency_side) merged.currency_side = addonPi.currency_side;
      if (!merged.settings && addonPi.settings)
        merged.settings = addonPi.settings;
    }

    return merged;
  }

  /**
   * Після успішного оформлення допродажу на pathname з /thanks.
   * user_info, savedAt, transaction_id / order_id_visible не змінюються.
   */
  function flushUpsellAppend() {
    var addon = snapshotUpsellCartOnly();
    if (!addon || !addon.products || !addon.products.length) return;

    var sig = fingerprintProducts(addon.products);
    var now = Date.now();
    if (sig && sig === _lastUpsellMergeSig && now - _lastUpsellMergeAt < 1200) {
      return;
    }
    _lastUpsellMergeSig = sig || String(now);
    _lastUpsellMergeAt = now;

    var prev = readBundle();
    var basePi = null;
    if (prev.last_purchase && prev.last_purchase.products_info) {
      basePi = deepClone(prev.last_purchase.products_info);
    } else if (prev.products_info) {
      basePi = deepClone(prev.products_info);
    }

    var mergedPi = mergeUpsellIntoBase(basePi || { products: [] }, addon);
    if (!mergedPi || !mergedPi.products || !mergedPi.products.length) return;

    var lpPrev = prev.last_purchase || {};
    var savedAtKeep =
      lpPrev.savedAt != null ? lpPrev.savedAt : new Date().getTime();

    var next = {
      user_info: shallowExtend({}, prev.user_info || {}),
      last_purchase: {
        savedAt: savedAtKeep,
        products_info: mergedPi,
        transaction_id:
          lpPrev.transaction_id != null ? String(lpPrev.transaction_id) : "",
        order_id_visible:
          lpPrev.order_id_visible != null
            ? String(lpPrev.order_id_visible)
            : "",
      },
      products_info: deepClone(mergedPi),
    };

    localStorage.setItem(LS_KEY, JSON.stringify(next));
    notifyUpdated();
  }

  function flushUpsellAppendChain() {
    flushUpsellAppend();
    setTimeout(flushUpsellAppend, 0);
    setTimeout(flushUpsellAppend, 150);
  }

  /** Знімок корзини для products_info: спочатку tcart, інакше попередній запис (Tilda часто очищує tcart до/в момент колбека). */
  function snapshotProductsInfo() {
    var pi = deepClone(readTcart());
    if (pi && pi.products && pi.products.length > 0)
      return enrichProductsInfo(pi);
    var prev = readBundle();
    if (prev.last_purchase && prev.last_purchase.products_info) {
      pi = deepClone(prev.last_purchase.products_info);
      if (pi && pi.products && pi.products.length > 0)
        return enrichProductsInfo(pi);
    }
    if (prev.products_info) {
      pi = deepClone(prev.products_info);
      if (pi && pi.products && pi.products.length > 0)
        return enrichProductsInfo(pi);
    }
    return null;
  }

  /** dataLayer / orderid у tcart зʼявляються після відправки форми — дописуємо ID кількома затримками. */
  function scheduleTransactionIdPatches() {
    var delays = [50, 250, 900, 2800];
    for (var k = 0; k < delays.length; k++) {
      (function (ms) {
        setTimeout(function () {
          try {
            var b = readBundle();
            var lp = b.last_purchase;
            if (!lp) return;
            var tc = readTcart();
            var meta = buildOrderMeta(tc);
            var tx = meta.transaction_id ? String(meta.transaction_id) : "";
            if (!tx) return;
            var vis = meta.order_id_visible
              ? String(meta.order_id_visible)
              : "";
            var needTx = tx !== String(lp.transaction_id || "");
            var needVis =
              !String(lp.order_id_visible || "") &&
              !!(vis || tx.indexOf("-") >= 0);
            if (!needTx && !needVis) return;
            lp.transaction_id = tx;
            if (vis) lp.order_id_visible = vis;
            else if (
              !String(lp.order_id_visible || "") &&
              tx.indexOf("-") >= 0
            ) {
              var p = tx.split("-");
              lp.order_id_visible = p.length > 1 ? p[1] : p[0];
            }
            b.last_purchase = lp;
            localStorage.setItem(LS_KEY, JSON.stringify(b));
            notifyUpdated();
          } catch (err) {}
        }, ms);
      })(delays[k]);
    }
  }

  /** Один цикл збереження: user_info + знімок корзини + мета замовлення (з dataLayer / tcart.orderid). */
  function flushOrderToStorage(form) {
    var userInfo = buildUserInfo(form);
    if (!userInfo) return;
    var tc = readTcart();
    var pi = snapshotProductsInfo();
    saveOrder(userInfo, pi, buildOrderMeta(tc));
  }

  function onAfterSuccess(form) {
    if (!form) return;

    if (isUpsellCartForm(form)) {
      if (isThanksUpsellPage()) {
        flushUpsellAppendChain();
      }
      return;
    }

    if (!isMainForm(form)) {
      return;
    }

    flushOrderToStorage(form);
    setTimeout(function () {
      flushOrderToStorage(form);
    }, 0);
    setTimeout(function () {
      flushOrderToStorage(form);
    }, 150);
    scheduleTransactionIdPatches();
  }

  /* ===== WIRING ===== */
  function bindJq() {
    if (typeof window.jQuery === "undefined") return;
    window
      .jQuery(document)
      .on(
        "tildaform:aftersuccess tildaform:afterpaymentsuccess",
        function (_e, data) {
          onAfterSuccess(resolveForm({ detail: data || {} }, data));
        },
      );
  }
  function init() {
    // migrateRemovePaymentOption(); // добавлено временно для пользователй у которых сохранена оплата (22.05.2026)
    bindJq();
    document.addEventListener("tildaform:aftersuccess", function (e) {
      onAfterSuccess(resolveForm(e));
    });
    document.addEventListener("tildaform:afterpaymentsuccess", function (e) {
      onAfterSuccess(resolveForm(e));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ===================== 6. Visited pages -> webhook (product remarketing) ===================== */
/* Accumulates the pages a visitor viewed into a cookie, and pushes that list
   into a hidden `visited_pages` field on the cart forms so it rides along in
   the Tilda webhook. The backend matches it against product_mailing_rules:
   viewed a product page but didn't buy -> added to a SendPulse book. */
(function () {
  try {
    var COOKIE = "rb_vp";
    var FIELD = "visited_pages";
    var MAX_PAGES = 50; // keep the cookie small
    var TTL_DAYS = 30; // rolling window, matches remarketing intent
    // Main cart + thank-you-page upsell cart (see section 5).
    var CART_FORM_IDS = ["form665507684", "form2235408313"];

    function readCookie() {
      var m = document.cookie.match(/(?:^|;\s*)rb_vp=([^;]*)/);
      if (!m) return [];
      try {
        return decodeURIComponent(m[1]).split("|").filter(Boolean);
      } catch (e) {
        return [];
      }
    }
    function writeCookie(list) {
      var d = new Date();
      d.setDate(d.getDate() + TTL_DAYS);
      document.cookie =
        COOKIE +
        "=" +
        encodeURIComponent(list.join("|")) +
        ";path=/;expires=" +
        d.toUTCString() +
        ";SameSite=Lax";
    }
    function currentPage() {
      var host = "";
      var path = "";
      try {
        host = location.host || "";
      } catch (e) {}
      try {
        path = (location.pathname || "").replace(/\/+$/, "");
      } catch (e) {}
      return (host + path).toLowerCase();
    }

    // 1) Record the current page (deduped, capped). Runs on every page load.
    var page = currentPage();
    if (page) {
      var pages = readCookie();
      if (pages.indexOf(page) === -1) {
        pages.push(page);
        while (pages.length > MAX_PAGES) pages.shift();
        writeCookie(pages);
      }
    }

    // 2) Keep the hidden field on the cart forms in sync with the cookie, so
    //    Tilda serializes it into the webhook when the form is submitted.
    function ensureField() {
      var value = readCookie().join("|");
      for (var i = 0; i < CART_FORM_IDS.length; i++) {
        var f = document.getElementById(CART_FORM_IDS[i]);
        if (!f) continue;
        var input = f.querySelector('input[name="' + FIELD + '"]');
        if (!input) {
          input = document.createElement("input");
          input.type = "hidden";
          input.name = FIELD;
          f.appendChild(input);
        }
        input.value = value;
      }
    }

    function start() {
      ensureField();
      // The cart form markup is (re)rendered when the cart opens; refresh then.
      try {
        var mo = new MutationObserver(function () {
          ensureField();
        });
        mo.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
        });
      } catch (e) {}
      // Safety net for any dynamic re-render the observer misses.
      setInterval(ensureField, 1000);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  } catch (e) {}
})();

/* ===================== 7. Cart product links -> webhook (order email) ===================== */
/* Tilda's order webhook carries a product's name, image, price and quantity,
   but not its page URL — that only exists on `window.tcart.products[].url` in
   the browser. The order-confirmation email is sent server-side from that
   webhook (adblockers used to eat the /thanks fetch), so the missing links are
   pushed into a hidden `cart_products` field on the cart forms, exactly like
   `visited_pages` above. Backend: tilda-orders/src/order-email. */
(function () {
  try {
    var FIELD = "cart_products";
    // Main cart + thank-you-page upsell cart (see section 6).
    var CART_FORM_IDS = ["form665507684", "form2235408313"];

    function utmFrom(url) {
      if (!url) return "";
      var m = String(url).match(/[?&]utm_source=([^&#]+)/);
      return m ? m[1] : "";
    }

    /* Only what the webhook lacks — name/img/price all come from Tilda itself,
       so there is no point paying for them twice in a hidden field. */
    function buildPayload() {
      var cart = window.tcart;
      if (!cart || !cart.products || !cart.products.length) return "";
      var pageUtm = utmFrom(window.location.href);
      var items = [];
      for (var i = 0; i < cart.products.length; i++) {
        var p = cart.products[i] || {};
        items.push({
          id: p.sku || p.uid || "",
          link: p.url || "",
          utm: utmFrom(p.url) || pageUtm,
        });
      }
      try {
        return JSON.stringify(items);
      } catch (e) {
        return "";
      }
    }

    function ensureField() {
      var value = buildPayload();
      if (!value) return;
      for (var i = 0; i < CART_FORM_IDS.length; i++) {
        var f = document.getElementById(CART_FORM_IDS[i]);
        if (!f) continue;
        var input = f.querySelector('input[name="' + FIELD + '"]');
        if (!input) {
          input = document.createElement("input");
          input.type = "hidden";
          input.name = FIELD;
          f.appendChild(input);
        }
        input.value = value;
      }
    }

    function start() {
      ensureField();
      try {
        var mo = new MutationObserver(function () {
          ensureField();
        });
        mo.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
        });
      } catch (e) {}
      // The cart contents can change without a class flip; same safety net as
      // section 6.
      setInterval(ensureField, 1000);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  } catch (e) {}
})();

/* ===================== 9. Paid-only purchase events ===================== */
/* Tilda announces a purchase the moment the cart form is submitted — before the
   redirect to the payment page. GTM turns that announcement into the GA4
   purchase and the Google Ads conversions, so every abandoned or declined
   online payment was counted as a sale: 22% of GA4 purchases in September 2026
   had no order behind them.

   For online payment this section holds the announcement back and replays it,
   unchanged, once the backend confirms the paid order arrived (Tilda only
   delivers such an order to tilda-orders after payment). Cash-on-delivery
   orders are not touched: they always become orders, and they fire at submit
   exactly as before.

   Everything here fails open. If the hold cannot be set up, the payment method
   cannot be read or the held event cannot be stored, Tilda's announcement goes
   through at submit as it always did — a missed hold costs accuracy, a wrong
   one would cost a real purchase.

   Section 3 uses `window.rbPaidGate` to put the Meta Purchase behind the same
   confirmation. Backend: tilda-orders/src/order-status. */
(function () {
  try {
    var STATUS_URL =
      "https://payment-handler.site/api/tilda-orders/order-status";
    var HELD_KEY = "rb_held_purchase";
    // What the held announcement is called in dataLayer meanwhile. It keeps its
    // `ecommerce` payload — section 3 reads the order id from there — but no
    // GTM trigger listens for this name.
    var HELD_EVENT = "rb_purchase_submitted";
    // An unpaid WayForPay invoice expires well inside a day.
    var TTL_MS = 24 * 60 * 60 * 1000;
    // Seconds between checks while a thank-you page is open: 15 checks over
    // five minutes. 96% of paid orders reach the backend within 5 s of the
    // customer landing here, 98% within two minutes.
    var THANKS_SCHEDULE = [0, 2, 2, 2, 4, 5, 5, 10, 15, 15, 30, 30, 60, 60, 60];
    // This many failed checks with no answer at all means the backend cannot be
    // reached from this browser (adblock, outage).
    var UNREACHABLE_AFTER = 3;

    function isThanksPage() {
      var href = window.location.href;
      return href.indexOf("thanks") > -1 || href.indexOf("thx-claude") > -1;
    }

    function isExpired(ts) {
      return typeof ts === "number" && Date.now() - ts > TTL_MS;
    }

    /* Tilda's stat id is `T202609-1374965894`; the order itself is the digits. */
    function bareOrderId(raw) {
      var id = String(raw || "")
        .trim()
        .replace(/^T\d+-/i, "");
      return /^\d{6,12}$/.test(id) ? id : "";
    }

    /* One question to the backend: "paid", "unpaid" or "error". */
    function ask(id, cb) {
      var settled = false;
      var finish = function (answer) {
        if (settled) return;
        settled = true;
        cb(answer);
      };
      try {
        var ctl =
          typeof AbortController === "function" ? new AbortController() : null;
        var timer = setTimeout(function () {
          if (ctl) ctl.abort();
          finish("error");
        }, 8000);
        fetch(STATUS_URL + "?id=" + encodeURIComponent(id), {
          credentials: "omit",
          cache: "no-store",
          signal: ctl ? ctl.signal : undefined,
        })
          .then(function (r) {
            return r.ok ? r.json() : null;
          })
          .then(function (j) {
            clearTimeout(timer);
            if (!j || j.ok !== true) return finish("error");
            finish(j.exists ? "paid" : "unpaid");
          })
          .catch(function () {
            clearTimeout(timer);
            finish("error");
          });
      } catch (e) {
        finish("error");
      }
    }

    /* Calls `onPaid` once the order is confirmed, and otherwise never.

       On a thank-you page it keeps asking for five minutes; anywhere else it
       asks once, which is how a customer who paid but came back to another
       page still gets counted.

       Two cases cannot be verified, and on a thank-you page both let the
       purchase through, because that is what happened before this section
       existed: an order id that is not an order id, and a backend that never
       answered. A backend that did answer "unpaid" is never overridden. */
    // One poll per order, however many callers wait on it — the GTM release
    // below and the Meta Purchase in section 3 ask about the same order.
    var polls = {};

    function whenPaid(rawId, onPaid) {
      var onThanks = isThanksPage();
      var id = bareOrderId(rawId);
      if (!id) {
        if (onThanks) onPaid("unverifiable");
        return;
      }
      if (polls[id]) {
        polls[id].push(onPaid);
        return;
      }

      var waiting = (polls[id] = [onPaid]);
      var settle = function (how) {
        delete polls[id];
        for (var i = 0; i < waiting.length; i++) {
          try {
            waiting[i](how);
          } catch (e) {}
        }
      };

      var schedule = onThanks ? THANKS_SCHEDULE : [0];
      var attempt = 0;
      var errors = 0;
      var step = function () {
        ask(id, function (answer) {
          if (answer === "paid") return settle("paid");
          if (answer === "error") errors++;
          attempt++;
          if (onThanks && errors === attempt && errors >= UNREACHABLE_AFTER) {
            return settle("unverified");
          }
          if (attempt < schedule.length) {
            setTimeout(step, schedule[attempt] * 1000);
          } else {
            delete polls[id];
          }
        });
      };
      setTimeout(step, schedule[0] * 1000);
    }

    window.rbPaidGate = { whenPaid: whenPaid, isExpired: isExpired };

    /* ---------- hold: Tilda's announcement at submit ---------- */

    function paysOnline() {
      var el =
        document.querySelector('.t706 input[name="paymentsystem"]:checked') ||
        document.querySelector('input[name="paymentsystem"]:checked');
      var value = el && el.value ? String(el.value).toLowerCase() : "";
      return value !== "" && value !== "cash";
    }

    /* The condition under which Tilda.sendEventToStatistics builds the
       `purchase` push (tilda-events-1.0), plus ours: paid online. */
    function shouldHold(page, price) {
      return (
        parseFloat(price) > 0 &&
        typeof page === "string" &&
        page.indexOf("/tilda/") > -1 &&
        page.indexOf("/payment/") > -1 &&
        !!window.tildaForm &&
        window.tildaForm.orderIdForStat > "" &&
        paysOnline()
      );
    }

    function storeHeld(push) {
      try {
        var id = push.ecommerce.purchase.actionField.id;
        if (!bareOrderId(id)) return false;
        localStorage.setItem(
          HELD_KEY,
          JSON.stringify({ id: String(id), ts: Date.now(), push: push }),
        );
        return true;
      } catch (e) {
        return false;
      }
    }

    /* Tilda pushes with `window.dataLayer.push(...)`, looked up at call time,
       so for the length of one synchronous call the pushes can be collected in
       a stand-in array and forwarded afterwards — with the purchase renamed.
       That avoids competing with GTM over `dataLayer.push`, which GTM replaces
       with its own function whenever it loads. */
    function wrap(original) {
      var wrapped = function (page, title, product, price) {
        var hold = false;
        try {
          hold = shouldHold(page, price);
        } catch (e) {}
        if (!hold) return original.apply(this, arguments);

        var real = window.dataLayer;
        var collected = [];
        window.dataLayer = collected;
        try {
          return original.apply(this, arguments);
        } finally {
          window.dataLayer = real || [];
          for (var i = 0; i < collected.length; i++) {
            var item = collected[i];
            var isPurchase =
              item &&
              item.event === "purchase" &&
              item.ecommerce &&
              item.ecommerce.purchase;
            if (isPurchase && storeHeld(item)) {
              var renamed = {};
              for (var k in item) {
                if (Object.prototype.hasOwnProperty.call(item, k)) {
                  renamed[k] = item[k];
                }
              }
              renamed.event = HELD_EVENT;
              window.dataLayer.push(renamed);
            } else {
              window.dataLayer.push(item);
            }
          }
        }
      };
      wrapped.__rbPaidGate = true;
      return wrapped;
    }

    /* tilda-events may load before or after this file, and assigns
       `Tilda.sendEventToStatistics = function…` either way. An accessor on the
       shared `window.Tilda` object wraps whatever is assigned, whenever. */
    function installHold() {
      var tilda = (window.Tilda = window.Tilda || {});
      var current = tilda.sendEventToStatistics;
      if (typeof current === "function" && current.__rbPaidGate) return;
      var active = typeof current === "function" ? wrap(current) : current;
      try {
        Object.defineProperty(tilda, "sendEventToStatistics", {
          configurable: true,
          enumerable: true,
          get: function () {
            return active;
          },
          set: function (fn) {
            active =
              typeof fn === "function" && !fn.__rbPaidGate ? wrap(fn) : fn;
          },
        });
      } catch (e) {
        if (typeof current === "function") {
          tilda.sendEventToStatistics = wrap(current);
        }
      }
    }

    /* ---------- release: once the order is confirmed ---------- */

    function readHeld() {
      try {
        var held = JSON.parse(localStorage.getItem(HELD_KEY) || "null");
        return held && held.id && held.push ? held : null;
      } catch (e) {
        return null;
      }
    }

    function releaseHeld() {
      var held = readHeld();
      if (!held) return;
      if (isExpired(held.ts)) {
        localStorage.removeItem(HELD_KEY);
        return;
      }
      whenPaid(held.id, function () {
        // Another tab may have released it while this one was asking.
        var now = readHeld();
        if (!now || now.id !== held.id) return;
        localStorage.removeItem(HELD_KEY);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(now.push);
      });
    }

    installHold();

    var onReady = function () {
      // In case something replaced the whole `window.Tilda` object meanwhile.
      installHold();
      releaseHeld();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onReady);
    } else {
      onReady();
    }
  } catch (e) {}
})();

/* ===================== 10. Bonus redemption in cart ===================== */
/* Дозволяє покупцеві списати власні бонуси просто в кошику, без дзвінка
   менеджеру — саме це досі пропонував telegram-бот.

   Знижка йде через `tcart.promocode.discountsum`, а не через ціни позицій.
   Тільда вміє абсолютну знижку сама: `tcart__calcPromocode` розмазує її по
   позиціях, рахує `prodamount_withdiscount` і кладе підсумок у `tcart.amount`,
   який і йде на оплату. Ціни товарів при цьому лишаються повними, тож
   аналітика по SKU не псується, а скрипт наборів (який переписує `p.price`
   з конфігу) нам не заважає і ми не заважаємо йому.

   Наслідок, який нам і потрібен: слот `tcart.promocode` один, тому бонуси і
   промокод взаємно виключні без жодного окремого правила.

   Бекенд: robeauty-api/services/kommo-service (`/bonus/request-code`,
   `/bonus/verify`). Сума знижки, яку бачить сервер, перераховується там
   заново — те, що лежить у `tcart`, редагується з консолі. */
(function () {
  try {
    var API = "https://payment-handler.site/kommo_service/bonus";
    var MIN_ORDER = 1500;
    var RESEND_SEC = 60;
    var LS_KEY = "robeauty_bonus_hold";

    /* Увімкнено для всіх з 22.10.2026. Вимикається на сервері
       (BONUS_REDEMPTION_ENABLED=false у kommo-service: кошик сам покаже
       «тимчасово недоступне»), а блок цілком ховається через
       `window.ROBEAUTY_BONUS_ENABLED = false` у коді сторінки Тільди. */
    function enabled() {
      return window.ROBEAUTY_BONUS_ENABLED !== false;
    }

    /* { id, amount: <грн>, code: "BONUS-<ref>", phone: <цифри номера> } або null.
       ref — випадковий, його видає сервер лише на правильний код: за
       порядковим id чужий кошик міг би послатися на чужий резерв.
       Тримаємо і в пам'яті, і в localStorage: `t_cart__applyPageSettings`
       обнуляє `tcart.promocode` на кожній ініціалізації кошика, тож знижку
       треба вміти наклеїти назад, а не поставити один раз. */
    var hold = null;
    var timer = null;
    var resendLeft = 0;
    /* Сервер тримає резерв 45 хвилин; тут на хвилину менше, щоб кошик
       ніколи не показував знижку за резервом, якого вже немає. */
    var HOLD_MS = 44 * 60 * 1000;
    /* Сума кошика нижче 1500 ₴ (або половина замало) — бонуси не діють, але
       резерв не знімаємо: покупець міг прибрати товар на мить. */
    var suspended = false;

    function num(v) {
      var n = parseFloat(String(v == null ? "" : v).replace(/\s/g, "").replace(",", "."));
      return isFinite(n) ? n : 0;
    }
    function round2(n) {
      return Math.round(n * 100) / 100;
    }

    function lsLoad() {
      try {
        var raw = localStorage.getItem(LS_KEY);
        if (!raw) return null;
        var v = JSON.parse(raw);
        // Резерви з 1.0.10 і раніше мали код BONUS-<id>, а до 1.0.14 — не
        // мали строку дії; такі просто забуваємо.
        if (!(v && v.id && v.amount > 0 && /^BONUS-[0-9A-Z]{12}$/.test(v.code))) return null;
        if (!v.expiresAt || v.expiresAt < Date.now()) return null;
        // Замовлення з цим резервом уже пішло, і Тільда очистила кошик —
        // резерв належить замовленню, у новому кошику його не показуємо.
        if (v.submitted && storedCartEmpty()) return null;
        return v;
      } catch (e) {
        return null;
      }
    }
    function storedCartEmpty() {
      try {
        var c = JSON.parse(localStorage.getItem("tcart") || "null");
        if (!c || !c.products) return true;
        for (var i = 0; i < c.products.length; i++) {
          var p = c.products[i];
          if (p && p.deleted !== "yes" && p.name) return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    function lsSave(v) {
      try {
        if (v) localStorage.setItem(LS_KEY, JSON.stringify(v));
        else localStorage.removeItem(LS_KEY);
      } catch (e) {}
    }

    function cartWin() {
      return document.querySelector(".t706__cartwin");
    }
    /* Не через offsetParent: вікно кошика `position: fixed`, а в fixed-елемента
       offsetParent завжди null — така перевірка вважала кошик закритим
       назавжди, і блок не з'являвся ніколи. Тільда показує вікно класом
       `t706__cartwin_showed`; computed display — запасний варіант. */
    function cartOpen() {
      var w = cartWin();
      if (!w) return false;
      if (w.classList && w.classList.contains("t706__cartwin_showed")) return true;
      return window.getComputedStyle(w).display !== "none";
    }
    /* Усі пошуки — всередині вікна кошика: на сторінці «дякуємо» є ще одна
       форма кошика, і document.querySelector міг би взяти її поле. */
    function inCart(selector) {
      var w = cartWin();
      return w ? w.querySelector(selector) : null;
    }
    function prodAmount() {
      var c = window.tcart;
      return c && c.prodamount ? Number(c.prodamount) : 0;
    }
    function phoneValue() {
      var w = cartWin();
      var el = w && (w.querySelector('input[name="phone"]') || w.querySelector('input[type="tel"]'));
      return el ? String(el.value || "").trim() : "";
    }

    /* Лише цифри: маска показує той самий номер то з дужками, то без. */
    function phoneDigits() {
      return phoneValue().replace(/\D/g, "");
    }

    function call(name) {
      if (typeof window[name] === "function") {
        try {
          window[name]();
        } catch (e) {}
      }
    }
    /* Та сама послідовність, що й у скрипті наборів. Саме
       `tcart__updateTotalProductsinCartObj` викликає `tcart__calcPromocode`,
       тобто застосовує знижку й перераховує `tcart.amount`. */
    function redrawCart() {
      call("tcart__updateTotalProductsinCartObj");
      call("tcart__saveLocalObj");
      call("tcart__reDrawProducts");
      call("tcart__reDrawTotal");
      call("tcart__reDrawCartIcon");
    }

    /* Тільда не приймає незнайомий промокод — її сервер викидає його і
       рахує суму заново з цін товарів. Ціни товарів він бере з браузера
       (так працюють ціни наборів), тож бонус потрапляє в замовлення як
       знижені ціни позицій у момент оформлення (див. checkoutHook).

       Розкладаємо цілими гривнями, від найдорожчої позиції, не нижче
       1 ₴ за одиницю. Позиції на вагу (portion) і подарунки по 1 ₴ не
       чіпаємо. Якщо точно розкласти не виходить (усі позиції по 2+ шт.),
       знижка буде на кілька гривень меншою — і саме її показуємо, щоб
       кошик і оплата сходились до копійки. */
    /* Товари каталогу Тільди (картки магазину) сервер Тільди при оформленні
       звіряє з каталогом за `uid`/`lid` і відхиляє замовлення з іншою ціною:
       «The price of a product … has been changed» (22–25.10.2026). Позиції з
       кнопок «#order:… [sku:…]» таких id не мають і не звіряються ніколи
       (34 345 з 34 345 за 30 днів).

       Тож знижку кладемо спершу на «#order»-позиції, а якщо її треба
       покласти на позицію каталогу — у момент оформлення відправляємо таку
       позицію так само, як «#order»: без id каталогу, з SKU в назві
       (див. asOrderLine). Позицію каталогу без SKU не чіпаємо: без нього
       замовлення в Kommo не впізнало б товар. */
    function isCatalogueLine(p) {
      return !!(p && (p.uid || p.lid || p.gen_uid));
    }
    function priceIsOurs(p) {
      if (!p) return false;
      if (/sku:/i.test(String(p.name || ""))) return true;
      return isCatalogueLine(p) && !!String(p.sku || "").trim();
    }
    /* Позиція каталогу → вигляд «#order»-позиції. Тільки в tildapayment, у
       момент оформлення, і тільки для позицій, на які лягла знижка. */
    function asOrderLine(p) {
      if (!isCatalogueLine(p) || /sku:/i.test(String(p.name || ""))) return;
      var sku = String(p.sku || "").trim();
      if (!sku) return;
      p.name = String(p.name || "") + " [sku:" + sku + "]";
      p.lid = "";
      p.gen_uid = "";
      delete p.uid;
      delete p.part_uids;
      delete p.sku;
    }
    function cuttableLines(products) {
      var out = [];
      for (var i = 0; i < (products || []).length; i++) {
        var p = products[i];
        if (!p || p.deleted === "yes" || p.portion) continue;
        if (!priceIsOurs(p)) continue;
        var q = parseInt(p.quantity, 10) || 0;
        var price = num(p.price);
        if (q <= 0 || price <= 1) continue;
        out.push({ p: p, q: q, price: price });
      }
      /* Спершу «#order»-позиції (їх не треба перетворювати), далі за сумою. */
      out.sort(function (a, b) {
        var ca = isCatalogueLine(a.p) && !/sku:/i.test(String(a.p.name || "")) ? 1 : 0;
        var cb = isCatalogueLine(b.p) && !/sku:/i.test(String(b.p.name || "")) ? 1 : 0;
        return ca - cb || b.price * b.q - a.price * a.q;
      });
      return out;
    }
    function plan(products, want) {
      var target = Math.max(0, Math.floor(want));
      var rem = target;
      var cuts = [];
      var ls = cuttableLines(products);
      var byLine = [];
      for (var i = 0; i < ls.length && rem > 0; i++) {
        var unit = Math.min(Math.floor(ls[i].price - 1), Math.floor(rem / ls[i].q));
        byLine[i] = unit > 0 ? unit : 0;
        if (unit > 0) rem -= unit * ls[i].q;
      }
      /* Залишок, менший за кількість штук (7 ₴ на 3 тонери), кладемо на ОДНУ
         штуку: при оформленні вона йде окремим рядком (див. checkoutHook).
         Інакше покупець бачив «Списано 6 ₴, залишиться 1 бонус». */
      var extraAt = -1;
      if (rem > 0) {
        for (var j = 0; j < ls.length; j++) {
          if (Math.floor(ls[j].price - 1) - (byLine[j] || 0) >= rem) {
            extraAt = j;
            break;
          }
        }
      }
      for (var k = 0; k < ls.length; k++) {
        var u = byLine[k] || 0;
        var x = k === extraAt ? rem : 0;
        if (u > 0 || x > 0) cuts.push({ p: ls[k].p, unit: u, extra: x });
      }
      if (extraAt >= 0) rem = 0;
      return { applied: target - rem, cuts: cuts };
    }
    /* Набори «1=2» і «3=1» вже за ціною одного — бонуси на них не діють.
       Список SKU тримає сервер (kommo-service, BONUS_EXCLUDED_SKUS) і віддає
       в /availability уже нормалізованим. Половину рахуємо від решти
       кошика і знижку розкладаємо тільки по ній; поріг 1500 ₴ — від усього.
       Поки список не прийшов, вважаємо порожнім: сервер однаково не дасть
       більше, ніж належить, на підтвердженні коду. */
    var excludedSkus = {};
    /* `00-0003330` і `00-00003330` — той самий товар: нулі після дефіса не рахуються. */
    function normSku(raw) {
      var s = String(raw || "").replace(/\s+/g, "").toUpperCase();
      var m = s.match(/^([A-Z0-9]+)-0*(\d+)$/);
      return m ? m[1] + "-" + m[2] : s;
    }
    /* SKU позиції: поле `sku`, а якщо порожнє — з назви («… sku:00-00003666»). */
    function lineSku(p) {
      if (p && p.sku) return String(p.sku);
      var name = String((p && p.name) || "");
      var m = name.match(/sku:\s*([A-Za-z0-9-]+)/i) || name.match(/\(((?:KU|\d{2})-\d+)\)/i);
      return m ? m[1] : "";
    }
    function isExcluded(p) {
      var sku = lineSku(p);
      return !!sku && excludedSkus[normSku(sku)] === true;
    }
    function eligibleLines(products) {
      var out = [];
      for (var i = 0; i < (products || []).length; i++) {
        if (products[i] && !isExcluded(products[i])) out.push(products[i]);
      }
      return out;
    }
    /* Позиції для сервера: він сам відкидає набори і бере половину від решти. */
    function cartItems() {
      var c = window.tcart;
      var out = [];
      var ps = (c && c.products) || [];
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        if (!p || p.deleted === "yes") continue;
        out.push({ sku: lineSku(p), amount: num(p.amount) || num(p.price) * (parseInt(p.quantity, 10) || 0) });
      }
      return out;
    }

    function productsTotal(products) {
      var t = 0;
      for (var i = 0; i < (products || []).length; i++) {
        var p = products[i];
        if (!p || p.deleted === "yes") continue;
        t += num(p.amount) || num(p.price) * (parseInt(p.quantity, 10) || 0);
      }
      return round2(t);
    }
    /* Ті самі правила, що на сервері, але від поточного кошика: від 1500 ₴ і
       не більше половини того, що не набори. Повертає, скільки реально
       спишеться, або 0. */
    function planFor(products, amount) {
      if (productsTotal(products) < MIN_ORDER) return { applied: 0, cuts: [] };
      var ok = eligibleLines(products);
      return plan(ok, Math.min(amount, Math.floor(productsTotal(ok) * 0.5)));
    }
    function wanted(products) {
      if (!hold) return 0;
      return planFor(products, hold.amount).applied;
    }

    function dropDisplayedDiscount() {
      var pc = window.tcart && window.tcart.promocode;
      if (pc && hold && pc.promocode === hold.code) {
        try {
          delete window.tcart.promocode;
        } catch (e) {
          window.tcart.promocode = undefined;
        }
        redrawCart();
      }
    }

    /* Показує знижку в кошику через `tcart.promocode` — тільки для показу:
       «Сума знижки» і «Сума до оплати» Тільда малює сама. До сервера
       Тільди цей промокод не доходить (див. checkoutHook). */
    function applyHold() {
      if (!hold || !window.tcart) return;
      var applied = wanted(window.tcart.products);
      if (applied <= 0) {
        if (!suspended) {
          suspended = true;
          dropDisplayedDiscount();
          render();
        }
        return;
      }
      suspended = false;
      hold.applied = applied;
      window.tcart.promocode = { promocode: hold.code, discountsum: applied };
      redrawCart();
      render();
    }

    /* ---------- перевірка резерву на сервері ---------- */

    /* Чи можна ще витратити цей резерв: живий і жодне замовлення його не
       забрало. Резерв зникає, коли покупець підтвердив код на іншому
       пристрої чи вкладці (новий код замінює старий) або вже оформив з ним
       замовлення. Кошик про це сам не знає — тож питаємо сервер.
       Відповідь: true / false, або null, якщо перевірити не вдалося. */
    function checkUsable(h, timeoutMs) {
      if (!h || !h.code) return Promise.resolve(false);
      var done = false;
      return new Promise(function (resolve) {
        var t = setTimeout(function () {
          if (!done) {
            done = true;
            resolve(null);
          }
        }, timeoutMs);
        post("/status", { ref: h.code })
          .then(function (res) {
            if (done) return;
            done = true;
            clearTimeout(t);
            resolve(res && res.ok ? !!res.usable : null);
          })
          .catch(function () {
            if (done) return;
            done = true;
            clearTimeout(t);
            resolve(null);
          });
      });
    }

    /* Резерв уже недійсний: прибираємо знижку, кажемо чому. На сервер нічого
       не шлемо — там його вже немає. */
    function dropStaleHold() {
      dropDisplayedDiscount();
      hold = null;
      suspended = false;
      lsSave(null);
      var f = inCart("form");
      if (f) setHiddenFields(f, null);
      view = "idle";
      setNote(
        "Бонуси вже використано або підтверджено на іншому пристрої — підтвердьте ще раз.",
        true,
      );
      render();
    }

    /* Тиха перевірка: коли кошик відкрили і коли вкладка знову на екрані. */
    var lastBackgroundCheck = 0;
    function backgroundCheck() {
      if (!hold || Date.now() - lastBackgroundCheck < 5000) return;
      lastBackgroundCheck = Date.now();
      var h = hold;
      checkUsable(h, 8000).then(function (usable) {
        if (usable === false && hold === h) dropStaleHold();
      });
    }

    /* Чи списання взагалі ввімкнене (на розпродаж його вимикають на сервері).
       Питаємо, коли кошик відкрили, не частіше ніж раз на хвилину. Вимкнене —
       показуємо «тимчасово недоступне» одразу, а не після того, як покупець
       ввів номер. Збій зв'язку вважаємо «ввімкнено»: сервер усе одно
       відповість «недоступне» на запит коду. */
    var available = true;
    var lastAvailabilityCheck = 0;
    function availabilityCheck() {
      if (Date.now() - lastAvailabilityCheck < 60000) return;
      lastAvailabilityCheck = Date.now();
      post("/availability", {})
        .then(function (res) {
          if (res && res.ok && res.excludedSkus && res.excludedSkus.length) {
            var next = {};
            for (var i = 0; i < res.excludedSkus.length; i++) next[normSku(res.excludedSkus[i])] = true;
            excludedSkus = next;
            if (hold) applyHold();
          }
          setAvailable(!(res && res.ok && res.enabled === false));
        })
        .catch(function () {});
    }
    function setAvailable(v) {
      if (v === available) return;
      available = v;
      if (!v && view === "code") view = "idle";
      if (!v) setNote("");
      render();
    }

    /* Перевірка на кнопці «Оформити». Ловимо клік (і submit — на випадок Enter)
       у фазі захоплення на document, тобто раніше за будь-які обробники
       Тільди; притримуємо, питаємо сервер і далі:
         - резерв живий → повторюємо клік, він проходить як звичайно;
         - резерв зник → не оформлюємо, прибираємо знижку, покупець бачить
           справжню суму і вирішує сам;
         - перевірити не вдалося → пропускаємо: блокувати покупку через збій
           зв'язку гірше, а такий рідкісний випадок сервер підхопить сам
           (резерв новішого коду або сповіщення менеджерам). */
    var passThroughUntil = 0;
    var checking = false;
    function interceptCheckout(e) {
      if (!hold || suspended) return;
      if (Date.now() < passThroughUntil) return;
      var t = e.target;
      var form = t && t.closest ? t.closest(".t706__orderform form") : null;
      if (!form) return;
      if (e.type === "click" && !(t.closest && t.closest(".t-submit"))) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      if (checking) return;
      checking = true;

      var btn = form.querySelector(".t-submit");
      if (btn) btn.style.opacity = "0.6";
      var h = hold;
      checkUsable(h, 4000).then(function (usable) {
        checking = false;
        if (btn) btn.style.opacity = "";
        if (usable === false) {
          if (hold === h) dropStaleHold();
          var el = inCart(".rb-redeem");
          if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }
        // Живий (або не вдалося перевірити): пропускаємо саме цей повтор.
        passThroughUntil = Date.now() + 3000;
        if (btn) btn.click();
        else if (form.requestSubmit) form.requestSubmit();
      });
    }

    /* ---------- оформлення: знижка йде в ціни позицій ---------- */

    var HIDDEN_FIELDS = ["bonus_ref", "bonus_applied"];
    function formEl(f) {
      return f && f.nodeType === 1 ? f : f && f[0] && f[0].nodeType === 1 ? f[0] : null;
    }
    function setHiddenFields(form, values) {
      for (var i = 0; i < HIDDEN_FIELDS.length; i++) {
        var name = HIDDEN_FIELDS[i];
        var el = form.querySelector('input[name="' + name + '"]');
        if (values && values[name] != null) {
          if (!el) {
            el = document.createElement("input");
            el.type = "hidden";
            el.name = name;
            form.appendChild(el);
          }
          el.value = String(values[name]);
        } else if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    }

    /* Викликається одразу після того, як Тільда зібрала
       `tildaForm.tildapayment` — копію кошика, яку вона серіалізує й шле на
       свій сервер. Міняємо саме цю копію, а не `tcart`: кошик, скрипт наборів
       і аналітика до останньої миті бачать звичайні ціни, а Тільда між збиранням
       і відправкою `tcart` більше не читає. */
    function applyToPayment(form) {
      form = formEl(form);
      if (!form) return;
      setHiddenFields(form, null);

      var tp = window.tildaForm && window.tildaForm.tildapayment;
      if (!hold || suspended || !tp || !tp.products || !tp.products.length) return;
      /* Сторож знімає прострочений резерв двічі на секунду, але вкладка у фоні
         пригальмовує таймери — тож перевіряємо ще раз у сам момент оформлення,
         щоб замовлення не пішло зі знижкою за резервом, якого вже немає. */
      if (!hold.expiresAt || hold.expiresAt < Date.now()) return;

      var prodBefore = productsTotal(tp.products);
      var pl = planFor(tp.products, hold.amount);
      if (pl.applied <= 0) return;

      // Усе, що в сумі до оплати понад товари (доставка), — до змін.
      var extra = round2(num(tp.amount) - (prodBefore - num(tp.discount)));

      for (var i = 0; i < pl.cuts.length; i++) {
        var c = pl.cuts[i];
        var p = c.p;
        var q = parseInt(p.quantity, 10) || 0;
        var base = round2(num(p.price) - c.unit);
        if (c.extra > 0 && q > 1) {
          // Одна штука з додатковою знижкою — окремим рядком того ж товару.
          var one = JSON.parse(JSON.stringify(p));
          one.quantity = 1;
          one.price = round2(base - c.extra);
          one.amount = one.price;
          asOrderLine(one);
          tp.products.splice(tp.products.indexOf(p) + 1, 0, one);
          p.quantity = q - 1;
          q = q - 1;
        } else if (c.extra > 0) {
          base = round2(base - c.extra);
        }
        p.price = base;
        p.amount = round2(base * q);
        asOrderLine(p);
      }
      var prodAfter = round2(prodBefore - pl.applied);
      tp.prodamount = prodAfter;
      tp.amount = round2(prodAfter + Math.max(0, extra));
      // Наш показовий промокод сервер Тільди однаково викине.
      delete tp.promocode;
      delete tp.discount;
      delete tp.prodamount_withdiscount;
      delete tp.amount_withoutdiscount;

      setHiddenFields(form, { bonus_ref: hold.code, bonus_applied: pl.applied });
      hold.submitted = true;
      lsSave(hold);
    }

    function markWrapped(fn) {
      fn.__rbRedeem = true;
      return fn;
    }
    function wrapPayment(orig) {
      return markWrapped(function () {
        var r = orig.apply(this, arguments);
        try {
          applyToPayment(arguments[0]);
        } catch (e) {
          if (window.console && console.warn) console.warn("[bonus] checkout", e);
        }
        return r;
      });
    }
    /* `addPaymentInfoToForm` живе в tilda-forms-payments, який Тільда
       підвантажує ліниво — його може ще не бути, коли покупець натискає
       «Оформити». Тому, якщо функції ще немає, ловимо саме присвоєння. */
    function checkoutHook() {
      var tf = window.tildaForm;
      if (!tf) return;
      /* Перевіряємо саму властивість, а не прапорець «уже встановлено»:
         якщо Тільда перестворить tildaForm або перезапише властивість,
         пастку треба поставити знову, інакше оплата піде за повною ціною. */
      var d = Object.getOwnPropertyDescriptor(tf, "addPaymentInfoToForm");
      var cur = tf.addPaymentInfoToForm;
      if (typeof cur === "function") {
        if (!cur.__rbRedeem) tf.addPaymentInfoToForm = wrapPayment(cur);
      } else if (!(d && d.get && d.get.__rbRedeem)) {
        var held = cur;
        try {
          Object.defineProperty(tf, "addPaymentInfoToForm", {
            configurable: true,
            enumerable: true,
            get: markWrapped(function () {
              return held;
            }),
            set: function (fn) {
              held = typeof fn === "function" && !fn.__rbRedeem ? wrapPayment(fn) : fn;
            },
          });
        } catch (e) {}
      }
      /* Тільда кличе clearTCart, коли замовлення прийнято. Резерв тепер
         належить замовленню — у кошику його більше не показуємо (і на
         сервері не скасовуємо). */
      var clr = tf.clearTCart;
      if (typeof clr === "function" && !clr.__rbRedeem) {
        tf.clearTCart = markWrapped(function () {
          try {
            if (hold && hold.submitted) {
              hold = null;
              lsSave(null);
              view = "idle";
              suspended = false;
              setNote("");
            }
          } catch (e) {}
          return clr.apply(this, arguments);
        });
      }
    }

    /* Повідомляє сервер, що резерв більше не потрібен — інакше бали лишались
       зарезервованими ще 45 хвилин, і повторна спроба отримувала «немає
       бонусів». keepalive — щоб запит долетів, навіть якщо вкладку
       закривають. Відповідь не чекаємо: якщо запит загубиться, новий
       підтверджений код однаково замінить старий резерв. */
    function releaseOnServer(h) {
      if (!h || !h.code) return;
      try {
        fetch(API + "/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref: h.code }),
          keepalive: true,
        }).catch(function () {});
      } catch (e) {}
    }

    function clearHold() {
      hold = null;
      suspended = false;
      lsSave(null);
      var f = inCart("form");
      if (f) setHiddenFields(f, null);
      if (window.tcart && window.tcart.promocode) {
        try {
          delete window.tcart.promocode;
        } catch (e) {
          window.tcart.promocode = undefined;
        }
        redrawCart();
      }
      render();
    }

    /* Промокод і бонуси живуть в одному слоті, тому поле промокоду при
       застосованих бонусах блокуємо — інакше Тільда просто перезапише нашу
       знижку своєю і покупець побачить не те, що очікував. */
    function syncPromoInput() {
      var input = inCart(".t-inputpromocode");
      var btn = inCart(".t-inputpromocode__btn");
      // Поки бонуси на паузі (кошик замалий), знижки немає — промокод можна.
      var lock = !!hold && !suspended;
      if (input) {
        input.disabled = lock;
        input.style.opacity = lock ? "0.5" : "";
        if (lock) input.value = "";
      }
      if (btn) {
        btn.style.pointerEvents = lock ? "none" : "";
        btn.style.opacity = lock ? "0.5" : "";
      }
    }

    function post(path, body) {
      return fetch(API + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(function (r) {
        return r.json();
      });
    }

    var REFUSAL_TEXT = {
      disabled: "Списання бонусів тимчасово недоступне.",
      bad_phone: "Перевірте номер телефону.",
      cart_too_small: "Бонуси діють від суми замовлення " + MIN_ORDER + " ₴.",
      only_excluded: "Бонуси не діють на набори «1=2» і «3=1».",
      no_bonuses: "На цьому номері немає доступних бонусів.",
      cooldown: "Новий код можна запросити за хвилину.",
      rate_limited: "Забагато спроб. Спробуйте пізніше.",
      send_failed: "Не вдалося надіслати код. Спробуйте ще раз.",
      bad_code: "Невірний код.",
      expired: "Термін дії коду закінчився — запросіть новий.",
      burned: "Забагато невірних спроб. Запросіть новий код.",
      not_found: "Спочатку запросіть код.",
    };
    function refusalText(key) {
      return REFUSAL_TEXT[key] || "Щось пішло не так. Спробуйте ще раз.";
    }

    /* ---------- інтерфейс ---------- */

    /* Префікс `rb-redeem`, не `rb-bonus`: `rb-bonus` уже зайнятий шкалою
       «До подарунка … залишилось» з іншого скрипту сайту. З тим самим
       класом ми знаходили її блок замість свого, писали в нього і
       перевизначали її стилі. Так само `data-rbr`, бо `data-rb` теж
       уже є на сторінці. */
    var STYLE_ID = "robeauty-redeem-style";
    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return;
      var s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent =
        ".rb-redeem{margin:0 0 15px;font-family:'CenturyGothic',Arial,sans-serif}" +
        ".rb-redeem *{box-sizing:border-box}" +
        ".rb-redeem__btn{display:block;width:100%;padding:14px 20px;border:1px solid #2e2e2e;" +
        "border-radius:15px;background:#fff;color:#2e2e2e;font:inherit;font-size:15px;cursor:pointer;" +
        "-webkit-appearance:none;appearance:none}" +
        ".rb-redeem__btn:disabled{opacity:.5;cursor:default}" +
        ".rb-redeem__btn--primary{background:#2e2e2e;color:#fff}" +
        ".rb-redeem__row{display:flex;gap:8px;margin-top:8px}" +
        ".rb-redeem__row .rb-redeem__btn{width:auto;flex:0 0 auto;padding:14px 18px}" +
        ".rb-redeem__input{flex:1 1 auto;min-width:0;padding:14px 20px;border:1px solid #2e2e2e;" +
        "border-radius:15px;font:inherit;font-size:15px;-webkit-appearance:none;appearance:none}" +
        /* Як примітка до промокоду («*промокоди дійсні…»): чорна, по центру,
           12px, 10px зверху — щоб тексти під полями не різнились. */
        ".rb-redeem__note{margin:10px 0 0;font-size:12px;line-height:normal;color:#000;text-align:center}" +
        ".rb-redeem__num{color:#1f8a3b;font-weight:700}" +
        ".rb-redeem__note--err{color:#d0021b}" +
        ".rb-redeem__applied{display:flex;align-items:center;justify-content:space-between;gap:10px;" +
        "padding:13px 18px;border:1px solid #2e2e2e;border-radius:15px;font-size:15px}" +
        ".rb-redeem__link{background:none;border:0;padding:0;font:inherit;font-size:13px;" +
        "color:#8c8c8c;text-decoration:underline;cursor:pointer}";
      document.head.appendChild(s);
    }

    function mount() {
      var wrap = inCart(".t-inputpromocode__wrapper");
      if (!wrap) return null;
      var el = inCart(".rb-redeem");
      if (!el) {
        ensureStyle();
        el = document.createElement("div");
        el.className = "rb-redeem";
        // Тільда перебудовує вікно кошика при кожному відкритті, тож блок тут
        // новий і порожній — забуваємо попередню розмітку, інакше перевірка
        // «html не змінився» лишила б його порожнім назавжди.
        lastHtml = null;
      }
      /* Окремим рядком форми над полем промокоду: перед його
         `.t-input-group`, а не всередині, щоб примітка «*промокоди дійсні…»
         лишалась під своїм полем, а відступи були як між полями (15px).
         Місце перевіряємо на кожному такті, а не лише при створенні:
         `t_input_promocode_init` переносить поле промокоду у форму вже
         після того, як ми вставились, і без цього блок лишався нагорі
         кошика, над товарами. Переносимо тільки коли стоїмо не там, тож
         фокус у полі коду не збивається. */
      var anchor = (wrap.closest && wrap.closest(".t-input-group")) || wrap;
      if (anchor.previousSibling !== el) {
        anchor.parentNode.insertBefore(el, anchor);
      }
      return el;
    }

    var view = "idle"; // idle | code | applied
    var lastHtml = null;
    var note = "";
    var noteErr = false;
    var busy = false;

    function setNote(text, isErr) {
      note = text || "";
      noteErr = !!isErr;
    }

    /* Підказка, коли код підтверджено, але кошик зараз не підходить: скільки
       саме додати. Сума рахується від поточного кошика, тож зменшується, поки
       покупець додає товари, і блок сам повертає знижку, щойно вистачить. */
    function pausedHint() {
      var c = window.tcart;
      var gap = Math.ceil(MIN_ORDER - productsTotal(c && c.products));
      if (gap <= 0) return "*на ці товари бонуси не діють — додайте інші товари";
      var base = "*бонуси діють від суми замовлення <strong>" + MIN_ORDER + " ₴</strong>";
      return gap > 0 ? base + " — додайте товарів ще на <strong>" + gap + " ₴</strong>" : base;
    }

    /* «Залишиться 450 бонусів, з них 120 діють до 24.10».
       Сервер віддає живі нарахування з датами згоряння, найстаріші першими;
       списання бере з найстаріших — так само, як правило згоряння. Тож
       віднімаємо знижку з початку списку, і перше, що лишилось, згорить
       найраніше. Нічого не лишилось або сервер дат не дав — рядка нема. */
    function plural(n, one, few, many) {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return one;
      if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
      return many;
    }
    function remainingNote() {
      if (!hold || !hold.credits || !hold.credits.length) return "";
      var spend = hold.applied || hold.amount || 0;
      var left = [];
      for (var i = 0; i < hold.credits.length; i++) {
        var c = hold.credits[i];
        var amt = Math.max(0, Math.floor(num(c.amount)));
        var take = Math.min(amt, spend);
        spend -= take;
        if (amt - take > 0 && c.expiresOn) left.push({ amount: amt - take, on: String(c.expiresOn) });
      }
      var total = 0;
      for (var j = 0; j < left.length; j++) total += left[j].amount;
      if (total <= 0) return "";
      var first = left[0];
      var day = first.on.slice(8, 10) + "." + first.on.slice(5, 7);
      var n = function (v) { return '<span class="rb-redeem__num">' + v + "</span>"; };
      var head = "Залишиться " + n(total) + " " + plural(total, "бонус", "бонуси", "бонусів");
      var tail = first.amount === total
        ? ", " + plural(total, "діє", "діють", "діють") + " до " + day
        : ", з них " + n(first.amount) + " " + plural(first.amount, "діє", "діють", "діють") + " до " + day;
      return '<div class="rb-redeem__note">' + head + tail + "</div>";
    }

    function render() {
      var el = mount();
      if (!el) return;
      syncPromoInput();

      var html = "";
      if (hold) {
        html =
          '<div class="rb-redeem__applied"><span>' +
          (suspended
            ? "Бонуси поки не застосовано"
            : "Списано " + (hold.applied || hold.amount) + " ₴ бонусами") +
          "</span>" +
          '<button type="button" class="rb-redeem__link" data-rbr="cancel">Скасувати</button></div>' +
          (suspended
            ? '<div class="rb-redeem__note">' + pausedHint() + "</div>"
            : remainingNote());
      } else if (!available) {
        html =
          '<button type="button" class="rb-redeem__btn" disabled>Використати бонуси</button>' +
          '<div class="rb-redeem__note">' + REFUSAL_TEXT.disabled + "</div>";
      } else if (view === "code") {
        html =
          '<div class="rb-redeem__row">' +
          '<input class="rb-redeem__input" data-rbr="code" inputmode="numeric" ' +
          'autocomplete="one-time-code" maxlength="6" placeholder="Код із повідомлення">' +
          '<button type="button" class="rb-redeem__btn rb-redeem__btn--primary" data-rbr="confirm"' +
          (busy ? " disabled" : "") +
          ">Підтвердити</button></div>" +
          '<div class="rb-redeem__note">' +
          (resendLeft > 0
            ? 'Надіслати код ще раз можна за <span data-rbr-left></span> с'
            : '<button type="button" class="rb-redeem__link" data-rbr="resend">Надіслати код ще раз</button>') +
          "</div>";
      } else {
        html =
          '<button type="button" class="rb-redeem__btn" data-rbr="send"' +
          (busy ? " disabled" : "") +
          ">" +
          (busy ? "Надсилаємо…" : "Використати бонуси") +
          "</button>" +
          '<div class="rb-redeem__note">*бонуси діють від суми замовлення <strong>' +
          MIN_ORDER +
          " ₴</strong> і покривають до <strong>50%</strong> замовлення</div>";
      }

      if (note) {
        html +=
          '<div class="rb-redeem__note' +
          (noteErr ? " rb-redeem__note--err" : "") +
          '">' +
          note +
          "</div>";
      }

      /* Сторож смикає render() двічі на секунду. Розмітку переписуємо лише
         коли вона справді змінилась — і зворотний відлік у неї навмисно не
         входить: число оновлюється окремо, нижче. Інакше блок
         перебудовувався б щосекунди протягом хвилини, саме коли покупець
         набирає код: натискання «Підтвердити», що припало на перебудову,
         губилось, а на телефоні заміна поля у фокусі ховає клавіатуру. */
      if (html !== lastHtml) {
        lastHtml = html;
        replaceHtml(el, html);
      }
      var left = el.querySelector("[data-rbr-left]");
      if (left) left.textContent = String(resendLeft);
    }

    /* Переносить введене і фокус у нову розмітку — на випадок, коли вона
       таки змінюється під покупцем (зайнятий/вільний, повідомлення). */
    function replaceHtml(el, html) {
      var prev = el.querySelector('[data-rbr="code"]');
      var typed = prev ? prev.value : null;
      var hadFocus = prev && document.activeElement === prev;

      el.innerHTML = html;

      if (typed !== null) {
        var next = el.querySelector('[data-rbr="code"]');
        if (next) {
          next.value = typed;
          if (hadFocus) {
            next.focus();
            try {
              next.setSelectionRange(typed.length, typed.length);
            } catch (e) {}
          }
        }
      }
    }

    function startResendCountdown() {
      resendLeft = RESEND_SEC;
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        resendLeft -= 1;
        if (resendLeft <= 0) {
          clearInterval(timer);
          timer = null;
          resendLeft = 0;
        }
        if (view === "code") render();
      }, 1000);
    }

    function requestCode() {
      var phone = phoneValue();
      if (!phone) {
        setNote("Спочатку введіть номер телефону.", true);
        render();
        return;
      }
      /* Нема на що покласти знижку (лише набори або лише товари каталогу) —
         не шлемо SMS даремно. */
      var cp = window.tcart && window.tcart.products;
      if (productsTotal(cp) >= MIN_ORDER && planFor(cp, Infinity).applied <= 0) {
        setNote("На ці товари бонуси не діють.", true);
        render();
        return;
      }
      busy = true;
      setNote("");
      render();

      post("/request-code", { phone: phone, cartTotal: prodAmount(), items: cartItems() })
        .then(function (res) {
          busy = false;
          if (res && res.refusal === "disabled") {
            setAvailable(false);
            render();
            return;
          }
          if (!res || !res.ok) {
            setNote(refusalText(res && res.refusal), true);
            render();
            return;
          }
          view = "code";
          setNote("Код надіслано на ваш номер.", false);
          startResendCountdown();
          render();
        })
        .catch(function () {
          busy = false;
          setNote(refusalText("send_failed"), true);
          render();
        });
    }

    function confirmCode() {
      var el = inCart('[data-rbr="code"]');
      var code = el ? String(el.value || "").replace(/\D/g, "") : "";
      if (code.length !== 6) {
        setNote("Введіть 6 цифр коду.", true);
        render();
        return;
      }
      busy = true;
      setNote("");
      render();

      post("/verify", {
        phone: phoneValue(),
        code: code,
        cartTotal: prodAmount(),
        items: cartItems(),
      })
        .then(function (res) {
          busy = false;
          if (res && res.refusal === "disabled") {
            setAvailable(false);
            render();
            return;
          }
          if (!res || !res.ok) {
            setNote(refusalText(res && res.refusal), true);
            render();
            return;
          }
          if (!res.ref) {
            setNote(refusalText(), true);
            render();
            return;
          }
          hold = {
            id: res.redemptionId,
            amount: res.amount,
            code: "BONUS-" + res.ref,
            phone: phoneDigits(),
            expiresAt: Date.now() + HOLD_MS,
            // [{ amount, expiresOn: "YYYY-MM-DD" }], найстаріші першими.
            credits: Array.isArray(res.credits) ? res.credits : null,
          };
          lsSave(hold);
          view = "applied";
          setNote("");
          applyHold();
          render();
        })
        .catch(function () {
          busy = false;
          setNote(refusalText("bad_code"), true);
          render();
        });
    }

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.getAttribute) return;
      var action = t.getAttribute("data-rbr");
      if (!action) return;
      e.preventDefault();
      if (action === "send" || action === "resend") requestCode();
      else if (action === "confirm") confirmCode();
      else if (action === "cancel") {
        releaseOnServer(hold);
        view = "idle";
        setNote("");
        clearHold();
      }
    });

    /* Сторож. Робить дві речі, і обидві потрібні саме через те, як поводиться
       кошик Тільди:
         - вставляє блок, коли кошик щойно відкрили (DOM створюється на льоту);
         - наклеює знижку назад після кожної ініціалізації кошика, бо
           `t_cart__applyPageSettings` щоразу ставить `tcart.promocode`
           в undefined.
       Якщо в слоті опинився не наш код — покупець ввів справжній промокод,
       і тоді відступаємо: знижка одна, і обрав її він. */
    var wasOpen = false;
    function guard() {
      checkoutHook();
      var open = cartOpen();
      if (open && !wasOpen) {
        backgroundCheck();
        availabilityCheck();
      }
      wasOpen = open;
      if (!open) return;
      if (hold && hold.expiresAt < Date.now()) {
        hold = null;
        lsSave(null);
        view = "idle";
        suspended = false;
        dropDisplayedDiscount();
        setNote("Час резерву минув — підтвердьте номер ще раз.", false);
      }
      render();
      if (!hold) return;

      var pc = window.tcart && window.tcart.promocode;
      if (pc && pc.promocode && pc.promocode !== hold.code) {
        releaseOnServer(hold);
        hold = null;
        lsSave(null);
        view = "idle";
        setNote("Бонуси скасовано — застосовано промокод.", false);
        render();
        return;
      }
      /* Бонуси підтверджено для конкретного номера. Якщо номер у формі
         змінили, замовлення піде на інший — і сервер усе одно не спише за
         нього бали, а знижку покупець уже бачив. Тож знімаємо одразу.
         Порожнє поле не рахуємо: Тільда очищає форму при перемальовуванні. */
      var now = phoneDigits();
      if (hold.phone && now && now !== hold.phone) {
        releaseOnServer(hold);
        hold = null;
        lsSave(null);
        view = "idle";
        if (window.tcart && window.tcart.promocode) {
          try {
            delete window.tcart.promocode;
          } catch (e) {
            window.tcart.promocode = undefined;
          }
          redrawCart();
        }
        setNote("Номер змінено — бонуси скасовано. Підтвердьте новий номер.", false);
        render();
        return;
      }

      var applied = wanted(window.tcart && window.tcart.products);
      if (applied <= 0) {
        if (!suspended) applyHold();
      } else if (suspended || !pc || pc.promocode !== hold.code || Number(pc.discountsum) !== applied) {
        applyHold();
      }
    }

    function boot() {
      if (!enabled()) return;
      hold = lsLoad();
      if (!hold) lsSave(null);
      if (hold) view = "applied";
      checkoutHook();
      document.addEventListener("click", interceptCheckout, true);
      document.addEventListener("submit", interceptCheckout, true);
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible" && cartOpen()) {
          backgroundCheck();
          availabilityCheck();
        }
      });
      setInterval(guard, 500);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  } catch (e) {
    if (window.console && console.warn) console.warn("[bonus]", e);
  }
})();
