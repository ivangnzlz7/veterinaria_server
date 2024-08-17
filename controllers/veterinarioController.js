import Veterinario from "../models/veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";


const registrar = async(req, res) => {
    const { email, nombre } = req.body;

    // Si existe el usuario
    const existeUsuario = await Veterinario.findOne({email})

    if(existeUsuario){
        const error = new Error('Usuario ya registrado')
        return res.status(404).json({msg: error.message});
    }

    try {
        // Guardar un Nuevo Veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioSave = await veterinario.save();

        // Enviar el email
        emailRegistro({
            email,
            nombre,
            token: veterinarioSave.token,
        })

        res.json({msg: "Registrando usuario"});
    } catch (error) {
        console.log(error);
    }
}

const perfil = (req, res) => {
    
    const {veterinario} = req;
 
    res.json(veterinario);
} 

const confirmar = async(req, res) => {
    const { token } = req.params;
     
    const usuarioConfirmar = await Veterinario.findOne({ token });

    if(!usuarioConfirmar){
        const error = new Error("Token no valido");
        return res.status(404).json({msg: error.message});
    } 

    try {

        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({msg: 'Usuario confirmado Correctamente'});
        
    } catch (error) {
        console.log(error);
    }

}

const autenticar = async(req, res) => {
    const { email, password } = req.body
    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email})
    if(!usuario){
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message});
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    }

    // Revisar password
    if( await usuario.comprobarPassword(password) ){
          
        res.json({
            _id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),

        });
    } else {
        const error = new Error("El Password es incorrecto");
        return res.status(403).json({msg: error.message});
    }
}

const olvidePassword = async(req, res) => {
    const { email } = req.body;

   const existeVeterinario = await Veterinario.findOne({email})
   if(!existeVeterinario){
        const error = new Error('El usuario no existe');
        return res.status(403).json({msg: error.message})
   }

   try {

    existeVeterinario.token = generarId()
    await existeVeterinario.save()

    // Enviar Email con instrucciones

    emailOlvidePassword({
        email,
        nombre: existeVeterinario.nombre,
        token: existeVeterinario.token,
    });
    
    res.json({msg: "Se ha enviado un email con las instrucciones que debe seguir."})
    
   } catch (error) {
    console.log(error);
   }
}

const comprobarToken = async(req, res) => {
const {token} = req.params

    const tokenValido = await Veterinario.findOne({ token })

    if(tokenValido){
        //Usuario existe
        res.json({msg: "Token valido y usuario existe"})
    } else {
        const error = new Error('Token no valido')
        return res.status(403).json({msg: error.message})
    }
}

const nuevoPassword = async(req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({ token })
    if(!veterinario){
        const erorr = new Error('Hubo un error');
        return res.status(403).json({msg: erorr.message})
    }
    try {
        veterinario.token = null;
        veterinario.password = password
        await veterinario.save();
        res.json({msg: 'Password modificado exitosamente'})
        
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if(!veterinario){
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message })
    }
    const { email } = req.body

    if(veterinario.email !== req.body.email){
        const existeEmail = await Veterinario.findOne({email});
        if(existeEmail){
            const error = new Error('El Email Esta En Uso');
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado)
    } catch (error) {
        console.log(error);
    }
}

const actualizarPassword = async (req, res) =>{
        // Leer los datos
        const { id } = req.veterinario
        const { pwd_actual, pwd_nuevo } = req.body

        // Comprobar que el veterinario existe
        const veterinario = await Veterinario.findById(id)
        if(!veterinario){
            const erorr = new Error('Hubo un error');
            return res.status(403).json({msg: erorr.message})
        }

        // Comprobar su password
        if(await veterinario.comprobarPassword(pwd_actual)){
            
            // Almacenar el nuevo password
            veterinario.password = pwd_nuevo;
            await veterinario.save();
            res.json({msg: 'Password Guardado Exitosamente'})

        } else {
            const erorr = new Error('Password Actual Incorrecto');
            return res.status(403).json({msg: erorr.message})
        }
}
        
export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}