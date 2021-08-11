const API_KEY =
  "af3ab31d03e8c44a7c160d20b3eb721bdb4f9bd76323fc0eee13bd2e3432dba2";
const AGGREGATE_INDEX = "5";
const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

socket.addEventListener("message", (evt) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(evt.data);

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};

const subscribeToTickersOnWs = (tickerName) => {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const unsubscribeFromTickersOnWs = (tickerName) => {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const subscribeToTickers = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
  subscribeToTickersOnWs(tickerName);
};

const unsubscribeFromTickers = (tickerName) => {
  tickersHandlers.delete(tickerName);
  unsubscribeFromTickersOnWs(tickerName);
};

const loadAllCoins = () => {
  return fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  )
    .then((response) => response.json())
    .then((coinsResponse) => coinsResponse.Data)
    .catch((err) => console.log(err));
};

export { subscribeToTickers, unsubscribeFromTickers, loadAllCoins };
