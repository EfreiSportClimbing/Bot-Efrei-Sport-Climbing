import { axiosPrivate, axiosPublic } from "../common/axios.strategy.js";
import { checkClimbupOrder } from "./helloasso.shop.js";
import * as data from "../../config.json" assert { type: "json" };
import { client } from "../index.js";

const { ORGANIZATION_SLUG, CLIMBUP_FORM_SLUG } = data.default.helloasso;

// function that check if an order has been treated or not
// return true if the order has been treated and false if not
// take an order as parameter
export const checkOrder = async (order) => {
    console.log("order :", order?.formSlug, order?.formType);

    switch (order?.formSlug) {
        case CLIMBUP_FORM_SLUG:
            return await checkClimbupOrder(order);
        default:
            return false;
    }
    return false;
};

// fetch all orders and check if they have been treated or not
export const fetchOrders = async () => {
    // list all orders
    let finished = false;
    const response = await axiosPrivate.get(`/organizations/${ORGANIZATION_SLUG}/orders?withDetails=true`);

    async function checkPage(data, pagination) {
        for (let index = 0; index < pagination?.pageSize; index++) {
            const order = data[index];
            if (order) {
                const treated = await checkOrder(order);
                if (treated) {
                    finished = true;
                    break;
                }
            }
        }
        if (pagination?.pageIndex < pagination?.totalPages && !finished) {
            const response = await axiosPrivate.get(`organizations/${ORGANIZATION_SLUG}/orders?continuationToken=${pagination?.continuationToken}&withDetails=true`);
            if (response?.data) {
                const { data, pagination } = response.data;
                await checkPage(data, pagination);
            }
        }
    }
    if (response?.data) {
        const { data, pagination } = response.data;
        checkPage(data, pagination);
    }
};
