// A wraper for asyncronus task with try catch block


// yha pa ak fnction he async handeler isme ka function ai ga use ye async me wrape kar ke trycatch laga ke exicute kar dega
 const asyncHandler = (reqHandler) => {
  return (req, res, next) => {
    Promise.resolve(reqHandler(req,res,next))
    .catch((error) => next(error));
  }
 }


export  {asyncHandler}


//  this is one way a higher order function 
// const asyncHandler = (funct) => async (req, res, next) => {
//   try {
//     await funct(req,res,next)
//   } catch (error) {
//     res.send(error.code || 500).json({
//       sucess: true,
//       error: error.message
//     })
//   }
// }