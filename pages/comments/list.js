const app = getApp()
/**
 * 页面的初始数据
 */
Page({
  data: {
    hash: "",
    namespace: "",
    path: "",
    page: 1,
    isGetingData: false,
    commentList: []
  },
  onLoad: function (e) {
    wx.showLoading({
      title: '数据加载中',
    });
    app.loadFont();
    var that = this;
    if (e.path && e.namespace) {
      that.setData({
        namespace: e.namespace,
        path: e.path,
        hash: e.hash ? e.hash : "",
      });
      if (e.hash) {
        wx.setNavigationBarTitle({
          title: '变更评论列表',
        });
      } else {
        wx.setNavigationBarTitle({
          title: '仓库评论列表',
        });
      }
      wx.showLoading({
        title: '评论读取中',
      });
    } else {
      wx.showModal({
        title: '参数错误',
        content: '系统发生错误，无法为你读取数据',
        showCancel: false,
        success(res) {
          wx.navigateBack();
        }
      });
    }
  },
  /**
   * 页面显示事件
   */
  onShow: function () {
    var that = this;
    app.getUserInfo(function (result) {
      if (result) {
        that.getComments();
      } else {
        app.loginFirst();
      }
    });
  },
  /**
   * 下拉刷新事件
   */
  onPullDownRefresh() {
    this.setData({
      page: 1
    });
    this.getComments();
  },
  /**
   * 上拉加载时间
   */
  onReachBottom: function () {
    if (!this.data.isGetingData) {
      this.setData({
        page: this.data.page + 1
      });
      this.getComments();
    }
  },
  getComments: function () {
    var that = this;
    if (that.isGetingData) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      return;
    }
    var url = app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/comments";
    if (that.data.hash) {
      url = app.config.apiUrl + "api/v5/repos/" + that.data.namespace + "/" + that.data.path + "/commits/" + that.data.hash + "/comments"
    }
    wx.request({
      url: url,
      method: "GET",
      data: {
        access_token: app.access_token,
        page: that.data.page,
        direction: "desc",
        order: "desc"
      },
      success: function (result) {
        that.isGetingData = false;
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (!result.data.hasOwnProperty("message")) {
          if (that.data.page == 1) {
            that.setData({
              commentList: result.data
            });
          } else {
            var _list = that.data.commentList;
            for (var i = 0; i < result.data.length; i++) {
              _list.push(result.data[i]);
            }
            that.setData({
              commentList: _list
            });
          }
        } else {
          wx.showModal({
            title: '读取评论失败',
            content: result.data.message,
            showCancel: false,
          });
        }
      }
    });
  },
  onShareAppMessage: function (res) {}
})