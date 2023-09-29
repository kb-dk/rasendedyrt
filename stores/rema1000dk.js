const axios = require("axios");
const utils = require("./utils");

const units = {
    grm: { unit: "g", factor: 1 },
    kgm: { unit: "g", factor: 1000 },
    ltr: { unit: "ml", factor: 1000 },
    mlt: { unit: "ml", factor: 1 },
    mtr: { unit: "m", factor: 1 },
    anw: { unit: "stk", factor: 1 },
    "bl.": { unit: "stk", factor: 1 },
    pkg: { unit: "stk", factor: 1 },
    gr: { unit: "g", factor: 1 },
    er: { unit: "stk", factor: 1 },
};

exports.getCanonical = function (item, today) {
    /*let quantity = item.prices[0].presentationPrice.measurementUnit.quantity;
    let unit = item.prices[0].presentationPrice.measurementUnit.unitCode.toLowerCase();
    if (["xro", "h87", "hlt"].indexOf(unit) != -1) {
        const q = utils.parseUnitAndQuantityAtEnd(item.mixins.productCustomAttributes.packagingUnit);
        quantity = q[0] ?? quantity;
        unit = q[1];
    }
    if (!(unit in units)) {
        unit = "stk";
    }
    const isWeighted = (item.mixins.productCustomAttributes?.packagingDescription ?? "").startsWith("Gewichtsware");
*/
    let quantity = item.underline.split(" ")[0] ?? "1 stk.";
    let unit = item.underline.split(" ")[1] ?? "stk.";
    const isWeighted = item.is_weight_item ?? false;
    let pricing = item.pricing;

    return utils.convertUnit(
        {
            id: item.id,
            name: item.name,
            description: item.description,
            isWeighted: isWeighted,
            price: pricing.price,
            priceHistory: [{ date: today, price: item.pricing.price }],
            unit,
            quantity,
            bio: item.description.includes("ØKO"),
        },
        units,
        "rema1000dk"
    );
};

exports.fetchData = async function () {
    const REMA_URL = `https://flwdn2189e-dsn.algolia.net/1/indexes/aws-prod-products/browse?X-Algolia-API-Key=fa20981a63df668e871a87a8fbd0caed&X-Algolia-Application-Id=FLWDN2189E&X-Algolia-Agent=Vue.js`;
    console.log(`Initiating fetching from ${REMA_URL}`);
    let remaItems = [];
    let res = (await axios.get(REMA_URL)).data;
    remaItems = remaItems.concat(res.hits);
    cursor = res.cursor;
    while (cursor) {
        console.log(`Fetching from ${REMA_URL}`);
        res = (await axios.get(REMA_URL + `&cursor=${cursor}`)).data;
        remaItems = remaItems.concat(res.hits);
        console.log(`Found ${remaItems.length} for Rema1000`);
        cursor = res.cursor;
    }
    return remaItems;
};

function categoriesToPath(rawItem) {
    return rawItem.department_name + " -> " + rawItem.category_name;
    /*
    if (!rawItem.categories) return null;
    const traversePath = (category, result) => {
        if (category.name == "ProductRoot") return;
        if (category.parent) traversePath(category.parent, result);
        result.push({ name: category.name, id: category.id });
    };
    const pathElements = [];
    traversePath(rawItem.category, pathElements);
    const lastIndex = Math.min(3, pathElements.length) - 1;
    const result =
        pathElements
            .slice(0, lastIndex + 1)
            .map((el) => el.name)
            .join(" -> ") +
        "-" +
        pathElements[lastIndex].id;
    return result;
*/
}

exports.initializeCategoryMapping = async (rawItems) => {
    rawItems = rawItems ?? (await exports.fetchData());

    const categoryLookup = {};
    for (const rawItem of rawItems) {
        if (rawItem.categories) {
            const path = categoriesToPath(rawItem);
            categoryLookup[path] = {
                id: path,
                code: null,
                url: "https://shop.rema1000.dk/" + path.match(/(\d+)$/)[1],
            };
        }
    }
    let categories = [];
    Object.keys(categoryLookup).forEach((key) => categories.push(categoryLookup[key]));
    categories.sort((a, b) => b.id.localeCompare(a.id));
    categories = utils.mergeAndSaveCategories("rema1000dk", categories);
    exports.categoryLookup = {};
    for (const category of categories) {
        exports.categoryLookup[category.id] = category;
    }
};

exports.mapCategory = (rawItem) => {
    const path = categoriesToPath(rawItem);
    return exports.categoryLookup[path]?.code;
};

exports.urlBase = "https://shop.rema1000.dk/varer/";
