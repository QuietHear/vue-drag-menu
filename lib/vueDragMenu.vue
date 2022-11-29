/*
 * @Author: aFei
 * @Date: 2022-11-17 14:27:47
*/
/*
 * @LastEditors: aFei
 * @LastEditTime: 2022-11-29 14:28:12
 */
<template>
  <div
    :class="['vue-drag-menu', isMove ? 'move-ing' : '', cname]"
    ref="vueDragMenu"
  >
    <div
      class="menu-item"
      v-for="(item, index) in menuList"
      :title="item.title"
      :style="{
        zIndex: menuList.length + 1 - index,
        background: item.bgColor,
        color: item.color,
        left: item.left + 'px',
        top: item.top + 'px',
      }"
      :key="index"
      @mousedown="index === 0 && isPC ? moveBegin($event) : null"
      @touchstart="index === 0 && !isPC ? moveBegin($event) : null"
      @click="index !== 0 && !isMove ? showMenu(index) : null"
    >
      <i
        :class="['icon iconfont', 'icon-' + item.icon.split('/')[1]]"
        v-if="item.icon.split('/')[0] === 'iconfont'"
      />
      <i :class="item.icon.split('/')[0]" v-else>{{
        item.icon.split("/")[1]
      }}</i>
    </div>
  </div>
