//* What is a Higher-Order Function (HOF)?
//? A function is called higher-order if:
//? It takes another function as an argument, OR
//? It returns a function.
//! WITH PROMISE
const asynchandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((error) => {
      // ✅ correct
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    });
  };
};
//   Why .catch instead of .reject?
//   Promise.reject(err) → is a function to create a rejected promise, not a method to handle rejections.
//   .catch(errHandler) → is the method used to handle errors when a promise fails.
//   So when you already have a promise (Promise.resolve(func(...))), you attach .catch(...) to handle its errors.

export { asynchandler };
//!WITH TRY CATCH
//?method 1
// const asynchandler=(func)=>async(req,res,next)=>
// {
//     try
//     {
//       await func(req,res,next);
//     }
//     catch(error)
//     {
//           res.status(error.code||500).json({
//             success:false,
//             message:error.message,
//           })
//     }
// }
// important note= method 1 actual looks like below code as in method 1 we didnt use curly bracket after (func)=> if we would use (func)=>{} as below we need to use return statement
//! const asynchandler = (func) => {
//*     return async (req, res, next) => {
//       try {
//         await func(req, res, next);
//       } catch (error) {
//         res.status(error.code || 500).json({
//           success: false,
//           message: error.message,
//         });
//       }
//     };
//   };

//??IMPLEMENTATION

//* Why use it?

//! Without it, your route handlers look messy:

// app.get("/users", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

//! With asynchandler, you avoid writing repetitive try/catch in every route:

// app.get("/users", asynchandler(async (req, res) => {
//   const users = await User.find();
//   res.json(users);
// }));

//! AND HOW WILL IT ACTUALLY LOOK
// app.get("/users", async (req, res, next) => {
//     try {
//       await (async (req, res) => {
//         const users = await User.find();
//         res.json(users);
//       })(req, res, next); 
//     } catch (error) {
//       res.status(error.code || 500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   });
