const runtimeConfig = useRuntimeConfig()
import nodemailer from 'nodemailer'

let transporter = nodemailer.createTransport({
    host: runtimeConfig.MAIL_BOX.host,
    port:  runtimeConfig.MAIL_BOX.port,
    secure: false, 
    auth: {
        user: runtimeConfig.MAIL_BOX.user,
        pass: runtimeConfig.MAIL_BOX.pass
    },
    tls: {
        rejectUnauthorized: false
    },
});
export default transporter