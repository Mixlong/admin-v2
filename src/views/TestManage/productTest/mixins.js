import { getOrderCusList } from "@/api/order";

export default {
    data() {
        return {
            customerData: {
                data: [],
                page: 1,
                more: true,
            },
        }
    },
    methods: {
        /** 客户名称 */
        getCustomerList({ page = 1, more = false, keyword = "" } = {}) {
            return new Promise((resolve) => {
                getOrderCusList({
                    p: page,
                    name: keyword,
                }).then((res) => {
                    const { list, total, pageNum, pageSize } = res.data;
                    if (more) {
                        this.customerData.data = [...this.customerData.data, ...list];
                    } else {
                        this.customerData.data = list;
                    }
                    this.customerData.more = pageNum * pageSize < total;
                    this.customerData.page = pageNum;
                    resolve();
                });
            });
        },
    }
}