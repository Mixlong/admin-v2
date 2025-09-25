const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  nickName: state => state.user.nickName,
  readNum: state => state.user.readNum,
  userId: state => state.user.userId,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  taskOverdueNum: state => state.user.taskOverdueNum,
  deptId: state => state.user.deptId,
  deptName: state => state.user.deptName,
  permission_routes: state => state.permission.routes,
  isNODE_ENV: () => process.env.NODE_ENV === 'production'
}
export default getters
