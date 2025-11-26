const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`🌎  ==> API Server now listening on PORT ${process.env.PORT || 3000}!`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;

