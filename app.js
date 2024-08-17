import  express  from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from "./config/db.js";
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoute from './routes/pacienteRoute.js'


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4040
dotenv.config(); 
 
connectDB(); 
 
 const dominiosPermitidos = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback){
        if(dominiosPermitidos.indexOf(origin) !== -1 || !origin){
            callback(null, true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}
app.use(cors(corsOptions)); 

app.use('/api/veterinarios', veterinarioRoutes); 
app.use('/api/pacientes', pacienteRoute);



app.listen(PORT, () => { 
    console.log(`Servidor funcionando en el puerto: ${PORT}`);
})