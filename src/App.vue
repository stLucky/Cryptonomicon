<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="!allCoins"
      class="
        fixed
        w-100
        h-100
        opacity-80
        bg-purple-800
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container" v-else>
      <add-ticker :tickers="tickers" :all-coins="allCoins" @add-ticker="add" />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <p>
          <button
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
            type="button"
            v-if="page > 1"
            @click="page--"
          >
            Назад
          </button>
          <button
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
            type="button"
            v-if="hasNextPage"
            @click="page++"
          >
            Вперед
          </button>
        </p>
        <p>
          Фильтр:
          <input
            class="
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            type="text"
            v-model.trim="filter"
          />
        </p>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
            v-for="ticker of paginatedTickers"
            :key="ticker.name"
            :class="{ 'border-4': selectedTicker === ticker }"
            @click="select(ticker)"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(ticker.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="remove(ticker)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <graph-tickers
        v-if="selectedTicker"
        :selected-ticker="selectedTicker"
        :dynamic-prices="dynamicPrices"
        @close-graph="selectedTicker = null"
        @set-visible-bars="removeExtraPrices"
      />
    </div>
  </div>
</template>

<script>
import {
  subscribeToTickers,
  unsubscribeFromTickers,
  loadAllCoins,
} from "./api";

import AddTicker from "./components/AddTicker";
import GraphTickers from "./components/GraphTickers";

const VISIBLE_TICKERS_PAGE = 6;

export default {
  name: "App",

  components: {
    AddTicker,
    GraphTickers,
  },

  data: () => ({
    tickers: [],
    selectedTicker: null,
    allCoins: "",
    page: 1,
    filter: "",
    dynamicPrices: [],
  }),

  computed: {
    startIndexPage() {
      return (this.page - 1) * VISIBLE_TICKERS_PAGE;
    },

    endIndexPage() {
      return this.page * VISIBLE_TICKERS_PAGE;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.startsWith(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndexPage, this.endIndexPage);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndexPage;
    },

    tickersNames() {
      return this.tickers.map((ticker) => ticker.name);
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },

    formatPrice() {
      return (price) => {
        if (price === "-") {
          return price;
        }
        return price > 1 ? price.toFixed(2) : price.toPrecision(2);
      };
    },
  },

  methods: {
    removeExtraPrices(deletedPrices) {
      this.dynamicPrices.splice(0, deletedPrices);
    },

    updateTickers(tickerName, price) {
      this.tickers
        .filter((ticker) => ticker.name === tickerName)
        .forEach((ticker) => {
          if (ticker === this.selectedTicker) {
            this.dynamicPrices.push(price);
          }
          ticker.price = price;
        });
    },

    add(ticker) {
      const newTicker = {
        name: ticker,
        price: "-",
      };
      this.tickers = [...this.tickers, newTicker];
      this.filter = "";
      subscribeToTickers(newTicker.name, (newPrice) =>
        this.updateTickers(newTicker.name, newPrice)
      );
    },

    remove(currentTicker) {
      this.tickers = this.tickers.filter((ticker) => ticker !== currentTicker);
      if (this.selectedTicker === currentTicker) {
        this.selectedTicker = null;
      }
      unsubscribeFromTickers(currentTicker.name);
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },
  },

  watch: {
    selectedTicker() {
      this.dynamicPrices = [];
    },

    tickers() {
      localStorage.setItem("coins-list", JSON.stringify(this.tickers));
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0) {
        this.page = Math.max(1, this.page - 1);
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        "",
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }

    loadAllCoins().then((coins) => (this.allCoins = coins));

    const tickersData = localStorage.getItem("coins-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);

      this.tickers.forEach((ticker) => {
        subscribeToTickers(ticker.name, (newPrice) =>
          this.updateTickers(ticker.name, newPrice)
        );
      });
    }
  },
};
</script>
