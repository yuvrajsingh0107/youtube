
//this file is to stenderdise api error handling
// this use Error class in node js to hadel error


class APIerror extends Error{
  constructor(
    statusCode,
    message = "somthing went rong",
    errors = [],
    stack = ""
  ){
    super(message)
    this.statusCode = statusCode
    this.message = message
    this.data = null
    this.success = fase
    this.errors = errors

    if(stack){
      this.stack = stack
    }else{
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export {APIerror}