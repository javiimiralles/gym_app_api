import mongoose from 'mongoose';

export const dbConnection = async() => {
    try {
        await mongoose.connect(process.env.DBCONNECTION);
        console.log('Connection established with the database');
    } catch (error) {
        console.log(error);
        throw new Error('Error starting database');
    }
}