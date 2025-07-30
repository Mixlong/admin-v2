<template>
  <div></div>
</template>

<script>
export default {
  name: 'Redirect',
  created() {
    const { params, query } = this.$route
    const { path } = params
    const redirect = Array.isArray(path) ? path.join('/') : path
    this.$router.replace({
      path: '/' + redirect,
      query
    })
  }
}
</script>