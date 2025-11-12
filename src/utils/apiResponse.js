// FIXME 统一响应格式
class ApiResponse {
  static success(data, message = "Success") {
    return { success: true, data, message };
  }

  static error(errorCode, message) {
    return { success: false, errorCode, message };
  }
}
