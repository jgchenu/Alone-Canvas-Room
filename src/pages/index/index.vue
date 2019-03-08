<template>
<div class="index">
  
  <canvas  canvas-id="show" 
   :style="{'height'
   :height+'rpx','width'
   :width+'rpx','left':(offsetX)+'rpx','top':(offsetY)+'rpx'}" 
   disable-scroll="true"  
   />
   <canvas 
   canvas-id="Canvas" 
   :style="{'height'
   :height+'rpx','width'
   :width+'rpx','left':offsetX+'rpx','top':offsetY+'rpx'}" 
   disable-scroll="true"  
   @touchstart="touchStart" 
   @touchmove="touchMove"
   @touchend="touchEnd"
   :ref="'canvas'" class="canvas" 
   />

  <aside class="types">

    <picker mode="multiSelector" @change="bindMultiPickerChange" :value="multiIndex" :range="multiArray"  >
        <div class="picker type" :style="{'font-size':(computedDrawWidth)+'rpx','color':color}" style="border-radiu:50%;" >
            ●
        </div>
    </picker>

    <div v-for="(item,index) in types" :key="index" :class="{chosen:item==chosen}" class="type" @click="choseType(index)">
      <img :src="'https://raw.githubusercontent.com/jgchenu/staticAssets/master/'+item+'.png'" :alt="item">
    </div>


  </aside>
  <div v-if="identity==='join'" class="tip">
    <p>保存画板 
    <img :src="'https://raw.githubusercontent.com/jgchenu/staticAssets/master/save.png'"
    :alt="'save'"
    @click="choseType(4)">
    </p>
  </div>
</div>
</template>

<script>
import util from '@/utils/index.js'

