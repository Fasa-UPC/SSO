class ResponseCode {
  static SUCCESS = 0;
  static CREATED = 1;
  static DELETED = 2;
  static UPDATED = 3;
  static DUPLICATE_DATA = 4;
  static RECORD_NOT_FOUND = 5;
  static DENEID = 6;
  static MISS_DATA = 7;
}

class ResponseBody {
  body: any;
  error: Boolean;
  code: ResponseCode;
  constructor(body: any, error: Boolean, code: ResponseCode) {
    this.body = body;
    this.error = error;
    this.code = code;
  }
}

export { ResponseBody, ResponseCode };
