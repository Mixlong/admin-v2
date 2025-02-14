import Layout from "@/layout";

export default [
    {
        path: '/excel',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                component: () => import('@/views/third/orderReview/excel'),
                name: 'excel',
                meta: {
                    title: 'excel'
                }
            }
        ]
    }
]