</template>
<script>
export default {
  name: "vueDragMenu",
  props: {
    cname: {
      // 自定义class
      type: String,
      default: "",
    },
    list: {
      // 按钮数据
      type: Array,
      default: () => {
        return [
          {
            icon: "icon-insert icon-setting",
            bgColor: "#fff",
            title: "菜单",
            color: "",
          },
          {
            icon: "icon-insert icon-myCenter",
            bgColor: "rgb(255, 92, 92)",
          },
          {
            icon: "icon-insert icon-notice",
            bgColor: "rgb(92, 209, 255)",
          },
          {
            icon: "icon-insert icon-expression",
            bgColor: "rgb(255, 241, 92)",
          },
          {
            icon: "icon-insert icon-collection",
            bgColor: "rgb(100, 245, 146)",
          },
        ];
      },
    },
    // 非第一个的按钮点击时是否需要收起菜单
    closeOnClick: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      menuList: [],
      _parent: null, // 父元素对象
      _first: null, // 第一个子元素对象
      ITEMWIDTH: null, // 元素的宽
      ITEMHEIGHT: null, // 元素的高
      ENDTIME: null, // 检测拖拽动画结束定时器
      STEP: 6, // 步数间隔=实际间隔+1
      MOVEBETWEEN: 10, // 上下跳动距离
      // 根据屏幕尺寸改变的固定值
      WINDOWWIDTH: null, // 屏幕最大宽
      WINDOWHEIGHT: null, // 屏幕最大高
      FATHERX: null, // 父元素横坐标
      FATHERY: null, // 父元素纵坐标
      STATICWIDTH: null, // 改变页面大小可移动最大宽
      STATICHEIGHT: null, // 改变页面大小可移动最大高
      NOWX: null, // 元素当前left值
      NOWY: null, // 元素当前top值
      // 动态改变的值
      isMove: false, // 移动状态
      beginX: null, // 开始横坐标
      beginY: null, // 开始纵坐标
      clickX: null, // 拖拽开始前点击的位置距离父元素X
      clickY: null, // 拖拽开始前点击的位置距离父元素Y
      moveX: null, // 移动横坐标
      moveXMin: null, // 移动时横坐标最小值
      moveXMax: null, // 移动时横坐标最大值
      moveY: null, // 移动纵坐标
      moveYMin: null, // 移动时纵坐标最小值
      moveYMax: null, // 移动时纵坐标最大值
      needCheck: false, // 判断元素是否需要检查
      isPC: true, // 是否是PC端
      arr: [], // 存放位置路径
      endX: null, // 结束横坐标
      endY: null, // 结束横坐标
    };
  },
  created() {
    this.menuList = this.list.map((item) => {
      return {
        icon: item.icon,
        title: item.title || "",
        bgColor: item.bgColor || "",
        color: item.color || "",
        left: 0,
        top: 0,
      };
    });
    if (
      /Android|webOS|iPhone|iPod|BlackBerry/i.test(window.navigator.userAgent)
    ) {
      this.isPC = false;
    }
  },
  mounted() {
    if (this.menuList.length > 0) {
      this._parent = this.$refs.vueDragMenu;
      this._first = this.findByClass(this._parent, "menu-item")[0];
      this.ITEMWIDTH = this._first.offsetWidth;
      this.ITEMHEIGHT = this._first.offsetHeight;
      this.notDragMax();
      window.addEventListener("resize", this.notDragMax);
    }
  },
  methods: {
    hasClass(ele, className) {
      return ele.classList
        ? ele.classList.contains(className)
        : new RegExp("\\s" + className + "\\s").test(" " + ele.className + " ");
    },
    findByClass(ele, className) {
      let result = [];
      let depth = (arr) => {
        arr.forEach((item) => {
          if (this.hasClass(item, className)) {
            result.push(item);
          }
          if (item.childNodes && item.childNodes.length > 0) {
            depth(item.childNodes);
          }
        });
      };
      depth(ele.childNodes);
      return result;
    },
    lessAnimate(item, obj, time) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          for (const keys in obj) {
            item[keys] = obj[keys];
          }
          resolve();
        }, time);
      });
    },
    // 向上展开
    toTop() {
      this.menuList.forEach(async (item, index) => {
        if (index > 0) {
          // 展开时
          if (this.needCheck) {
            await this.lessAnimate(
              item,
              { top: this.endY + this.MOVEBETWEEN },
              40
            );
            await this.lessAnimate(
              item,
              { top: this.endY - this.MOVEBETWEEN },
              80
            );
            await this.lessAnimate(item, { top: this.endY }, 50);
          }
          // 收起时
          else {
            await this.lessAnimate(
              item,
              {
                top:
                  this.endY -
                  (index * (this.ITEMHEIGHT + this.MOVEBETWEEN) +
                    this.MOVEBETWEEN),
              },
              40
            );
            await this.lessAnimate(
              item,
              { top: this.endY - index * (this.ITEMHEIGHT + this.MOVEBETWEEN) },
              100
            );
          }
        }
      });
      this.needCheck = !this.needCheck;
    },
    // 向下展开
    toBottom() {
      this.menuList.forEach(async (item, index) => {
        if (index > 0) {
          // 展开时
          if (this.needCheck) {
            await this.lessAnimate(
              item,
              { top: this.endY - this.MOVEBETWEEN },
              40
            );
            await this.lessAnimate(
              item,
              { top: this.endY + this.MOVEBETWEEN },
              80
            );
            await this.lessAnimate(item, { top: this.endY }, 50);
          }
          // 收起时
          else {
            await this.lessAnimate(
              item,
              {
                top:
                  this.endY +
                  (index * (this.ITEMHEIGHT + this.MOVEBETWEEN) +
                    this.MOVEBETWEEN),
              },
              40
            );
            await this.lessAnimate(
              item,
              { top: this.endY + index * (this.ITEMHEIGHT + this.MOVEBETWEEN) },
              100
            );
          }
        }
      });
      this.needCheck = !this.needCheck;
    },
    // 向左展开
    toLeft() {
      this.menuList.forEach(async (item, index) => {
        if (index > 0) {
          // 展开时
          if (this.needCheck) {
            await this.lessAnimate(
              item,
              { left: this.endX + this.MOVEBETWEEN },
              40
            );
            await this.lessAnimate(
              item,
              { left: this.endX - this.MOVEBETWEEN },
              80
            );
            await this.lessAnimate(item, { left: this.endX }, 50);
          }
          // 收起时
          else {
            await this.lessAnimate(
              item,
              {
                left:
                  this.endX -
                  (index * (this.ITEMWIDTH + this.MOVEBETWEEN) +
                    this.MOVEBETWEEN),
              },
              40
            );
            await this.lessAnimate(
              item,
              { left: this.endX - index * (this.ITEMWIDTH + this.MOVEBETWEEN) },
              100
            );
          }
        }
      });
      this.needCheck = !this.needCheck;
    },
    // 向右展开
    toRight() {
      this.menuList.forEach(async (item, index) => {
        if (index > 0) {
          // 展开时
          if (this.needCheck) {
            await this.lessAnimate(
              item,
              { left: this.endX - this.MOVEBETWEEN },
              40
            );
            await this.lessAnimate(
              item,
              { left: this.endX + this.MOVEBETWEEN },
              80
            );
            await this.lessAnimate(item, { left: this.endX }, 50);
          }
          // 收起时
          else {
            await this.lessAnimate(
              item,
              {
                left:
                  this.endX +
                  (index * (this.ITEMWIDTH + this.MOVEBETWEEN) +
                    this.MOVEBETWEEN),
              },
              40
            );
            await this.lessAnimate(
              item,
              { left: this.endX + index * (this.ITEMWIDTH + this.MOVEBETWEEN) },
              100
            );
          }
        }
      });
      this.needCheck = !this.needCheck;
    },
    // 展示菜单
    showMenu(index = 0) {
      this.$emit("click", this.list[index]);
      if (index === 0 || this.closeOnClick) {
        // 距离边界的横纵坐标和距离
        let nowX, nowY, x, y;
        // 当前位置定位
        nowX = this._first.offsetLeft;
        nowY = this._first.offsetTop;
        //右边
        if (nowX > 0) {
          // 右上
          if (nowY < 0) {
            x = this.WINDOWWIDTH / 2 - nowX - this.ITEMWIDTH;
            y = this.WINDOWHEIGHT / 2 + nowY;
            if (x + 10 < y) {
              this.toLeft();
            } else {
              this.toBottom();
            }
          }
          // 右下
          else {
            x = this.WINDOWWIDTH / 2 - nowX - this.ITEMWIDTH;
            y = this.WINDOWHEIGHT / 2 - nowY - this.ITEMHEIGHT;
            if (x + 10 < y) {
              this.toLeft();
            } else {
              this.toTop();
            }
          }
        }
        //左边
        else {
          //左上
          if (nowY < 0) {
            x = this.WINDOWWIDTH / 2 + nowX;
            y = this.WINDOWHEIGHT / 2 + nowY;
            if (x + 10 < y) {
              this.toRight();
            } else {
              this.toBottom();
            }
          }
          // 左下
          else {
            x = this.WINDOWWIDTH / 2 + nowX;
            y = this.WINDOWHEIGHT / 2 - nowY - this.ITEMHEIGHT;
            if (x + 10 < y) {
              this.toRight();
            } else {
              this.toTop();
            }
          }
        }
      }
    },
    // 检查是否需要收起菜单
    checkCollapse() {
      if (this.needCheck) {
        this.showMenu(0);
      }
    },
    // 改变非拖拽时最大边界
    notDragMax() {
      this.checkCollapse();
      //屏幕最大内容
      this.WINDOWWIDTH = window.innerWidth;
      this.WINDOWHEIGHT = window.innerHeight;
      //屏幕有效大小
      this.STATICWIDTH = this.WINDOWWIDTH - this.ITEMWIDTH;
      this.STATICHEIGHT = this.WINDOWHEIGHT - this.ITEMHEIGHT;
      //父元素坐标
      this.FATHERX = this._parent.offsetLeft;
      this.FATHERY = this._parent.offsetTop;
      // 元素坐标
      this.NOWX = this.STATICWIDTH - this.FATHERX - 10;
      this.NOWY = this.STATICHEIGHT - this.FATHERY - 10;
      this.menuList.forEach((item) => {
        item.left = this.NOWX;
        item.top = this.NOWY;
      });
    },
    // 拖拽结束或停止动画
    dragStop() {
      // 防止只记录了一步，默认从上到下
      if (this.arr.length > 1) {
        // 最终移动差值
        let x, y;
        // 倒数第二个点
        let x1 = this.arr[this.arr.length - 2].x;
        let y1 = this.arr[this.arr.length - 2].y;
        // 最后一个点
        let x2 = this.arr[this.arr.length - 1].x;
        let y2 = this.arr[this.arr.length - 1].y;
        let differX = Math.abs(x2 - x1);
        let differY = Math.abs(y2 - y1);
        if (differX === 0) {
          x = 0;
          y = this.MOVEBETWEEN;
        } else {
          x = Math.sqrt(
            (Math.pow(this.MOVEBETWEEN, 2) * Math.pow(differX, 2)) /
              (Math.pow(differX, 2) + Math.pow(differY, 2))
          );
          y = (x * differY) / differX;
        }
        this.menuList.forEach((item, index) => {
          if (index > 0) {
            setTimeout(async () => {
              // 全部前进到最后一个点前的状态
              await this.lessAnimate(item, { left: x1, top: y1 }, 50);
              await this.lessAnimate(
                item,
                {
                  left: x2 > x1 ? x2 + x : x2 - x,
                  top: y2 > y1 ? y2 + y : y2 - y,
                },
                50
              );
              await this.lessAnimate(
                item,
                {
                  left: x2 > x1 ? x2 - x : x2 + x,
                  top: y2 > y1 ? y2 - y : y2 + y,
                },
                100
              );
              await this.lessAnimate(item, { left: x2, top: y2 }, 50);
            }, index * 120);
          }
        });
      }
      this.arr = [];
    },
    // 鼠标按下
    moveBegin(event) {
      if (this.isPC) {
        this.clickX = event.offsetX;
        this.clickY = event.offsetY;
      } else {
        this.clickX =
          event.changedTouches[0].clientX -
          this.WINDOWWIDTH / 2 -
          this._first.offsetLeft;
        this.clickY =
          event.changedTouches[0].clientY -
          this.WINDOWHEIGHT / 2 -
          this._first.offsetTop;
      }
      this.beginX = this._first.offsetLeft;
      this.beginY = this._first.offsetTop;
      this.moveXMin = this.clickX;
      this.moveXMax = this.STATICWIDTH + this.clickX;
      this.moveYMin = this.clickY;
      this.moveYMax = this.STATICHEIGHT + this.clickY;
      this.arr = [];
      //临时保存当前的元素的位置，若元素移动则会被清除
      this.NOWX = this.beginX - this.FATHERX;
      this.NOWY = this.beginY - this.FATHERY;
      this.isMove = true;
      if (this.isPC) {
        window.addEventListener("mousemove", this.moveIng);
        window.addEventListener("mouseup", this.moveEnd);
      } else {
        window.addEventListener("touchmove", this.moveIng);
        window.addEventListener("touchend", this.moveEnd);
      }
    },
    // 鼠标移动
    moveIng(event) {
      this.checkCollapse();
      if (this.isPC) {
        this.moveX = event.clientX;
        this.moveY = event.clientY;
      } else {
        this.moveX = event.changedTouches[0].clientX;
        this.moveY = event.changedTouches[0].clientY;
      }
      // 横坐标极限判断
      if (this.moveX < this.moveXMin) {
        this.NOWX = 0 - this.FATHERX;
      } else if (this.moveX > this.moveXMax) {
        this.NOWX = this.STATICWIDTH - this.FATHERX;
      } else {
        this.NOWX = this.moveX - this.FATHERX - this.clickX;
      }
      // 纵坐标极限判断
      if (this.moveY < this.moveYMin) {
        this.NOWY = 0 - this.FATHERY;
      } else if (this.moveY > this.moveYMax) {
        this.NOWY = this.STATICHEIGHT - this.FATHERY;
      } else {
        this.NOWY = this.moveY - this.FATHERY - this.clickY;
      }
      this.arr.push({ x: this.NOWX, y: this.NOWY });
      this.menuList.forEach((item, index) => {
        if (this.arr.length > 1 && this.arr.length > index * this.STEP) {
          item.left = this.arr[this.arr.length - 1 - this.STEP * index].x;
          item.top = this.arr[this.arr.length - 1 - this.STEP * index].y;
        }
      });
      if (this.arr.length > this.STEP * (this.menuList.length - 1) + 1) {
        //节省内存
        this.arr.shift();
      }
      if (this.ENDTIME !== null || this.ENDTIME !== undefined) {
        clearTimeout(this.ENDTIME);
      }
      this.ENDTIME = setTimeout(this.dragStop, 500);
    },
    // 鼠标松开
    moveEnd() {
      this.endX = this._first.offsetLeft;
      this.endY = this._first.offsetTop;
      // 清除多余事件，防止多次绑定
      if (this.isPC) {
        window.removeEventListener("mousemove", this.moveIng);
        window.removeEventListener("mouseup", this.moveEnd);
      } else {
        window.removeEventListener("touchmove", this.moveIng);
        window.removeEventListener("touchend", this.moveEnd);
      }
      // 为简单单击事件时
      if (this.beginX === this.endX && this.beginY === this.endY) {
        this.showMenu();
      }
      setTimeout(() => {
        this.isMove = false;
      }, 600);
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.notDragMax);
    if (this.isPC) {
      window.removeEventListener("mousemove", this.moveIng);
      window.removeEventListener("mouseup", this.moveEnd);
    } else {
      window.removeEventListener("touchmove", this.moveIng);
      window.removeEventListener("touchend", this.moveEnd);
    }
  },
};
</script>

<!--基础样式-->
<style>
@import "style/vueDragMenu.css";
</style>