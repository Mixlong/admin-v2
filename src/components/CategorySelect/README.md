# CategorySelect 品类选择器组件

## 功能特点

✅ **全局缓存** - 只请求一次接口，多处使用共享数据  
✅ **双向绑定** - 支持 v-model  
✅ **灵活配置** - 可返回 id 或 name  
✅ **智能识别** - 自动识别传入的是 id 还是 name，无需手动转换  
✅ **自动加载** - 组件创建时自动加载数据  
✅ **手动刷新** - 支持手动清除缓存并重新加载  

## 基本用法

### 1. 返回品类名称（默认）

```vue
<template>
  <category-select v-model="form.categoryName" />
</template>

<script>
import CategorySelect from "@/components/CategorySelect";

export default {
  components: { CategorySelect },
  data() {
    return {
      form: {
        categoryName: ""
      }
    };
  }
};
</script>
```

### 2. 返回品类 ID

```vue
<template>
  <category-select 
    v-model="form.categoryId" 
    :return-id="true" 
  />
</template>

<script>
import CategorySelect from "@/components/CategorySelect";

export default {
  components: { CategorySelect },
  data() {
    return {
      form: {
        categoryId: ""
      }
    };
  }
};
</script>
```

### 3. 在搜索表单中使用

```vue
<template>
  <el-form :model="searchForm">
    <el-form-item label="产品品类">
      <category-select 
        v-model="searchForm.categoryName"
        placeholder="请选择品类"
        @change="handleSearch"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import CategorySelect from "@/components/CategorySelect";

export default {
  components: { CategorySelect },
  data() {
    return {
      searchForm: {
        categoryName: ""
      }
    };
  },
  methods: {
    handleSearch() {
      // 执行搜索逻辑
      console.log(this.searchForm);
    }
  }
};
</script>
```

### 4. 监听选中的完整品类对象

```vue
<template>
  <category-select 
    v-model="form.categoryId"
    :return-id="true"
    @category-change="handleCategoryChange"
  />
</template>

<script>
import CategorySelect from "@/components/CategorySelect";

export default {
  components: { CategorySelect },
  data() {
    return {
      form: {
        categoryId: "",
        categoryName: ""
      }
    };
  },
  methods: {
    handleCategoryChange(category) {
      if (category) {
        // category = { id: 1, name: "工控机", ... }
        this.form.categoryName = category.name;
      }
    }
  }
};
</script>
```

### 5. 手动刷新数据

```vue
<template>
  <div>
    <category-select ref="categorySelect" v-model="form.categoryId" />
    <el-button @click="refreshCategory">刷新品类</el-button>
  </div>
</template>

<script>
import CategorySelect from "@/components/CategorySelect";

export default {
  components: { CategorySelect },
  methods: {
    refreshCategory() {
      this.$refs.categorySelect.refresh();
    }
  }
};
</script>
```

### 6. 辅助方法使用

```vue
<template>
  <category-select ref="categorySelect" v-model="categoryId" :return-id="true" />
</template>

<script>
import CategorySelect from "@/components/CategorySelect";

export default {
  components: { CategorySelect },
  data() {
    return {
      categoryId: 1
    };
  },
  methods: {
    getCategoryInfo() {
      // 根据 ID 获取名称
      const name = this.$refs.categorySelect.getNameById(this.categoryId);
      console.log('品类名称:', name);
      
      // 根据名称获取 ID
      const id = this.$refs.categorySelect.getIdByName('工控机');
      console.log('品类ID:', id);
    }
  }
};
</script>
```

## Props 参数

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value / v-model | 绑定值 | String / Number | - |
| placeholder | 占位文本 | String | '请选择产品品类' |
| clearable | 是否可清空 | Boolean | true |
| filterable | 是否可搜索 | Boolean | true |
| disabled | 是否禁用 | Boolean | false |
| returnId | 是否返回 id（默认返回 name） | Boolean | false |

## Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值发生变化时触发 | (value: string \| number) |
| category-change | 选中品类对象发生变化时触发 | (category: Object \| null) |
| clear | 清空时触发 | - |

## Methods 方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| refresh | 清除缓存并重新加载数据 | - |
| getNameById | 根据 id 获取 name | (id: number) |
| getIdByName | 根据 name 获取 id | (name: string) |

## 智能兼容功能 🎯

组件会自动识别传入的值类型，无需手动转换！

### 场景 1：后端返回 id，但组件配置为返回 name

```vue
<template>
  <!-- 组件配置为返回 name（默认） -->
  <category-select v-model="form.categoryName" />
</template>

<script>
export default {
  data() {
    return {
      form: {
        categoryName: "" // 期望存储 name
      }
    };
  },
  created() {
    // 从后端获取数据，返回的是 categoryId
    this.form = {
      categoryId: 1,  // 后端返回的是 id
      categoryName: "" 
    };
    
    // ✅ 组件会自动识别 categoryId 是数字，
    // 并在品类列表中查找对应的 name 来显示
    // 用户选择后，会更新为 name
  }
};
</script>
```

### 场景 2：后端返回 name，但组件配置为返回 id

```vue
<template>
  <!-- 组件配置为返回 id -->
  <category-select v-model="form.categoryId" :return-id="true" />
</template>

<script>
export default {
  data() {
    return {
      form: {
        categoryId: "" // 期望存储 id
      }
    };
  },
  created() {
    // 从后端获取数据，返回的是 categoryName
    this.form = {
      categoryId: "",
      categoryName: "工控机"  // 后端返回的是 name
    };
    
    // ✅ 组件会自动识别 categoryName 是字符串，
    // 并在品类列表中查找对应的 id 来显示
    // 用户选择后，会更新为 id
  }
};
</script>
```

### 场景 3：编辑模式自动适配

```vue
<template>
  <category-select 
    v-model="form.categoryId" 
    :return-id="true" 
  />
</template>

<script>
export default {
  data() {
    return {
      form: {
        categoryId: null
      }
    };
  },
  methods: {
    loadData() {
      // 后端可能返回 id 或 name，组件都能正确识别
      this.form.categoryId = 1;  // 传入 id，✅ 正常显示
      // 或
      this.form.categoryId = "工控机";  // 传入 name，✅ 也能正常显示
      
      // 用户选择后，始终返回 id（因为 :return-id="true"）
    }
  }
};
</script>
```

**原理说明：**
- 组件会根据传入值的**类型**（数字 or 字符串）自动判断
- 如果类型与配置不匹配，会自动在品类列表中查找并转换
- 确保显示和输出都符合预期

## 缓存机制说明

- 第一次使用组件时会请求接口获取品类数据
- 数据会缓存在**全局变量**中
- 后续所有 CategorySelect 组件实例都会使用缓存数据，**不会重复请求**
- 如果需要刷新数据，调用组件的 `refresh()` 方法

## 与 TypedSelectLoadMore 的区别

| 特性 | CategorySelect | TypedSelectLoadMore (categoryId) |
|------|---------------|----------------------------------|
| 数据加载 | 一次性加载全部 | 分页加载 |
| 缓存机制 | ✅ 全局缓存 | ❌ 无缓存 |
| 适用场景 | 品类数量较少（<100） | 品类数量很多（>100） |
| 性能 | 首次加载稍慢，后续极快 | 每次都需要请求 |
| 推荐使用 | ✅ **推荐** | 备选方案 |

## 推荐使用场景

✅ 搜索表单  
✅ 新增/编辑表单  
✅ 筛选条件  
✅ 任何需要选择品类的地方  

**一次引入，到处使用，无需担心性能问题！**
