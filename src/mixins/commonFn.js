import { listCustomer } from "@/api/third/sample";
const mixinsFn = {
    data() {
        return {

        }
    },
    methods: {
        querySearchAsync(queryString, cb) {
            listCustomer({ key: queryString || "" }).then((res) => {
                cb(
                    res.data.map((item) => {
                        return {
                            value: item.name,
                        };
                    })
                );
            });
        },
    }
}

export { mixinsFn }