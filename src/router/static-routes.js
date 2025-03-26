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
    },
    {
        path: '/CAD',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'testModelRecord',
                component: () => import('@/views/third/CAD/testModelRecord'),
                name: 'testModelRecord',
                meta: {
                    title: '测试记录'
                }
            }
        ]
    },
    {
        path: '/smartScreen',
        component: () => import('@/views/smartScreen/index'),
        meta: {
            title: '智慧大屏'
        }
    }
]