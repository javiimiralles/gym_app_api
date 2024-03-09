import mongoose from 'mongoose';

export const dbConnection = async() => {
    try {
        // await mongoose.connect(process.env.DBCONNECTION);
        await mongoose.connect('mongodb+srv://javiimiralles:uEEkyWz9yJceJF6h@clusterjfitness.bkzpb3w.mongodb.net/ClusterJFitness');
        console.log('Connection established with the database');
    } catch (error) {
        console.log(error);
        throw new Error('Error starting database');
    }
}