export default {
  mounted() {
    //调用监听服务器返回
    this.ctx = wx.createContext();
    //初始化画布背景色
    this.setBg();
    this.ctx.setStrokeStyle(this.color);
    this.ctx.setLineWidth(2);
    this.ctx.setLineCap("round"); // 让线条圆润
  },
  onLoad(option) {
  },
  onUnload() {
  },
  data() {
    return {
      index: 0,
      multiArray: [
        [1, 2, 4, 6, 8, 10],
        ["黑", "红", "橙", "黄", "绿", "蓝", "青", "紫"]
      ],
      colorArray: [
        "#000000",
        "#e74c3c",
        "#e67e22",
        "#f1c40f",
        "#2ecc71",
        "#3498db",
        "#1abc9c",
        "#9b59b6"
      ],
      multiIndex: [0, 0],
      drawArr: [],
      prevPosition: [0, 0],
      startX: 0,
      startY: 0,
      height: 1080,
      width: 2880,
      offsetX: 0,
      offsetY: 0,
      timer: null,
      types: ["draw", "move", "eraser", "clear", "save"],
      chosen: "draw",
      time: 0,
      roomId: "",
      drawWidth: 1,
      eraserWidth: 20,
      color: "#000000"
    };
  },
  methods: {
    bindMultiPickerChange(e) {
      console.log("picker发送选择改变，携带值为", e.target.value);
      this.multiIndex = e.target.value;
      this.drawWidth = this.multiArray[0][this.multiIndex[0]];
      this.color = this.colorArray[this.multiIndex[1]];
      console.log(this.drawWidth, this.color);
    },
    getAuth() {
      wx.getSetting({
        success: res => {
          if ( 
            !res.authSetting["scope.writePhotosAlbum"]
          ) {
            wx.navigateTo({
              url:'../auth/main'
            })
          }
        }
      });
    },
    //映射
    setBg() {
      this.ctx.setFillStyle("#ffffff");
      this.ctx.fillRect(0, 0, this.width, this.height);
      wx.drawCanvas({
        canvasId: "show",
        reserve: true,
        actions: this.ctx.getActions() // 获取绘图动作数组
      });
      this.ctx.clearActions();
    },
    //触摸开始事件
    touchStart(e) {
      this.prevPosition = [e.touches[0].x, e.touches[0].y];
      this.startX = ~~(e.touches[0].x + 0.5);
      this.startY = ~~(e.touches[0].y + 0.5);
      this.drawArr.push({
        x: this.startX,
        y: this.startY
      });
    },
    //手指移动事件
    touchMove(e) {
      //判断是单手指
      if (this.chosen === "draw" || this.chosen === "eraser") {
        if (this.chosen === "draw") {
          this.ctx.setStrokeStyle(this.color);
          this.ctx.setLineWidth(this.drawWidth);
        } else if (this.chosen == "eraser") {
          this.ctx.setStrokeStyle("white");
          this.ctx.setLineWidth(this.eraserWidth);
        }
        let x = ~~(e.touches[0].x + 0.5);
        let y = ~~(e.touches[0].y + 0.5);
        this.ctx.setLineJoin("round");
        this.ctx.setLineCap("round"); // 让线条圆润
        this.startX = x;
        this.startY = y;
        this.drawArr.push({
          x: this.startX,
          y: this.startY
        });
        let p1 = this.drawArr[0];
        let p2 = this.drawArr[1];
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        for (let i = 1; i < this.drawArr.length; i++) {
          let midPoint = this.midPoint(p1, p2);
          this.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          p1 = this.drawArr[i];
          p2 = this.drawArr[i + 1];
        }
        this.ctx.lineTo(p1.x, p1.y);
        this.ctx.stroke();
        this.ctx.closePath();
        wx.drawCanvas({
          canvasId: "Canvas",
          reserve: false,
          actions: this.ctx.getActions() // 获取绘图动作数组
        });
        this.ctx.clearActions();
      } else if (this.chosen === "move") {
        this.time++;
        if (this.time == 6) {
          this.offsetX += (e.touches[0].x - this.prevPosition[0]) * 2;
          this.time = 0;
        }
        // this.offsetY += e.touches[0].y - this.prevPosition[1];
        this.prevPosition = [
          parseInt(e.touches[0].x),
          parseInt(e.touches[0].y)
        ];
      }
    },
    touchEnd() {
      if (this.chosen === "draw") {
        this.drawCanvas(this.drawWidth, this.color, this.drawArr);
      } else if (this.chosen === "move") {

      } else if (this.chosen === "eraser") {
        this.drawCanvas(this.eraserWidth, "#ffffff", this.drawArr);
      }
      this.drawArr = [];
      this.begin = false;
    },
    //选择动作类型
    choseType(index) {
      if (this.types[index] === "clear") {
        wx.showModal({
          title: "提示",
          content: "是否清空屏幕",
          success: res => {
            if (res.confirm) {
              console.log("用户点击确定");
              this.clearCanvas();
            } else if (res.cancel) {
              console.log("用户点击取消");
            }
          }
        });
      } else if (this.types[index] === "save") {
        var self = this;
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: self.width,
          height: self.height,
          fileType: "jpg",
          canvasId: "show",
          success: function(res) {
            console.log(res.tempFilePath);
            self.tempFilePath = res.tempFilePath;
            util.showBusy("保存中", 15000);
            wx.saveImageToPhotosAlbum({
              filePath: self.tempFilePath,
              success: function(res) {
                util.showSuccess("保存成功");
                console.log("save");
              },
              fail: function(err) {
                console.log(err);
                util.showBusy("请先授权");
                setTimeout(() => {
                  self.getAuth();
                }, 1000);
              }
            });
          }
        });
      } else {
        this.chosen = this.types[index];
      }
    },
    //二次贝塞尔中间点计算
    midPoint(start, end) {
      let x = (start.x + end.x) / 2;
      let y = (start.y + end.y) / 2;
      var cp = {
        x: x,
        y: y
      };
      return cp;
    },
    //定时器
    setTimer() {
      this.timer = setTimeout(() => {
        this.timer = null;
      }, 8);
    },
    //绘画函数
    drawCanvas(width = 1, color = "#000000", drawArr = []) {
      this.ctx.setStrokeStyle(color);
      this.ctx.setLineWidth(width);
      this.ctx.setLineJoin("round");
      this.ctx.setLineCap("round"); // 让线条圆润
      let p1 = drawArr[0];
      let p2 = drawArr[1];
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      for (let i = 1; i < drawArr.length; i++) {
        let midPoint = this.midPoint(p1, p2);
        this.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        p1 = drawArr[i];
        p2 = drawArr[i + 1];
      }
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.stroke();
      this.ctx.closePath();
      wx.drawCanvas({
        canvasId: "show",
        reserve: true,
        actions: this.ctx.getActions() // 获取绘图动作数组
      });
      this.ctx.clearActions();
      wx.drawCanvas({
        canvasId: "Canvas",
        reserve: false,
        actions: [] // 获取绘图动作数组
      });
    },
    recoverCanvas(data) {
      for (let index = 0; index < data.length; index++) {
        this.recoverAction(data[index]);
      }
    },
    recoverAction(data) {
      const type = data.data.type;
      if (type === 1) {
        const drawArr = data.data.data.drawArr;
        const drawWidth = data.data.data.drawWidth;
        const color = data.data.data.color;
        this.drawCanvas(drawWidth, color, drawArr);
      } else if (type === 2) {
        const offsetX = data.data.data.offsetX;
        this.offsetX = offsetX;
      } else if (type === 3) {
        const drawArr = data.data.data.drawArr;
        this.drawCanvas(this.eraserWidth, "#ffffff", drawArr);
      } else if (type === 4) {
        this.clearCanvas();
      }
    },
    clearCanvas() {
      wx.drawCanvas({
        canvasId: "Canvas",
        reserve: false,
        actions: [] // 获取绘图动作数组
      });
      wx.drawCanvas({
        canvasId: "show",
        reserve: false,
        actions: [] // 获取绘图动作数组
      });
      this.chosen = "draw";
      this.setBg();
    }
  },
  computed:{
    computedDrawWidth(){
      return this.drawWidth*5+16;
    }
  }
};
</script>

<style scoped lang='less'>
page {
  background: rgba(153, 204, 255, 0.1);
  transform: translateZ(0);
  position: relative;
  .canvas,
  .show {
    box-shadow: #aaa 0 0 10px;
    position: absolute;
    z-index: 22222;
    border-radius: 4rpx;
    border-left: 1rpx solid #bfccdc;
    border-right: 1rpx solid #bfccdc;
  }
  .show {
    border-color: #ffffff;
    z-index: 1;
  }
  .types {
    width: 100%;
    position: absolute;
    display: flex;
    flex-direction: row;
    left: 0;
    bottom: 10rpx;
    z-index: 99999999;
    color: #bbb;
    .type {
      flex-direction: row;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 18rpx;
      height: 90rpx;
      width: 100rpx;
      text-align: center; //   background: red;
      // border: 1rpx solid #cccccc;
      img {
        width: 50rpx;
        height: 50rpx;
      }
    }
    .chosen {
      border-color: #000;
      background-color: #3BACF9;
    }
  }
  .tip {
    width: 2880rpx;
    background: #bfccdc;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 130rpx;
    p {
      width: 750rpx;
      height: 130rpx;
      display: flex;
      flex-direction: row;
      line-height: 130rpx;
      justify-content: center;
      align-items: center;
      img {
        margin-left: 20rpx;
        width: 40rpx;
        height: 40rpx;
      }
    }
  }
}
</style>