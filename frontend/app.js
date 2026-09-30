let chart = null;

let currentSymbol = "AAPL";

let currentRange = "1M";

let watchlist = JSON.parse(localStorage.getItem("marketpulse_watchlist")) || [
  "AAPL",
  "MSFT",
  "GOOGL",
];

let alerts = JSON.parse(localStorage.getItem("marketpulse_alerts")) || [];

/* =====================================================
   HELPER
===================================================== */

function $(id) {
  return document.getElementById(id);
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return (
    "$" +
    number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString();
}

function showError(message) {
  $("errorMessage").textContent = message;

  $("errorMessage").classList.remove("hidden");

  $("apiStatusText").textContent = "API Error";
}

function clearError() {
  $("errorMessage").classList.add("hidden");

  $("apiStatusText").textContent = "Connected";
}

/* =====================================================
   LOAD STOCK
===================================================== */

async function loadStock(symbol = $("symbolInput").value.trim().toUpperCase()) {
  if (!symbol) {
    showError("Please enter a stock symbol.");

    return;
  }

  symbol = symbol.toUpperCase();

  if (!/^[A-Z0-9.\-]{1,15}$/.test(symbol)) {
    showError("Enter a valid symbol such as AAPL.");

    return;
  }

  currentSymbol = symbol;

  $("symbolInput").value = symbol;

  clearError();

  $("refreshButton").disabled = true;

  try {
    const response = await fetch(`/api/quote/${encodeURIComponent(symbol)}`);

    const quote = await response.json();

    if (!response.ok) {
      throw new Error(quote.detail || "Unable to load stock data.");
    }

    /* BASIC DATA */

    $("stockSymbol").textContent = quote.symbol || symbol;

    $("symbolMini").textContent = quote.symbol || symbol;

    $("price").textContent = formatMoney(quote.price);

    $("open").textContent = formatMoney(quote.open);

    $("high").textContent = formatMoney(quote.high);

    $("low").textContent = formatMoney(quote.low);

    $("previousClose").textContent = formatMoney(quote.previous_close);

    $("volume").textContent = formatNumber(quote.volume);

    $("tradingDay").textContent = quote.latest_trading_day || "—";

    /* CHANGE */

    const change = Number(quote.change || 0);

    const percent = quote.change_percent || "0%";

    const badge = $("changeBadge");

    badge.textContent = `${quote.change || "0"} (${percent})`;

    badge.classList.remove("positive", "negative", "neutral");

    if (change > 0) {
      badge.classList.add("positive");
    } else if (change < 0) {
      badge.classList.add("negative");
    } else {
      badge.classList.add("neutral");
    }

    /* UPDATED TIME */

    $("lastUpdated").textContent =
      "Updated " +
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    $("chartTitle").textContent = `${symbol} Price History`;

    updateWatchButton();

    await loadChart(symbol);
  } catch (error) {
    showError(error.message);
  } finally {
    $("refreshButton").disabled = false;
  }
}

/* =====================================================
   CHART
===================================================== */

async function loadChart(symbol) {
  try {
    const response = await fetch(`/api/history/${encodeURIComponent(symbol)}`);

    const data = await response.json();

    if (!response.ok || !Array.isArray(data) || data.length === 0) {
      showChartMessage(
        "Historical chart is not available from the current API.",
      );

      return;
    }

    $("chartMessage").classList.add("hidden");

    /*
            Approximate number of
            trading sessions to show.
        */

    const rangeCount = {
      "1M": 22,

      "3M": 66,

      "6M": 132,

      "1Y": 252,
    };

    const visible = data.slice(-(rangeCount[currentRange] || 22));

    const labels = visible.map((item) => item.date);

    const prices = visible.map((item) => item.close);

    if (chart) {
      chart.destroy();

      chart = null;
    }

    const canvas = $("priceChart");

    const ctx = canvas.getContext("2d");

    /* GRADIENT */

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);

    gradient.addColorStop(0, "rgba(124, 92, 255, 0.30)");

    gradient.addColorStop(1, "rgba(124, 92, 255, 0)");

    /* CHART */

    chart = new Chart(ctx, {
      type: "line",

      data: {
        labels: labels,

        datasets: [
          {
            label: symbol,

            data: prices,

            borderColor: "#8d79ff",

            backgroundColor: gradient,

            fill: true,

            borderWidth: 2,

            tension: 0.28,

            pointRadius: 0,

            pointHoverRadius: 5,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        interaction: {
          intersect: false,

          mode: "index",
        },

        plugins: {
          legend: {
            display: false,
          },

          tooltip: {
            displayColors: false,

            callbacks: {
              label: function (context) {
                return "  $" + Number(context.parsed.y).toFixed(2);
              },
            },
          },
        },

        scales: {
          x: {
            grid: {
              display: false,
            },

            ticks: {
              color: "#7f8aa1",

              maxTicksLimit: 7,
            },
          },

          y: {
            grid: {
              color: "rgba(130,140,160,.10)",
            },

            ticks: {
              color: "#7f8aa1",

              callback: function (value) {
                return "$" + value;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    showChartMessage("Unable to load price history.");
  }
}

function showChartMessage(message) {
  $("chartMessage").textContent = message;

  $("chartMessage").classList.remove("hidden");

  if (chart) {
    chart.destroy();

    chart = null;
  }
}

/* =====================================================
   WATCHLIST
===================================================== */

function saveWatchlist() {
  localStorage.setItem("marketpulse_watchlist", JSON.stringify(watchlist));
}

function renderWatchlist() {
  const box = $("watchlist");

  box.innerHTML = "";

  $("watchCount").textContent = watchlist.length;

  $("emptyWatchlist").classList.toggle("hidden", watchlist.length > 0);

  watchlist.forEach(function (symbol) {
    const row = document.createElement("div");

    row.className = "watch-row";

    row.innerHTML = `

                <div>

                    <div class="watch-symbol">
                        ${symbol}
                    </div>

                    <div class="watch-subtitle">
                        Click to view
                    </div>

                </div>

                <button
                    class="remove-watch"
                    type="button"
                    title="Remove"
                >
                    ×
                </button>

            `;

    row.addEventListener("click", function (event) {
      if (event.target.closest(".remove-watch")) {
        return;
      }

      loadStock(symbol);
    });

    row.querySelector(".remove-watch").addEventListener("click", function () {
      watchlist = watchlist.filter((item) => item !== symbol);

      saveWatchlist();

      renderWatchlist();

      updateWatchButton();
    });

    box.appendChild(row);
  });
}

function updateWatchButton() {
  const exists = watchlist.includes(currentSymbol);

  $("watchButton").textContent = exists
    ? "★ In Watchlist"
    : "☆ Add to Watchlist";
}

/* =====================================================
   ALERTS
===================================================== */

function saveAlerts() {
  localStorage.setItem("marketpulse_alerts", JSON.stringify(alerts));
}

function renderAlerts() {
  const box = $("alertList");

  box.innerHTML = "";

  alerts.forEach(function (alert, index) {
    const row = document.createElement("div");

    row.className = "alert-item";

    const conditionText = alert.condition === "above" ? "above" : "below";

    row.innerHTML = `

                <div>

                    <strong>
                        ${alert.symbol}
                    </strong>

                    <span>
                        Price ${conditionText}
                        $${Number(alert.price).toFixed(2)}
                    </span>

                </div>

                <button
                    type="button"
                    class="delete-alert"
                    title="Delete alert"
                >
                    ×
                </button>
            `;

    row.querySelector(".delete-alert").addEventListener("click", function () {
      alerts.splice(index, 1);

      saveAlerts();

      renderAlerts();
    });

    box.appendChild(row);
  });
}

function addAlert() {
  const symbol = $("alertSymbol").value.trim().toUpperCase();

  const condition = $("alertCondition").value;

  const price = Number($("alertPrice").value);

  if (!symbol) {
    showError("Please enter a symbol for the alert.");

    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showError("Please enter a valid target price.");

    return;
  }

  alerts.push({
    symbol: symbol,

    condition: condition,

    price: price,
  });

  saveAlerts();

  renderAlerts();

  $("alertPrice").value = "";

  clearError();
}

/* =====================================================
   SEARCH EVENTS
===================================================== */

$("searchButton").addEventListener("click", function () {
  loadStock();
});

$("symbolInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    loadStock();
  }
});

/* QUICK SEARCH */

document.querySelectorAll(".quick-chip").forEach(function (button) {
  button.addEventListener("click", function () {
    const symbol = button.dataset.symbol;

    loadStock(symbol);
  });
});

/* =====================================================
   CHART RANGE
===================================================== */

document.querySelectorAll(".range-button").forEach(function (button) {
  button.addEventListener("click", function () {
    currentRange = button.dataset.range;

    document.querySelectorAll(".range-button").forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    loadChart(currentSymbol);
  });
});

/* =====================================================
   WATCHLIST BUTTON
===================================================== */

$("watchButton").addEventListener("click", function () {
  if (watchlist.includes(currentSymbol)) {
    watchlist = watchlist.filter((item) => item !== currentSymbol);
  } else {
    watchlist.push(currentSymbol);
  }

  saveWatchlist();

  renderWatchlist();

  updateWatchButton();
});

/* =====================================================
   REFRESH
===================================================== */

$("refreshButton").addEventListener("click", function () {
  loadStock(currentSymbol);
});

/* =====================================================
   THEME
===================================================== */

$("themeButton").addEventListener("click", function () {
  document.body.classList.toggle("light");

  const light = document.body.classList.contains("light");

  $("themeButton").innerHTML = light
    ? "☀ <span>Light Mode</span>"
    : "☾ <span>Dark Mode</span>";
});

/* =====================================================
   SIDEBAR NAVIGATION
===================================================== */

document.querySelectorAll(".menu-item").forEach(function (button) {
  button.addEventListener("click", function () {
    document.querySelectorAll(".menu-item").forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const targetId = button.dataset.target;

    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

/* =====================================================
   ALERT BUTTON
===================================================== */

$("addAlertButton").addEventListener("click", addAlert);

/* =====================================================
   INITIAL LOAD
===================================================== */

renderWatchlist();

renderAlerts();

updateWatchButton();

loadStock();

/* =====================================================
   AUTO REFRESH
===================================================== */
