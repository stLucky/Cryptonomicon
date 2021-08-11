const API_KEY =
  "af3ab31d03e8c44a7c160d20b3eb721bdb4f9bd76323fc0eee13bd2e3432dba2";

const tickersHandlers = new Map();

const loadTickers = () => {
  if (!tickersHandlers.size) {
    return;
  }
  const url = new URL("https://min-api.cryptocompare.com/data/pricemulti");
  url.searchParams.set("fsyms", `${[...tickersHandlers.keys()].join(",")}`);
  url.searchParams.set("tsyms", "USD");
  url.searchParams.set("api_key", `${API_KEY}`);

  return fetch(url)
    .then((response) => response.json())
    .then((rawData) => {
      const updatedTickers = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedTickers).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];

        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

const subscribeToTickers = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
};

const unsubscribeFromTickers = (tickerName) => {
  tickersHandlers.delete(tickerName);
};

setInterval(loadTickers, 5000);

window.tickers = tickersHandlers;

const loadAllCoins = () => {
  return fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  )
    .then((response) => response.json())
    .then((coinsResponse) => coinsResponse.Data)
    .catch((err) => console.log(err));
};

export {
  loadTickers,
  subscribeToTickers,
  unsubscribeFromTickers,
  loadAllCoins,
};
