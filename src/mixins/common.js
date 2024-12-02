import _, { method } from "lodash";
import { categoryComputerDict } from "@/api/third/fileConfig";

const commonJs = {
  data() {
    return {
      // 提交loading
      isSubLoading: false,
    };
  },
  methods: {
    tabSelection(selection, singleOrMultity = true) {
      // singleOrMultity (true 多选 反之 单选)
      if (selection.length === 0) {
        return true; // 判断是否选择列
      }
      return false;
    },
    warningMessage(msg, isType) {
      // type 1 成功、2 警告、 3 失败
      let type = null;
      switch (+isType) {
        case 1:
          type = "success";
          break;
        case 2:
          type = "warning";
          break;
        case 3:
          type = "error";
          break;
      }
      this.$message({
        message: msg,
        type,
      });
    },
  },
};

const dragTable = {
  mounted() {
    this.handleDrag();
  },
  methods: {
    handleDrag() {
      this.$nextTick(() => {
        const tableBodyWrapper = this.$refs.tableRef.$el.querySelector(
          ".el-table__body-wrapper"
        );

        if (!tableBodyWrapper) {
          console.error("Table body wrapper not found.");
          return;
        }

        let isDown = false;
        let startX, scrollLeft;

        // 鼠标事件
        tableBodyWrapper.addEventListener("mousedown", (e) => {
          const tableBodyCell = e.target.querySelector(".cell");

          if (tableBodyCell) {
            isDown = true;
            startX = e.pageX - tableBodyWrapper.offsetLeft;
            scrollLeft = tableBodyWrapper.scrollLeft;
            tableBodyWrapper.style.cursor = "grabbing";
          } else {
            isDown = false;
          }
        });

        tableBodyWrapper.addEventListener("mouseleave", () => {
          isDown = false;
          tableBodyWrapper.style.cursor = "grab";
        });

        tableBodyWrapper.addEventListener("mouseup", () => {
          isDown = false;
          tableBodyWrapper.style.cursor = "grab";
        });

        const handleMouseMove = (e) => {
          if (!isDown) {
            return;
          }

          e.preventDefault();
          const x = e.pageX - tableBodyWrapper.offsetLeft;
          const walk = (x - startX) * 2;
          tableBodyWrapper.scrollLeft = scrollLeft - walk;
        };

        tableBodyWrapper.addEventListener(
          "mousemove",
          _.throttle(handleMouseMove, 200)
        );

        // tableBodyWrapper.style.overflowX = "hidden";
      });
    },
  },
};

const dragTableFn = {
  mounted() {
    this.handleDrag();
  },
  methods: {
    handleDrag() {
      let isDragging = false; // 标记是否正在拖动
      let isCtrlDown = false; // 标记Ctrl键是否被按下
      const scrollContainer = document.querySelector("#drag_table > .el-table__body-wrapper");

      // 监听键盘按下事件
      document.addEventListener("keydown", function (event) {
        if (event.key === "Control" || event.key === "Meta") {
          // 监听 Ctrl 或 Command 键（在Mac上）
          isCtrlDown = true;
        }
      });

      // 监听键盘释放事件
      document.addEventListener("keyup", function (event) {
        if (event.key === "Control" || event.key === "Meta") {
          // 监听 Ctrl 或 Command 键（在Mac上）
          isCtrlDown = false;
          isDragging = false; // 重置拖动状态
        }
      });

      // 监听鼠标按下事件
      document.addEventListener("mousedown", function (event) {
        if (isCtrlDown) {
          isDragging = true; // 设置拖动状态
          event.preventDefault(); // 阻止默认行为
        }
      });

      // 监听鼠标移动事件
      document.addEventListener("mousemove", function (event) {
        if (isDragging) {
          // 获取el-table的滚动容器
          if (scrollContainer) {
            const scrollLeft = scrollContainer.scrollLeft;
            const deltaX = event.movementX; // 获取鼠标水平移动距离
            scrollContainer.scrollLeft = scrollLeft - deltaX; // 更新滚动位置
          }
          // 阻止默认行为，防止选中文本等
          event.preventDefault();
        }
      });

      // 监听鼠标释放事件
      document.addEventListener("mouseup", function (event) {
        if (isDragging) {
          isDragging = false; // 重置拖动状态
        }
      });

      // 禁用点击事件
      document.addEventListener("click", function (event) {
        if (isDragging) {
          event.preventDefault(); // 阻止默认点击行为
          event.stopPropagation(); // 阻止事件冒泡
        }
      });
    },
  },
};

const CategoryMixin = {
  data() {
    return {
      // 品类
      dictList: [],
      computerOptions: [],
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getCategoryData();
    });
  },
  methods: {
    getCategoryData() {
      return new Promise((resolve, reject) => {
        try {
          categoryComputerDict().then((res) => {
            this.dictList = res.data;

            // 默认选择第一个
            this.queryParams.categoryId = this.dictList[0]?.id;

            this.getList();
            resolve(res.data);
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    changeCategory(categoryName) {
      if (!categoryName) return;
      this.queryParams.computerName = "";
      this.computerOptions = this.dictList.filter(
        (item) => item.name === categoryName
      )[0].computerList;
    },
  },
};

export { commonJs, dragTable, CategoryMixin, dragTableFn };
