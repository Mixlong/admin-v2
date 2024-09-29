import _ from "lodash";

const commonJs = {
    data() {
        return {
            // 提交loading
            isSubLoading: false,
        }
    },
    methods: {
        tabSelection(selection, singleOrMultity = true) {     // singleOrMultity (true 多选 反之 单选)
            if (selection.length === 0) {
                return true      // 判断是否选择列
            }
            return false
        },
        warningMessage(msg, isType) {  // type 1 成功、2 警告、 3 失败
            let type = null
            switch (+isType) {
                case 1: type = 'success'; break;
                case 2: type = 'warning'; break;
                case 3: type = 'error'; break;
            }
            this.$message({
                message: msg,
                type
            })
        }
    }
}

const dragTable =  {
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
  
          tableBodyWrapper.style.overflowX = "hidden";
        });
      },
    },
  };


export {
    commonJs,
    dragTable
}