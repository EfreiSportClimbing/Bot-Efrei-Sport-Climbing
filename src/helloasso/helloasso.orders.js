import { axiosPrivate, axiosPublic } from "../common/axios.strategy.js";
import { checkClimbupOrder } from "./helloasso.shop.js";
import * as data from "../../config.json" assert { type: "json" };
import { client } from "../index.js";
import { orderExists } from "../firebase/orders.firestore.js";
import { Queue } from "async-await-queue";

export const queueTasks = new Queue(1);

const { ORGANIZATION_SLUG, CLIMBUP_FORM_SLUG } = data.default.helloasso;

export const checkOrder = async (order) => {
    switch (order?.formSlug) {
        case CLIMBUP_FORM_SLUG:
            const me = Symbol();
            await queueTasks.wait(me);
            await checkClimbupOrder(order);
            queueTasks.end(me);
        default:
            return;
    }
};

// fetch all orders from HelloAsso
export const fetchOrders = async () => {
    // define a variable to stop the loop
    let finished = false;
    var { data, pagination } = { data: [], pagination: { pageIndex: 0, totalPages: 1 } };

    // loop through all pages while the current page is not the last one and the order has not been treated
    while (pagination?.pageIndex < pagination?.totalPages && !finished) {
        const response = await axiosPrivate.get(`/organizations/${ORGANIZATION_SLUG}/orders`, {
            params: {
                continuationToken: pagination?.continuationToken,
                withDetails: true,
            },
        });

        if (response?.data) {
            var { data, pagination } = response.data;

            for (let index = 0; index < pagination?.pageSize; index++) {
                const order = data[index];
                if (order) {
                    if (!(await orderExists(order.id))) {
                        await checkOrder(order);
                    } else {
                        finished = true;
                        break;
                    }
                }
            }
        }
    }
};
