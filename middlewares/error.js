const errorHandling = (error, req, res, next) => {
    if (error.errors?.name) {
      return res.json({ message: error.errors.name.message });
    }
  
    if (error.errors?.email) {
      return res.json({ message: error.errors.email.message });
    }
    if (error.errors?.password) {
      return res.json({ message: error.errors.password.message });
    }
    res.json({message:error});
  };
  
  module.exports = errorHandling;
  