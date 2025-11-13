// FIXME 统一API响应格式
class ApiResponse {
  // 成功响应
  static success(data, meta = {}) {
    return {
      time: new Date(Date.now()),
      code: 200,
      message: "Success",
      data,
      ...meta,
    };
  }

  // 错误响应（支持业务错误码）
  static error(errorCode, message = "Error", meta = {}) {
    return {
      time: new Date(Date.now()),
      code: 500,
      errorCode,
      message,
      ...meta,
    };
  }
}

// 导出两种调用方式
module.exports = {
  ApiResponse,
  success: (data, meta) => ApiResponse.success(data, meta),
  error: (code, msg, meta) => ApiResponse.error(code, msg, meta),
};
