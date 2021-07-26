module.exports = {
    success: (res,msg,data) => {
      return res.status(200).json({
        statusCode: 200,
        message: msg,
        user_details: data,
      });
    },
    db_error: (res, e) => {
      return res.status(500).json({
        statusCode: 500,
        message: "internal server error",
        error: e.message,
      });
    },

    db_errorwithoutE: (res) => {
      return res.status(500).json({
        statusCode: 500,
        message: "internal server error"
      });
    },
    went_wrong: (res,e) => {
      return res.status(400).json({
        statusCode: 400,
        message: "Something went wrong",
        error:e.message
      });
    },
    duplicate: (res,msg) => {
      return res.status(400).json({
        statusCode: 400,
        message: msg,
      });
    },
    validation_error: (res, err) => {
      return res.status(422).json({
        statusCode: 422,
        message: err,
      });
    },
    successWithnodata: (res, msg) => {
      return res.status(200).json({
        statusCode: 200,
        message: msg
      });
    },
    login_failed: (res,msg) => {
      return res.status(400).json({
        statusCode: 400,//401
        message: msg,
      });
    },
    not_found:(res,msg) =>{
        return res.status(404).json({
            statusCode: 404,
            message: msg,
          });
    } ,
    went_wrongWithdata: (res,msg,data) => {
      return res.status(400).json({
        statusCode: 400,
        message: msg,
        data : data
      });
    },
    went_wrongwtihoutE: (res) => {
      return res.status(400).json({
        statusCode: 400,
        message: "Something went wrong",
      });
    }
   
  };