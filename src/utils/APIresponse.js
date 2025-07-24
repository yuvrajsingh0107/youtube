class APIresponse{
  constructor(statusCode, data, massage = 'success'){
    this.statusCode = statusCode
    this.data = data
    this.massage = massage
    this.sucess = statusCode < 400
  }
}