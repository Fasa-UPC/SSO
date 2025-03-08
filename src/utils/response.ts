class ResponseCode {
  static SUCCESS = 0;
  static CREATED = 1;
  static DELETED = 2;
  static UPDATED = 3;
  static DUPLICATE_DATA = 4;
  static RECORD_NOT_FOUND = 5;
  static DENEID = 6;
  static MISS_DATA = 7;
  static EXPIRED = 8;
  static WRONG_CREDENTIALS = 9;
  static INTERNAL_ERROR = 10;
  static INVALID_DATA = 11;
}

class ResponseRecord {
  static Client = "client";
  static Student = "student";
  static StudentCard = "student_card";
}

class ResponseBodyKey {
  static Record = "record";
  static TokenID = "tokenID";
  static ClientID = "clientId";
  static ClientURI = "clientUri";
  static Data = "data";
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

export { ResponseBody, ResponseCode, ResponseRecord, ResponseBodyKey };
