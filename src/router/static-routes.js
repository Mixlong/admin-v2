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
        path: '/base',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'process-route',
                component: () => import('@/views/base/process-route/index'),
                name: 'ProcessRoute',
                meta: {
                    title: '工艺路线管理',
                    keepAlive: true
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
    },
    {
        path: '/production-management',
        component: Layout,
        redirect: '/production-management/alerts',
        name: 'ProductionManagement',
        meta: {
            title: '生产管理',
            icon: 'el-icon-s-operation'
        },
        children: [
            {
                path: 'alerts',
                component: () => import('@/views/production-management/alerts/index'),
                name: 'ProductionAlerts',
                meta: {
                    title: '生产报警管理',
                    icon: 'el-icon-warning',
                    keepAlive: true
                }
            }
        ]
    },
    {
        path: '/shipment-management',
        component: Layout,
        redirect: '/shipment-management/shipment-order',
        name: 'ShipmentManagement',
        meta: {
            title: '出货管理',
            icon: 'el-icon-truck'
        },
        children: [
            {
                path: 'shipment-order',
                component: () => import('@/views/shipment-management/shipment-order/index'),
                name: 'ShipmentOrder',
                meta: {
                    title: '出货订单管理',
                    icon: 'el-icon-document',
                    keepAlive: true
                }
            }
        ]
    }
]