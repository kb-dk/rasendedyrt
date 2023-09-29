const allSpacesRegex = / /g;

exports.stores = {
    rema1000dk: {
        name: "REMA1000",
        budgetBrands: [],
        color: "rose",
        defaultChecked: true,
        getUrl: (item) => `https://shop.rema1000.dk/varer/${item.id}`,
    },
    billa: {
        name: "Billa",
        budgetBrands: ["clever"],
        color: "yellow",
        defaultChecked: true,
        getUrl: (item) => `https://shop.billa.at/produkte/${item.id}`,
    },
    bipa: {
        name: "Bipa",
        budgetBrands: ["babywell", "look by bipa", "bi care", "bi kids", "bi good", "bi life", "bi life dent"],
        color: "rose",
        defaultChecked: true,
        getUrl: (item) => `https://www.bipa.at${item.url}`,
        removeOld: false,
    },
};

exports.STORE_KEYS = Object.keys(exports.stores);
exports.BUDGET_BRANDS = [...new Set([].concat(...Object.values(exports.stores).map((store) => store.budgetBrands)))];
