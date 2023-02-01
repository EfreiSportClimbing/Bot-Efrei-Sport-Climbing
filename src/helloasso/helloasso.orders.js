import { axiosPrivate, axiosPublic } from "./src/common/axios.strategy.js";

// fetch all orders at init
const fetchOrders = async () => {
    const { data } = await axiosPrivate.get(`/organizations/${ORGANIZATION_SLUG}/forms/Event/${CLIMBUP_FORM_SLUG}/orders`);
    return data;
};
