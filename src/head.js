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

/* ===================== 2. GrowthBook config (сам auto.min.js остаётся тегом в Tilda ПОСЛЕ head.js) ===================== */

window.growthbook_config = window.growthbook_config || {};
window.growthbook_config.trackingCallback = function (experiment, result) {
  function getGaClientId() {
    var m = document.cookie.match(/_ga=GA1\.\d+\.(\d+\.\d+)/);
    if (m) return m[1];
    // no _ga yet — mint one in GA's format and save it so later events reuse it
    var cid =
      Math.floor(Math.random() * 2147483647) +
      "." +
      Math.floor(Date.now() / 1000);
    var domain = location.hostname.replace(/^www\./, "");
    document.cookie =
      "_ga=GA1.1." + cid + "; path=/; domain=." + domain + "; max-age=63072000";
    return cid;
  }
  return fetch(
    "https://payment-handler.site/fb_capi_service/api/google/experiment_viewed",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        client_id: getGaClientId(),
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        action_source: "website",
        events: [
          {
            name: "experiment_viewed",
            params: {
              experiment_id: experiment.key,
              variation_id: result.variationId,
              gbuuid: result.hashValue,
            },
          },
        ],
      }),
    },
  ).catch(function () {});
};

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

    // --- ПРОВЕРКА СТРАНИЦЫ THANKS (ФИНАЛИЗАЦИЯ PURCHASE) ---
    if (
      window.location.href.includes("thanks") ||
      window.location.href.includes("thx-claude")
    ) {
      var pendingDataStr = localStorage.getItem("rb_meta_pending");
      if (pendingDataStr) {
        try {
          var data = JSON.parse(pendingDataStr);
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
        } catch (error) {
          console.error("Purchase processing error:", error);
        } finally {
          localStorage.removeItem("rb_meta_pending");
          localStorage.removeItem("fb_capi_initial_checkout");
        }
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
    return {
      name: getField(form, "name"),
      surname: getField(form, "surname"),
      city: getField(form, "city"),
      post_office: getField(form, "address"),
      email: getField(form, "Email"),
      phone: getField(form, "phone"),
      call_user: callOpt.indexOf("Передзвоніть") !== -1,
      //   payment_option: getField(form, 'paymentsystem') || 'cash'
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
    migrateRemovePaymentOption(); // добавлено временно для пользователй у которых сохранена оплата (22.05.2026)
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
