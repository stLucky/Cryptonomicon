<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model.trim="name"
            @keydown.enter="add"
            @input="onInput()"
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
        </div>
        <div
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
          v-if="isEmptyTooltip"
        >
          <span
            class="
              inline-flex
              items-center
              px-2
              m-1
              rounded-md
              text-xs
              font-medium
              bg-gray-300
              text-gray-800
              cursor-pointer
            "
            v-for="coin of visibleTooltipCoins"
            :key="coin.Symbol"
            :value="coin.Symbol"
            @click="onTooltipClick(coin), add()"
          >
            {{ coin.Symbol }}
          </span>
        </div>
        <div class="text-sm text-red-600" v-if="showAlert">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <button
      @click="add"
      type="button"
      class="
        my-4
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
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
      "
    >
      <!-- Heroicon name: solid/mail -->
      <svg
        class="-ml-0.5 mr-2 h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="#ffffff"
      >
        <path
          d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        ></path>
      </svg>
      Добавить
    </button>
  </section>
</template>
<script>
const MAX_VISIBLE_COINS = 4;

export default {
  props: {
    tickers: {
      type: Array,
      required: true,
    },

    allCoins: {
      type: Object,
      required: true,
    },
  },

  emits: {
    addTicker: (value) => typeof value === "string",
  },

  data: () => ({
    name: "",
    showAlert: false,
    visibleTooltipCoins: [],
  }),

  computed: {
    hasTicker() {
      return this.tickers.some(
        (ticker) => ticker.name === this.name.toUpperCase()
      );
    },

    isEmptyTooltip() {
      return this.visibleTooltipCoins.length > 0;
    },

    allCoinsNames() {
      return Object.values(this.allCoins);
    },

    filteredCoins() {
      return this.allCoinsNames.filter((coin) => {
        if (this.name === "") {
          return false;
        }
        return coin.Symbol.startsWith(this.name.toUpperCase());
      });
    },

    filteredSliceCoins() {
      return this.filteredCoins.slice(0, MAX_VISIBLE_COINS);
    },

    fullMatchCoin() {
      return this.filteredCoins.find(
        (coin) => coin.Symbol === this.name.toUpperCase()
      );
    },
  },

  methods: {
    onInput() {
      if (this.showAlert) {
        this.showAlert = false;
      }
    },

    add() {
      if (!this.hasTicker && this.name) {
        this.$emit("addTicker", this.name.toUpperCase());

        this.name = "";
      } else if (this.name) {
        this.showAlert = true;
      }
    },

    onTooltipClick(coin) {
      this.name = coin.Symbol;
    },
  },

  watch: {
    filteredSliceCoins() {
      if (this.fullMatchCoin) {
        const duplicateCoinIndex = this.filteredSliceCoins.findIndex(
          (coin) => coin === this.fullMatchCoin
        );
        this.filteredSliceCoins.splice(duplicateCoinIndex, 1);
        this.visibleTooltipCoins = [];
        this.visibleTooltipCoins.push(
          this.fullMatchCoin,
          ...this.filteredSliceCoins
        );
      } else {
        this.visibleTooltipCoins = this.filteredSliceCoins;
      }
    },
  },
};
</script>
